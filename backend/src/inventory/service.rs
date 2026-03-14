use sqlx::PgPool;

use crate::error::{AppError, Result};
use crate::inventory::model::{
    AdjustQuantityRequest, CreatePartRequest, CsvExportRow, Part, PartsListResponse, PartsQuery,
    PartTransaction, UpdatePartRequest,
};
use crate::inventory::repository::PartRepository;

pub struct InventoryService;

impl InventoryService {
    pub async fn list_parts(pool: &PgPool, query: PartsQuery) -> Result<PartsListResponse> {
        let page = query.page.unwrap_or(1).max(1);
        let page_size = query.page_size.unwrap_or(25).clamp(10, 100);

        let (items, total) = PartRepository::list_parts(pool, &query).await?;

        let total_pages = ((total as f64) / (page_size as f64)).ceil() as i32;

        Ok(PartsListResponse {
            items,
            total,
            page,
            page_size,
            total_pages,
        })
    }

    pub async fn get_part(pool: &PgPool, id: i32) -> Result<Part> {
        PartRepository::get_by_id(pool, id).await
    }

    pub async fn create_part(pool: &PgPool, req: CreatePartRequest) -> Result<Part> {
        // Validate required fields
        if req.name.trim().is_empty() {
            return Err(AppError::Validation("Name is required".to_string()));
        }
        if req.category.trim().is_empty() {
            return Err(AppError::Validation("Category is required".to_string()));
        }

        PartRepository::create(pool, &req).await
    }

    pub async fn update_part(pool: &PgPool, id: i32, req: UpdatePartRequest) -> Result<Part> {
        PartRepository::update(pool, id, &req).await
    }

    pub async fn adjust_quantity(
        pool: &PgPool,
        id: i32,
        req: AdjustQuantityRequest,
        changed_by: i32,
    ) -> Result<crate::inventory::model::InventoryTransaction> {
        // Get current quantity
        let part = PartRepository::get_by_id(pool, id).await?;
        
        let new_quantity = part.quantity + req.change_amount;
        
        // Prevent negative quantities
        if new_quantity < 0 {
            return Err(AppError::Validation(
                "Quantity cannot be negative".to_string(),
            ));
        }

        PartRepository::adjust_quantity(
            pool,
            id,
            req.change_amount,
            new_quantity,
            req.reason.as_deref(),
            changed_by,
        )
        .await
    }

    pub async fn get_transaction_history(pool: &PgPool, part_id: i32) -> Result<Vec<PartTransaction>> {
        PartRepository::get_transaction_history(pool, part_id).await
    }

    pub async fn export_csv(pool: &PgPool) -> Result<(Vec<CsvExportRow>, String)> {
        let rows = PartRepository::get_all_for_export(pool).await?;
        
        // Build CSV content
        let mut csv = String::from("ID,Name,Description,Category,Quantity,Min Quantity,Location,Zone,Manufacturer,Part Number\n");
        
        for row in &rows {
            csv.push_str(&format!(
                "{},{},{},{},{},{},{},{},{},{}\n",
                row.id,
                escape_csv(&row.name),
                escape_csv(&row.description.as_deref().unwrap_or("")),
                escape_csv(&row.category),
                row.quantity,
                row.min_quantity,
                escape_csv(&row.location.as_deref().unwrap_or("")),
                escape_csv(&row.zone.as_deref().unwrap_or("")),
                escape_csv(&row.manufacturer.as_deref().unwrap_or("")),
                escape_csv(&row.part_number.as_deref().unwrap_or(""))
            ));
        }

        let _filename = format!("inventory_export_{}.csv", chrono::Utc::now().format("%Y%m%d_%H%M%S"));
        
        Ok((rows, csv))
    }
}

fn escape_csv(field: &str) -> String {
    if field.contains(',') || field.contains('"') || field.contains('\n') {
        format!("\"{}\"", field.replace('"', "\"\""))
    } else {
        field.to_string()
    }
}
