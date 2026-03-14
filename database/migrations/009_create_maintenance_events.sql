CREATE TABLE maintenance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installation_id UUID NOT NULL REFERENCES part_installations(id),
    event_type TEXT NOT NULL CHECK (event_type IN ('replacement', 'repair', 'inspection')),
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    final_tonnage BIGINT,
    reason TEXT,
    actual_lifespan_days INTEGER,
    notes TEXT
);

CREATE INDEX idx_maintenance_installation ON maintenance_events(installation_id);
CREATE INDEX idx_maintenance_type ON maintenance_events(event_type);
CREATE INDEX idx_maintenance_recorded ON maintenance_events(recorded_at);
