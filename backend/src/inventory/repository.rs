use chrono::Utc;
use sqlx::{PgPool, Row};

use crate::error::{AppError, Result};
use crate::inventory::model::{
    CreatePartRequest, CsvExportRow, InventoryTransaction, Part, PartsQuery, StockState,
    UpdatePartRequest,
};

pub struct PartRepository;

impl PartRepository {
    pub async fn list_parts(pool: &PgPool, query: &PartsQuery) -> Result<(Vec<Part>, i64)> {
        let page = query.page.unwrap_or(1).max(1);
        let page_size = query.page_size.unwrap_or(25).clamp(10, 100);
        let offset = (page - 1) as i64 * page_size as i64;

        // Build the query with parameterized filters
        let mut sql = String::from(
            r#"
            SELECT 
                id, name, description, category, part_type, manufacturer, part_number,
                quantity, min_quantity, lead_time_days, location, machine_location,
                function_description, zone, bom_reference, yard_label, image_url,
                unit_cost, supplier, wear_rating, tracked, created_at, updated_at
            FROM parts
            WHERE 1=1
            "#
        );

        let mut count_sql = String::from("SELECT COUNT(*) FROM parts WHERE 1=1");
        
        // Build filter conditions
        let mut filters: Vec<String> = Vec::new();
        
        if let Some(search) = &query.search {
            if !search.is_empty() {
                filters.push(format!(
                    " AND (name ILIKE '%' || ${} || '%' OR description ILIKE '%' || ${} || '%' OR COALESCE(part_number, '') ILIKE '%' || ${} || '%')",
                    filters.len() + 1, filters.len() + 1, filters.len() + 1
                ));
            }
        }

        if let Some(_category) = &query.category {
            filters.push(format!(" AND category = ${}", filters.len() + 1));
        }

        if let Some(_zone) = &query.zone {
            filters.push(format!(" AND zone = ${}", filters.len() + 1));
        }

        if let Some(_manufacturer) = &query.manufacturer {
            filters.push(format!(" AND manufacturer = ${}", filters.len() + 1));
        }

        if let Some(_tracked) = query.tracked {
            filters.push(format!(" AND tracked = ${}", filters.len() + 1));
        }

        // Stock state filter
        if let Some(stock_state_str) = &query.stock_state {
            if let Ok(stock_state) = StockState::try_from(stock_state_str.as_str()) {
                match stock_state {
                    StockState::InStock => {
                        filters.push(" AND quantity > min_quantity".to_string())
                    }
                    StockState::LowStock => {
                        filters.push(
                            " AND quantity > 0 AND quantity <= min_quantity".to_string(),
                        )
                    }
                    StockState::OutOfStock => filters.push(" AND quantity = 0".to_string()),
                }
            }
        }

        // Add filters to queries
        let filter_sql = filters.join("");
        sql.push_str(&filter_sql);
        count_sql.push_str(&filter_sql);

        // Determine sort column
        let sort_column = match query.sort_by.as_deref() {
            Some("quantity") => "quantity",
            Some("category") => "category",
            Some("location") => "location",
            Some("updated_at") => "updated_at",
            _ => "name",
        };

        let sort_direction = if query.sort_order.as_deref() == Some("desc") {
            "DESC"
        } else {
            "ASC"
        };

        // Add sorting and pagination
        sql.push_str(&format!(
            " ORDER BY {} {} LIMIT ${} OFFSET ${}",
            sort_column,
            sort_direction,
            filters.len() + 1,
            filters.len() + 2
        ));

        // Build count query
        let mut count_query = sqlx::query_scalar::<_, i64>(&count_sql);
        
        // Build main query
        let mut main_query = sqlx::query(&sql);

        // Bind parameters for both queries
        if let Some(search) = &query.search {
            if !search.is_empty() {
                count_query = count_query.bind(search);
                main_query = main_query.bind(search);
            }
        }
        if let Some(category) = &query.category {
            count_query = count_query.bind(category);
            main_query = main_query.bind(category);
        }
        if let Some(zone) = &query.zone {
            count_query = count_query.bind(zone);
            main_query = main_query.bind(zone);
        }
        if let Some(manufacturer) = &query.manufacturer {
            count_query = count_query.bind(manufacturer);
            main_query = main_query.bind(manufacturer);
        }
        if let Some(tracked) = query.tracked {
            count_query = count_query.bind(tracked);
            main_query = main_query.bind(tracked);
        }

        // Bind pagination parameters
        main_query = main_query.bind(page_size).bind(offset);

        // Execute queries
        let total: i64 = count_query.fetch_one(pool).await?;
        let rows = main_query.fetch_all(pool).await?;

        let parts: Vec<Part> = rows
            .into_iter()
            .map(|row| Part {
                id: row.try_get("id").unwrap_or_default(),
                name: row.try_get("name").unwrap_or_default(),
                description: row.try_get("description").ok(),
                category: row.try_get("category").unwrap_or_default(),
                part_type: row.try_get("part_type").ok(),
                manufacturer: row.try_get("manufacturer").ok(),
                part_number: row.try_get("part_number").ok(),
                quantity: row.try_get("quantity").unwrap_or_default(),
                min_quantity: row.try_get("min_quantity").unwrap_or_default(),
                lead_time_days: row.try_get("lead_time_days").unwrap_or_default(),
                location: row.try_get("location").ok(),
                machine_location: row.try_get("machine_location").ok(),
                function_description: row.try_get("function_description").ok(),
                zone: row.try_get("zone").ok(),
                bom_reference: row.try_get("bom_reference").ok(),
                yard_label: row.try_get("yard_label").ok(),
                image_url: row.try_get("image_url").ok(),
                unit_cost: row.try_get("unit_cost").ok(),
                supplier: row.try_get("supplier").ok(),
                wear_rating: row.try_get("wear_rating").ok(),
                tracked: row.try_get("tracked").unwrap_or(true),
                created_at: row.try_get("created_at").unwrap_or_else(|_| Utc::now()),
                updated_at: row.try_get("updated_at").unwrap_or_else(|_| Utc::now()),
            })
            .collect();

        Ok((parts, total))
    }

