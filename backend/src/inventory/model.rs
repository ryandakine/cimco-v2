use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Part {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub category: String,
    pub part_type: Option<String>,
    pub manufacturer: Option<String>,
    pub part_number: Option<String>,
    pub quantity: i32,
    pub min_quantity: i32,
    pub lead_time_days: i32,
    pub location: Option<String>,
    pub machine_location: Option<String>,
    pub function_description: Option<String>,
    pub zone: Option<String>,
    pub bom_reference: Option<String>,
    pub yard_label: Option<String>,
    pub image_url: Option<String>,
    pub unit_cost: Option<f32>,
    pub supplier: Option<String>,
    pub wear_rating: Option<i32>,
    pub tracked: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct InventoryTransaction {
    pub id: i32,
    pub part_id: i32,
    pub change_amount: i32,
    pub new_quantity: i32,
    pub reason: Option<String>,
    pub changed_by: i32,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartTransaction {
    pub id: i32,
    pub change_amount: i32,
    pub new_quantity: i32,
    pub reason: Option<String>,
    pub changed_by_username: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct PartsListResponse {
    pub items: Vec<Part>,
    pub total: i64,
    pub page: i32,
    pub page_size: i32,
    pub total_pages: i32,
}

#[derive(Debug, Deserialize)]
pub struct CreatePartRequest {
    pub name: String,
    pub description: Option<String>,
    pub category: String,
    pub part_type: Option<String>,
    pub manufacturer: Option<String>,
    pub part_number: Option<String>,
    pub quantity: Option<i32>,
    pub min_quantity: Option<i32>,
    pub lead_time_days: Option<i32>,
    pub location: Option<String>,
    pub machine_location: Option<String>,
    pub function_description: Option<String>,
    pub zone: Option<String>,
    pub bom_reference: Option<String>,
    pub yard_label: Option<String>,
    pub image_url: Option<String>,
    pub unit_cost: Option<f32>,
    pub supplier: Option<String>,
    pub wear_rating: Option<i32>,
    pub tracked: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePartRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub part_type: Option<String>,
    pub manufacturer: Option<String>,
    pub part_number: Option<String>,
    pub min_quantity: Option<i32>,
    pub lead_time_days: Option<i32>,
    pub location: Option<String>,
    pub machine_location: Option<String>,
    pub function_description: Option<String>,
    pub zone: Option<String>,
    pub bom_reference: Option<String>,
    pub yard_label: Option<String>,
    pub image_url: Option<String>,
    pub unit_cost: Option<f32>,
    pub supplier: Option<String>,
    pub wear_rating: Option<i32>,
    pub tracked: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct AdjustQuantityRequest {
    pub change_amount: i32,
    pub reason: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct PartsQuery {
    pub search: Option<String>,
    pub category: Option<String>,
    pub zone: Option<String>,
    pub manufacturer: Option<String>,
    pub stock_state: Option<String>, // "in_stock", "low_stock", "out_of_stock"
    pub tracked: Option<bool>,
    pub sort_by: Option<String>, // "name", "quantity", "category", "location", "updated_at"
    pub sort_order: Option<String>, // "asc", "desc"
    pub page: Option<i32>,       // 1-based
    pub page_size: Option<i32>,  // 10, 25, 50, 100
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum StockState {
    InStock,
    LowStock,
    OutOfStock,
}

impl StockState {
    pub fn as_str(&self) -> &'static str {
        match self {
            StockState::InStock => "in_stock",
            StockState::LowStock => "low_stock",
            StockState::OutOfStock => "out_of_stock",
        }
    }
}

impl TryFrom<&str> for StockState {
    type Error = String;

    fn try_from(value: &str) -> std::result::Result<Self, Self::Error> {
        match value {
            "in_stock" => Ok(StockState::InStock),
            "low_stock" => Ok(StockState::LowStock),
            "out_of_stock" => Ok(StockState::OutOfStock),
            _ => Err(format!("Invalid stock state: {}", value)),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct CsvExportRow {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub category: String,
    pub quantity: i32,
    pub min_quantity: i32,
    pub location: Option<String>,
    pub zone: Option<String>,
    pub manufacturer: Option<String>,
    pub part_number: Option<String>,
}
