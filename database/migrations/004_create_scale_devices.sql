CREATE TABLE scale_devices (
    id TEXT PRIMARY KEY,
    name TEXT,
    location TEXT,
    api_key TEXT,
    last_seen TIMESTAMPTZ,
    last_tonnage BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scale_devices_last_seen ON scale_devices(last_seen);
