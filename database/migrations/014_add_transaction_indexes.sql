-- Add indexes for inventory_transactions table to improve query performance
-- Created: 2026-03-11

-- Composite index covers both filtering by part_id and sorting by timestamp
-- This single index satisfies the common query pattern
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_part_timestamp 
    ON inventory_transactions(part_id, timestamp DESC);
