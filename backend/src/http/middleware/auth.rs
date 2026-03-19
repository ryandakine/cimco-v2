use axum::{
    extract::{Extension, Request},
    middleware::Next,
    response::Response,
};
use std::sync::Arc;

use crate::auth::handler::session_from_claims;
use crate::auth::jwt::{self, JwtConfig, TokenDenylist};
use crate::error::AppError;

pub async fn auth_middleware(
    Extension(jwt_config): Extension<Arc<JwtConfig>>,
    Extension(denylist): Extension<Arc<TokenDenylist>>,
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

    // Check if token has been revoked
    if denylist.is_denied(token) {
        return Err(AppError::Unauthorized("Token has been revoked".to_string()));
    }

    // Validate token and convert to session
    let claims = jwt::validate_token(token, &jwt_config)?;
    let session = session_from_claims(claims.clone())?;

    // Add both claims and session to request extensions
    request.extensions_mut().insert(claims);
    request.extensions_mut().insert(session);

    Ok(next.run(request).await)
}
