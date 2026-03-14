use chrono::Utc;
use cimco_inventory_v2::inventory::model::{
    AdjustQuantityRequest, CreatePartRequest, CsvExportRow, InventoryTransaction, Part,
    PartTransaction, PartsListResponse, PartsQuery, StockState, UpdatePartRequest,
};

// ==================== StockState Tests ====================

#[test]
fn test_stock_state_as_str() {
    assert_eq!(StockState::InStock.as_str(), "in_stock");
    assert_eq!(StockState::LowStock.as_str(), "low_stock");
    assert_eq!(StockState::OutOfStock.as_str(), "out_of_stock");
}

#[test]
fn test_stock_state_try_from_str_success() {
    assert_eq!(StockState::try_from("in_stock"), Ok(StockState::InStock));
    assert_eq!(StockState::try_from("low_stock"), Ok(StockState::LowStock));
    assert_eq!(StockState::try_from("out_of_stock"), Ok(StockState::OutOfStock));
}

#[test]
fn test_stock_state_try_from_str_error() {
    let result = StockState::try_from("invalid");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Invalid stock state: invalid");
    
    let result = StockState::try_from("");
    assert!(result.is_err());
    
    let result = StockState::try_from("INSTOCK"); // Case sensitive
    assert!(result.is_err());
}

#[test]
fn test_stock_state_clone() {
    let state = StockState::InStock;
    let cloned = state.clone();
    assert_eq!(state, cloned);
}

#[test]
fn test_stock_state_debug() {
    assert_eq!(format!("{:?}", StockState::InStock), "InStock");
    assert_eq!(format!("{:?}", StockState::LowStock), "LowStock");
    assert_eq!(format!("{:?}", StockState::OutOfStock), "OutOfStock");
}

#[test]
fn test_stock_state_equality() {
    assert_eq!(StockState::InStock, StockState::InStock);
    assert_ne!(StockState::InStock, StockState::OutOfStock);
}

// ==================== Part Tests ====================

