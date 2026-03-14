use axum::http::StatusCode;
use serde_json::json;

use crate::common::fixtures::*;
use crate::common::helpers::*;

// ==================== List Parts Tests ====================

#[tokio::test]
async fn test_list_parts_success() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts", &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert!(body["items"].is_array());
    assert!(body["total"].is_number());
    assert!(body["page"].is_number());
    assert!(body["page_size"].is_number());
    assert!(body["total_pages"].is_number());
}

#[tokio::test]
async fn test_list_parts_as_worker() {
    let app = create_test_app().await;
    let token = login_as_worker(&app).await;
    
    let response = get_with_auth(&app, "/api/parts", &token).await;
    
    assert_status(&response, StatusCode::OK);
}

#[tokio::test]
async fn test_list_parts_pagination_defaults() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts", &token).await;
    
    let body: serde_json::Value = response_to_json(response).await;
    assert_eq!(body["page"], 1);
    assert_eq!(body["page_size"], 25); // Default page size
}

#[tokio::test]
async fn test_list_parts_custom_page_size() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?page_size=10", &token).await;
    
    let body: serde_json::Value = response_to_json(response).await;
    assert_eq!(body["page_size"], 10);
}

#[tokio::test]
async fn test_list_parts_page_navigation() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    // Get first page
    let response = get_with_auth(&app, "/api/parts?page=1&page_size=2", &token).await;
    let body1: serde_json::Value = response_to_json(response).await;
    
    // Get second page
    let response = get_with_auth(&app, "/api/parts?page=2&page_size=2", &token).await;
    let body2: serde_json::Value = response_to_json(response).await;
    
    // Pages should be different
    if body1["items"].as_array().unwrap().len() > 0 && body2["items"].as_array().unwrap().len() > 0 {
        let id1 = body1["items"][0]["id"].as_i64().unwrap();
        let id2 = body2["items"][0]["id"].as_i64().unwrap();
        assert_ne!(id1, id2, "Different pages should have different items");
    }
}

// ==================== Search Tests ====================

#[tokio::test]
async fn test_list_parts_search_by_name() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?search=Bearing", &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    // Results should contain "Bearing" in name, description, or part_number
    if let Some(items) = body["items"].as_array() {
        for item in items {
            let name = item["name"].as_str().unwrap_or("").to_lowercase();
            assert!(name.contains("bearing") || items.is_empty());
        }
    }
}

#[tokio::test]
async fn test_list_parts_search_no_results() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?search=xyznonexistent123", &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert_eq!(body["total"], 0);
    let items = body["items"].as_array().unwrap();
    assert!(items.is_empty());
}

#[tokio::test]
async fn test_list_parts_search_empty() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    // Empty search should return all results
    let response = get_with_auth(&app, "/api/parts?search=", &token).await;
    
    assert_status(&response, StatusCode::OK);
}

// ==================== Filter Tests ====================

#[tokio::test]
async fn test_list_parts_filter_by_category() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?category=Hydraulics", &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    if let Some(items) = body["items"].as_array() {
        for item in items {
            assert_eq!(item["category"], "Hydraulics");
        }
    }
}

#[tokio::test]
async fn test_list_parts_filter_by_zone() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?zone=Production", &token).await;
    
    assert_status(&response, StatusCode::OK);
}

#[tokio::test]
async fn test_list_parts_filter_by_manufacturer() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?manufacturer=Siemens", &token).await;
    
    assert_status(&response, StatusCode::OK);
}

#[tokio::test]
async fn test_list_parts_filter_by_tracked() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?tracked=true", &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    if let Some(items) = body["items"].as_array() {
        for item in items {
            assert_eq!(item["tracked"], true);
        }
    }
}

#[tokio::test]
async fn test_list_parts_filter_stock_state_in_stock() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?stock_state=in_stock", &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    if let Some(items) = body["items"].as_array() {
        for item in items {
            let qty = item["quantity"].as_i64().unwrap();
            let min_qty = item["min_quantity"].as_i64().unwrap();
            assert!(qty > min_qty, "In stock items should have quantity > min_quantity");
        }
    }
}

#[tokio::test]
async fn test_list_parts_filter_stock_state_low_stock() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?stock_state=low_stock", &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    if let Some(items) = body["items"].as_array() {
        for item in items {
            let qty = item["quantity"].as_i64().unwrap();
            let min_qty = item["min_quantity"].as_i64().unwrap();
            assert!(qty > 0 && qty <= min_qty, "Low stock items should have 0 < quantity <= min_quantity");
        }
    }
}

