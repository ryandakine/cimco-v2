# CIMCO v2 Security & Performance Fixes - PRD

## Overview
This document outlines the critical security and performance fixes required for the CIMCO Inventory System v2 before production deployment.

## Priority Levels
- **P0**: Critical - Security vulnerability, data loss risk
- **P1**: Major - Significant bug, performance regression
- **P2**: Minor - Code smell, clarity issue

---

## P1 Fixes (Must Fix Before Production)

### 1. Authentication Rate Limiting
**Issue**: Login endpoint has no application-level rate limiting, vulnerable to brute force attacks.

**Implementation**:
- Create `src/http/middleware/rate_limit.rs`
- Implement per-IP and per-username rate limiting using in-memory store with TTL
- Apply middleware to `/api/auth/login` endpoint
- Return 429 Too Many Requests after 5 failed attempts per minute

**Acceptance Criteria**:
- [ ] Rate limiter tracks attempts by IP and username
- [ ] 429 response returned after threshold exceeded
- [ ] Rate limit headers included in responses (X-RateLimit-*)
- [ ] Integration tests verify rate limiting behavior

---

### 2. JWT Token Implementation
**Issue**: SESSION_SECRET environment variable is loaded but unused; tokens are simple UUIDs requiring DB lookup on every request.

**Implementation**:
- Add `jsonwebtoken` crate dependency
- Create `src/auth/jwt.rs` module with token encoding/decoding
- Modify `auth/service.rs` to generate signed JWTs instead of UUIDs
- Update `auth_middleware` to validate JWTs cryptographically
- Store JWT secret in config and pass through application

**Acceptance Criteria**:
- [ ] Tokens are signed HS256 JWTs with 24h expiration
- [ ] Token payload contains: user_id, username, role, exp, iat
- [ ] Middleware validates signature without database lookup
- [ ] Session table can be deprecated (optional cleanup migration)

---

### 3. Password Complexity Validation
**Issue**: No password strength requirements; users can create weak passwords.

**Implementation**:
- Add `password_validator` crate or custom validation
- Create `src/auth/validation.rs` module
- Validate passwords in `create_user` and password change flows
- Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 digit

**Acceptance Criteria**:
- [ ] Passwords < 8 chars rejected with clear error message
- [ ] Passwords without uppercase rejected
- [ ] Passwords without lowercase rejected
- [ ] Passwords without digit rejected
- [ ] Unit tests for all validation cases

---

### 4. Fix Race Condition in Quantity Adjustment
**Issue**: Quantity adjustment reads current value, calculates new value, then updates - vulnerable to race conditions.

**Implementation**:
- Modify `inventory/repository.rs` `adjust_quantity()` to use `SELECT FOR UPDATE`
- Calculate new quantity within the transaction after locking row
- Remove new_quantity parameter from service layer
- Validate quantity >= 0 before commit

**Acceptance Criteria**:
- [ ] Row-level locking prevents concurrent modification
- [ ] Concurrent adjustments are processed sequentially
- [ ] No negative quantities possible
- [ ] Integration test simulates concurrent adjustments

---

### 5. Database Index for Transaction History
**Issue**: `get_transaction_history` queries lack index on `part_id`, causing full table scans.

**Implementation**:
- Create migration `014_add_transaction_indexes.sql`
- Add index: `idx_inventory_transactions_part_id ON inventory_transactions(part_id)`
- Add index: `idx_inventory_transactions_timestamp ON inventory_transactions(timestamp DESC)`

**Acceptance Criteria**:
- [ ] Explain query shows index usage
- [ ] Query performance < 100ms for 100k records

---

### 6. CORS Origin Validation
**Issue**: CORS origins split from env var without validation; malformed origins possible.

**Implementation**:
- Add URL validation in `config.rs`
- Use `url` crate to parse and validate each origin
- Ensure origins start with http:// or https://
- Fail fast on invalid configuration

**Acceptance Criteria**:
- [ ] Invalid CORS origins cause config error on startup
- [ ] Valid origins accepted and used correctly

---

## P2 Fixes (Should Fix)

