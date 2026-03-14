use chrono::{DateTime, Utc};
use cimco_inventory_v2::auth::model::{
    CreateUserRequest, LoginRequest, Session, User, UserResponse, UserRole,
};
use cimco_inventory_v2::auth::service::AuthService;
use cimco_inventory_v2::inventory::model::{
    AdjustQuantityRequest, CreatePartRequest, CsvExportRow, InventoryTransaction, Part,
    PartTransaction, PartsQuery, StockState, UpdatePartRequest,
};

// ==================== User Fixtures ====================

/// Create an admin user for testing
pub fn admin_user() -> User {
    User {
        id: 1,
        username: "admin".to_string(),
        password_hash: "$argon2id$v=19$m=19456,t=2,p=1$VEJaTVVVa3d4S1RTV1hZWkhBcVMyY1NWZVFFcmdVbnpOQVVTVHNzUk1Naw$IWl1xMm4sNuv+jYHMZGwD+CLQWqfVNiAvOQ8mOqP9og".to_string(),
        role: UserRole::Admin,
        created_at: Utc::now(),
    }
}

/// Create a worker user for testing
pub fn worker_user() -> User {
    User {
        id: 2,
        username: "worker".to_string(),
        password_hash: "$argon2id$v=19$m=19456,t=2,p=1$VEJaTVVVa3d4S1RTV1hZWkhBcVMyY1NWZVFFcmdVbnpOQVVTVHNzUk1Naw$IWl1xMm4sNuv+jYHMZGwD+CLQWqfVNiAvOQ8mOqP9og".to_string(),
        role: UserRole::Worker,
        created_at: Utc::now(),
    }
}

/// Create admin session
pub fn admin_session() -> Session {
    Session {
        user_id: 1,
        username: "admin".to_string(),
        role: UserRole::Admin,
    }
}

/// Create worker session
pub fn worker_session() -> Session {
    Session {
        user_id: 2,
        username: "worker".to_string(),
        role: UserRole::Worker,
    }
}

/// Admin login request
pub fn admin_login_request() -> LoginRequest {
    LoginRequest {
        username: "admin".to_string(),
        password: "admin123".to_string(),
    }
}

/// Worker login request
pub fn worker_login_request() -> LoginRequest {
    LoginRequest {
        username: "worker".to_string(),
        password: "worker123".to_string(),
    }
}

/// Invalid login request
pub fn invalid_login_request() -> LoginRequest {
    LoginRequest {
        username: "nonexistent".to_string(),
        password: "wrongpassword".to_string(),
    }
}

/// Create user request for admin
pub fn create_admin_request() -> CreateUserRequest {
    CreateUserRequest {
        username: "newadmin".to_string(),
        password: "newadmin123".to_string(),
        role: UserRole::Admin,
    }
}

/// Create user request for worker
pub fn create_worker_request() -> CreateUserRequest {
    CreateUserRequest {
        username: "newworker".to_string(),
        password: "newworker123".to_string(),
        role: UserRole::Worker,
    }
}

// ==================== Part Fixtures ====================

/// Create a sample part in stock
pub fn part_in_stock() -> Part {
    Part {
        id: 1,
        name: "Hydraulic Cylinder".to_string(),
        description: Some("Main hydraulic cylinder".to_string()),
        category: "Hydraulics".to_string(),
        part_type: Some("Cylinder".to_string()),
        manufacturer: Some("Parker".to_string()),
        part_number: Some("HC-5000-XL".to_string()),
        quantity: 10,
        min_quantity: 5,
        lead_time_days: 14,
        location: Some("Shelf A1".to_string()),
        machine_location: Some("Press 1".to_string()),
        function_description: Some("Main press cylinder".to_string()),
        zone: Some("Production".to_string()),
        bom_reference: Some("BOM-001".to_string()),
        yard_label: Some("HYD-01".to_string()),
        image_url: Some("http://example.com/image.jpg".to_string()),
        unit_cost: Some(299.99),
        supplier: Some("Parker Hannifin".to_string()),
        wear_rating: Some(8),
        tracked: true,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    }
}

