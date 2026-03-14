#!/bin/bash
set -e

# Usage: ./restore.sh <backup_file.gz>
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.gz>"
    echo "Available backups:"
    ls -la ./backups/*.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will replace the current database!"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

echo "🔄 Restoring database..."

# Stop backend to prevent writes
docker-compose -f docker-compose.prod.yml stop backend

# Restore database
gunzip -c "$BACKUP_FILE" | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U cimco cimco_v2

# Start backend
docker-compose -f docker-compose.prod.yml start backend

echo "✅ Restore complete!"
