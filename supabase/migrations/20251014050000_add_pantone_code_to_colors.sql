-- Add Pantone code support to colors table
ALTER TABLE colors ADD COLUMN IF NOT EXISTS pantone_code VARCHAR(20) NULL;

-- Create index for Pantone code lookups
CREATE INDEX IF NOT EXISTS idx_colors_pantone_code ON colors(pantone_code);

-- Add constraint to ensure Pantone code format (if provided)
-- Format: XX-XXXX TCX or XX-XXXX TPX or just XX-XXXX
ALTER TABLE colors ADD CONSTRAINT valid_pantone_code
CHECK (pantone_code IS NULL OR pantone_code ~ '^[0-9]{2}-[0-9]{4}( (TCX|TPX|TPG))?$');

-- Update existing colors with Pantone codes for common textile colors
UPDATE colors SET pantone_code = '19-1664 TCX' WHERE name = 'Red' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '19-4052 TCX' WHERE name = 'Blue' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '19-0406 TCX' WHERE name = 'Black' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '11-0601 TCX' WHERE name = 'White' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '19-5420 TCX' WHERE name = 'Navy Blue' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '19-4049 TCX' WHERE name = 'Royal Blue' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '14-4318 TCX' WHERE name = 'Sky Blue' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '19-0315 TCX' WHERE name = 'Green' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '19-0417 TCX' WHERE name = 'Dark Green' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '13-0220 TCX' WHERE name = 'Light Green' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '13-1520 TCX' WHERE name = 'Pink' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '19-3536 TCX' WHERE name = 'Purple' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '15-1263 TCX' WHERE name = 'Orange' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '18-1154 TCX' WHERE name = 'Brown' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '14-4002 TCX' WHERE name = 'Gray' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '19-1557 TCX' WHERE name = 'Maroon' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '11-0107 TCX' WHERE name = 'Beige' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '11-0617 TCX' WHERE name = 'Cream' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '13-0755 TCX' WHERE name = 'Gold' AND pantone_code IS NULL;
UPDATE colors SET pantone_code = '13-0922 TCX' WHERE name = 'Yellow' AND pantone_code IS NULL;
