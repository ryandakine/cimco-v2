-- Create parts table
CREATE TABLE IF NOT EXISTS parts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    part_type TEXT,
    manufacturer TEXT,
    part_number TEXT,
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 1,
    lead_time_days INTEGER DEFAULT 7,
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
    tracked BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_zone ON parts(zone);
CREATE INDEX IF NOT EXISTS idx_parts_tracked ON parts(tracked);
CREATE INDEX IF NOT EXISTS idx_parts_name ON parts(name);
CREATE INDEX IF NOT EXISTS idx_parts_part_number ON parts(part_number);
CREATE INDEX IF NOT EXISTS idx_parts_manufacturer ON parts(manufacturer);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_parts_updated_at ON parts;

CREATE TRIGGER update_parts_updated_at
    BEFORE UPDATE ON parts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
