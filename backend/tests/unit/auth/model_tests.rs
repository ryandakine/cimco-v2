use cimco_inventory_v2::auth::model::{UserRole, UserResponse, User, Session, LoginRequest, LoginResponse, CreateUserRequest};
use chrono::Utc;

// ==================== UserRole Tests ====================

#[test]
fn test_user_role_as_str() {
    assert_eq!(UserRole::Admin.as_str(), "admin");
    assert_eq!(UserRole::Worker.as_str(), "worker");
}

#[test]
fn test_user_role_try_from_str_success() {
    assert_eq!(UserRole::try_from("admin"), Ok(UserRole::Admin));
    assert_eq!(UserRole::try_from("worker"), Ok(UserRole::Worker));
}

#[test]
fn test_user_role_try_from_str_error() {
    let result = UserRole::try_from("invalid");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Invalid user role: invalid");
    
    let result = UserRole::try_from("");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Invalid user role: ");
}

#[test]
fn test_user_role_try_from_string() {
    assert_eq!(UserRole::try_from("admin".to_string()), Ok(UserRole::Admin));
    assert_eq!(UserRole::try_from("worker".to_string()), Ok(UserRole::Worker));
    
    let result = UserRole::try_from("invalid".to_string());
    assert!(result.is_err());
}

#[test]
fn test_user_role_equality() {
    assert_eq!(UserRole::Admin, UserRole::Admin);
    assert_eq!(UserRole::Worker, UserRole::Worker);
    assert_ne!(UserRole::Admin, UserRole::Worker);
}

#[test]
fn test_user_role_clone() {
    let role = UserRole::Admin;
    let cloned = role.clone();
    assert_eq!(role, cloned);
}

#[test]
fn test_user_role_debug() {
    let role = UserRole::Admin;
    assert_eq!(format!("{:?}", role), "Admin");
}

#[test]
fn test_user_role_serialize() {
    let role = UserRole::Admin;
    let json = serde_json::to_string(&role).unwrap();
    assert_eq!(json, "\"admin\"");
    
    let role = UserRole::Worker;
    let json = serde_json::to_string(&role).unwrap();
    assert_eq!(json, "\"worker\"");
}

#[test]
fn test_user_role_deserialize() {
    let role: UserRole = serde_json::from_str("\"admin\"").unwrap();
    assert_eq!(role, UserRole::Admin);
    
    let role: UserRole = serde_json::from_str("\"worker\"").unwrap();
    assert_eq!(role, UserRole::Worker);
}

// ==================== User Tests ====================

#[test]
fn test_user_serialize() {
    let user = User {
        id: 1,
        username: "testuser".to_string(),
        password_hash: "hash123".to_string(),
        role: UserRole::Admin,
        created_at: Utc::now(),
    };
    
    let json = serde_json::to_string(&user).unwrap();
    assert!(json.contains("\"id\":1"));
    assert!(json.contains("\"username\":\"testuser\""));
    assert!(!json.contains("password_hash")); // Should be skipped in serialization
    assert!(json.contains("\"role\":\"admin\""));
}

#[test]
fn test_user_clone() {
    let user = User {
        id: 1,
        username: "test".to_string(),
        password_hash: "hash".to_string(),
        role: UserRole::Admin,
        created_at: Utc::now(),
    };
    
    let cloned = user.clone();
    assert_eq!(user.id, cloned.id);
    assert_eq!(user.username, cloned.username);
}

// ==================== Session Tests ====================

#[test]
fn test_session_creation() {
    let session = Session {
        user_id: 1,
        username: "admin".to_string(),
        role: UserRole::Admin,
    };
    
    assert_eq!(session.user_id, 1);
    assert_eq!(session.username, "admin");
    assert_eq!(session.role, UserRole::Admin);
}

#[test]
fn test_session_clone() {
    let session = Session {
        user_id: 1,
        username: "admin".to_string(),
        role: UserRole::Admin,
    };
    
    let cloned = session.clone();
    assert_eq!(session.user_id, cloned.user_id);
    assert_eq!(session.username, cloned.username);
}

