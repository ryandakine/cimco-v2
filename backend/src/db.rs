use sqlx::PgPool;
use std::time::Duration;

use crate::config::Config;
use crate::error::Result;

#[derive(Clone)]
pub struct DbPool(pub PgPool);

impl DbPool {
    pub async fn new(config: &Config) -> Result<Self> {
        let pool = PgPoolOptions::new()
            .min_connections(config.db_pool_min)
            .max_connections(config.db_pool_max)
            .acquire_timeout(Duration::from_secs(30))
            .connect(&config.database_url)
            .await
            .map_err(|e| crate::error::AppError::Database(e.to_string()))?;
        
        // Test the connection
        sqlx::query("SELECT 1")
            .fetch_one(&pool)
            .await
            .map_err(|e| crate::error::AppError::Database(e.to_string()))?;
        
        tracing::info!(
            "Database connection established (pool: {}-{} connections)",
            config.db_pool_min,
            config.db_pool_max
        );
        Ok(Self(pool))
    }

    pub fn get(&self) -> &PgPool {
        &self.0
    }
}

impl std::ops::Deref for DbPool {
    type Target = PgPool;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
