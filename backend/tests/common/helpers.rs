use axum::body::{to_bytes, Body};
use axum::http::{Request, StatusCode};
use axum::Router;
use http_body_util::Empty;
use serde::de::DeserializeOwned;
use serde::Serialize;
use serde_json::Value;
use std::sync::Arc;
use tower::ServiceExt;

use cimco_inventory_v2::auth::model::{LoginRequest, LoginResponse};
use cimco_inventory_v2::config::Config;
use cimco_inventory_v2::db::DbPool;
use cimco_inventory_v2::http::routes::create_router;

/// Create a test app with an in-memory/test database
pub async fn create_test_app() -> Router {
    dotenvy::dotenv().ok();
    
    let database_url = std::env::var("TEST_DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/cimco_test".to_string());

    let config = Config {
        database_url,
        server_port: 0, // Don't need port for tests
        server_host: "127.0.0.1".to_string(),
        session_secret: "test_secret_key_for_testing_only".to_string(),
        cors_origins: vec!["http://localhost:3000".to_string()],
    };

    let pool = DbPool::new(&config).await.expect("Failed to create test database pool");
    let pool = Arc::new(pool);

    // Create CORS layer for tests
    let cors = tower_http::cors::CorsLayer::new()
        .allow_origin(tower_http::cors::Any)
        .allow_methods(tower_http::cors::Any)
        .allow_headers(tower_http::cors::Any);

    create_router(pool, cors)
}

/// Create a test app without database (for simple handler tests)
pub fn create_test_app_mock() -> Router {
    use axum::routing::get;
    
    Router::new().route("/health", get(|| async { "OK" }))
}

/// Send a GET request to the app
pub async fn get(app: &Router, uri: &str) -> axum::response::Response {
    let request = Request::builder()
        .uri(uri)
        .body(Body::empty())
        .unwrap();
    
    app.clone().oneshot(request).await.unwrap()
}

/// Send a GET request with authorization
pub async fn get_with_auth(app: &Router, uri: &str, token: &str) -> axum::response::Response {
    let request = Request::builder()
        .uri(uri)
        .header("Authorization", format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();
    
    app.clone().oneshot(request).await.unwrap()
}

/// Send a POST request with JSON body
pub async fn post<B: Serialize>(
    app: &Router,
    uri: &str,
    body: B,
) -> axum::response::Response {
    let json = serde_json::to_string(&body).unwrap();
    let request = Request::builder()
        .method("POST")
        .uri(uri)
        .header("content-type", "application/json")
        .body(Body::from(json))
        .unwrap();
    
    app.clone().oneshot(request).await.unwrap()
}

/// Send a POST request with authorization
pub async fn post_with_auth<B: Serialize>(
    app: &Router,
    uri: &str,
    token: &str,
    body: B,
) -> axum::response::Response {
    let json = serde_json::to_string(&body).unwrap();
    let request = Request::builder()
        .method("POST")
        .uri(uri)
        .header("content-type", "application/json")
        .header("Authorization", format!("Bearer {}", token))
        .body(Body::from(json))
        .unwrap();
    
    app.clone().oneshot(request).await.unwrap()
}

/// Send a PUT request with authorization
pub async fn put_with_auth<B: Serialize>(
    app: &Router,
    uri: &str,
    token: &str,
    body: B,
) -> axum::response::Response {
    let json = serde_json::to_string(&body).unwrap();
    let request = Request::builder()
        .method("PUT")
        .uri(uri)
        .header("content-type", "application/json")
        .header("Authorization", format!("Bearer {}", token))
        .body(Body::from(json))
        .unwrap();
    
    app.clone().oneshot(request).await.unwrap()
}

/// Login as admin and return token
pub async fn login_as_admin(app: &Router) -> String {
    let login_req = LoginRequest {
        username: "admin".to_string(),
        password: "admin123".to_string(),
    };
    
    let response = post(app, "/api/auth/login", login_req).await;
    assert_eq!(response.status(), StatusCode::OK);
    
    let body = response_to_json::<Value>(response).await;
    body["token"].as_str().unwrap().to_string()
}

/// Login as worker and return token
pub async fn login_as_worker(app: &Router) -> String {
    let login_req = LoginRequest {
        username: "worker".to_string(),
        password: "worker123".to_string(),
    };
    
    let response = post(app, "/api/auth/login", login_req).await;
    assert_eq!(response.status(), StatusCode::OK);
    
    let body = response_to_json::<Value>(response).await;
    body["token"].as_str().unwrap().to_string()
}

/// Extract JSON body from response
pub async fn response_to_json<T: DeserializeOwned>(response: axum::response::Response) -> T {
    let status = response.status();
    let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let body_str = String::from_utf8(body.to_vec()).unwrap_or_default();
    
    serde_json::from_str(&body_str).unwrap_or_else(|e| {
        panic!("Failed to parse JSON response (status: {}): {}\nBody: {}", status, e, body_str)
    })
}

/// Extract string body from response
pub async fn response_to_string(response: axum::response::Response) -> String {
    let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    String::from_utf8(body.to_vec()).unwrap()
}

/// Extract bytes body from response
pub async fn response_to_bytes(response: axum::response::Response) -> Vec<u8> {
    let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    body.to_vec()
}

/// Assert response has expected status code
pub fn assert_status(response: &axum::response::Response, expected: StatusCode) {
    assert_eq!(
        response.status(),
        expected,
        "Expected status {:?}, got {:?}",
        expected,
        response.status()
    );
}

/// Create authorization header value
pub fn auth_header(token: &str) -> String {
    format!("Bearer {}", token)
}

/// Run database migrations for tests
pub async fn run_migrations(pool: &DbPool) -> Result<(), sqlx::migrate::MigrateError> {
    sqlx::migrate!("./migrations").run(pool.get()).await
}

/// Seed test data
pub async fn seed_test_data(pool: &DbPool) -> Result<(), Box<dyn std::error::Error>> {
    use cimco_inventory_v2::auth::{model::UserRole, service::AuthService};
    
    // Create admin user
    let _ = AuthService::create_user(
        pool.get(),
        "admin",
        "admin123",
        &UserRole::Admin,
    ).await;
    
    // Create worker user
    let _ = AuthService::create_user(
        pool.get(),
        "worker",
        "worker123",
        &UserRole::Worker,
    ).await;
    
    Ok(())
}
