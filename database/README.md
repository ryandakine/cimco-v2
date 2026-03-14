# CIMCO Inventory System v2 - Database

PostgreSQL 15 database for the CIMCO Inventory System v2 with full-scale integration, predictive maintenance, and equipment tracking.

## Database Architecture

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | Authentication and authorization (admin/worker roles) |
| `parts` | Inventory parts catalog with full metadata |
| `inventory_transactions` | Audit log for all quantity changes |
| `scale_devices` | Connected scale/tally devices |
| `scale_readings` | Raw tonnage readings from scales |
| `equipment_nodes` | Hierarchical equipment structure |
| `equipment_part_links` | Many-to-many parts ↔ equipment mapping |
| `part_installations` | Track installed parts with installation tonnage |
| `maintenance_events` | Maintenance history (replacement/repair/inspection) |
| `wear_models` | ML-based wear prediction models per category |
| `wear_predictions` | Calculated wear predictions per installation |
| `alerts` | System alerts (low stock, critical wear, etc.) |

### Key Relationships

```
parts ←── equipment_part_links ──→ equipment_nodes
  ↑                                     ↑
  └── part_installations ───→ scale_readings (scale_devices)
         ↓
    maintenance_events
         ↓
    wear_predictions
         ↓
        alerts
```

## Getting Started

### Prerequisites
- Docker & Docker Compose
- PostgreSQL 15

### Start the Database

```bash
cd /home/ryan/osi/platforms/cimco-v2/database

# Start PostgreSQL container
./scripts/init-db.sh

# Load seed data
./scripts/seed.sh
```

### Connection String

```
postgresql://cimco:cimco@localhost:5432/cimco_v2
```

For SQLx in Rust:
```rust
DATABASE_URL=postgresql://cimco:cimco@localhost:5432/cimco_v2
```

## Running Migrations

### Using Docker (Auto-migration)
Migrations in `migrations/` are automatically applied when the container starts via the volume mount to `/docker-entrypoint-initdb.d`.

### Manual Migration
```bash
# Connect to database
docker-compose exec postgres psql -U cimco -d cimco_v2

# Run specific migration
psql -U cimco -d cimco_v2 < migrations/001_create_users.sql
```

### Using SQLx CLI
```bash
# Install sqlx-cli
cargo install sqlx-cli --no-default-features --features native-tls,postgres

# Run migrations
sqlx migrate run --database-url postgresql://cimco:cimco@localhost:5432/cimco_v2

# Create new migration
sqlx migrate add new_migration_name
```

## Backup & Restore

### Backup
```bash
./scripts/backup.sh
# Creates: backup_YYYYMMDD_HHMMSS.sql
```

### Restore
```bash
./scripts/restore.sh backup_20250311_120000.sql
```

### Manual Backup/Restore
```bash
# Backup
docker-compose exec postgres pg_dump -U cimco cimco_v2 > backup.sql

# Restore
docker-compose exec -T postgres psql -U cimco -d cimco_v2 < backup.sql
```

## Default Seed Data

### Users
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| worker | worker123 | worker |

### Parts
10 sample parts across categories: Shredder, Hydraulics, Electrical, General

### Equipment
- A545 Infeed (Main infeed conveyor)
- C617 Conveyor (Secondary conveyor)

### Scale Device
- agglink-77360 (Main Shredder Scale)

## Important Indexes

### Full-Text Search
```sql
-- Parts search (name + description + part_number)
idx_parts_search ON parts USING gin(to_tsvector(...))
```

### Performance Indexes
- `idx_transactions_part_id` - Fast inventory history lookup
- `idx_readings_device_recorded` - Time-series scale data queries
- `idx_alerts_status` - Active alerts filtering
- `idx_installations_active` - Current installations query

## Data Types & Constraints

### UUID Generation
Tables using UUIDs require the `pgcrypto` extension:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Check Constraints
- `users.role` ∈ {admin, worker}
- `equipment_nodes.health_status` ∈ {healthy, warning, critical}
- `maintenance_events.event_type` ∈ {replacement, repair, inspection}
- `alerts.severity` ∈ {info, warning, critical}
- `alerts.status` ∈ {active, acknowledged, resolved}

### Triggers
- `update_parts_updated_at` - Auto-updates `updated_at` on part modifications

## Development Commands

```bash
# View logs
docker-compose logs -f postgres

# Reset database (destroy all data)
docker-compose down -v

# Connect with psql
docker-compose exec postgres psql -U cimco -d cimco_v2

# List tables\dt

# Describe table\d parts
```

## Next Steps for Backend Integration

1. **Set up SQLx in Rust project**:
   ```bash
   cargo add sqlx --features runtime-tokio-native-tls,postgres,uuid,chrono
   cargo add sqlx-cli --dev
   ```

2. **Create `.env` file**:
   ```
   DATABASE_URL=postgresql://cimco:cimco@localhost:5432/cimco_v2
   ```

3. **Generate query metadata** (for compile-time verification):
   ```bash
   cargo sqlx prepare
   ```

4. **Create repository layer**:
   - `src/db/parts.rs` - Parts CRUD operations
   - `src/db/installations.rs` - Installation tracking
   - `src/db/predictions.rs` - Wear predictions

5. **API Endpoints to Implement**:
   - `GET /api/parts` - List/search parts
   - `POST /api/parts/:id/install` - Install part
   - `GET /api/installations/:id/predictions` - Get predictions
   - `POST /api/scale-readings` - Ingest scale data
   - `GET /api/alerts` - Active alerts

## Schema Version

- **Version**: 1.0.0
- **Created**: 2026-03-11
- **PostgreSQL**: 15.x
