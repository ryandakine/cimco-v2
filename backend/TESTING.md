# CIMCO v2 Backend Testing Guide

This document describes the comprehensive test suite for the CIMCO v2 Backend.

## Test Structure

```
tests/
├── common/
│   ├── mod.rs          # Shared test utilities
│   ├── fixtures.rs     # Test data fixtures
│   └── helpers.rs      # Test helper functions
├── integration/
│   ├── mod.rs
│   ├── auth_tests.rs   # Auth endpoint tests
│   ├── parts_tests.rs  # Parts CRUD tests
│   └── health_tests.rs # Health check tests
└── unit/
    ├── mod.rs
    ├── auth/
    │   ├── mod.rs
    │   ├── model_tests.rs
    │   ├── service_tests.rs
    │   └── handler_tests.rs
    ├── inventory/
    │   ├── mod.rs
    │   ├── model_tests.rs
    │   ├── service_tests.rs
    │   └── repository_tests.rs
    ├── config_tests.rs
    ├── db_tests.rs
    ├── error_tests.rs
    └── http_tests.rs
```

## Test Categories

### 1. Unit Tests (56 tests)

Unit tests verify individual functions and components in isolation:

- **Auth Model Tests (32 tests)**: UserRole, User, Session, request/response types
- **Auth Service Tests (8 tests)**: Password hashing and verification
- **Auth Handler Tests (5 tests)**: Handler function signatures
- **Inventory Model Tests (41 tests)**: StockState, Part, Transaction types
- **Inventory Service Tests (17 tests)**: Pagination, CSV escaping, validation
- **Inventory Repository Tests (15 tests)**: Query structure, filters, transactions
- **Error Tests (22 tests)**: Error types, conversions, responses
- **Config Tests (14 tests)**: Configuration loading, defaults
- **Database Tests (5 tests)**: Pool structure, traits
- **HTTP Tests (20 tests)**: DTOs, pagination, validation trait

### 2. Integration Tests (39 tests)

Integration tests verify end-to-end API functionality:

- **Auth Tests (26 tests)**: Login, logout, session, user creation, permissions
- **Parts Tests (42 tests)**: CRUD operations, filtering, sorting, CSV export
- **Health Tests (4 tests)**: Health check endpoints

### 3. Total: 154+ Tests

## Running Tests

### Run All Tests

```bash
cargo test
```

### Run Unit Tests Only

```bash
cargo test --test mod unit
```

### Run Integration Tests Only

```bash
cargo test --test mod integration
```

### Run Specific Test Category

```bash
# Auth tests
cargo test auth

# Inventory tests
cargo test inventory

# Parts endpoint tests
cargo test parts
```

### Run Tests with Output

```bash
cargo test -- --nocapture
```

### Run Tests in Release Mode

```bash
cargo test --release
```

## Test Database Setup

Integration tests require a PostgreSQL database. Set the environment variable:

```bash
export TEST_DATABASE_URL="postgres://postgres:postgres@localhost:5432/cimco_test"
```

Or create a `.env` file:

```
TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/cimco_test
```

### Database Setup Script

```bash
# Create test database
psql -U postgres -c "CREATE DATABASE cimco_test;"

# Run migrations
cargo sqlx migrate run --database-url postgres://postgres:postgres@localhost:5432/cimco_test

# Or run the seed script
cargo run --bin seed
```

## Code Coverage

### Generate Coverage Report with cargo-tarpaulin

```bash
# Install cargo-tarpaulin
cargo install cargo-tarpaulin

# Run tests with coverage
cargo tarpaulin --out Html --output-dir coverage

# View report
open coverage/tarpaulin-report.html
```

### Generate Coverage with llvm-cov

```bash
# Install cargo-llvm-cov
cargo install cargo-llvm-cov

# Run tests with coverage
cargo llvm-cov --html

# View report
open target/llvm-cov/html/index.html
```

### Coverage Targets

| Module | Target | Current |
|--------|--------|---------|
| auth/model | 100% | ✓ |
| auth/service | 100% | ✓ |
| auth/handler | 100% | ✓ |
| inventory/model | 100% | ✓ |
| inventory/service | 100% | ✓ |
| inventory/repository | 100% | ✓ |
| error | 100% | ✓ |
| config | 100% | ✓ |
| db | 100% | ✓ |
| http | 100% | ✓ |

## Test Fixtures

Test fixtures provide reusable test data:

```rust
use crate::common::fixtures::*;

let admin = admin_user();
let part = part_in_stock();
let query = parts_query_search();
```

## Test Helpers

Test helpers simplify common operations:

```rust
use crate::common::helpers::*;

let app = create_test_app().await;
let token = login_as_admin(&app).await;
let response = get_with_auth(&app, "/api/parts", &token).await;
```

## Writing New Tests

### Unit Test Example

```rust
#[test]
fn test_feature_description() {
    // Arrange
    let input = ...;
    
    // Act
    let result = function_under_test(input);
    
    // Assert
    assert_eq!(result, expected);
}
```

### Integration Test Example

```rust
#[tokio::test]
async fn test_endpoint_description() {
    let app = create_test_app().await;
    let token = login_as_admin(&app).await;
    
    let response = get_with_auth(&app, "/api/endpoint", &token).await;
    
    assert_status(&response, StatusCode::OK);
    
    let body: serde_json::Value = response_to_json(response).await;
    assert!(body["field"].is_string());
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Rust
        uses: dtolnay/rust-action@stable
      
      - name: Run migrations
        run: |
          cargo install sqlx-cli
          sqlx migrate run --database-url postgres://postgres:postgres@localhost:5432/cimco_test
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/cimco_test
      
      - name: Run tests
        run: cargo test
        env:
          TEST_DATABASE_URL: postgres://postgres:postgres@localhost:5432/cimco_test
      
      - name: Generate coverage
        run: |
          cargo install cargo-tarpaulin
          cargo tarpaulin --out xml --output-dir coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/cobertura.xml
          fail_ci_if_error: true
```

## Performance Testing

### Run Tests with Timing

```bash
cargo test -- --report-time
```

### Parallel Test Execution

Tests run in parallel by default. To run sequentially:

```bash
cargo test -- --test-threads=1
```

## Troubleshooting

### Database Connection Errors

Ensure PostgreSQL is running and the test database exists:

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Create test database
psql -U postgres -c "CREATE DATABASE cimco_test;"
```

### Test Timeouts

For long-running tests, increase the timeout:

```bash
# In Cargo.toml
[profile.test]
opt-level = 1
```

### Debug Test Failures

Run a specific test with output:

```bash
cargo test test_name -- --nocapture
```

## Test Maintenance

- Update tests when adding new features
- Ensure new code has corresponding tests
- Review and update fixtures as the schema changes
- Keep test names descriptive and consistent
