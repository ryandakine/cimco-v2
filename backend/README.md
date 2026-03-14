# CIMCO Inventory System v2 - Backend

A Rust-based backend for the CIMCO Inventory System v2, built with Axum web framework and SQLx for database operations.

## Tech Stack

- **Rust** 1.75+
- **Axum** - Web framework
- **Tokio** - Async runtime
- **SQLx** - Compile-time checked SQL queries with PostgreSQL
- **Argon2** - Password hashing
- **Tracing** - Structured logging

## Project Structure

```
src/
├── main.rs              # Entry point, server bootstrap
├── config.rs            # Configuration management
├── error.rs             # Error types and handling
├── lib.rs               # Module exports
├── db.rs                # Database connection pool
├── auth/                # Authentication module
│   ├── mod.rs
│   ├── handler.rs       # Login/logout endpoints
│   ├── service.rs       # Auth business logic
│   └── model.rs         # User, Session models
├── inventory/           # Inventory module
│   ├── mod.rs
│   ├── handler.rs       # Parts CRUD endpoints
│   ├── service.rs       # Inventory business logic
│   ├── model.rs         # Part, PartTransaction models
│   └── repository.rs    # Database queries
└── http/                # HTTP layer
    ├── mod.rs
    ├── routes.rs        # Route definitions
    ├── dto.rs           # Request/response DTOs
    └── middleware/      # Auth middleware

migrations/              # SQLx migrations
├── 001_users.sql
├── 002_parts.sql
└── 003_inventory_transactions.sql
```

## Setup Instructions

### 1. Prerequisites

- Rust 1.75+ installed
- PostgreSQL 15+ installed and running
- `sqlx-cli` installed: `cargo install sqlx-cli`

### 2. Database Setup

```bash
# Create database
createdb cimco_inventory_v2

# Run migrations
sqlx database create
sqlx migrate run
```

Or manually apply migrations:
```bash
psql $DATABASE_URL -f migrations/001_users.sql
psql $DATABASE_URL -f migrations/002_parts.sql
psql $DATABASE_URL -f migrations/003_inventory_transactions.sql
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgres://user:password@localhost:5432/cimco_inventory_v2
SERVER_PORT=8081
SERVER_HOST=0.0.0.0
SESSION_SECRET=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RUST_LOG=debug
```

### 4. Seed Data

Option A: SQL seed file
```bash
psql $DATABASE_URL -f seed.sql
```

Option B: Rust seed binary
```bash
cargo run --bin seed
```

### 5. Run the Server

```bash
cargo run
```

The server will start on `http://0.0.0.0:8081`

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Authentication
- `POST /api/auth/login` - Login with username/password
  - Body: `{ "username": "admin", "password": "admin123" }`
  - Returns: `{ "user": {...}, "token": "..." }`
  
- `POST /api/auth/logout` - Invalidate session (requires auth)
- `GET /api/auth/session` - Validate current session (requires auth)
- `POST /api/auth/users` - Create new user (Admin only)

### Inventory Management

- `GET /api/parts` - List parts with search, filter, pagination
  - Query params:
    - `search` - Full-text search on name, description, part_number
    - `category` - Filter by category
    - `zone` - Filter by zone
    - `manufacturer` - Filter by manufacturer
    - `stock_state` - Filter by stock state (`in_stock`, `low_stock`, `out_of_stock`)
    - `tracked` - Filter by tracked status (true/false)
    - `sort_by` - Sort field (`name`, `quantity`, `category`, `location`, `updated_at`)
    - `sort_order` - Sort direction (`asc`, `desc`)
    - `page` - Page number (1-based)
    - `page_size` - Items per page (10, 25, 50, 100)

- `GET /api/parts/:id` - Get single part by ID
- `POST /api/parts` - Create new part (Admin only)
- `PUT /api/parts/:id` - Update part (Admin only)
- `POST /api/parts/:id/adjust-quantity` - Adjust quantity with reason
  - Body: `{ "change_amount": 5, "reason": "Restocked from supplier" }`
- `GET /api/parts/:id/history` - Get transaction history for a part
- `GET /api/parts/export` - Export parts as CSV

## Authentication

The API uses Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Default Credentials

After seeding, the following users are available:

- **Admin**: username=`admin`, password=`admin123`
- **Worker**: username=`worker`, password=`worker123`

## Development

### Running Tests
```bash
cargo test
```

### Building for Production
```bash
cargo build --release
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SERVER_PORT` | Server port | 8081 |
| `SERVER_HOST` | Server host | 0.0.0.0 |
| `SESSION_SECRET` | Secret for session tokens | Required |
| `CORS_ORIGINS` | Comma-separated allowed origins | http://localhost:3000 |
| `RUST_LOG` | Log level | debug |

## License

Proprietary - CIMCO
