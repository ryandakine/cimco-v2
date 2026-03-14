# PRD: Security & Reliability Improvements for CIMCO v2 Backend

## Overview

Three targeted improvements to strengthen the CIMCO v2 Rust backend's security posture and operational reliability. Each improvement builds on existing code and infrastructure with minimal new dependencies.

---

## 1. Integrate Rate Limiter on Login Endpoint

### Problem

The `RateLimiter` in `backend/src/http/middleware/rate_limit.rs` is fully implemented and tested but **never wired into any route**. The login endpoint (`POST /api/v2/auth/login`) accepts unlimited requests, leaving it open to brute-force credential attacks.

### Goal

Apply rate limiting to the login endpoint (5 requests/minute per IP) and run periodic cleanup to prevent memory growth from stale IP entries.

### Integration Plan

#### Files Modified

| File | Change |
|------|--------|
| `backend/src/main.rs` | Instantiate `RateLimiter`, spawn background cleanup task |
| `backend/src/http/routes.rs` | Accept `Arc<RateLimiter>`, apply `rate_limit_handler` as a layer on the login route |

#### Implementation Details

**`main.rs`** — After creating `jwt_config`, add:
```rust
// Create rate limiter for login endpoint
let login_rate_limiter = rate_limit::default_login_rate_limiter();

// Spawn background cleanup task (runs every 5 minutes)
let cleanup_limiter = login_rate_limiter.clone();
tokio::spawn(async move {
    let mut interval = tokio::time::interval(Duration::from_secs(300));
    loop {
        interval.tick().await;
        cleanup_limiter.cleanup_all_expired();
    }
});
```

Pass `login_rate_limiter` into `create_router()`.

**`routes.rs`** — Split the login route into its own router with the rate limit layer:
```rust
let public_routes = Router::new()
    .route("/api/v2/auth/login", post(login))
    .layer(axum::middleware::from_fn_with_state(
        login_rate_limiter,
        rate_limit::rate_limit_handler,
    ));
```

**Note:** `rate_limit_handler` uses `ConnectInfo<SocketAddr>`, so the server must be started with `.into_make_service_with_connect_info::<SocketAddr>()` instead of `.into_make_service()`. Verify this is already the case in `main.rs`, or update accordingly.

#### Acceptance Criteria

- Login endpoint returns `429 Too Many Requests` with `Retry-After` header after 5 requests in 60 seconds from the same IP
- Different IPs are tracked independently
- Background task cleans up expired entries every 5 minutes
- All other routes remain unaffected

---

## 2. JWT Token Denylist for Logout

### Problem

The `logout()` handler is a no-op — it returns a success message but the JWT token remains valid for up to 24 hours. A stolen or compromised token cannot be revoked server-side.

### Goal

Add an in-memory token denylist that is checked during token validation. When a user logs out, their token is added to the denylist and rejected on subsequent requests until it would have expired naturally.

### Integration Plan

#### Files Modified

| File | Change |
|------|--------|
| `backend/src/auth/jwt.rs` | Add `TokenDenylist` struct with `deny()` and `is_denied()` methods |
| `backend/src/auth/handler.rs` | Update `logout()` to accept token and add to denylist |
| `backend/src/http/middleware/auth.rs` | Check denylist before accepting token |
| `backend/src/http/routes.rs` | Pass `Arc<TokenDenylist>` as an extension |
| `backend/src/main.rs` | Instantiate denylist, spawn cleanup task |

#### Implementation Details

**`jwt.rs`** — Add a new struct alongside existing JWT code:
```rust
pub struct TokenDenylist {
    /// Maps token string -> expiration Instant
    denied: DashMap<String, Instant>,
}

impl TokenDenylist {
    pub fn new() -> Self {
        Self { denied: DashMap::new() }
    }

    /// Add a token to the denylist. It will be kept until `expires_at`.
    pub fn deny(&self, token: String, expires_at: Instant) {
        self.denied.insert(token, expires_at);
    }

    /// Check if a token has been denied.
    pub fn is_denied(&self, token: &str) -> bool {
        self.denied.contains_key(token)
    }

    /// Remove expired entries.
    pub fn cleanup_expired(&self) {
        let now = Instant::now();
        self.denied.retain(|_, expires_at| *expires_at > now);
    }
}
```

