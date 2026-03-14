#!/bin/bash
# Restore database from backup file
# Usage: ./restore.sh backup_file.sql

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file.sql>"
    exit 1
fi

if [ ! -f "$1" ]; then
    echo "Error: File '$1' not found"
    exit 1
fi

echo "Restoring from $1..."
docker-compose exec -T postgres psql -U cimco -d cimco_v2 < "$1"
echo "Restore complete"
