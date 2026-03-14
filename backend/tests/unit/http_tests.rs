use cimco_inventory_v2::http::dto::{
    ApiResponse, PaginationInfo, PaginationQuery, PaginatedResponse, Validate,
};

// ==================== ApiResponse Tests ====================

#[test]
fn test_api_response_success() {
    let data = "test data";
    let response = ApiResponse::success(data);
    
    assert!(response.success);
    assert_eq!(response.data, Some("test data"));
    assert_eq!(response.error, None);
}

#[test]
fn test_api_response_error() {
    let response: ApiResponse<String> = ApiResponse::error("Something went wrong");
    
    assert!(!response.success);
    assert_eq!(response.data, None);
    assert_eq!(response.error, Some("Something went wrong".to_string()));
}

#[test]
fn test_api_response_error_with_string() {
    let response: ApiResponse<i32> = ApiResponse::error("Error message".to_string());
    
    assert!(!response.success);
    assert_eq!(response.error, Some("Error message".to_string()));
}

#[test]
fn test_api_response_serialize_success() {
    let response = ApiResponse::success(vec![1, 2, 3]);
    let json = serde_json::to_string(&response).unwrap();
    
    assert!(json.contains("\"success\":true"));
    assert!(json.contains("\"data\":[1,2,3]"));
}

#[test]
fn test_api_response_serialize_error() {
    let response: ApiResponse<i32> = ApiResponse::error("Failed");
    let json = serde_json::to_string(&response).unwrap();
    
    assert!(json.contains("\"success\":false"));
    assert!(json.contains("\"error\":\"Failed\""));
}

#[test]
fn test_api_response_with_complex_type() {
    #[derive(serde::Serialize, Clone)]
    struct TestData {
        id: i32,
        name: String,
    }
    
    let data = TestData {
        id: 1,
        name: "Test".to_string(),
    };
    
    let response = ApiResponse::success(data);
    assert!(response.success);
    assert!(response.data.is_some());
}

// ==================== PaginationQuery Tests ====================

#[test]
fn test_pagination_query_defaults() {
    let query = PaginationQuery {
        page: None,
        page_size: None,
    };
    
    assert!(query.page.is_none());
    assert!(query.page_size.is_none());
}

#[test]
fn test_pagination_query_with_values() {
    let query = PaginationQuery {
        page: Some(2),
        page_size: Some(50),
    };
    
    assert_eq!(query.page, Some(2));
    assert_eq!(query.page_size, Some(50));
}

#[test]
fn test_pagination_query_deserialize() {
    let json = r#"{"page":2,"page_size":50}"#;
    let query: PaginationQuery = serde_json::from_str(json).unwrap();
    
    assert_eq!(query.page, Some(2));
    assert_eq!(query.page_size, Some(50));
}

#[test]
fn test_pagination_query_partial() {
    let json = r#"{"page":5}"#;
    let query: PaginationQuery = serde_json::from_str(json).unwrap();
    
    assert_eq!(query.page, Some(5));
    assert!(query.page_size.is_none());
}

// ==================== PaginationInfo Tests ====================

#[test]
fn test_pagination_info_creation() {
    let info = PaginationInfo {
        page: 2,
        page_size: 25,
        total: 100,
        total_pages: 4,
    };
    
    assert_eq!(info.page, 2);
    assert_eq!(info.page_size, 25);
    assert_eq!(info.total, 100);
    assert_eq!(info.total_pages, 4);
}

#[test]
fn test_pagination_info_serialize() {
    let info = PaginationInfo {
        page: 1,
        page_size: 10,
        total: 50,
        total_pages: 5,
    };
    
    let json = serde_json::to_string(&info).unwrap();
    assert!(json.contains("\"page\":1"));
    assert!(json.contains("\"total\":50"));
    assert!(json.contains("\"total_pages\":5"));
}

// ==================== PaginatedResponse Tests ====================

#[test]
fn test_paginated_response_creation() {
    let items = vec!["item1", "item2", "item3"];
    let pagination = PaginationInfo {
        page: 1,
        page_size: 10,
        total: 3,
        total_pages: 1,
    };
    
    let response = PaginatedResponse {
        items,
        pagination,
    };
    
    assert_eq!(response.items.len(), 3);
    assert_eq!(response.pagination.total, 3);
}

#[test]
fn test_paginated_response_serialize() {
    let items: Vec<i32> = vec![1, 2, 3];
    let pagination = PaginationInfo {
        page: 1,
        page_size: 10,
        total: 3,
        total_pages: 1,
    };
    
    let response = PaginatedResponse {
        items,
        pagination,
    };
    
    let json = serde_json::to_string(&response).unwrap();
    assert!(json.contains("\"items\":[1,2,3]"));
    assert!(json.contains("\"pagination\""));
}

#[test]
fn test_paginated_response_empty() {
    let items: Vec<i32> = vec![];
    let pagination = PaginationInfo {
        page: 1,
        page_size: 10,
        total: 0,
        total_pages: 0,
    };
    
    let response = PaginatedResponse {
        items,
        pagination,
    };
    
    assert!(response.items.is_empty());
    assert_eq!(response.pagination.total, 0);
}

// ==================== Validate Trait Tests ====================

// Since Validate is a trait, we test it by implementing it for a test struct
#[derive(Debug, serde::Deserialize)]
struct TestValidatable {
    name: String,
    age: i32,
}

impl Validate for TestValidatable {
    fn validate(&self) -> Result<(), String> {
        if self.name.trim().is_empty() {
            return Err("Name is required".to_string());
        }
        if self.age < 0 {
            return Err("Age cannot be negative".to_string());
        }
        Ok(())
    }
}

#[test]
fn test_validate_trait_valid() {
    let item = TestValidatable {
        name: "John".to_string(),
        age: 30,
    };
    
    assert!(item.validate().is_ok());
}

#[test]
fn test_validate_trait_empty_name() {
    let item = TestValidatable {
        name: "".to_string(),
        age: 30,
    };
    
    let result = item.validate();
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Name is required");
}

#[test]
fn test_validate_trait_negative_age() {
    let item = TestValidatable {
        name: "John".to_string(),
        age: -5,
    };
    
    let result = item.validate();
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Age cannot be negative");
}

// ==================== Route Tests ====================

// We verify the route function signatures exist
#[test]
fn test_create_router_function_exists() {
    fn _check_router_signature() {
        use std::sync::Arc;
        use cimco_inventory_v2::db::DbPool;
        
        let _: fn(Arc<DbPool>, tower_http::cors::CorsLayer) -> axum::Router =
            cimco_inventory_v2::http::routes::create_router;
    }
}

// ==================== Middleware Tests ====================

// Verify that auth middleware function exists
#[test]
fn test_auth_middleware_function_exists() {
    use axum::extract::{Extension, Request};
    use axum::middleware::Next;
    use axum::response::Response;
    use std::sync::Arc;
    use cimco_inventory_v2::db::DbPool;
    use cimco_inventory_v2::error::AppError;
    
    fn _check_middleware_signature(
        ext: Extension<Arc<DbPool>>,
        req: Request,
        next: Next,
    ) -> impl std::future::Future<Output = Result<Response, AppError>> {
        cimco_inventory_v2::http::middleware::auth::auth_middleware(ext, req, next)
    }
}
