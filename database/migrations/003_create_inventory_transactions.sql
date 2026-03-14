CREATE TABLE inventory_transactions (
    id SERIAL PRIMARY KEY,
    part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    change_amount INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason TEXT,
    changed_by INTEGER REFERENCES users(id),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_part_id ON inventory_transactions(part_id);
CREATE INDEX idx_transactions_timestamp ON inventory_transactions(timestamp);
CREATE INDEX idx_transactions_changed_by ON inventory_transactions(changed_by);
