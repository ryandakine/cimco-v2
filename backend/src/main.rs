mod auth;
mod config;
mod db;
mod error;
mod http;
mod inventory;

use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;

use crate::auth::jwt::{JwtConfig, TokenDenylist};
use crate::config::Config;
use crate::db::DbPool;
use crate::http::middleware::rate_limit;
use crate::http::routes::create_router;
use tower_http::{
    cors::CorsLayer,
    limit::RequestBodyLimitLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "cimco_inventory_v2=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Starting CIMCO Inventory System v2 Backend");

    // Load configuration
    let config = Config::from_env()?;
    tracing::info!("Configuration loaded successfully");

    // Create database pool
    let pool = DbPool::new(&config).await?;
    let pool = Arc::new(pool);

    // Create JWT config
    let jwt_config = Arc::new(JwtConfig::new(config.jwt_secret.clone()));

    // Create rate limiter for login endpoint (5 requests/minute per IP)
    let login_rate_limiter = rate_limit::default_login_rate_limiter();

    // Spawn background cleanup task for rate limiter
    let cleanup_limiter = login_rate_limiter.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(300));
        loop {
            interval.tick().await;
            cleanup_limiter.cleanup_all_expired();
        }
    });

    // Create token denylist for logout
    let token_denylist = Arc::new(TokenDenylist::new());

    // Spawn background cleanup task for token denylist
    let cleanup_denylist = token_denylist.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(600));
        loop {
            interval.tick().await;
            cleanup_denylist.cleanup_expired();
        }
    });

    // Create CORS layer with validated origins
    let cors = CorsLayer::new()
        .allow_origin(
            config
                .cors_origins
                .iter()
                .map(|o| o.parse().unwrap())
                .collect::<Vec<_>>(),
        )
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::PUT,
            axum::http::Method::DELETE,
            axum::http::Method::OPTIONS,
        ])
        .allow_headers([axum::http::header::CONTENT_TYPE, axum::http::header::AUTHORIZATION]);

    // Create router with JWT config, rate limiter, denylist, and body limit
    let app = create_router(pool, cors, jwt_config, login_rate_limiter, token_denylist)
        .layer(RequestBodyLimitLayer::new(config.max_request_body_size));

    // Create socket address
    let addr: SocketAddr = format!("{}:{}", config.server_host, config.server_port)
        .parse()
        .expect("Invalid server address");

    tracing::info!("Server starting on http://{}", addr);

    // Start server with ConnectInfo for rate limiter IP extraction
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    ).await?;

    Ok(())
}