/// Create a sample part with low stock
pub fn part_low_stock() -> Part {
    Part {
        id: 2,
        name: "Bearing SKF 6205".to_string(),
        description: Some("Deep groove ball bearing".to_string()),
        category: "Mechanical".to_string(),
        part_type: Some("Bearing".to_string()),
        manufacturer: Some("SKF".to_string()),
        part_number: Some("6205-2RS1".to_string()),
        quantity: 3,
        min_quantity: 5,
        lead_time_days: 7,
        location: Some("Shelf B2".to_string()),
        machine_location: Some("Conveyor 1".to_string()),
        function_description: Some("Motor bearing".to_string()),
        zone: Some("Assembly".to_string()),
        bom_reference: Some("BOM-002".to_string()),
        yard_label: Some("MEC-01".to_string()),
        image_url: None,
        unit_cost: Some(45.50),
        supplier: Some("SKF".to_string()),
        wear_rating: Some(5),
        tracked: true,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    }
}

/// Create a sample part out of stock
pub fn part_out_of_stock() -> Part {
    Part {
        id: 3,
        name: "PLC Module CPU".to_string(),
        description: Some("Central processing unit".to_string()),
        category: "Electronics".to_string(),
        part_type: Some("PLC".to_string()),
        manufacturer: Some("Siemens".to_string()),
        part_number: Some("S7-1500".to_string()),
        quantity: 0,
        min_quantity: 2,
        lead_time_days: 21,
        location: Some("Shelf C1".to_string()),
        machine_location: Some("Control Cabinet".to_string()),
        function_description: Some("Main controller".to_string()),
        zone: Some("Electrical".to_string()),
        bom_reference: Some("BOM-003".to_string()),
        yard_label: Some("ELEC-01".to_string()),
        image_url: Some("http://example.com/plc.jpg".to_string()),
        unit_cost: Some(1500.00),
        supplier: Some("Siemens".to_string()),
        wear_rating: Some(3),
        tracked: true,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    }
}

/// Create an untracked part
pub fn part_untracked() -> Part {
    Part {
        id: 4,
        name: "Office Supplies".to_string(),
        description: Some("General office supplies".to_string()),
        category: "Office".to_string(),
        part_type: None,
        manufacturer: None,
        part_number: None,
        quantity: 100,
        min_quantity: 10,
        lead_time_days: 3,
        location: Some("Office".to_string()),
        machine_location: None,
        function_description: None,
        zone: Some("Office".to_string()),
        bom_reference: None,
        yard_label: None,
        image_url: None,
        unit_cost: Some(5.00),
        supplier: Some("Office Depot".to_string()),
        wear_rating: None,
        tracked: false,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    }
}

/// Collection of sample parts
pub fn sample_parts() -> Vec<Part> {
    vec![
        part_in_stock(),
        part_low_stock(),
        part_out_of_stock(),
        part_untracked(),
    ]
}

/// Create part request (valid)
pub fn create_part_request() -> CreatePartRequest {
    CreatePartRequest {
        name: "Proximity Sensor".to_string(),
        description: Some("Inductive proximity sensor".to_string()),
        category: "Sensors".to_string(),
        part_type: Some("Proximity".to_string()),
        manufacturer: Some("IFM".to_string()),
        part_number: Some("IGT205".to_string()),
        quantity: Some(45),
        min_quantity: Some(10),
        lead_time_days: Some(5),
        location: Some("Shelf D1".to_string()),
        machine_location: Some("Line 1".to_string()),
        function_description: Some("Position detection".to_string()),
        zone: Some("Production".to_string()),
        bom_reference: Some("BOM-004".to_string()),
        yard_label: Some("SENS-01".to_string()),
        image_url: None,
        unit_cost: Some(89.99),
        supplier: Some("IFM".to_string()),
        wear_rating: Some(6),
        tracked: Some(true),
    }
}

/// Create part request with empty name (invalid)
pub fn create_part_request_invalid() -> CreatePartRequest {
    CreatePartRequest {
        name: "".to_string(),
        description: None,
        category: "".to_string(),
        part_type: None,
        manufacturer: None,
        part_number: None,
        quantity: None,
        min_quantity: None,
        lead_time_days: None,
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
        tracked: None,
    }
}

/// Update part request
pub fn update_part_request() -> UpdatePartRequest {
    UpdatePartRequest {
        name: Some("Updated Hydraulic Cylinder".to_string()),
        description: Some("Updated description".to_string()),
        category: Some("Updated Category".to_string()),
        part_type: None,
        manufacturer: None,
        part_number: None,
        min_quantity: Some(10),
        lead_time_days: None,
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
        tracked: None,
    }
}

