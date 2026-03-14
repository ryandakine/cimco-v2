use crate::error::{AppError, Result};

/// Validate password complexity requirements
/// - Minimum 8 characters
/// - At least 1 uppercase letter
/// - At least 1 lowercase letter
/// - At least 1 digit
pub fn validate_password(password: &str) -> Result<()> {
    if password.len() < 8 {
        return Err(AppError::Validation(
            "Password must be at least 8 characters long".to_string(),
        ));
    }

    if !password.chars().any(|c| c.is_ascii_uppercase()) {
        return Err(AppError::Validation(
            "Password must contain at least one uppercase letter".to_string(),
        ));
    }

    if !password.chars().any(|c| c.is_ascii_lowercase()) {
        return Err(AppError::Validation(
            "Password must contain at least one lowercase letter".to_string(),
        ));
    }

    if !password.chars().any(|c| c.is_ascii_digit()) {
        return Err(AppError::Validation(
            "Password must contain at least one digit".to_string(),
        ));
    }

    Ok(())
}

/// Validate username requirements
/// - Minimum 3 characters
/// - Maximum 50 characters
/// - Alphanumeric and underscores only
pub fn validate_username(username: &str) -> Result<()> {
    if username.len() < 3 {
        return Err(AppError::Validation(
            "Username must be at least 3 characters long".to_string(),
        ));
    }

    if username.len() > 50 {
        return Err(AppError::Validation(
            "Username must not exceed 50 characters".to_string(),
        ));
    }

    if !username.chars().all(|c| c.is_alphanumeric() || c == '_') {
        return Err(AppError::Validation(
            "Username can only contain letters, numbers, and underscores".to_string(),
        ));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_password() {
        assert!(validate_password("ValidPass1").is_ok());
        assert!(validate_password("A1b2c3d4").is_ok());
    }

    #[test]
    fn test_password_too_short() {
        let result = validate_password("Short1");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("8 characters"));
    }

    #[test]
    fn test_password_no_uppercase() {
        let result = validate_password("lowercase1");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("uppercase"));
    }

    #[test]
    fn test_password_no_lowercase() {
        let result = validate_password("UPPERCASE1");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("lowercase"));
    }

    #[test]
    fn test_password_no_digit() {
        let result = validate_password("NoDigitsHere");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("digit"));
    }

    #[test]
    fn test_valid_username() {
        assert!(validate_username("user").is_ok());
        assert!(validate_username("user_name").is_ok());
        assert!(validate_username("User123").is_ok());
    }

    #[test]
    fn test_username_too_short() {
        let result = validate_username("ab");
        assert!(result.is_err());
    }

    #[test]
    fn test_username_invalid_chars() {
        let result = validate_username("user-name");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("letters, numbers, and underscores"));
    }
}
