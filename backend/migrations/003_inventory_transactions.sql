-- Create inventory transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id SERIAL PRIMARY KEY,
    part_id INTEGER REFERENCES parts(id) ON DELETE CASCADE,
    change_amount INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason TEXT,
    changed_by INTEGER REFERENCES users(id),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_part_id ON inventory_transactions(part_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON inventory_transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_changed_by ON inventory_transactions(changed_by);

-- Create view for transaction history with user details
CREATE OR REPLACE VIEW transaction_history AS
SELECT 
    it.id,
    it.part_id,
    p.name as part_name,
    it.change_amount,
    it.new_quantity,
    it.reason,
    it.changed_by,
    u.username as changed_by_username,
    it.timestamp
FROM inventory_transactions it
JOIN parts p ON it.part_id = p.id
JOIN users u ON it.changed_by = u.id;
