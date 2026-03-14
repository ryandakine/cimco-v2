use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

use crate::auth::model::UserRole;
use crate::error::{AppError, Result};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: i32,           // user_id
    pub username: String,
    pub role: String,
    pub exp: usize,         // expiration time
    pub iat: usize,         // issued at
}

pub struct JwtConfig {
    pub secret: String,
}

impl JwtConfig {
    pub fn new(secret: String) -> Self {
        Self { secret }
    }
}

/// Create a JWT token for a user
pub fn create_token(
    user_id: i32,
    username: &str,
    role: &UserRole,
    config: &JwtConfig,
) -> Result<String> {
    let now = Utc::now();
    let expires_at = now + Duration::hours(24);

    let claims = Claims {
        sub: user_id,
        username: username.to_string(),
        role: role.as_str().to_string(),
        exp: expires_at.timestamp() as usize,
        iat: now.timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(format!("Failed to create token: {}", e)))
}

/// Validate and decode a JWT token
pub fn validate_token(token: &str, config: &JwtConfig) -> Result<Claims> {
    let validation = Validation::default();

    decode::<Claims>(
        token,
        &DecodingKey::from_secret(config.secret.as_bytes()),
        &validation,
    )
    .map(|data| data.claims)
    .map_err(|e| match e.kind() {
        jsonwebtoken::errors::ErrorKind::ExpiredSignature => {
            AppError::Unauthorized("Token has expired".to_string())
        }
        _ => AppError::Unauthorized("Invalid token".to_string()),
    })
}

/// Extract bearer token from Authorization header
pub fn extract_bearer_token(auth_header: &str) -> Option<&str> {
    auth_header.strip_prefix("Bearer ")
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_config() -> JwtConfig {
        JwtConfig::new("test_secret_key_for_testing_only".to_string())
    }

    #[test]
    fn test_create_and_validate_token() {
        let config = test_config();
        let token = create_token(1, "testuser", &UserRole::Admin, &config).unwrap();

        let claims = validate_token(&token, &config).unwrap();
        assert_eq!(claims.sub, 1);
        assert_eq!(claims.username, "testuser");
        assert_eq!(claims.role, "admin");
    }

    #[test]
    fn test_invalid_token_fails() {
        let config = test_config();
        let result = validate_token("invalid.token.here", &config);
        assert!(result.is_err());
    }

    #[test]
    fn test_extract_bearer_token() {
        assert_eq!(
            extract_bearer_token("Bearer abc123"),
            Some("abc123")
        );
        assert_eq!(
            extract_bearer_token("Basic abc123"),
            None
        );
    }
}
