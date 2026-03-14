use axum::http::StatusCode;
use axum::response::IntoResponse;
use cimco_inventory_v2::error::{AppError, Result};
use std::io;

// ==================== AppError Creation Tests ====================

#[test]
fn test_error_not_found() {
    let err = AppError::NotFound("User not found".to_string());
    match err {
        AppError::NotFound(msg) => assert_eq!(msg, "User not found"),
        _ => panic!("Expected NotFound error"),
    }
}

#[test]
fn test_error_unauthorized() {
    let err = AppError::Unauthorized("Invalid credentials".to_string());
    match err {
        AppError::Unauthorized(msg) => assert_eq!(msg, "Invalid credentials"),
        _ => panic!("Expected Unauthorized error"),
    }
}

#[test]
fn test_error_validation() {
    let err = AppError::Validation("Name is required".to_string());
    match err {
        AppError::Validation(msg) => assert_eq!(msg, "Name is required"),
        _ => panic!("Expected Validation error"),
    }
}

#[test]
fn test_error_database() {
    let err = AppError::Database("connection failed".to_string());
    match err {
        AppError::Database(_) => (), // Expected
        _ => panic!("Expected Database error"),
    }
}

#[test]
fn test_error_internal() {
    let err = AppError::Internal("Something went wrong".to_string());
    match err {
        AppError::Internal(msg) => assert_eq!(msg, "Something went wrong"),
        _ => panic!("Expected Internal error"),
    }
}

// ==================== Display Trait Tests ====================

#[test]
fn test_error_display_not_found() {
    let err = AppError::NotFound("User".to_string());
    assert_eq!(format!("{}", err), "Not found: User");
}

#[test]
fn test_error_display_unauthorized() {
    let err = AppError::Unauthorized("Bad token".to_string());
    assert_eq!(format!("{}", err), "Unauthorized: Bad token");
}

#[test]
fn test_error_display_validation() {
    let err = AppError::Validation("Invalid field".to_string());
    assert_eq!(format!("{}", err), "Validation error: Invalid field");
}

#[test]
fn test_error_display_database() {
    let err = AppError::Database("connection failed".to_string());
    assert!(format!("{}", err).starts_with("Database error:"));
}

#[test]
fn test_error_display_internal() {
    let err = AppError::Internal("Server error".to_string());
    assert_eq!(format!("{}", err), "Internal error: Server error");
}

// ==================== Debug Trait Tests ====================

#[test]
fn test_error_debug() {
    let err = AppError::NotFound("Test".to_string());
    let debug = format!("{:?}", err);
    assert!(debug.contains("NotFound"));
    assert!(debug.contains("Test"));
}

// ==================== IntoResponse Tests ====================

#[test]
fn test_error_into_response_not_found() {
    let err = AppError::NotFound("Resource".to_string());
    let response = err.into_response();
    
    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[test]
fn test_error_into_response_unauthorized() {
    let err = AppError::Unauthorized("Auth required".to_string());
    let response = err.into_response();
    
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[test]
fn test_error_into_response_validation() {
    let err = AppError::Validation("Bad input".to_string());
    let response = err.into_response();
    
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[test]
fn test_error_into_response_database() {
    let err = AppError::Database("pool closed".to_string());
    let response = err.into_response();
    
    assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);
}

#[test]
fn test_error_into_response_internal() {
    let err = AppError::Internal("Oops".to_string());
    let response = err.into_response();
    
    assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);
}

// ==================== From Trait Tests ====================

#[test]
fn test_error_from_sqlx_row_not_found() {
    let db_err = sqlx::Error::RowNotFound;
    let err: AppError = db_err.into();
    
    match err {
        AppError::NotFound(msg) => assert_eq!(msg, "Resource not found"),
        _ => panic!("Expected NotFound for RowNotFound"),
    }
}

#[test]
fn test_error_from_sqlx_other() {
    let db_err = sqlx::Error::PoolClosed;
    let err: AppError = db_err.into();
    
    match err {
        AppError::Database(msg) => {
            assert!(msg.contains("pool") || msg.contains("closed"));
        }
        _ => panic!("Expected Database for other SQLx errors"),
    }
}

#[test]
fn test_error_from_argon2() {
    let argon_err = argon2::password_hash::Error::Algorithm;
    let err: AppError = argon_err.into();
    
    match err {
        AppError::Validation(msg) => assert_eq!(msg, "Invalid password hash"),
        _ => panic!("Expected Validation for Argon2 error"),
    }
}

// ==================== Result Type Tests ====================

#[test]
fn test_result_ok() {
    let result: Result<i32> = Ok(42);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), 42);
}

#[test]
fn test_result_err() {
    let result: Result<i32> = Err(AppError::NotFound("test".to_string()));
    assert!(result.is_err());
}

// ==================== Error Clone Tests ====================

#[test]
fn test_error_clone_not_found() {
    let err = AppError::NotFound("test".to_string());
    let cloned = err.clone();
    
    match (&err, &cloned) {
        (AppError::NotFound(a), AppError::NotFound(b)) => assert_eq!(a, b),
        _ => panic!("Clone failed"),
    }
}

#[test]
fn test_error_clone_unauthorized() {
    let err = AppError::Unauthorized("test".to_string());
    let cloned = err.clone();
    
    match (&err, &cloned) {
        (AppError::Unauthorized(a), AppError::Unauthorized(b)) => assert_eq!(a, b),
        _ => panic!("Clone failed"),
    }
}

// ==================== Response Body Tests ====================

#[tokio::test]
async fn test_error_response_body_not_found() {
    use axum::body::to_bytes;
    
    let err = AppError::NotFound("User".to_string());
    let response = err.into_response();
    
    let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    
    assert_eq!(json["error"], "User");
    assert_eq!(json["status"], 404);
}

#[tokio::test]
async fn test_error_response_body_database() {
    use axum::body::to_bytes;
    
    let err = AppError::Database("pool closed".to_string());
    let response = err.into_response();
    
    let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    
    // Database errors should return the stored message
    assert_eq!(json["error"], "pool closed");
    assert_eq!(json["status"], 500);
}

#[tokio::test]
async fn test_error_response_body_internal() {
    use axum::body::to_bytes;
    
    let err = AppError::Internal("Secret error".to_string());
    let response = err.into_response();
    
    let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    
    // Internal errors should return generic message
    assert_eq!(json["error"], "Internal server error");
    assert_eq!(json["status"], 500);
}
