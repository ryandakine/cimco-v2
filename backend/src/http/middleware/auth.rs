use axum::{
    extract::{Extension, Request},
    http::header,
    middleware::Next,
    response::Response,
};
use std::sync::Arc;

use crate::auth::service::AuthService;
use crate::db::DbPool;
use crate::error::AppError;

pub async fn auth_middleware(
    Extension(pool): Extension<Arc<DbPool>>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    // Extract token from Authorization header
    let token = request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .and_then(|h| h.strip_prefix("Bearer "));

    let token = match token {
        Some(t) => t,
        None => {
            return Err(AppError::Unauthorized(
                "Missing or invalid authorization header".to_string(),
            ));
        }
    };

    // Validate session
    let session = AuthService::validate_session(pool.get(), token).await?;

    // Add session to request extensions
    request.extensions_mut().insert(session);

    Ok(next.run(request).await)
}
