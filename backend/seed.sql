-- Seed script for CIMCO Inventory System v2
-- Run with: psql $DATABASE_URL -f seed.sql

-- Insert admin user (password: admin123)
INSERT INTO users (username, password_hash, role)
VALUES (
    'admin',
    '$argon2id$v=19$m=19456,t=2,p=1$VEhpcyBpcyBhIHNhbHQ$uK23mUx4GJDVhVqU+4D8DmJ+U+T9y5cx0Q+0h4bL3hY',
    'admin'
)
ON CONFLICT (username) DO NOTHING;

-- Insert worker user (password: worker123)
INSERT INTO users (username, password_hash, role)
VALUES (
    'worker',
    '$argon2id$v=19$m=19456,t=2,p=1$QW5vdGhlciBzYWx0$zN+Z8YbF2uZ3jRZ8K4L3mN4vW5xY6bZ7c8D9e0F1g2',
    'worker'
)
ON CONFLICT (username) DO NOTHING;

-- Insert sample parts
INSERT INTO parts (
    name, description, category, part_type, manufacturer, part_number,
    quantity, min_quantity, lead_time_days, location, machine_location,
    function_description, zone, bom_reference, yard_label, image_url,
    unit_cost, supplier, wear_rating, tracked
) VALUES 
(
    'Hydraulic Cylinder',
    'Main hydraulic cylinder for press operation',
    'Hydraulics',
    'Cylinder',
    'Parker',
    'HC-5000-XL',
    5, 2, 14, 'A1-Shelf-3', 'Press Line 1',
    'Provides pressing force for material forming',
    'Zone A',
    'BOM-001-HC',
    'HYD-001',
    'https://example.com/images/hc-5000.jpg',
    1250.00,
    'Parker Hannifin',
    8,
    true
),
(
    'Control Valve Assembly',
    'Proportional control valve for hydraulic system',
    'Hydraulics',
    'Valve',
    'Bosch Rexroth',
    '4WRPEH-6-C3',
    12, 3, 21, 'A2-Shelf-1', 'Multiple',
    'Controls hydraulic flow and pressure',
    'Zone A',
    'BOM-002-CV',
    'HYD-002',
    NULL,
    850.00,
    'Bosch Rexroth',
    6,
    true
),
(
    'PLC Module CPU',
    'Central processing unit for control system',
    'Electronics',
    'PLC',
    'Siemens',
    'S7-1500-CPU1511-1',
    3, 1, 30, 'B1-Cabinet-2', 'Control Room',
    'Main processor for machine control logic',
    'Zone B',
    'BOM-003-PLC',
    'ELEC-001',
    NULL,
    3200.00,
    'Siemens',
    3,
    true
),
(
    'Proximity Sensor',
    'Inductive proximity sensor M18',
    'Sensors',
    'Proximity',
    'IFM',
    'IGT205',
    45, 10, 7, 'B2-Drawer-1', 'Multiple',
    'Position detection for moving parts',
    'Zone B',
    'BOM-004-SNS',
    'ELEC-002',
    NULL,
    85.50,
    'IFM Electronic',
    4,
    true
),
(
    'Bearing SKF 6205',
    'Deep groove ball bearing 25x52x15mm',
    'Mechanical',
    'Bearing',
    'SKF',
    '6205-2RS1',
    25, 5, 14, 'C1-Bin-12', 'Conveyor System',
    'Rotational support for conveyor rollers',
    'Zone C',
    'BOM-005-BRG',
    'MECH-001',
    NULL,
    25.75,
    'SKF Group',
    7,
    true
),
(
    'Conveyor Belt 1200mm',
    'Rubber conveyor belt 1200mm width',
    'Mechanical',
    'Conveyor',
    'Habasit',
    'CB-1200-EP500',
    2, 1, 45, 'C2-Rack-5', 'Conveyor Line 2',
    'Material transport belt',
    'Zone C',
    'BOM-006-CVB',
    'MECH-002',
    NULL,
    1800.00,
    'Habasit AG',
    9,
    true
),
(
    'Pneumatic Cylinder',
    'Compact pneumatic cylinder 50mm bore',
    'Pneumatics',
    'Cylinder',
    'Festo',
    'DSNU-50-100-P-A',
    8, 3, 10, 'D1-Shelf-2', 'Pneumatic Station',
    'Linear actuation for clamping',
    'Zone D',
    'BOM-007-PNC',
    'PNEU-001',
    NULL,
    145.00,
    'Festo',
    5,
    true
),
(
    'Solenoid Valve 5/2',
    '5/2 way solenoid valve for pneumatics',
    'Pneumatics',
    'Valve',
    'SMC',
    'SY5120-5LZ-01',
    15, 5, 7, 'D2-Drawer-3', 'Multiple',
    'Directional control for air flow',
    'Zone D',
    'BOM-008-SLV',
    'PNEU-002',
    NULL,
    65.00,
    'SMC Corporation',
    4,
    true
),
(
    'HMI Touch Panel',
    '10-inch touch screen HMI',
    'Electronics',
    'HMI',
    'Siemens',
    'KTP1000-Basic',
    4, 2, 14, 'B1-Cabinet-1', 'Control Room',
    'Operator interface for machine control',
    'Zone B',
    'BOM-009-HMI',
    'ELEC-003',
    NULL,
    1200.00,
    'Siemens',
    2,
    true
),
(
    'Emergency Stop Button',
    'Mushroom head emergency stop with lock',
    'Safety',
    'E-Stop',
    'Schneider',
    'XB4BS8442',
    10, 4, 5, 'E1-Shelf-1', 'Multiple Stations',
    'Emergency shutdown activation',
    'Zone E',
    'BOM-010-EST',
    'SAFE-001',
    NULL,
    45.00,
    'Schneider Electric',
    3,
    true
),
(
    'Safety Relay',
    'Dual channel safety relay module',
    'Safety',
    'Relay',
    'Pilz',
    'PNOZ-X2.8P',
    6, 2, 10, 'E2-Drawer-2', 'Safety Cabinet',
    'Safety circuit monitoring',
    'Zone E',
    'BOM-011-SFR',
    'SAFE-002',
    NULL,
    320.00,
    'Pilz GmbH',
    3,
    true
),
(
    'Gear Motor 2.2kW',
    'Helical gear motor 2.2kW, 1400rpm',
    'Mechanical',
    'Motor',
    'SEW',
    'R67-DRE100LC4',
    2, 1, 35, 'C3-Rack-2', 'Drive System',
    'Main drive motor with gearbox',
    'Zone C',
    'BOM-012-MTR',
    'MECH-003',
    NULL,
    2800.00,
    'SEW-Eurodrive',
    6,
    true
)
ON CONFLICT DO NOTHING;

-- Get user IDs for transaction creation
DO $$
DECLARE
    admin_id INTEGER;
    worker_id INTEGER;
BEGIN
    SELECT id INTO admin_id FROM users WHERE username = 'admin';
    SELECT id INTO worker_id FROM users WHERE username = 'worker';

    -- Create initial inventory transactions for tracking
    IF admin_id IS NOT NULL THEN
        INSERT INTO inventory_transactions (part_id, change_amount, new_quantity, reason, changed_by)
        SELECT 
            id, 
            quantity, 
            quantity, 
            'Initial inventory setup',
            admin_id
        FROM parts
        WHERE NOT EXISTS (
            SELECT 1 FROM inventory_transactions WHERE part_id = parts.id
        );
    END IF;
END $$;