    pub async fn get_by_id(pool: &PgPool, id: i32) -> Result<Part> {
        let part: Part = sqlx::query_as(
            r#"
            SELECT 
                id, name, description, category, part_type, manufacturer, part_number,
                quantity, min_quantity, lead_time_days, location, machine_location,
                function_description, zone, bom_reference, yard_label, image_url,
                unit_cost, supplier, wear_rating, tracked, created_at, updated_at
            FROM parts
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(part)
    }

    pub async fn create(pool: &PgPool, req: &CreatePartRequest) -> Result<Part> {
        let part: Part = sqlx::query_as(
            r#"
            INSERT INTO parts (
                name, description, category, part_type, manufacturer, part_number,
                quantity, min_quantity, lead_time_days, location, machine_location,
                function_description, zone, bom_reference, yard_label, image_url,
                unit_cost, supplier, wear_rating, tracked
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            RETURNING 
                id, name, description, category, part_type, manufacturer, part_number,
                quantity, min_quantity, lead_time_days, location, machine_location,
                function_description, zone, bom_reference, yard_label, image_url,
                unit_cost, supplier, wear_rating, tracked, created_at, updated_at
            "#,
        )
        .bind(&req.name)
        .bind(&req.description)
        .bind(&req.category)
        .bind(&req.part_type)
        .bind(&req.manufacturer)
        .bind(&req.part_number)
        .bind(req.quantity.unwrap_or(0))
        .bind(req.min_quantity.unwrap_or(1))
        .bind(req.lead_time_days.unwrap_or(7))
        .bind(&req.location)
        .bind(&req.machine_location)
        .bind(&req.function_description)
        .bind(&req.zone)
        .bind(&req.bom_reference)
        .bind(&req.yard_label)
        .bind(&req.image_url)
        .bind(req.unit_cost)
        .bind(&req.supplier)
        .bind(req.wear_rating)
        .bind(req.tracked.unwrap_or(true))
        .fetch_one(pool)
        .await?;

        Ok(part)
    }

    pub async fn update(pool: &PgPool, id: i32, req: &UpdatePartRequest) -> Result<Part> {
        let part: Part = sqlx::query_as(
            r#"
            UPDATE parts SET
                name = COALESCE($2, name),
                description = COALESCE($3, description),
                category = COALESCE($4, category),
                part_type = COALESCE($5, part_type),
                manufacturer = COALESCE($6, manufacturer),
                part_number = COALESCE($7, part_number),
                min_quantity = COALESCE($8, min_quantity),
                lead_time_days = COALESCE($9, lead_time_days),
                location = COALESCE($10, location),
                machine_location = COALESCE($11, machine_location),
                function_description = COALESCE($12, function_description),
                zone = COALESCE($13, zone),
                bom_reference = COALESCE($14, bom_reference),
                yard_label = COALESCE($15, yard_label),
                image_url = COALESCE($16, image_url),
                unit_cost = COALESCE($17, unit_cost),
                supplier = COALESCE($18, supplier),
                wear_rating = COALESCE($19, wear_rating),
                tracked = COALESCE($20, tracked),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING 
                id, name, description, category, part_type, manufacturer, part_number,
                quantity, min_quantity, lead_time_days, location, machine_location,
                function_description, zone, bom_reference, yard_label, image_url,
                unit_cost, supplier, wear_rating, tracked, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(&req.name)
        .bind(&req.description)
        .bind(&req.category)
        .bind(&req.part_type)
        .bind(&req.manufacturer)
        .bind(&req.part_number)
        .bind(req.min_quantity)
        .bind(req.lead_time_days)
        .bind(&req.location)
        .bind(&req.machine_location)
        .bind(&req.function_description)
        .bind(&req.zone)
        .bind(&req.bom_reference)
        .bind(&req.yard_label)
        .bind(&req.image_url)
        .bind(req.unit_cost)
        .bind(&req.supplier)
        .bind(req.wear_rating)
        .bind(req.tracked)
        .fetch_one(pool)
        .await?;

        Ok(part)
    }

    pub async fn adjust_quantity(
        pool: &PgPool,
        id: i32,
        change_amount: i32,
        reason: Option<&str>,
        changed_by: i32,
    ) -> Result<InventoryTransaction> {
        let mut tx = pool.begin().await?;

        // Lock row and get current quantity
        let current_quantity: i32 = sqlx::query_scalar("SELECT quantity FROM parts WHERE id = $1 FOR UPDATE")
            .bind(id)
            .fetch_one(&mut *tx)
            .await?;

        let new_quantity = current_quantity + change_amount;

        // Validate quantity >= 0
        if new_quantity < 0 {
            return Err(AppError::Validation("Insufficient quantity".to_string()));
        }

        // Update quantity
        sqlx::query("UPDATE parts SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2")
            .bind(new_quantity)
            .bind(id)
            .execute(&mut *tx)
            .await?;

        // Create transaction record
        let transaction: InventoryTransaction = sqlx::query_as(
            r#"
            INSERT INTO inventory_transactions (part_id, change_amount, new_quantity, reason, changed_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, part_id, change_amount, new_quantity, reason, changed_by, timestamp
            "#,
        )
        .bind(id)
        .bind(change_amount)
        .bind(new_quantity)
        .bind(reason)
        .bind(changed_by)
        .fetch_one(&mut *tx)
        .await?;

        tx.commit().await?;

        Ok(transaction)
    }

    pub async fn get_transaction_history(pool: &PgPool, part_id: i32) -> Result<Vec<crate::inventory::model::PartTransaction>> {
        let rows = sqlx::query(
            r#"
            SELECT 
                it.id, it.change_amount, it.new_quantity, it.reason, it.timestamp,
                u.username as changed_by_username
            FROM inventory_transactions it
            JOIN users u ON it.changed_by = u.id
            WHERE it.part_id = $1
            ORDER BY it.timestamp DESC
            "#,
        )
        .bind(part_id)
        .fetch_all(pool)
        .await?;

        let transactions: Vec<crate::inventory::model::PartTransaction> = rows
            .into_iter()
            .map(|row| crate::inventory::model::PartTransaction {
                id: row.try_get("id").unwrap_or_default(),
                change_amount: row.try_get("change_amount").unwrap_or_default(),
                new_quantity: row.try_get("new_quantity").unwrap_or_default(),
                reason: row.try_get("reason").ok(),
                changed_by_username: row.try_get("changed_by_username").unwrap_or_default(),
                timestamp: row.try_get("timestamp").unwrap_or_else(|_| Utc::now()),
            })
            .collect();

        Ok(transactions)
    }

    pub async fn get_all_for_export(pool: &PgPool) -> Result<Vec<CsvExportRow>> {
        let rows = sqlx::query(
            r#"
            SELECT 
                id, name, description, category, quantity, min_quantity,
                location, zone, manufacturer, part_number
            FROM parts
            ORDER BY name
            "#,
        )
        .fetch_all(pool)
        .await?;

        let rows: Vec<CsvExportRow> = rows
            .into_iter()
            .map(|row| CsvExportRow {
                id: row.try_get("id").unwrap_or_default(),
                name: row.try_get("name").unwrap_or_default(),
                description: row.try_get("description").ok(),
                category: row.try_get("category").unwrap_or_default(),
                quantity: row.try_get("quantity").unwrap_or_default(),
                min_quantity: row.try_get("min_quantity").unwrap_or_default(),
                location: row.try_get("location").ok(),
                zone: row.try_get("zone").ok(),
                manufacturer: row.try_get("manufacturer").ok(),
                part_number: row.try_get("part_number").ok(),
            })
            .collect();

        Ok(rows)
    }
}
