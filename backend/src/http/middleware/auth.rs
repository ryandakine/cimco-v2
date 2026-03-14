use axum::{
    extract::{Extension, Request},
    middleware::Next,
    response::Response,
};
use std::sync::Arc;

use crate::auth::jwt::{self, JwtConfig};
use crate::auth::model::{Session, UserRole};
use crate::error::AppError;

pub async fn auth_middleware(
    Extension(jwt_config): Extension<Arc<JwtConfig>>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    // Extract bearer token from Authorization header
    let auth_header = request
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok());

    let token = match auth_header {
        Some(header) => jwt::extract_bearer_token(header),
        None => None,
    };

    let token = match token {
        Some(t) => t,
        None => {
            return Err(AppError::Unauthorized(
                "Missing or invalid authorization header".to_string(),
            ));
        }
    };

    // Validate token using JwtConfig
    let claims = jwt::validate_token(token, &jwt_config)?;

    // Convert claims to Session for backward compatibility with handlers
    let role = UserRole::try_from(claims.role.as_str())
        .map_err(|e| AppError::Internal(e))?;
    
    let session = Session {
        user_id: claims.sub,
        username: claims.username,
        role,
    };

    // Add session to request extensions
    request.extensions_mut().insert(session);

    Ok(next.run(request).await)
}
