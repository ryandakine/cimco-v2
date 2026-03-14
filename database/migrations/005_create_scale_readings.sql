CREATE TABLE scale_readings (
    id SERIAL PRIMARY KEY,
    scale_device_id TEXT NOT NULL REFERENCES scale_devices(id) ON DELETE CASCADE,
    tonnage BIGINT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_readings_device ON scale_readings(scale_device_id);
CREATE INDEX idx_readings_recorded ON scale_readings(recorded_at);
CREATE INDEX idx_readings_device_recorded ON scale_readings(scale_device_id, recorded_at);
