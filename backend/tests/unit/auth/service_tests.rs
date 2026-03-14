use cimco_inventory_v2::auth::service::AuthService;

// ==================== Password Hashing Tests ====================

#[test]
fn test_hash_password_success() {
    let password = "test_password123";
    let hash = AuthService::hash_password(password);
    
    assert!(hash.is_ok());
    let hash_str = hash.unwrap();
    assert!(!hash_str.is_empty());
    // Argon2 hashes start with $argon2id$
    assert!(hash_str.starts_with("$argon2id$"));
}

#[test]
fn test_hash_password_different_salts() {
    let password = "same_password";
    let hash1 = AuthService::hash_password(password).unwrap();
    let hash2 = AuthService::hash_password(password).unwrap();
    
    // Same password should produce different hashes (due to random salt)
    assert_ne!(hash1, hash2);
}

#[test]
fn test_verify_password_correct() {
    let password = "correct_password";
    let hash = AuthService::hash_password(password).unwrap();
    
    let verified = AuthService::verify_password(password, &hash);
    assert!(verified.is_ok());
    assert!(verified.unwrap());
}

#[test]
fn test_verify_password_incorrect() {
    let password = "correct_password";
    let hash = AuthService::hash_password(password).unwrap();
    
    let verified = AuthService::verify_password("wrong_password", &hash);
    assert!(verified.is_ok());
    assert!(!verified.unwrap());
}

#[test]
fn test_verify_password_invalid_hash() {
    let result = AuthService::verify_password("password", "invalid_hash");
    assert!(result.is_err());
}

#[test]
fn test_verify_password_empty_hash() {
    let result = AuthService::verify_password("password", "");
    assert!(result.is_err());
}

#[test]
fn test_password_hashing_roundtrip() {
    let passwords = vec![
        "simple",
        "Complex_Pass123!",
        "a",
        "verylongpasswordthathasmanycharactersindeed",
        "with spaces",
        "unicode:ñáéíóú",
    ];
    
    for password in passwords {
        let hash = AuthService::hash_password(password).unwrap();
        let verified = AuthService::verify_password(password, &hash).unwrap();
        assert!(verified, "Password '{}' should verify", password);
    }
}

// ==================== AuthService Structure Tests ====================

#[test]
fn test_auth_service_is_send_sync() {
    fn assert_send_sync<T: Send + Sync>() {}
    assert_send_sync::<AuthService>();
}
