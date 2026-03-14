use std::env;
use url::Url;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub server_port: u16,
    pub server_host: String,
    pub session_secret: String,
    pub jwt_secret: String,
    pub cors_origins: Vec<String>,
    pub db_pool_min: u32,
    pub db_pool_max: u32,
    pub max_request_body_size: usize,
}

impl Config {
    pub fn from_env() -> Result<Self, std::io::Error> {
        dotenvy::dotenv().ok();

        let database_url = env::var("DATABASE_URL")
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidInput, e))?;
        let server_port = env::var("SERVER_PORT")
            .unwrap_or_else(|_| "8081".to_string())
            .parse()
            .expect("SERVER_PORT must be a valid u16");
        let server_host = env::var("SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
        let session_secret = env::var("SESSION_SECRET")
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidInput, e))?;
        let jwt_secret = env::var("JWT_SECRET")
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidInput, e))?;
        let cors_origins = env::var("CORS_ORIGINS")
            .unwrap_or_else(|_| "http://localhost:3000".to_string())
            .split(',')
            .map(|s| {
                let s = s.trim();
                let url = Url::parse(s)
                    .map_err(|_| format!("Invalid CORS origin URL: {}", s))?;
                if url.scheme() != "http" && url.scheme() != "https" {
                    return Err(format!("CORS origin must use http:// or https://: {}", s));
                }
                Ok(s.to_string())
            })
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidInput, e))?;
        let db_pool_min = env::var("DB_POOL_MIN")
            .unwrap_or_else(|_| "5".to_string())
            .parse()
            .expect("DB_POOL_MIN must be a valid u32");
        let db_pool_max = env::var("DB_POOL_MAX")
            .unwrap_or_else(|_| "20".to_string())
            .parse()
            .expect("DB_POOL_MAX must be a valid u32");
        let max_request_body_size = env::var("MAX_REQUEST_BODY_SIZE")
            .unwrap_or_else(|_| "1048576".to_string())
            .parse()
            .expect("MAX_REQUEST_BODY_SIZE must be a valid usize");

        Ok(Config {
            database_url,
            server_port,
            server_host,
            session_secret,
            jwt_secret,
            cors_origins,
            db_pool_min,
            db_pool_max,
            max_request_body_size,
        })
    }
}
