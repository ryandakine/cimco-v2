use axum::http::StatusCode;

use crate::common::helpers::{create_test_app, get, assert_status};

#[tokio::test]
async fn test_health_check_returns_ok() {
    let app = create_test_app().await;
    
    let response = get(&app, "/health").await;
    
    assert_status(&response, StatusCode::OK);
}

#[tokio::test]
async fn test_health_check_returns_ok_body() {
    let app = create_test_app().await;
    
    let response = get(&app, "/health").await;
    let body = crate::common::helpers::response_to_string(response).await;
    
    assert_eq!(body, "OK");
}

#[tokio::test]
async fn test_health_check_is_public() {
    // Health check should not require authentication
    let app = create_test_app().await;
    
    let response = get(&app, "/health").await;
    
    // Should succeed without auth headers
    assert_status(&response, StatusCode::OK);
}

#[tokio::test]
async fn test_health_check_multiple_requests() {
    let app = create_test_app().await;
    
    // Multiple requests should all succeed
    for _ in 0..5 {
        let response = get(&app, "/health").await;
        assert_status(&response, StatusCode::OK);
    }
}
