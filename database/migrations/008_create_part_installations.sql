CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE part_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id INTEGER NOT NULL REFERENCES parts(id),
    scale_device_id TEXT REFERENCES scale_devices(id),
    installed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    installed_at_tonnage BIGINT NOT NULL,
    category TEXT NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_installations_part ON part_installations(part_id);
CREATE INDEX idx_installations_scale ON part_installations(scale_device_id);
CREATE INDEX idx_installations_active ON part_installations(is_active);
