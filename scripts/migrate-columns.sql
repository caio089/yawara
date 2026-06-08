-- ============================================================
-- YAWARA — Migração obrigatória (SQL Editor do Supabase)
-- Execute TUDO de uma vez, depois rode: npm run audit:supabase
-- ============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS embroidery TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS pix_price NUMERIC(10,2) DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS embroidery_prices JSONB DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gender_options TEXT[];

-- Conferir se as colunas existem:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
  AND column_name IN ('embroidery', 'embroidery_prices', 'gender_options', 'pix_price')
ORDER BY column_name;
