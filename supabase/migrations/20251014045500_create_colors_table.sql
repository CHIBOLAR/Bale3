-- Create colors table for smart color capture
CREATE TABLE IF NOT EXISTS colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  hex_code VARCHAR(7) NOT NULL,
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure unique color names per company
  CONSTRAINT unique_color_name_per_company UNIQUE (company_id, name),
  -- Ensure hex_code format
  CONSTRAINT valid_hex_code CHECK (hex_code ~* '^#[0-9A-Fa-f]{6}$')
);

-- Create index for faster lookups
CREATE INDEX idx_colors_company_id ON colors(company_id);
CREATE INDEX idx_colors_hex_code ON colors(hex_code);
CREATE INDEX idx_colors_name ON colors(name);

-- Enable RLS
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view colors from their company
CREATE POLICY "Users can view colors from their company"
ON colors FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM users WHERE auth_user_id = auth.uid()
  )
);

-- Policy: Users can insert colors for their company
CREATE POLICY "Users can insert colors for their company"
ON colors FOR INSERT
TO authenticated
WITH CHECK (
  company_id IN (
    SELECT company_id FROM users WHERE auth_user_id = auth.uid()
  )
);

-- Policy: Users can update colors from their company
CREATE POLICY "Users can update colors from their company"
ON colors FOR UPDATE
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM users WHERE auth_user_id = auth.uid()
  )
);

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_color_usage(color_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE colors
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = color_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed with common colors
INSERT INTO colors (company_id, name, hex_code, usage_count)
SELECT
  c.id as company_id,
  color_data.name,
  color_data.hex_code,
  0 as usage_count
FROM companies c
CROSS JOIN (
  VALUES
    ('Red', '#FF0000'),
    ('Blue', '#0000FF'),
    ('Green', '#008000'),
    ('Yellow', '#FFFF00'),
    ('Black', '#000000'),
    ('White', '#FFFFFF'),
    ('Navy Blue', '#000080'),
    ('Royal Blue', '#4169E1'),
    ('Sky Blue', '#87CEEB'),
    ('Dark Green', '#006400'),
    ('Light Green', '#90EE90'),
    ('Pink', '#FFC0CB'),
    ('Purple', '#800080'),
    ('Orange', '#FFA500'),
    ('Brown', '#A52A2A'),
    ('Gray', '#808080'),
    ('Maroon', '#800000'),
    ('Beige', '#F5F5DC'),
    ('Cream', '#FFFDD0'),
    ('Gold', '#FFD700')
) AS color_data(name, hex_code)
ON CONFLICT (company_id, name) DO NOTHING;