/// Adjust quantity request (positive)
pub fn adjust_quantity_request_positive() -> AdjustQuantityRequest {
    AdjustQuantityRequest {
        change_amount: 5,
        reason: Some("Restock from supplier".to_string()),
    }
}

/// Adjust quantity request (negative)
pub fn adjust_quantity_request_negative() -> AdjustQuantityRequest {
    AdjustQuantityRequest {
        change_amount: -3,
        reason: Some("Used in production".to_string()),
    }
}

/// Adjust quantity request (would go negative - invalid)
pub fn adjust_quantity_request_invalid() -> AdjustQuantityRequest {
    AdjustQuantityRequest {
        change_amount: -100,
        reason: Some("Invalid adjustment".to_string()),
    }
}

/// Parts query with default values
pub fn parts_query_default() -> PartsQuery {
    PartsQuery {
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
    }
}

/// Parts query with search
pub fn parts_query_search() -> PartsQuery {
    PartsQuery {
        search: Some("bearing".to_string()),
        category: None,
        zone: None,
        manufacturer: None,
        stock_state: None,
        tracked: None,
        sort_by: None,
        sort_order: None,
        page: Some(1),
        page_size: Some(25),
    }
}

/// Parts query with category filter
pub fn parts_query_category() -> PartsQuery {
    PartsQuery {
        search: None,
        category: Some("Hydraulics".to_string()),
        zone: None,
        manufacturer: None,
        stock_state: None,
        tracked: None,
        sort_by: None,
        sort_order: None,
        page: Some(1),
        page_size: Some(10),
    }
}

/// Parts query with stock state filter
pub fn parts_query_low_stock() -> PartsQuery {
    PartsQuery {
        search: None,
        category: None,
        zone: None,
        manufacturer: None,
        stock_state: Some("low_stock".to_string()),
        tracked: None,
        sort_by: None,
        sort_order: None,
        page: Some(1),
        page_size: Some(50),
    }
}

/// Parts query with sorting
pub fn parts_query_sorted() -> PartsQuery {
    PartsQuery {
        search: None,
        category: None,
        zone: None,
        manufacturer: None,
        stock_state: None,
        tracked: None,
        sort_by: Some("quantity".to_string()),
        sort_order: Some("desc".to_string()),
        page: Some(1),
        page_size: Some(25),
    }
}

/// Sample inventory transaction
pub fn sample_transaction() -> InventoryTransaction {
    InventoryTransaction {
        id: 1,
        part_id: 1,
        change_amount: 5,
        new_quantity: 15,
        reason: Some("Restocked".to_string()),
        changed_by: 1,
        timestamp: Utc::now(),
    }
}

/// Sample part transaction (with username)
pub fn sample_part_transaction() -> PartTransaction {
    PartTransaction {
        id: 1,
        change_amount: 5,
        new_quantity: 15,
        reason: Some("Restocked".to_string()),
        changed_by_username: "admin".to_string(),
        timestamp: Utc::now(),
    }
}

/// Sample CSV export row
pub fn sample_csv_row() -> CsvExportRow {
    CsvExportRow {
        id: 1,
        name: "Hydraulic Cylinder".to_string(),
        description: Some("Main cylinder".to_string()),
        category: "Hydraulics".to_string(),
        quantity: 10,
        min_quantity: 5,
        location: Some("Shelf A1".to_string()),
        zone: Some("Production".to_string()),
        manufacturer: Some("Parker".to_string()),
        part_number: Some("HC-5000".to_string()),
    }
}

/// CSV row that needs escaping
pub fn sample_csv_row_needs_escape() -> CsvExportRow {
    CsvExportRow {
        id: 2,
        name: "Part, with comma".to_string(),
        description: Some("Description with \"quotes\"".to_string()),
        category: "Test".to_string(),
        quantity: 5,
        min_quantity: 2,
        location: Some("Shelf\nA2".to_string()),
        zone: Some("Test".to_string()),
        manufacturer: Some("Test \"Corp\"".to_string()),
        part_number: Some("PART-001".to_string()),
    }
}
