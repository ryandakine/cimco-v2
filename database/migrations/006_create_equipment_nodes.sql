CREATE TABLE equipment_nodes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES equipment_nodes(id),
    health_status TEXT CHECK (health_status IN ('healthy', 'warning', 'critical')),
    critical_spares_count INTEGER DEFAULT 0,
    total_parts_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipment_parent ON equipment_nodes(parent_id);
CREATE INDEX idx_equipment_health ON equipment_nodes(health_status);
