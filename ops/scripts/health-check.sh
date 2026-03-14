#!/bin/bash

# Check backend
if ! curl -sf http://localhost:8081/api/health > /dev/null; then
    echo "❌ Backend unhealthy"
    exit 1
fi

# Check database
if ! docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U cimco > /dev/null 2>&1; then
    echo "❌ Database unhealthy"
    exit 1
fi

echo "✅ All services healthy"
