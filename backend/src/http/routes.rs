use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tower_http::cors::CorsLayer;

use crate::auth::handler::{create_user_handler, get_session, login, logout};
use crate::auth::jwt::JwtConfig;
use crate::db::DbPool;
use crate::http::middleware::auth::auth_middleware;
use crate::inventory::handler::{
    adjust_quantity, create_part, export_csv, get_part, get_transaction_history, list_parts,
    update_part,
};

pub fn create_router(
    pool: Arc<DbPool>, 
    cors_layer: CorsLayer,
    jwt_config: Arc<JwtConfig>,
) -> Router {
    // Public routes
    let public_routes = Router::new()
        .route("/api/v2/auth/login", post(login));

    // Protected auth routes
    let auth_routes = Router::new()
        .route("/api/v2/auth/logout", post(logout))
        .route("/api/v2/auth/session", get(get_session))
        .route("/api/v2/auth/users", post(create_user_handler))
        .layer(axum::middleware::from_fn(auth_middleware));

    // Inventory routes (protected)
    let inventory_routes = Router::new()
        .route("/api/v2/parts", get(list_parts).post(create_part))
        .route("/api/v2/parts/export", get(export_csv))
        .route("/api/v2/parts/:id", get(get_part).put(update_part))
        .route("/api/v2/parts/:id/adjust-quantity", post(adjust_quantity))
        .route("/api/v2/parts/:id/history", get(get_transaction_history))
        .layer(axum::middleware::from_fn(auth_middleware));

    // Health check (unversioned)
    let health_routes = Router::new()
        .route("/health", get(health_check));

    // Combine all routes
    Router::new()
        .merge(public_routes)
        .merge(auth_routes)
        .merge(inventory_routes)
        .merge(health_routes)
        .layer(cors_layer)
        .layer(axum::extract::Extension(pool))
        .layer(axum::extract::Extension(jwt_config))
}

async fn health_check() -> &'static str {
    "OK"
}
