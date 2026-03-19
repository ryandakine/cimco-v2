use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use sqlx::PgPool;

use crate::auth::jwt::{create_token, validate_token, JwtConfig};
use crate::auth::model::{LoginRequest, LoginResponse, Session, User, UserResponse};
use crate::auth::validation::{validate_password, validate_username};
use crate::error::{AppError, Result};

pub struct AuthService;

impl AuthService {
    pub fn hash_password(password: &str) -> Result<String> {
        let argon2 = Argon2::default();
        let salt = SaltString::generate(&mut OsRng);
        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| AppError::Internal(format!("Password hashing failed: {}", e)))?;
        Ok(password_hash.to_string())
    }

    pub fn verify_password(password: &str, password_hash: &str) -> Result<bool> {
        let argon2 = Argon2::default();
        let parsed_hash = PasswordHash::new(password_hash)
            .map_err(|e| AppError::Internal(format!("Invalid password hash: {}", e)))?;
        Ok(argon2.verify_password(password.as_bytes(), &parsed_hash).is_ok())
    }

    pub async fn login(
        pool: &PgPool,
        req: LoginRequest,
        jwt_config: &JwtConfig,
    ) -> Result<LoginResponse> {
        let user: User = sqlx::query_as::<_, User>(
            r#"
            SELECT id, username, password_hash, role, created_at
            FROM users
            WHERE username = $1
            "#,
        )
        .bind(&req.username)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| AppError::Unauthorized("Invalid credentials".to_string()))?;

        if !Self::verify_password(&req.password, &user.password_hash)? {
            return Err(AppError::Unauthorized("Invalid credentials".to_string()));
        }

        // Create JWT token
        let token = create_token(user.id, &user.username, &user.role, jwt_config)?;

        tracing::info!("User {} logged in successfully", user.username);

        Ok(LoginResponse {
            user: UserResponse::from(user),
            token,
        })
    }

    pub async fn logout(_token: &str) -> Result<()> {
        // JWT tokens cannot be revoked server-side without a denylist
        // Client should discard the token
        tracing::info!("Logout requested (token discarded on client side)");
        Ok(())
    }

    pub async fn validate_session(token: &str, jwt_config: &JwtConfig) -> Result<Session> {
        let claims = validate_token(token, jwt_config)?;
        crate::auth::handler::session_from_claims(claims)
    }

    pub async fn create_user(
        pool: &PgPool,
        username: &str,
        password: &str,
        role: &crate::auth::model::UserRole,
    ) -> Result<User> {
        // Validate username and password before creating user
        validate_username(username)?;
        validate_password(password)?;

        let password_hash = Self::hash_password(password)?;
        let role_str = role.as_str();

        let user: User = sqlx::query_as(
            r#"
            INSERT INTO users (username, password_hash, role)
            VALUES ($1, $2, $3)
            RETURNING id, username, password_hash, role, created_at
            "#,
        )
        .bind(username)
        .bind(&password_hash)
        .bind(role_str)
        .fetch_one(pool)
        .await?;

        tracing::info!("Created user: {}", username);
        Ok(user)
    }

    pub async fn get_user_by_id(pool: &PgPool, user_id: i32) -> Result<User> {
        let user: User = sqlx::query_as(
            r#"
            SELECT id, username, password_hash, role, created_at
            FROM users
            WHERE id = $1
            "#,
        )
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        Ok(user)
    }
}