#[tokio::test]
async fn test_list_parts_filter_stock_state_out_of_stock() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?stock_state=out_of_stock", &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    if let Some(items) = body["items"].as_array() {
        for item in items {
            let qty = item["quantity"].as_i64().unwrap();
            assert_eq!(qty, 0, "Out of stock items should have quantity = 0");
        }
    }
}

#[tokio::test]
async fn test_list_parts_combined_filters() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?category=Hydraulics&tracked=true&page_size=10", &token).await;
    
    assert_status(&response, StatusCode::OK);
}

// ==================== Sorting Tests ====================

#[tokio::test]
async fn test_list_parts_sort_by_name_asc() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?sort_by=name&sort_order=asc", &token).await;
    
    assert_status(&response, StatusCode::OK);
}

#[tokio::test]
async fn test_list_parts_sort_by_name_desc() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?sort_by=name&sort_order=desc", &token).await;
    
    assert_status(&response, StatusCode::OK);
}

#[tokio::test]
async fn test_list_parts_sort_by_quantity() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?sort_by=quantity&sort_order=desc", &token).await;
    
    assert_status(&response, StatusCode::OK);
}

#[tokio::test]
async fn test_list_parts_sort_by_updated_at() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts?sort_by=updated_at", &token).await;
    
    assert_status(&response, StatusCode::OK);
}

// ==================== Get Part Tests ====================

#[tokio::test]
async fn test_get_part_success() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    // First, get a list of parts to find a valid ID
    let response = get_with_auth(&app, "/api/parts?page_size=1", &token).await;
    let list_body: serde_json::Value = response_to_json(response).await;
    
    if let Some(first_item) = list_body["items"].as_array().and_then(|i| i.first()) {
        let id = first_item["id"].as_i64().unwrap();
        
        let response = get_with_auth(&app, &format!("/api/parts/{}", id), &token).await;
        
        assert_status(&response, StatusCode::OK);
        
        let body: serde_json::Value = response_to_json(response).await;
        assert_eq!(body["id"], id);
        assert!(body["name"].is_string());
    }
}

#[tokio::test]
async fn test_get_part_not_found() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts/99999", &token).await;
    
    assert_status(&response, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_get_part_invalid_id() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts/invalid", &token).await;
    
    assert_status(&response, StatusCode::BAD_REQUEST);
}

// ==================== Create Part Tests ====================

