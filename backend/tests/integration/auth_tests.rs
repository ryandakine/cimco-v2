use axum::http::StatusCode;
use serde_json::json;

use crate::common::fixtures::*;
use crate::common::helpers::*;

// ==================== Login Tests ====================

#[tokio::test]
async fn test_login_success_admin() {
    let app = create_test_app().await;
    
    let login_req = admin_login_request();
    let response = post(&app, "/api/auth/login", login_req).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert!(body["token"].is_string());
    assert!(!body["token"].as_str().unwrap().is_empty());
    assert_eq!(body["user"]["username"], "admin");
    assert_eq!(body["user"]["role"], "admin");
}

#[tokio::test]
async fn test_login_success_worker() {
    let app = create_test_app().await;
    
    let login_req = worker_login_request();
    let response = post(&app, "/api/auth/login", login_req).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert!(body["token"].is_string());
    assert_eq!(body["user"]["username"], "worker");
    assert_eq!(body["user"]["role"], "worker");
}

#[tokio::test]
async fn test_login_invalid_username() {
    let app = create_test_app().await;
    
    let login_req = invalid_login_request();
    let response = post(&app, "/api/auth/login", login_req).await;
    
    assert_status(&response, StatusCode::UNAUTHORIZED);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert!(body["error"].is_string());
}

