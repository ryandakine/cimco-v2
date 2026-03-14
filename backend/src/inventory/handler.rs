use axum::{
    body::Body,
    extract::{Extension, Path, Query},
    http::{header, StatusCode},
    response::IntoResponse,
    Json,
};
use std::sync::Arc;

use crate::auth::model::{Session, UserRole};
use crate::db::DbPool;
use crate::error::{AppError, Result};
use crate::inventory::model::{
    AdjustQuantityRequest, CreatePartRequest, PartsQuery, UpdatePartRequest,
};
use crate::inventory::service::InventoryService;

pub async fn list_parts(
    Extension(pool): Extension<Arc<DbPool>>,
    Query(query): Query<PartsQuery>,
) -> Result<impl IntoResponse> {
    let response = InventoryService::list_parts(pool.get(), query).await?;
    Ok((StatusCode::OK, Json(response)))
}

pub async fn get_part(
    Extension(pool): Extension<Arc<DbPool>>,
    Path(id): Path<i32>,
) -> Result<impl IntoResponse> {
    let part = InventoryService::get_part(pool.get(), id).await?;
    Ok((StatusCode::OK, Json(part)))
}

pub async fn create_part(
    Extension(pool): Extension<Arc<DbPool>>,
    Extension(session): Extension<Session>,
    Json(req): Json<CreatePartRequest>,
) -> Result<impl IntoResponse> {
    // Only admins can create parts
    if session.role != UserRole::Admin {
        return Err(AppError::Unauthorized(
            "Only admins can create parts".to_string(),
        ));
    }

    let part = InventoryService::create_part(pool.get(), req).await?;
    Ok((StatusCode::CREATED, Json(part)))
}

pub async fn update_part(
    Extension(pool): Extension<Arc<DbPool>>,
    Extension(session): Extension<Session>,
    Path(id): Path<i32>,
    Json(req): Json<UpdatePartRequest>,
) -> Result<impl IntoResponse> {
    // Only admins can update parts
    if session.role != UserRole::Admin {
        return Err(AppError::Unauthorized(
            "Only admins can update parts".to_string(),
        ));
    }

    let part = InventoryService::update_part(pool.get(), id, req).await?;
    Ok((StatusCode::OK, Json(part)))
}

pub async fn adjust_quantity(
    Extension(pool): Extension<Arc<DbPool>>,
    Extension(session): Extension<Session>,
    Path(id): Path<i32>,
    Json(req): Json<AdjustQuantityRequest>,
) -> Result<impl IntoResponse> {
    let transaction =
        InventoryService::adjust_quantity(pool.get(), id, req, session.user_id).await?;
    Ok((StatusCode::OK, Json(transaction)))
}

pub async fn get_transaction_history(
    Extension(pool): Extension<Arc<DbPool>>,
    Path(id): Path<i32>,
) -> Result<impl IntoResponse> {
    let history = InventoryService::get_transaction_history(pool.get(), id).await?;
    Ok((StatusCode::OK, Json(history)))
}

pub async fn export_csv(
    Extension(pool): Extension<Arc<DbPool>>,
) -> Result<impl IntoResponse> {
    let (_, csv_content) = InventoryService::export_csv(pool.get()).await?;
    
    let filename = format!("inventory_export_{}.csv", chrono::Utc::now().format("%Y%m%d_%H%M%S"));
    let disposition = format!("attachment; filename=\"{}\"", filename);
    
    let response = axum::response::Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "text/csv; charset=utf-8")
        .header(header::CONTENT_DISPOSITION, disposition)
        .body(Body::from(csv_content))
        .map_err(|e| AppError::Internal(format!("Failed to build response: {}", e)))?;

    Ok(response)
}