#[tokio::test]
async fn test_create_part_success() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let new_part = json!({
        "name": "Test Part Creation",
        "category": "Test Category",
        "quantity": 10,
        "min_quantity": 5
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    
    assert_status(&response, StatusCode::CREATED);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert_eq!(body["name"], "Test Part Creation");
    assert_eq!(body["category"], "Test Category");
    assert_eq!(body["quantity"], 10);
    assert!(body["id"].is_number());
    assert!(body["created_at"].is_string());
}

#[tokio::test]
async fn test_create_part_worker_forbidden() {
    let app = create_test_app().await;
    let token = login_as_worker(&app).await;
    
    let new_part = json!({
        "name": "Should Fail",
        "category": "Test"
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    
    assert_status(&response, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_create_part_validation_empty_name() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let new_part = json!({
        "name": "",
        "category": "Test"
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    
    assert_status(&response, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_create_part_validation_empty_category() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let new_part = json!({
        "name": "Valid Name",
        "category": ""
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    
    assert_status(&response, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_create_part_validation_whitespace_only() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let new_part = json!({
        "name": "   ",
        "category": "   "
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    
    assert_status(&response, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_create_part_with_all_fields() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let new_part = json!({
        "name": "Complete Part",
        "description": "A complete test part",
        "category": "Complete",
        "part_type": "Type A",
        "manufacturer": "Test Mfg",
        "part_number": "TP-001",
        "quantity": 50,
        "min_quantity": 10,
        "lead_time_days": 14,
        "location": "Shelf A1",
        "machine_location": "Machine 1",
        "function_description": "Testing",
        "zone": "Test Zone",
        "bom_reference": "BOM-001",
        "yard_label": "YL-001",
        "image_url": "http://example.com/img.jpg",
        "unit_cost": 99.99,
        "supplier": "Supplier Co",
        "wear_rating": 5,
        "tracked": true
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    
    assert_status(&response, StatusCode::CREATED);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert_eq!(body["name"], "Complete Part");
    assert_eq!(body["unit_cost"], 99.99);
}

// ==================== Update Part Tests ====================

#[tokio::test]
async fn test_update_part_success() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    // First create a part
    let new_part = json!({
        "name": "Part to Update",
        "category": "Test"
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    let body: serde_json::Value = response_to_json(response).await;
    let id = body["id"].as_i64().unwrap();
    let created_at = body["created_at"].as_str().unwrap();
    
    // Update the part
    let update = json!({
        "name": "Updated Part Name",
        "min_quantity": 20
    });
    
    let response = put_with_auth(&app, &format!("/api/parts/{}", id), &token, update).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert_eq!(body["name"], "Updated Part Name");
    assert_eq!(body["min_quantity"], 20);
    // created_at should remain unchanged
    assert_eq!(body["created_at"].as_str().unwrap(), created_at);
}

#[tokio::test]
async fn test_update_part_worker_forbidden() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    let worker_token = login_as_worker(&app).await;
    
    // First create a part as admin
    let new_part = json!({
        "name": "Part to Update",
        "category": "Test"
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    let body: serde_json::Value = response_to_json(response).await;
    let id = body["id"].as_i64().unwrap();
    
    // Try to update as worker
    let update = json!({"name": "Should Fail"});
    let response = put_with_auth(&app, &format!("/api/parts/{}", id), &worker_token, update).await;
    
    assert_status(&response, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_update_part_not_found() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let update = json!({"name": "Should Fail"});
    let response = put_with_auth(&app, "/api/parts/99999", &token, update).await;
    
    assert_status(&response, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_update_part_partial_fields() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    // Create a part
    let new_part = json!({
        "name": "Part for Partial Update",
        "category": "Test",
        "location": "Original Location"
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    let body: serde_json::Value = response_to_json(response).await;
    let id = body["id"].as_i64().unwrap();
    let original_category = body["category"].as_str().unwrap();
    
    // Update only location
    let update = json!({
        "location": "New Location"
    });
    
    let response = put_with_auth(&app, &format!("/api/parts/{}", id), &token, update).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert_eq!(body["location"], "New Location");
    // Category should remain unchanged
    assert_eq!(body["category"].as_str().unwrap(), original_category);
}

// ==================== Adjust Quantity Tests ====================

#[tokio::test]
async fn test_adjust_quantity_increase() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    // Create a part
    let new_part = json!({
        "name": "Part to Adjust",
        "category": "Test",
        "quantity": 10
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    let body: serde_json::Value = response_to_json(response).await;
    let id = body["id"].as_i64().unwrap();
    
    // Increase quantity
    let adjustment = json!({
        "change_amount": 5,
        "reason": "Restocked"
    });
    
    let response = post_with_auth(&app, &format!("/api/parts/{}/adjust-quantity", id), &token, adjustment).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert_eq!(body["change_amount"], 5);
    assert_eq!(body["new_quantity"], 15);
    assert_eq!(body["reason"], "Restocked");
}

#[tokio::test]
async fn test_adjust_quantity_decrease() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    // Create a part with enough quantity
    let new_part = json!({
        "name": "Part to Decrease",
        "category": "Test",
        "quantity": 20
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    let body: serde_json::Value = response_to_json(response).await;
    let id = body["id"].as_i64().unwrap();
    
    // Decrease quantity
    let adjustment = json!({
        "change_amount": -5,
        "reason": "Used in production"
    });
    
    let response = post_with_auth(&app, &format!("/api/parts/{}/adjust-quantity", id), &token, adjustment).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert_eq!(body["change_amount"], -5);
    assert_eq!(body["new_quantity"], 15);
}

#[tokio::test]
async fn test_adjust_quantity_prevents_negative() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    // Create a part with limited quantity
    let new_part = json!({
        "name": "Part Low Stock",
        "category": "Test",
        "quantity": 5
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    let body: serde_json::Value = response_to_json(response).await;
    let id = body["id"].as_i64().unwrap();
    
    // Try to decrease more than available
    let adjustment = json!({
        "change_amount": -100,
        "reason": "Invalid"
    });
    
    let response = post_with_auth(&app, &format!("/api/parts/{}/adjust-quantity", id), &token, adjustment).await;
    
    assert_status(&response, StatusCode::BAD_REQUEST);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert!(body["error"].as_str().unwrap().contains("negative"));
}

#[tokio::test]
async fn test_adjust_quantity_worker_can_adjust() {
    let app = create_test_app().await;
    let admin_token = login_as_admin(&app).await;
    let worker_token = login_as_worker(&app).await;
    
    // Create a part as admin
    let new_part = json!({
        "name": "Part Worker Adjust",
        "category": "Test",
        "quantity": 10
    });
    
    let response = post_with_auth(&app, "/api/parts", &admin_token, new_part).await;
    let body: serde_json::Value = response_to_json(response).await;
    let id = body["id"].as_i64().unwrap();
    
    // Worker can adjust quantity
    let adjustment = json!({
        "change_amount": -2,
        "reason": "Used by worker"
    });
    
    let response = post_with_auth(&app, &format!("/api/parts/{}/adjust-quantity", id), &worker_token, adjustment).await;
    
    assert_status(&response, StatusCode::OK);
}

#[tokio::test]
async fn test_adjust_quantity_not_found() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let adjustment = json!({
        "change_amount": 5,
        "reason": "Test"
    });
    
    let response = post_with_auth(&app, "/api/parts/99999/adjust-quantity", &token, adjustment).await;
    
    assert_status(&response, StatusCode::NOT_FOUND);
}

// ==================== Transaction History Tests ====================

#[tokio::test]
async fn test_get_transaction_history() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    // Create a part
    let new_part = json!({
        "name": "Part with History",
        "category": "Test",
        "quantity": 10
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    let body: serde_json::Value = response_to_json(response).await;
    let id = body["id"].as_i64().unwrap();
    
    // Make adjustments to create history
    let adjustment = json!({"change_amount": 5, "reason": "First"});
    post_with_auth(&app, &format!("/api/parts/{}/adjust-quantity", id), &token, adjustment).await;
    
    let adjustment = json!({"change_amount": -3, "reason": "Second"});
    post_with_auth(&app, &format!("/api/parts/{}/adjust-quantity", id), &token, adjustment).await;
    
    // Get history
    let response = get_with_auth(&app, &format!("/api/parts/{}/history", id), &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert!(body.is_array());
    
    let history = body.as_array().unwrap();
    assert!(history.len() >= 2);
    
    // History should be sorted by timestamp DESC (newest first)
    if history.len() >= 2 {
        assert_eq!(history[0]["change_amount"], -3); // Last adjustment
        assert_eq!(history[1]["change_amount"], 5);  // First adjustment
    }
}

#[tokio::test]
async fn test_get_transaction_history_empty() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    // Create a part without adjustments
    let new_part = json!({
        "name": "Part without History",
        "category": "Test"
    });
    
    let response = post_with_auth(&app, "/api/parts", &token, new_part).await;
    let body: serde_json::Value = response_to_json(response).await;
    let id = body["id"].as_i64().unwrap();
    
    // Get history
    let response = get_with_auth(&app, &format!("/api/parts/{}/history", id), &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    let history = body.as_array().unwrap();
    assert!(history.is_empty());
}

#[tokio::test]
async fn test_get_transaction_history_not_found() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts/99999/history", &token).await;
    
    // Should still return OK with empty history
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    let history = body.as_array().unwrap();
    assert!(history.is_empty());
}

// ==================== CSV Export Tests ====================

#[tokio::test]
async fn test_export_csv_success() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts/export", &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let content_type = response.headers().get("content-type").unwrap().to_str().unwrap();
    assert!(content_type.contains("text/csv"));
    
    let disposition = response.headers().get("content-disposition").unwrap().to_str().unwrap();
    assert!(disposition.contains("attachment"));
    assert!(disposition.contains(".csv"));
}

#[tokio::test]
async fn test_export_csv_content() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/parts/export", &token).await;
    let body = response_to_bytes(response).await;
    let csv = String::from_utf8(body).unwrap();
    
    // Should have header
    assert!(csv.contains("ID,Name,Description,Category,Quantity,Min Quantity"));
    
    // Should have data rows
    let lines: Vec<&str> = csv.lines().collect();
    assert!(lines.len() > 1);
}

#[tokio::test]
async fn test_export_csv_as_worker() {
    let app = create_test_app().await;
    let token = login_as_worker(&app).await;
    
    let response = get_with_auth(&app, "/api/parts/export", &token).await;
    
    assert_status(&response, StatusCode::OK);
}