#[tokio::test]
async fn test_login_invalid_password() {
    let app = create_test_app().await;
    
    let login_req = json!({
        "username": "admin",
        "password": "wrongpassword"
    });
    let response = post(&app, "/api/auth/login", login_req).await;
    
    assert_status(&response, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_login_missing_username() {
    let app = create_test_app().await;
    
    let login_req = json!({
        "password": "password123"
    });
    let response = post(&app, "/api/auth/login", login_req).await;
    
    assert_status(&response, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_login_missing_password() {
    let app = create_test_app().await;
    
    let login_req = json!({
        "username": "admin"
    });
    let response = post(&app, "/api/auth/login", login_req).await;
    
    assert_status(&response, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_login_empty_body() {
    let app = create_test_app().await;
    
    let response = post(&app, "/api/auth/login", json!({})).await;
    
    assert_status(&response, StatusCode::UNPROCESSABLE_ENTITY);
}

// ==================== Session Tests ====================

#[tokio::test]
async fn test_get_session_success() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/auth/session", &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert_eq!(body["valid"], true);
    assert_eq!(body["username"], "admin");
    assert_eq!(body["role"], "admin");
    assert!(body["user_id"].is_number());
}

#[tokio::test]
async fn test_get_session_worker() {
    let app = create_test_app().await;
    let token = login_as_worker(&app).await;
    
    let response = get_with_auth(&app, "/api/auth/session", &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert_eq!(body["username"], "worker");
    assert_eq!(body["role"], "worker");
}

#[tokio::test]
async fn test_get_session_no_auth() {
    let app = create_test_app().await;
    
    let response = get(&app, "/api/auth/session").await;
    
    assert_status(&response, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_get_session_invalid_token() {
    let app = create_test_app().await;
    
    let response = get_with_auth(&app, "/api/auth/session", "invalid_token").await;
    
    assert_status(&response, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_get_session_malformed_token() {
    let app = create_test_app().await;
    
    let response = get_with_auth(&app, "/api/auth/session", "not-a-uuid-format").await;
    
    assert_status(&response, StatusCode::UNAUTHORIZED);
}

// ==================== Logout Tests ====================

#[tokio::test]
async fn test_logout_success() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    // Verify token works
    let response = get_with_auth(&app, "/api/auth/session", &token).await;
    assert_status(&response, StatusCode::OK);
    
    // Logout
    let response = post_with_auth(&app, "/api/auth/logout", &token, json!({})).await;
    assert_status(&response, StatusCode::OK);
    
    // Verify token no longer works
    let response = get_with_auth(&app, "/api/auth/session", &token).await;
    assert_status(&response, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_logout_no_auth() {
    let app = create_test_app().await;
    
    let response = post(&app, "/api/auth/logout", json!({})).await;
    
    assert_status(&response, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_logout_invalid_token() {
    let app = create_test_app().await;
    
    let response = post_with_auth(&app, "/api/auth/logout", "invalid_token", json!({})).await;
    
    // Should still return OK as there's nothing to delete
    assert_status(&response, StatusCode::UNAUTHORIZED);
}

// ==================== Create User Tests ====================

#[tokio::test]
async fn test_create_user_success() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let new_user = json!({
        "username": "newadminuser",
        "password": "newpassword123",
        "role": "admin"
    });
    
    let response = post_with_auth(&app, "/api/auth/users", &token, new_user).await;
    
    assert_status(&response, StatusCode::CREATED);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert_eq!(body["username"], "newadminuser");
    assert_eq!(body["role"], "admin");
}

#[tokio::test]
async fn test_create_user_worker_by_admin() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let new_user = json!({
        "username": "newworkeruser",
        "password": "newpassword123",
        "role": "worker"
    });
    
    let response = post_with_auth(&app, "/api/auth/users", &token, new_user).await;
    
    assert_status(&response, StatusCode::CREATED);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert_eq!(body["username"], "newworkeruser");
    assert_eq!(body["role"], "worker");
}

#[tokio::test]
async fn test_create_user_worker_forbidden() {
    let app = create_test_app().await;
    let token = login_as_worker(&app).await;
    
    let new_user = json!({
        "username": "shouldfail",
        "password": "password123",
        "role": "worker"
    });
    
    let response = post_with_auth(&app, "/api/auth/users", &token, new_user).await;
    
    assert_status(&response, StatusCode::UNAUTHORIZED);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert!(body["error"].as_str().unwrap().contains("Only admins"));
}

#[tokio::test]
async fn test_create_user_no_auth() {
    let app = create_test_app().await;
    
    let new_user = json!({
        "username": "shouldfail",
        "password": "password123",
        "role": "admin"
    });
    
    let response = post(&app, "/api/auth/users", new_user).await;
    
    assert_status(&response, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_create_user_duplicate_username() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    // Try to create user with existing username
    let new_user = json!({
        "username": "admin", // Already exists
        "password": "password123",
        "role": "admin"
    });
    
    let response = post_with_auth(&app, "/api/auth/users", &token, new_user).await;
    
    assert_status(&response, StatusCode::INTERNAL_SERVER_ERROR);
}

#[tokio::test]
async fn test_create_user_missing_fields() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    // Missing password
    let new_user = json!({
        "username": "testuser",
        "role": "admin"
    });
    
    let response = post_with_auth(&app, "/api/auth/users", &token, new_user).await;
    assert_status(&response, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_user_invalid_role() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let new_user = json!({
        "username": "testuser",
        "password": "password123",
        "role": "invalid_role"
    });
    
    let response = post_with_auth(&app, "/api/auth/users", &token, new_user).await;
    
    assert_status(&response, StatusCode::UNPROCESSABLE_ENTITY);
}

// ==================== Protected Routes Access Tests ====================

#[tokio::test]
async fn test_protected_route_without_auth() {
    let app = create_test_app().await;
    
    let response = get(&app, "/api/parts").await;
    
    assert_status(&response, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_protected_route_with_invalid_auth_format() {
    let app = create_test_app().await;
    
    use axum::body::Body;
    use axum::http::Request;
    use tower::ServiceExt;
    
    // Missing "Bearer " prefix
    let request = Request::builder()
        .uri("/api/parts")
        .header("Authorization", "invalid_token")
        .body(Body::empty())
        .unwrap();
    
    let response = app.clone().oneshot(request).await.unwrap();
    
    assert_status(&response, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_protected_route_with_expired_session() {
    let app = create_test_app().await;
    
    // Use a random UUID that won't exist in the database
    let fake_token = "550e8400-e29b-41d4-a716-446655440000";
    let response = get_with_auth(&app, "/api/parts", fake_token).await;
    
    assert_status(&response, StatusCode::UNAUTHORIZED);
}

// ==================== Token Validation Tests ====================

#[tokio::test]
async fn test_login_returns_valid_token() {
    let app = create_test_app().await;
    
    let login_req = admin_login_request();
    let response = post(&app, "/api/auth/login", login_req).await;
    
    let body: serde_json::Value = response_to_json(response).await;
    let token = body["token"].as_str().unwrap();
    
    // Token should be a valid UUID format
    assert!(uuid::Uuid::parse_str(token).is_ok());
}

#[tokio::test]
async fn test_same_user_different_sessions() {
    let app = create_test_app().await;
    
    // Login twice
    let login_req = admin_login_request();
    let response1 = post(&app, "/api/auth/login", &login_req).await;
    let response2 = post(&app, "/api/auth/login", login_req).await;
    
    let body1: serde_json::Value = response_to_json(response1).await;
    let body2: serde_json::Value = response_to_json(response2).await;
    
    let token1 = body1["token"].as_str().unwrap();
    let token2 = body2["token"].as_str().unwrap();
    
    // Different tokens should be generated
    assert_ne!(token1, token2);
    
    // Both should work
    let resp1 = get_with_auth(&app, "/api/auth/session", token1).await;
    let resp2 = get_with_auth(&app, "/api/auth/session", token2).await;
    
    assert_status(&resp1, StatusCode::OK);
    assert_status(&resp2, StatusCode::OK);
}
