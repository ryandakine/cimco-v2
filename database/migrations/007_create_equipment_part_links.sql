CREATE TABLE equipment_part_links (
    id SERIAL PRIMARY KEY,
    equipment_node_id INTEGER NOT NULL REFERENCES equipment_nodes(id) ON DELETE CASCADE,
    part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    is_critical BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(equipment_node_id, part_id)
);

CREATE INDEX idx_links_equipment ON equipment_part_links(equipment_node_id);
CREATE INDEX idx_links_part ON equipment_part_links(part_id);
CREATE INDEX idx_links_critical ON equipment_part_links(is_critical);
