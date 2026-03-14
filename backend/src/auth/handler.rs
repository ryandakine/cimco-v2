use axum::{
    extract::{Extension, Json},
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::json;
use std::sync::Arc;

use crate::auth::jwt::{self, JwtConfig};
use crate::auth::model::{CreateUserRequest, LoginRequest, Session, UserRole};
use crate::auth::service::AuthService;
use crate::db::DbPool;
use crate::error::{AppError, Result};

pub async fn login(
    Extension(pool): Extension<Arc<DbPool>>,
    Extension(jwt_config): Extension<Arc<JwtConfig>>,
    Json(req): Json<LoginRequest>,
) -> Result<impl IntoResponse> {
    let response = AuthService::login(pool.get(), req, &jwt_config).await?;
    Ok((StatusCode::OK, Json(response)))
}

pub async fn logout() -> Result<impl IntoResponse> {
    // JWT tokens are stateless - client should discard the token
    // For server-side revocation, a token denylist would be needed
    Ok((
        StatusCode::OK,
        Json(json!({"message": "Logged out successfully"})),
    ))
}

pub async fn get_session(
    Extension(claims): Extension<jwt::Claims>,
) -> Result<impl IntoResponse> {
    Ok((
        StatusCode::OK,
        Json(json!({
            "user_id": claims.sub,
            "username": claims.username,
            "role": claims.role,
            "valid": true,
        })),
    ))
}

pub async fn create_user_handler(
    Extension(pool): Extension<Arc<DbPool>>,
    Extension(session): Extension<Session>,
    Json(req): Json<CreateUserRequest>,
) -> Result<impl IntoResponse> {
    // Only admins can create users
    if session.role != UserRole::Admin {
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

/// Extract session from claims (used by middleware)
pub fn session_from_claims(claims: jwt::Claims) -> Result<Session> {
    let role = UserRole::try_from(claims.role.as_str())
        .map_err(|e| AppError::Internal(e))?;
    
    Ok(Session {
        user_id: claims.sub,
        username: claims.username,
        role,
    })
}
