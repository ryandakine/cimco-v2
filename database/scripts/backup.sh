#!/bin/bash
# Backup database
docker-compose exec postgres pg_dump -U cimco cimco_v2 > backup_$(date +%Y%m%d_%H%M%S).sql
echo "Backup complete"
