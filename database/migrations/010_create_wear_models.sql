CREATE TABLE wear_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT UNIQUE NOT NULL,
    baseline_life_tons BIGINT NOT NULL,
    learned_coefficient REAL DEFAULT 1.0,
    sample_size INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wear_models_category ON wear_models(category);
