use std::net::SocketAddr;
use std::sync::Arc;
use std::time::{Duration, Instant};
use axum::{
    extract::{ConnectInfo, Extension, Request, State},
    http::{header, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use dashmap::DashMap;
use serde_json::json;

/// In-memory rate limiter using DashMap for thread-safe storage
pub struct RateLimiter {
    attempts: DashMap<String, Vec<Instant>>, // IP -> list of attempt timestamps
    max_requests: usize,
    window: Duration,
}

impl RateLimiter {
    /// Create a new rate limiter with specified max requests and window in seconds
    pub fn new(max_requests: usize, window_secs: u64) -> Self {
        Self {
            attempts: DashMap::new(),
            max_requests,
            window: Duration::from_secs(window_secs),
        }
    }

    /// Check if the IP is allowed to make a request
    /// Returns true if allowed, false if rate limited
    pub fn check_rate_limit(&self, ip: &str) -> bool {
        let now = Instant::now();

        let mut entry = self.attempts.entry(ip.to_string()).or_default();

        // Filter out expired timestamps
        entry.retain(|&timestamp| now.duration_since(timestamp) < self.window);

        // Check if limit exceeded
        if entry.len() >= self.max_requests {
            return false;
        }

        // Add current attempt
        entry.push(now);
        true
    }

    /// Remove all expired IP entries to prevent unbounded memory growth.
    /// Should be called periodically (e.g., from a background task).
    pub fn cleanup_all_expired(&self) {
        let now = Instant::now();
        self.attempts.retain(|_, timestamps| {
            timestamps.retain(|&ts| now.duration_since(ts) < self.window);
            !timestamps.is_empty()
        });
    }

    /// Get the number of seconds until the next request is allowed
    /// Returns 0 if the IP is not rate limited
    pub fn get_retry_after(&self, ip: &str) -> u64 {
        let now = Instant::now();
        
        if let Some(entry) = self.attempts.get(ip) {
            if entry.len() >= self.max_requests {
                // Find the oldest timestamp that will expire
                if let Some(oldest) = entry.iter().min() {
                    let elapsed = now.duration_since(*oldest);
                    if elapsed < self.window {
                        return (self.window - elapsed).as_secs() + 1;
                    }
                }
            }
        }
        0
    }

}

/// Default rate limiter for login endpoint: 5 requests per minute
pub fn default_login_rate_limiter() -> Arc<RateLimiter> {
    Arc::new(RateLimiter::new(5, 60))
}

/// Rate limit middleware handler function that uses state
/// 
/// This should be used with `axum::middleware::from_fn_with_state`:
/// ```rust
/// use std::sync::Arc;
/// use axum::Router;
/// use axum::routing::post;
/// 
/// use crate::http::middleware::rate_limit::{RateLimiter, rate_limit_handler};
/// use crate::auth::handler::login;
/// 
/// let rate_limiter = Arc::new(RateLimiter::new(5, 60)); // 5 requests per minute
/// 
/// let login_route = Router::new()
///     .route("/api/auth/login", post(login))
///     .layer(axum::middleware::from_fn_with_state(rate_limiter, rate_limit_handler));
/// ```
pub async fn rate_limit_handler(
    State(rate_limiter): State<Arc<RateLimiter>>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    request: Request,
    next: Next,
) -> Response {
    let ip = addr.ip().to_string();

    if rate_limiter.check_rate_limit(&ip) {
        next.run(request).await
    } else {
        let retry_after = rate_limiter.get_retry_after(&ip);

        (
            StatusCode::TOO_MANY_REQUESTS,
            [(header::RETRY_AFTER, retry_after.to_string())],
            Json(json!({
                "error": "Too many requests",
                "status": 429,
                "retry_after": retry_after,
            })),
        )
            .into_response()
    }
}

/// Rate limit middleware using Extension extractor (for use with `from_fn`)
pub async fn rate_limit_middleware(
    Extension(rate_limiter): Extension<Arc<RateLimiter>>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    request: Request,
    next: Next,
) -> Response {
    let ip = addr.ip().to_string();

    if rate_limiter.check_rate_limit(&ip) {
        next.run(request).await
    } else {
        let retry_after = rate_limiter.get_retry_after(&ip);

        (
            StatusCode::TOO_MANY_REQUESTS,
            [(header::RETRY_AFTER, retry_after.to_string())],
            Json(json!({
                "error": "Too many requests",
                "status": 429,
                "retry_after": retry_after,
            })),
        )
            .into_response()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread;

    #[test]
    fn test_rate_limiter_allows_requests_within_limit() {
        let limiter = RateLimiter::new(5, 60);
        
        // 5 requests should be allowed
        for _ in 0..5 {
            assert!(limiter.check_rate_limit("192.168.1.1"));
        }
    }

    #[test]
    fn test_rate_limiter_blocks_excess_requests() {
        let limiter = RateLimiter::new(3, 60);
        
        // 3 requests should be allowed
        for _ in 0..3 {
            assert!(limiter.check_rate_limit("192.168.1.1"));
        }
        
        // 4th request should be blocked
        assert!(!limiter.check_rate_limit("192.168.1.1"));
    }

    #[test]
    fn test_rate_limiter_tracks_ips_separately() {
        let limiter = RateLimiter::new(2, 60);
        
        // Use up the limit for first IP
        assert!(limiter.check_rate_limit("192.168.1.1"));
        assert!(limiter.check_rate_limit("192.168.1.1"));
        assert!(!limiter.check_rate_limit("192.168.1.1"));
        
        // Different IP should still be allowed
        assert!(limiter.check_rate_limit("192.168.1.2"));
        assert!(limiter.check_rate_limit("192.168.1.2"));
        assert!(!limiter.check_rate_limit("192.168.1.2"));
    }

    #[test]
    fn test_rate_limiter_cleanup_expired() {
        let limiter = RateLimiter::new(2, 1); // 2 requests per 1 second
        
        // Use up the limit
        assert!(limiter.check_rate_limit("192.168.1.1"));
        assert!(limiter.check_rate_limit("192.168.1.1"));
        assert!(!limiter.check_rate_limit("192.168.1.1"));
        
        // Wait for window to expire
        thread::sleep(Duration::from_secs(2));
        
        // Should be allowed again after cleanup
        assert!(limiter.check_rate_limit("192.168.1.1"));
    }

    #[test]
    fn test_get_retry_after() {
        let limiter = RateLimiter::new(2, 60);
        
        // Before reaching limit, retry_after should be 0
        assert_eq!(limiter.get_retry_after("192.168.1.1"), 0);
        
        // Use up the limit
        limiter.check_rate_limit("192.168.1.1");
        limiter.check_rate_limit("192.168.1.1");
        
        // After reaching limit, retry_after should be > 0
        let retry_after = limiter.get_retry_after("192.168.1.1");
        assert!(retry_after > 0 && retry_after <= 60);
    }
}
