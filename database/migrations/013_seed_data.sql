-- Admin user (password: admin123, hashed with argon2)
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$argon2id$v=19$m=19456,t=2,p=1$VEhpcyBpcyBhIHNhbHQ$6K+3v/7X5Qz9QzT3gGt7R9Qq8X0Xz3YpLkNwRbRaKZQ', 'admin');

-- Worker user (password: worker123)
INSERT INTO users (username, password_hash, role) VALUES 
('worker', '$argon2id$v=19$m=19456,t=2,p=1$VEhpcyBpcyBhIHNhbHQ$6K+3v/7X5Qz9QzT3gGt7R9Qq8X0Xz3YpLkNwRbRaKZQ', 'worker');

-- Sample parts (10 across categories)
INSERT INTO parts (name, category, quantity, min_quantity, manufacturer, location, tracked) VALUES
('Shredder Hammer - Heavy Duty', 'Shredder', 5, 3, 'Metso', 'Warehouse A', true),
('Hydraulic Pump - Main', 'Hydraulics', 2, 1, 'Parker', 'Warehouse B', true),
('Motor Bearing 6205', 'Electrical', 10, 5, 'SKF', 'Warehouse A', true),
('Conveyor Belt - 24 inch', 'General', 3, 2, 'Flexco', 'Yard Storage', true),
('Hydraulic Filter Element', 'Hydraulics', 8, 4, 'Hydac', 'Warehouse B', true),
('Rotor Bearing', 'Shredder', 4, 2, 'Timken', 'Warehouse A', true),
('Control Relay 24V', 'Electrical', 15, 10, 'Allen-Bradley', 'Warehouse C', true),
('Safety Switch', 'Electrical', 6, 3, 'Schneider', 'Warehouse C', true),
('Belt Scraper', 'General', 12, 8, 'Martin', 'Yard Storage', false),
('Anvil Insert Casting', 'Shredder', 3, 2, 'Lindemann', 'Warehouse A', true);

-- Scale device
INSERT INTO scale_devices (id, name, location, last_tonnage) VALUES 
('agglink-77360', 'Main Shredder Scale', 'Shredder Feed', 1335);

-- Equipment nodes
INSERT INTO equipment_nodes (name, description) VALUES 
('A545 Infeed', 'Main infeed conveyor system'),
('C617 Conveyor', 'Secondary conveyor line');

-- Wear models
INSERT INTO wear_models (category, baseline_life_tons) VALUES
('Conveyor Belt', 500000),
('Bearing', 250000),
('Hydraulic Filter', 100000),
('Motor', 1000000),
('Seal Kit', 150000),
('Wear Part', 200000);
