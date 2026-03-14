CREATE TABLE parts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    part_type TEXT,
    manufacturer TEXT,
    part_number TEXT,
    quantity INTEGER DEFAULT 0 NOT NULL,
    min_quantity INTEGER DEFAULT 1 NOT NULL,
    lead_time_days INTEGER DEFAULT 7 NOT NULL,
    location TEXT,
    machine_location TEXT,
    function_description TEXT,
    zone TEXT,
    bom_reference TEXT,
    yard_label TEXT,
    image_url TEXT,
    unit_cost REAL,
    supplier TEXT,
    wear_rating INTEGER,
    tracked BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_zone ON parts(zone);
CREATE INDEX idx_parts_manufacturer ON parts(manufacturer);
CREATE INDEX idx_parts_tracked ON parts(tracked);
CREATE INDEX idx_parts_quantity ON parts(quantity);
CREATE INDEX idx_parts_name ON parts USING gin(to_tsvector('english', name));
CREATE INDEX idx_parts_search ON parts USING gin(to_tsvector('english', 
    coalesce(name, '') || ' ' || 
    coalesce(description, '') || ' ' || 
    coalesce(part_number, '')
));

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_parts_updated_at 
    BEFORE UPDATE ON parts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
