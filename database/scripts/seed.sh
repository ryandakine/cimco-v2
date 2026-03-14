#!/bin/bash
# Run seed data
docker-compose exec -T postgres psql -U cimco -d cimco_v2 < migrations/013_seed_data.sql
echo "Seed data loaded"
