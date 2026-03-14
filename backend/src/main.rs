mod auth;
mod config;
mod db;
mod error;
mod http;
mod inventory;

use std::net::SocketAddr;
use std::sync::Arc;

use axum::Router;
use crate::auth::jwt::JwtConfig;
use crate::config::Config;
use crate::db::DbPool;
use crate::http::routes::create_router;
use tower_http::{
    cors::CorsLayer,
    limit::RequestBodyLimitLayer,
    trace::TraceLayer,
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

    // Create router with JWT config and body limit
    let app = create_router(pool, cors, jwt_config)
        .layer(RequestBodyLimitLayer::new(config.max_request_body_size));

    // Create socket address
    let addr: SocketAddr = format!("{}:{}", config.server_host, config.server_port)
        .parse()
        .expect("Invalid server address");

    tracing::info!("Server starting on http://{}", addr);

    // Start server
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