**`auth.rs` middleware** — After `validate_token()` succeeds, add a denylist check:
```rust
let denylist = request.extensions().get::<Arc<TokenDenylist>>()...;
if denylist.is_denied(token) {
    return Err(AppError::Unauthorized("Token has been revoked".into()));
}
```

**`handler.rs` logout** — Extract the bearer token and deny it:
```rust
pub async fn logout(
    Extension(denylist): Extension<Arc<TokenDenylist>>,
    headers: HeaderMap,
) -> Result<impl IntoResponse> {
    let token = extract_bearer_from_headers(&headers)?;
    let claims = // decode without full validation to get exp
    let ttl = Duration::from_secs(claims.exp - now);
    denylist.deny(token.to_string(), Instant::now() + ttl);
    Ok(...)
}
```

**`main.rs`** — Instantiate and spawn cleanup:
```rust
let token_denylist = Arc::new(TokenDenylist::new());

// Cleanup expired denied tokens every 10 minutes
let cleanup_denylist = token_denylist.clone();
tokio::spawn(async move {
    let mut interval = tokio::time::interval(Duration::from_secs(600));
    loop {
        interval.tick().await;
        cleanup_denylist.cleanup_expired();
    }
});
```

#### Design Decisions

- **In-memory only**: Tokens are short-lived (24h) and the denylist is small. A server restart clears the denylist, which is acceptable since tokens issued before restart are still cryptographically valid — this is an inherent JWT tradeoff. For multi-instance deployments, a Redis-backed denylist would be needed, but that's out of scope.
- **DashMap reuse**: Already a dependency for the rate limiter, so no new crate needed.
- **No `jti` claim required**: We use the full token string as the key. Adding a `jti` (JWT ID) claim is a future optimization that would reduce key size.

#### Acceptance Criteria

- After calling `POST /api/v2/auth/logout` with a valid token, subsequent requests using that token return `401 Unauthorized`
- Tokens not in the denylist continue to work normally
- Expired denylist entries are cleaned up automatically
- Server startup with an empty denylist does not break existing tokens

---

## 3. Replace `expect()` Panics with Error Returns in Config

### Problem

`config.rs` uses `.expect()` to parse four environment variables (`SERVER_PORT`, `DB_POOL_MIN`, `DB_POOL_MAX`, `MAX_REQUEST_BODY_SIZE`). If any of these contain non-numeric values, the process panics with an unhelpful message instead of returning a clean error through the `Result` return type that `from_env()` already uses.

### Goal

Replace all `.expect()` calls with `.map_err()` to return `std::io::Error`, consistent with how `DATABASE_URL`, `SESSION_SECRET`, and `JWT_SECRET` are handled.

### Integration Plan

#### Files Modified

| File | Change |
|------|--------|
| `backend/src/config.rs` | Replace 4 `.expect()` calls with `.map_err()` |

#### Implementation Details

Replace each pattern from:
```rust
let server_port = env::var("SERVER_PORT")
    .unwrap_or_else(|_| "8081".to_string())
    .parse()
    .expect("SERVER_PORT must be a valid u16");
```

To:
```rust
let server_port: u16 = env::var("SERVER_PORT")
    .unwrap_or_else(|_| "8081".to_string())
    .parse()
    .map_err(|_| std::io::Error::new(
        std::io::ErrorKind::InvalidInput,
        "SERVER_PORT must be a valid u16",
    ))?;
```

Apply the same transformation to:
- `SERVER_PORT` (u16)
- `DB_POOL_MIN` (u32)
- `DB_POOL_MAX` (u32)
- `MAX_REQUEST_BODY_SIZE` (usize)

#### Acceptance Criteria

- Invalid values for any of these 4 variables produce a clean error message instead of a panic
- Valid values and defaults continue to work unchanged
- `from_env()` return type remains `Result<Self, std::io::Error>` (no signature change)

---

## Implementation Order

1. **Config error handling** (improvement 3) — smallest change, no cross-cutting concerns, can be done and tested immediately
2. **Rate limiter integration** (improvement 1) — requires wiring existing code into routes and main, plus verifying `ConnectInfo` setup
3. **Token denylist** (improvement 2) — most new code, touches auth middleware hot path, should be done last

## Dependencies

- No new crates required — all improvements use existing dependencies (`dashmap`, `jsonwebtoken`, `tokio`)
- No database schema changes
- No API contract changes (rate limiting adds a new response code `429`, denylist makes `logout` actually functional)