### 7. CSV Export Pagination
**Issue**: CSV export loads all parts into memory, potential OOM with large datasets.

**Implementation**:
- Add pagination parameters to `get_all_for_export()`
- Implement streaming CSV generation using `csv` crate
- Process in chunks of 1000 records
- Return iterator/stream instead of Vec

**Acceptance Criteria**:
- [ ] Export works with 100k+ parts without memory issues
- [ ] Streaming response to client

---

### 8. Fix Silent Row Mapping Failures
**Issue**: `unwrap_or_default()` hides database schema mismatches.

**Implementation**:
- Replace `unwrap_or_default()` with `?` operator in repository mappers
- Change `map()` to return `Result<Part, sqlx::Error>`
- Use `collect::<Result<Vec<_>, _>>()` to propagate errors

**Acceptance Criteria**:
- [ ] Schema mismatch causes error instead of silent data loss
- [ ] All existing tests pass

---

### 9. API Version Consistency
**Issue**: Frontend uses `/api/v2`, backend uses `/api/` without version prefix.

**Implementation**:
- Update `http/routes.rs` to mount routes under `/api/v2`
- Keep `/health` at root for load balancers
- Update any hardcoded paths

**Acceptance Criteria**:
- [ ] All API routes prefixed with `/api/v2`
- [ ] Frontend requests succeed
- [ ] Health check available at `/health`

---

### 10. Request Body Size Limits
**Issue**: No body size limits, vulnerable to DoS via large payloads.

**Implementation**:
- Add `tower_http::limit::RequestBodyLimitLayer`
- Set 1MB default limit
- Configure via environment variable

**Acceptance Criteria**:
- [ ] Requests > 1MB return 413 Payload Too Large
- [ ] Normal requests processed correctly

---

### 11. Database Connection Pool Configuration
**Issue**: Default connection pool size may not be optimal.

**Implementation**:
- Add pool configuration options to `Config`
- Configure min/max connections in `db.rs`
- Add connection timeout settings

**Acceptance Criteria**:
- [ ] DB_POOL_MAX and DB_POOL_MIN env vars supported
- [ ] Sensible defaults (min: 5, max: 20)

---

## Implementation Plan

### Phase 1: Security Critical (P1)
1. JWT implementation
2. Rate limiting
3. Password validation
4. Race condition fix
5. Database indexes

### Phase 2: Robustness (P2)
1. CORS validation
2. Body size limits
3. API versioning
4. Error handling improvements
5. CSV streaming
6. Pool configuration

### Phase 3: Testing & Documentation
1. Update all tests for JWT changes
2. Add rate limiting tests
3. Update API documentation
4. Deployment checklist

---

## Dependencies to Add

```toml
[dependencies]
jsonwebtoken = "9"
passwords = "3"
url = "2"
csv = "1"
dashmap = "5"  # For concurrent rate limiter

[dev-dependencies]
# Existing dev dependencies
```

---

## Migration Scripts

### 014_add_transaction_indexes.sql
```sql
-- Add indexes for transaction history queries
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_part_id 
    ON inventory_transactions(part_id);
    
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_timestamp 
    ON inventory_transactions(timestamp DESC);

-- Add composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_part_timestamp 
    ON inventory_transactions(part_id, timestamp DESC);
```

---

## Environment Variables

```bash
# New/Updated environment variables
JWT_SECRET=<cryptographically-secure-secret>
RATE_LIMIT_REQUESTS_PER_MINUTE=5
RATE_LIMIT_BURST_SIZE=10
MAX_REQUEST_BODY_SIZE=1048576  # 1MB in bytes
DB_POOL_MIN=5
DB_POOL_MAX=20
```

---

## Testing Checklist

- [ ] Unit tests for JWT encoding/decoding
- [ ] Unit tests for password validation
- [ ] Unit tests for rate limiting
- [ ] Integration tests for concurrent quantity adjustments
- [ ] Load tests for CSV export with large datasets
- [ ] Security tests for token validation edge cases
- [ ] E2E tests for full authentication flow
