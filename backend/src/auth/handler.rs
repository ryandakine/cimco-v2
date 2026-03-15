use std::sync::Arc;
use std::time::{Duration, Instant};

use axum::{
    extract::{Extension, Json},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
};
use serde_json::json;

use crate::auth::jwt::{self, JwtConfig, TokenDenylist};
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

pub async fn logout(
    Extension(denylist): Extension<Arc<TokenDenylist>>,
    Extension(jwt_config): Extension<Arc<JwtConfig>>,
    headers: HeaderMap,
) -> Result<impl IntoResponse> {
    let auth_header = headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| AppError::Unauthorized("Missing authorization header".to_string()))?;

    let token = jwt::extract_bearer_token(auth_header)
        .ok_or_else(|| AppError::Unauthorized("Invalid authorization header".to_string()))?;

    // Decode claims to get expiration time
    let claims = jwt::decode_claims_unvalidated(token, &jwt_config)?;
    let now = chrono::Utc::now().timestamp() as u64;
    let exp = claims.exp as u64;
    let ttl = exp.saturating_sub(now);

    denylist.deny(token.to_string(), Instant::now() + Duration::from_secs(ttl));

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
