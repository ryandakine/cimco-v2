use axum::{
    extract::{Extension, Json},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
};
use serde_json::json;
use std::sync::Arc;

use crate::auth::model::LoginRequest;
use crate::auth::service::AuthService;
use crate::db::DbPool;
use crate::error::{AppError, Result};

pub async fn login(
    Extension(pool): Extension<Arc<DbPool>>,
    Json(req): Json<LoginRequest>,
) -> Result<impl IntoResponse> {
    let response = AuthService::login(pool.get(), req).await?;
    Ok((StatusCode::OK, Json(response)))
}

pub async fn logout(
    Extension(pool): Extension<Arc<DbPool>>,
    headers: HeaderMap,
) -> Result<impl IntoResponse> {
    // Extract token from Authorization header
    let token = headers
        .get("authorization")
        .and_then(|h| h.to_str().ok())
        .and_then(|h| h.strip_prefix("Bearer "))
        .ok_or_else(|| AppError::Unauthorized("Missing authorization token".to_string()))?;

    AuthService::logout(pool.get(), token).await?;

    Ok((
        StatusCode::OK,
        Json(json!({"message": "Logged out successfully"})),
    ))
}

pub async fn get_session(
    Extension(pool): Extension<Arc<DbPool>>,
    headers: HeaderMap,
) -> Result<impl IntoResponse> {
    // Extract token from Authorization header
    let token = headers
        .get("authorization")
        .and_then(|h| h.to_str().ok())
        .and_then(|h| h.strip_prefix("Bearer "))
        .ok_or_else(|| AppError::Unauthorized("Missing authorization token".to_string()))?;

    let session = AuthService::validate_session(pool.get(), token).await?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "user_id": session.user_id,
            "username": session.username,
            "role": session.role.as_str(),
            "valid": true,
        })),
    ))
}

pub async fn create_user_handler(
    Extension(pool): Extension<Arc<DbPool>>,
    Extension(session): Extension<crate::auth::model::Session>,
    Json(req): Json<crate::auth::model::CreateUserRequest>,
) -> Result<impl IntoResponse> {
    // Only admins can create users
    if session.role != crate::auth::model::UserRole::Admin {
        return Err(AppError::Unauthorized(
            "Only admins can create users".to_string(),
        ));
    }

    let user = AuthService::create_user(pool.get(), &req.username, &req.password, &req.role).await?;

    Ok((
        StatusCode::CREATED,
        Json(crate::auth::model::UserResponse::from(user)),
    ))
}