#[test]
fn test_session_serialize() {
    let session = Session {
        user_id: 1,
        username: "admin".to_string(),
        role: UserRole::Admin,
    };
    
    let json = serde_json::to_string(&session).unwrap();
    assert!(json.contains("\"user_id\":1"));
    assert!(json.contains("\"username\":\"admin\""));
    assert!(json.contains("\"role\":\"admin\""));
}

// ==================== UserResponse Tests ====================

#[test]
fn test_user_response_from_user() {
    let user = User {
        id: 1,
        username: "admin".to_string(),
        password_hash: "secret_hash".to_string(),
        role: UserRole::Admin,
        created_at: Utc::now(),
    };
    
    let response: UserResponse = user.into();
    
    assert_eq!(response.id, 1);
    assert_eq!(response.username, "admin");
    assert_eq!(response.role, "admin");
}

#[test]
fn test_user_response_from_worker() {
    let user = User {
        id: 2,
        username: "worker".to_string(),
        password_hash: "secret_hash".to_string(),
        role: UserRole::Worker,
        created_at: Utc::now(),
    };
    
    let response: UserResponse = user.into();
    
    assert_eq!(response.id, 2);
    assert_eq!(response.username, "worker");
    assert_eq!(response.role, "worker");
}

#[test]
fn test_user_response_serialize() {
    let user = User {
        id: 1,
        username: "admin".to_string(),
        password_hash: "hash".to_string(),
        role: UserRole::Admin,
        created_at: Utc::now(),
    };
    
    let response: UserResponse = user.into();
    let json = serde_json::to_string(&response).unwrap();
    
    assert!(json.contains("\"id\":1"));
    assert!(json.contains("\"username\":\"admin\""));
    assert!(json.contains("\"role\":\"admin\""));
}

// ==================== LoginRequest Tests ====================

#[test]
fn test_login_request_deserialize() {
    let json = r#"{"username":"admin","password":"secret123"}"#;
    let req: LoginRequest = serde_json::from_str(json).unwrap();
    
    assert_eq!(req.username, "admin");
    assert_eq!(req.password, "secret123");
}

#[test]
fn test_login_request_debug() {
    let req = LoginRequest {
        username: "admin".to_string(),
        password: "secret".to_string(),
    };
    
    let debug = format!("{:?}", req);
    assert!(debug.contains("admin"));
    assert!(debug.contains("secret"));
}

// ==================== LoginResponse Tests ====================

#[test]
fn test_login_response_serialize() {
    let user = User {
        id: 1,
        username: "admin".to_string(),
        password_hash: "hash".to_string(),
        role: UserRole::Admin,
        created_at: Utc::now(),
    };
    
    let response = LoginResponse {
        user: UserResponse::from(user),
        token: "abc123".to_string(),
    };
    
    let json = serde_json::to_string(&response).unwrap();
    assert!(json.contains("\"token\":\"abc123\""));
    assert!(json.contains("\"user\""));
}

// ==================== CreateUserRequest Tests ====================

#[test]
fn test_create_user_request_deserialize() {
    let json = r#"{"username":"newuser","password":"pass123","role":"admin"}"#;
    let req: CreateUserRequest = serde_json::from_str(json).unwrap();
    
    assert_eq!(req.username, "newuser");
    assert_eq!(req.password, "pass123");
    assert_eq!(req.role, UserRole::Admin);
}

#[test]
fn test_create_user_request_worker_role() {
    let json = r#"{"username":"worker","password":"worker123","role":"worker"}"#;
    let req: CreateUserRequest = serde_json::from_str(json).unwrap();
    
    assert_eq!(req.role, UserRole::Worker);
}

#[test]
fn test_create_user_request_debug() {
    let req = CreateUserRequest {
        username: "newuser".to_string(),
        password: "pass123".to_string(),
        role: UserRole::Admin,
    };
    
    let debug = format!("{:?}", req);
    assert!(debug.contains("newuser"));
    assert!(debug.contains("Admin"));
}
