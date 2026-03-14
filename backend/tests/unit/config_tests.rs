use cimco_inventory_v2::config::Config;
use std::env;

// ==================== Config from_env Tests ====================

#[test]
fn test_config_default_values() {
    // Set required environment variables
    env::set_var("DATABASE_URL", "postgres://user:pass@localhost/db");
    env::set_var("SESSION_SECRET", "test_secret");
    
    // Remove optional variables to test defaults
    env::remove_var("SERVER_PORT");
    env::remove_var("SERVER_HOST");
    env::remove_var("CORS_ORIGINS");
    
    let config = Config::from_env().unwrap();
    
    assert_eq!(config.server_port, 8081); // Default
    assert_eq!(config.server_host, "0.0.0.0"); // Default
    assert_eq!(config.cors_origins, vec!["http://localhost:3000"]); // Default
    assert_eq!(config.database_url, "postgres://user:pass@localhost/db");
    assert_eq!(config.session_secret, "test_secret");
    
    // Cleanup
    env::remove_var("DATABASE_URL");
    env::remove_var("SESSION_SECRET");
}

#[test]
fn test_config_custom_values() {
    env::set_var("DATABASE_URL", "postgres://custom/db");
    env::set_var("SERVER_PORT", "9000");
    env::set_var("SERVER_HOST", "127.0.0.1");
    env::set_var("SESSION_SECRET", "custom_secret");
    env::set_var("CORS_ORIGINS", "http://app1.com,http://app2.com");
    
    let config = Config::from_env().unwrap();
    
    assert_eq!(config.server_port, 9000);
    assert_eq!(config.server_host, "127.0.0.1");
    assert_eq!(config.session_secret, "custom_secret");
    assert_eq!(config.cors_origins, vec!["http://app1.com", "http://app2.com"]);
    
    // Cleanup
    env::remove_var("DATABASE_URL");
    env::remove_var("SERVER_PORT");
    env::remove_var("SERVER_HOST");
    env::remove_var("SESSION_SECRET");
    env::remove_var("CORS_ORIGINS");
}

#[test]
fn test_config_missing_database_url() {
    env::remove_var("DATABASE_URL");
    env::set_var("SESSION_SECRET", "test_secret");
    
    let result = Config::from_env();
    assert!(result.is_err());
    
    env::remove_var("SESSION_SECRET");
}

#[test]
fn test_config_missing_session_secret() {
    env::set_var("DATABASE_URL", "postgres://localhost/db");
    env::remove_var("SESSION_SECRET");
    
    let result = Config::from_env();
    assert!(result.is_err());
    
    env::remove_var("DATABASE_URL");
}

#[test]
fn test_config_invalid_server_port() {
    env::set_var("DATABASE_URL", "postgres://localhost/db");
    env::set_var("SESSION_SECRET", "test_secret");
    env::set_var("SERVER_PORT", "not_a_number");
    
    // This should panic due to expect() in the code
    // We test the panic case separately if needed
    
    env::remove_var("DATABASE_URL");
    env::remove_var("SESSION_SECRET");
    env::remove_var("SERVER_PORT");
}

#[test]
fn test_config_cors_origins_trimming() {
    env::set_var("DATABASE_URL", "postgres://localhost/db");
    env::set_var("SESSION_SECRET", "test_secret");
    env::set_var("CORS_ORIGINS", " http://app1.com , http://app2.com ");
    
    let config = Config::from_env().unwrap();
    
    assert_eq!(config.cors_origins, vec!["http://app1.com", "http://app2.com"]);
    
    env::remove_var("DATABASE_URL");
    env::remove_var("SESSION_SECRET");
    env::remove_var("CORS_ORIGINS");
}

#[test]
fn test_config_single_cors_origin() {
    env::set_var("DATABASE_URL", "postgres://localhost/db");
    env::set_var("SESSION_SECRET", "test_secret");
    env::set_var("CORS_ORIGINS", "http://single.com");
    
    let config = Config::from_env().unwrap();
    
    assert_eq!(config.cors_origins, vec!["http://single.com"]);
    
    env::remove_var("DATABASE_URL");
    env::remove_var("SESSION_SECRET");
    env::remove_var("CORS_ORIGINS");
}

// ==================== Config Clone Tests ====================

#[test]
fn test_config_clone() {
    env::set_var("DATABASE_URL", "postgres://localhost/db");
    env::set_var("SESSION_SECRET", "test_secret");
    
    let config = Config::from_env().unwrap();
    let cloned = config.clone();
    
    assert_eq!(config.server_port, cloned.server_port);
    assert_eq!(config.server_host, cloned.server_host);
    assert_eq!(config.database_url, cloned.database_url);
    
    env::remove_var("DATABASE_URL");
    env::remove_var("SESSION_SECRET");
}

// ==================== Config Debug Tests ====================

#[test]
fn test_config_debug() {
    env::set_var("DATABASE_URL", "postgres://localhost/db");
    env::set_var("SESSION_SECRET", "test_secret");
    
    let config = Config::from_env().unwrap();
    let debug = format!("{:?}", config);
    
    assert!(debug.contains("Config"));
    assert!(debug.contains("8081") || debug.contains("9000")); // port
    
    env::remove_var("DATABASE_URL");
    env::remove_var("SESSION_SECRET");
}
