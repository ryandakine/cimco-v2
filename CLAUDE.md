# CIMCO v2 — AI Assistant Guide

## Project Overview

CIMCO v2 is a full-stack inventory management system for CIMCO (industrial/manufacturing). It manages parts, tracks stock levels, records quantity adjustments with full history, supports role-based auth (admin/worker), and provides CSV export.

The backend is written in Rust (Axum). The frontend is React + TypeScript (Vite). This is intentional — do not suggest migrating either.

## Tech Stack

### Backend (Rust)
| Component | Technology |
|-----------|-----------|
| Framework | Axum 0.7 |
| Runtime | Tokio (async) |
| Database | PostgreSQL via SQLx (compile-time checked queries) |
| Auth | JWT (jsonwebtoken) + Argon2 password hashing |
| Session store | DashMap (in-memory) |
| Logging | tracing + tracing-subscriber |
| CORS | tower-http |

### Frontend (TypeScript)
| Component | Technology |
|-----------|-----------|
| Framework | React 18 + React Router DOM 6 |
| Data fetching | TanStack React Query v5 |
| Build | Vite 5 |
| Styling | TailwindCSS 3 |
| HTTP | Axios |
| Icons | lucide-react |
| Testing | Vitest + Testing Library + MSW |

## Repository Structure

```
backend/
  src/
    main.rs           Entry point, server bootstrap
    config.rs         Configuration loading
    db.rs             PostgreSQL connection pool setup
    auth/             Login/logout handlers, JWT service, User/Session models
    inventory/        Parts CRUD handler, service, repository, models, transactions
    http/             Route definitions, DTOs, auth middleware
  migrations/         SQL migration files (users, parts, transactions)
  seed.sql            Test data seeder
frontend/
  src/                React SPA (router, react-query, components)
  public/             Static assets
ops/                  Deployment / infrastructure config
database/             Additional DB config
```

## Key Commands

### Backend (Rust)
```bash
createdb cimco_inventory_v2
cd backend && sqlx migrate run
cargo run                    # API server at http://0.0.0.0:8081
cargo run --bin seed         # Seed test data
cargo build --release
cargo test
```

### Frontend (TypeScript)
```bash
cd frontend
npm install
npm run dev
npm run build
npm run test
npm run test:coverage
```

## Architecture Patterns

### Repository Pattern (Rust)
The backend strictly follows: handler → service → repository.
- handler: parse request, call service, return response
- service: enforce rules, orchestrate repositories
- repository: SQLx queries only, no business logic

### SQLx Compile-Time Query Checking
All SQL uses sqlx::query! or sqlx::query_as! macros. Queries are checked against the real schema at compile time. You must have DATABASE_URL set and run cargo sqlx prepare after changing queries. Never use raw string queries.

### JWT Auth Flow
1. POST /auth/login returns JWT token
2. All protected routes require Authorization: Bearer <token>
3. Sessions in DashMap (in-memory, not persisted across restarts)
4. Roles: admin (full CRUD) and worker (view + adjustments only)

### Frontend Data Fetching
All API calls go through TanStack React Query. Do not use useEffect + fetch directly.

## Environment Variables

Backend:
- DATABASE_URL=postgresql://user:password@localhost/cimco_inventory_v2
- JWT_SECRET=your-secret-key-here
- SERVER_PORT=8081

Frontend:
- VITE_API_URL=http://localhost:8081

## Testing

Backend: cargo test
Frontend: npm run test (Vitest), npm run test:coverage (100% threshold — will fail if below)

MSW mocks the Rust API in frontend tests. When adding new endpoints, add MSW handlers.

## Important Constraints

- Compile-time SQL: run cargo sqlx prepare after changing queries to update offline cache.
- 100% frontend coverage threshold enforced — new components need tests.
- Never use bcrypt or MD5 — Argon2 is the chosen password algorithm.
- DashMap sessions are ephemeral — lost on server restart.
- Role checks happen at the service layer, not just middleware.
- Never modify existing migration files — add new ones instead.
