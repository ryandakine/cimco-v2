CREATE TABLE wear_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installation_id UUID NOT NULL REFERENCES part_installations(id),
    current_tonnage BIGINT,
    elapsed_tonnage BIGINT,
    remaining_tonnage BIGINT,
    remaining_days INTEGER,
    wear_percent REAL,
    predicted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_predictions_installation ON wear_predictions(installation_id);
CREATE INDEX idx_predictions_predicted ON wear_predictions(predicted_at);
