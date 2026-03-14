-- Add indexes for inventory_transactions table to improve query performance
-- Created: 2026-03-11

-- Index for sorting transactions by time
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_timestamp 
    ON inventory_transactions(timestamp DESC);

-- Composite index for getting history for a specific part sorted by time
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_part_timestamp 
    ON inventory_transactions(part_id, timestamp DESC);