#[test]
fn test_part_creation() {
    let part = Part {
        id: 1,
        name: "Test Part".to_string(),
        description: Some("Test Description".to_string()),
        category: "Test Category".to_string(),
        part_type: Some("Type A".to_string()),
        manufacturer: Some("Test Co".to_string()),
        part_number: Some("TN-001".to_string()),
        quantity: 10,
        min_quantity: 5,
        lead_time_days: 7,
        location: Some("Shelf A1".to_string()),
        machine_location: Some("Machine 1".to_string()),
        function_description: Some("Testing".to_string()),
        zone: Some("Zone 1".to_string()),
        bom_reference: Some("BOM-001".to_string()),
        yard_label: Some("YL-001".to_string()),
        image_url: Some("http://example.com/img.jpg".to_string()),
        unit_cost: Some(99.99),
        supplier: Some("Supplier Co".to_string()),
        wear_rating: Some(5),
        tracked: true,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    
    assert_eq!(part.id, 1);
    assert_eq!(part.name, "Test Part");
    assert_eq!(part.quantity, 10);
    assert!(part.tracked);
}

#[test]
fn test_part_serialize() {
    let part = Part {
        id: 1,
        name: "Test".to_string(),
        description: None,
        category: "Cat".to_string(),
        part_type: None,
        manufacturer: None,
        part_number: None,
        quantity: 0,
        min_quantity: 0,
        lead_time_days: 0,
        location: None,
        machine_location: None,
        function_description: None,
        zone: None,
        bom_reference: None,
        yard_label: None,
        image_url: None,
        unit_cost: None,
        supplier: None,
        wear_rating: None,
        tracked: false,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    
    let json = serde_json::to_string(&part).unwrap();
    assert!(json.contains("\"id\":1"));
    assert!(json.contains("\"name\":\"Test\""));
    assert!(json.contains("\"tracked\":false"));
}

#[test]
fn test_part_clone() {
    let part = Part {
        id: 1,
        name: "Test".to_string(),
        description: Some("Desc".to_string()),
        category: "Cat".to_string(),
        part_type: None,
        manufacturer: None,
        part_number: None,
        quantity: 10,
        min_quantity: 5,
        lead_time_days: 7,
        location: None,
        machine_location: None,
        function_description: None,
        zone: None,
        bom_reference: None,
        yard_label: None,
        image_url: None,
        unit_cost: None,
        supplier: None,
        wear_rating: None,
        tracked: true,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    
    let cloned = part.clone();
    assert_eq!(part.id, cloned.id);
    assert_eq!(part.name, cloned.name);
}

// ==================== InventoryTransaction Tests ====================

#[test]
fn test_inventory_transaction_creation() {
    let tx = InventoryTransaction {
        id: 1,
        part_id: 2,
        change_amount: 5,
        new_quantity: 15,
        reason: Some("Restocked".to_string()),
        changed_by: 1,
        timestamp: Utc::now(),
    };
    
    assert_eq!(tx.id, 1);
    assert_eq!(tx.part_id, 2);
    assert_eq!(tx.change_amount, 5);
    assert_eq!(tx.new_quantity, 15);
}

#[test]
fn test_inventory_transaction_serialize() {
    let tx = InventoryTransaction {
        id: 1,
        part_id: 2,
        change_amount: -3,
        new_quantity: 7,
        reason: None,
        changed_by: 1,
        timestamp: Utc::now(),
    };
    
    let json = serde_json::to_string(&tx).unwrap();
    assert!(json.contains("\"id\":1"));
    assert!(json.contains("\"change_amount\":-3"));
    assert!(json.contains("\"new_quantity\":7"));
}

// ==================== PartTransaction Tests ====================

#[test]
fn test_part_transaction_creation() {
    let tx = PartTransaction {
        id: 1,
        change_amount: 5,
        new_quantity: 15,
        reason: Some("Restocked".to_string()),
        changed_by_username: "admin".to_string(),
        timestamp: Utc::now(),
    };
    
    assert_eq!(tx.id, 1);
    assert_eq!(tx.changed_by_username, "admin");
}

#[test]
fn test_part_transaction_serialize() {
    let tx = PartTransaction {
        id: 1,
        change_amount: 5,
        new_quantity: 15,
        reason: None,
        changed_by_username: "worker".to_string(),
        timestamp: Utc::now(),
    };
    
    let json = serde_json::to_string(&tx).unwrap();
    assert!(json.contains("\"changed_by_username\":\"worker\""));
}

// ==================== PartsListResponse Tests ====================

#[test]
fn test_parts_list_response_creation() {
    let response = PartsListResponse {
        items: vec![],
        total: 0,
        page: 1,
        page_size: 25,
        total_pages: 0,
    };
    
    assert_eq!(response.total, 0);
    assert_eq!(response.page, 1);
    assert_eq!(response.page_size, 25);
    assert_eq!(response.total_pages, 0);
}

#[test]
fn test_parts_list_response_with_items() {
    let part = Part {
        id: 1,
        name: "Test".to_string(),
        description: None,
        category: "Cat".to_string(),
        part_type: None,
        manufacturer: None,
        part_number: None,
        quantity: 10,
        min_quantity: 5,
        lead_time_days: 7,
        location: None,
        machine_location: None,
        function_description: None,
        zone: None,
        bom_reference: None,
        yard_label: None,
        image_url: None,
        unit_cost: None,
        supplier: None,
        wear_rating: None,
        tracked: true,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    
    let response = PartsListResponse {
        items: vec![part],
        total: 1,
        page: 1,
        page_size: 25,
        total_pages: 1,
    };
    
    assert_eq!(response.items.len(), 1);
    assert_eq!(response.total, 1);
}

#[test]
fn test_parts_list_response_serialize() {
    let response = PartsListResponse {
        items: vec![],
        total: 100,
        page: 1,
        page_size: 25,
        total_pages: 4,
    };
    
    let json = serde_json::to_string(&response).unwrap();
    assert!(json.contains("\"total\":100"));
    assert!(json.contains("\"total_pages\":4"));
}

// ==================== PartsQuery Tests ====================

#[test]
fn test_parts_query_default() {
    let query = PartsQuery {
        search: None,
        category: None,
        zone: None,
        manufacturer: None,
        stock_state: None,
        tracked: None,
        sort_by: None,
        sort_order: None,
        page: None,
        page_size: None,
    };
    
    assert!(query.search.is_none());
    assert!(query.page.is_none());
}

#[test]
fn test_parts_query_with_values() {
    let query = PartsQuery {
        search: Some("bearing".to_string()),
        category: Some("Mechanical".to_string()),
        zone: Some("Production".to_string()),
        manufacturer: Some("SKF".to_string()),
        stock_state: Some("in_stock".to_string()),
        tracked: Some(true),
        sort_by: Some("name".to_string()),
        sort_order: Some("asc".to_string()),
        page: Some(1),
        page_size: Some(50),
    };
    
    assert_eq!(query.search, Some("bearing".to_string()));
    assert_eq!(query.page, Some(1));
    assert_eq!(query.page_size, Some(50));
}

#[test]
fn test_parts_query_deserialize() {
    let json = r#"{
        "search": "test",
        "category": "Cat",
        "page": 2,
        "page_size": 10
    }"#;
    
    let query: PartsQuery = serde_json::from_str(json).unwrap();
    assert_eq!(query.search, Some("test".to_string()));
    assert_eq!(query.page, Some(2));
    assert_eq!(query.page_size, Some(10));
}

// ==================== CreatePartRequest Tests ====================

#[test]
fn test_create_part_request_deserialize() {
    let json = r#"{
        "name": "Test Part",
        "category": "Test",
        "quantity": 10,
        "min_quantity": 5
    }"#;
    
    let req: CreatePartRequest = serde_json::from_str(json).unwrap();
    assert_eq!(req.name, "Test Part");
    assert_eq!(req.category, "Test");
    assert_eq!(req.quantity, Some(10));
    assert_eq!(req.min_quantity, Some(5));
}

#[test]
fn test_create_part_request_optional_fields() {
    let json = r#"{"name": "Test", "category": "Cat"}"#;
    
    let req: CreatePartRequest = serde_json::from_str(json).unwrap();
    assert_eq!(req.name, "Test");
    assert_eq!(req.quantity, None);
    assert_eq!(req.tracked, None);
}

// ==================== UpdatePartRequest Tests ====================

#[test]
fn test_update_part_request_deserialize() {
    let json = r#"{
        "name": "Updated Name",
        "min_quantity": 10
    }"#;
    
    let req: UpdatePartRequest = serde_json::from_str(json).unwrap();
    assert_eq!(req.name, Some("Updated Name".to_string()));
    assert_eq!(req.min_quantity, Some(10));
    assert_eq!(req.category, None);
}

#[test]
fn test_update_part_request_empty() {
    let json = r#"{}"#;
    
    let req: UpdatePartRequest = serde_json::from_str(json).unwrap();
    assert!(req.name.is_none());
    assert!(req.category.is_none());
}

// ==================== AdjustQuantityRequest Tests ====================

#[test]
fn test_adjust_quantity_request_positive() {
    let json = r#"{"change_amount": 5, "reason": "Restocked"}"#;
    
    let req: AdjustQuantityRequest = serde_json::from_str(json).unwrap();
    assert_eq!(req.change_amount, 5);
    assert_eq!(req.reason, Some("Restocked".to_string()));
}

#[test]
fn test_adjust_quantity_request_negative() {
    let json = r#"{"change_amount": -3, "reason": "Used"}"#;
    
    let req: AdjustQuantityRequest = serde_json::from_str(json).unwrap();
    assert_eq!(req.change_amount, -3);
    assert_eq!(req.reason, Some("Used".to_string()));
}

#[test]
fn test_adjust_quantity_request_no_reason() {
    let json = r#"{"change_amount": 1}"#;
    
    let req: AdjustQuantityRequest = serde_json::from_str(json).unwrap();
    assert_eq!(req.change_amount, 1);
    assert_eq!(req.reason, None);
}

// ==================== CsvExportRow Tests ====================

#[test]
fn test_csv_export_row_creation() {
    let row = CsvExportRow {
        id: 1,
        name: "Test Part".to_string(),
        description: Some("Description".to_string()),
        category: "Category".to_string(),
        quantity: 10,
        min_quantity: 5,
        location: Some("Shelf A1".to_string()),
        zone: Some("Zone 1".to_string()),
        manufacturer: Some("Mfg".to_string()),
        part_number: Some("PN-001".to_string()),
    };
    
    assert_eq!(row.id, 1);
    assert_eq!(row.name, "Test Part");
    assert_eq!(row.quantity, 10);
}

#[test]
fn test_csv_export_row_serialize() {
    let row = CsvExportRow {
        id: 1,
        name: "Test".to_string(),
        description: None,
        category: "Cat".to_string(),
        quantity: 10,
        min_quantity: 5,
        location: None,
        zone: None,
        manufacturer: None,
        part_number: None,
    };
    
    let json = serde_json::to_string(&row).unwrap();
    assert!(json.contains("\"id\":1"));
    assert!(json.contains("\"quantity\":10"));
}
