# CIMCO Inventory System v2

Industrial parts inventory management system with equipment tracking, wear prediction, and scale integration.

## Project Structure

```
backend/    — Rust/Axum REST API (port 8081)
frontend/   — React/TypeScript + Vite SPA (port 3000)
database/   — PostgreSQL migrations and Docker setup
ops/        — Deployment and operational configs
```

## Backend (Rust)

### Build & Run

```bash
cd backend
cargo build                    # Build
cargo run                      # Run server (requires env vars)
cargo run --bin seed           # Seed database
cargo test --lib               # Unit tests (no DB required)
cargo test                     # All tests (needs DB)
cargo check                    # Fast compilation check
```

### Required Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Session signing secret
- `JWT_SECRET` — JWT signing secret
- `CORS_ORIGINS` — Comma-separated allowed origins (default: `http://localhost:3000`)
- `SERVER_PORT` — Default `8081`
- `SERVER_HOST` — Default `0.0.0.0`

### Architecture

- **Modules**: `auth`, `inventory`, `http`, `config`, `db`, `error`
- **Pattern**: Handler → Service → Repository (per module)
- **Auth**: JWT bearer tokens, Argon2 password hashing, role-based (Admin/Operator/Viewer)
- **Error handling**: `AppError` enum → JSON `{error, status}` responses via `IntoResponse`
- **Database**: sqlx with raw SQL queries (no ORM), PgPool
- **Middleware**: auth (JWT validation), rate limiting (per-IP with dashmap)

### Key Files

- `src/main.rs` — Server startup, graceful shutdown (SIGTERM/Ctrl+C)
- `src/http/routes.rs` — All route definitions, single auth middleware layer for protected routes
- `src/error.rs` — `AppError` enum and `IntoResponse` impl
- `src/http/dto.rs` — Shared DTOs (ApiResponse, pagination types, Validate trait)
- `src/auth/handler.rs` — Login, logout, session, user creation endpoints
- `src/inventory/handler.rs` — CRUD for parts, quantity adjustment, CSV export

### API Routes

- `POST /api/v2/auth/login` — Public, rate-limited
- `POST /api/v2/auth/logout` — Protected
- `GET  /api/v2/auth/session` — Protected
- `POST /api/v2/auth/users` — Protected (admin only)
- `GET|POST /api/v2/parts` — Protected (POST: admin only)
- `GET|PUT  /api/v2/parts/:id` — Protected (PUT: admin only)
- `POST /api/v2/parts/:id/adjust-quantity` — Protected
- `GET  /api/v2/parts/:id/history` — Protected
- `GET  /api/v2/parts/export` — Protected (CSV download)
- `GET  /health` — Public

## Frontend (React/TypeScript)

### Build & Run

```bash
cd frontend
npm install
npm run dev                    # Dev server
npm run build                  # Production build (runs tsc first)
npm run test                   # Vitest tests
npm run lint                   # ESLint
```

### Stack

- React 18, TypeScript, Vite
- TanStack React Query for data fetching
- React Router v6
- Tailwind CSS
- Axios for HTTP
- Vitest for testing

## Database

```bash
cd database
docker-compose up -d           # Start PostgreSQL
# Migrations are in database/migrations/ (001-014), applied in order
```

## Conventions

- Rust edition 2021, MSRV 1.75
- All API responses use consistent JSON error format: `{error: string, status: number}`
- Input validation happens at the handler level before calling services
- Admin-only operations check `session.role != UserRole::Admin` in handlers
- Use `AppError::Validation(...)` for input validation errors
- Use `AppError::Unauthorized(...)` for permission errors
- Prefer `cargo check` for fast iteration, `cargo test --lib` for unit tests
