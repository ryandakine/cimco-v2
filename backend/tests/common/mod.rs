pub mod fixtures;
pub mod helpers;

use std::sync::Arc;

/// Initialize tracing for tests
pub fn init_tracing() {
    let _ = tracing_subscriber::fmt()
        .with_env_filter("cimco_inventory_v2=debug")
        .try_init();
}

/// Test database configuration
pub fn test_database_url() -> String {
    std::env::var("TEST_DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/cimco_test".to_string())
}
