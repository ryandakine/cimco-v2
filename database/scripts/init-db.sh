#!/bin/bash
# Initialize database with migrations
docker-compose up -d postgres
echo "Waiting for PostgreSQL..."
sleep 5
echo "Database ready at localhost:5432"
echo "User: cimco, Password: cimco, Database: cimco_v2"
