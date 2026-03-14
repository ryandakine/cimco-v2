#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="cimco_v2_backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "💾 Creating backup..."
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U cimco cimco_v2 > "$BACKUP_DIR/$BACKUP_FILE"

# Compress
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Keep only last 7 backups
ls -t $BACKUP_DIR/*.gz | tail -n +8 | xargs rm -f

echo "✅ Backup complete: $BACKUP_DIR/$BACKUP_FILE.gz"
