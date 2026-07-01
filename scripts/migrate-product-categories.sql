-- ============================================================
-- YAWARA — Categorias de produto gerenciáveis pelo admin
-- Execute no SQL Editor do Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_jp TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_categories_sort ON product_categories (sort_order, id);

DROP TRIGGER IF EXISTS product_categories_updated_at ON product_categories;
CREATE TRIGGER product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categorias visíveis publicamente" ON product_categories;
CREATE POLICY "Categorias visíveis publicamente"
  ON product_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin pode inserir categorias" ON product_categories;
CREATE POLICY "Admin pode inserir categorias"
  ON product_categories FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin pode atualizar categorias" ON product_categories;
CREATE POLICY "Admin pode atualizar categorias"
  ON product_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin pode deletar categorias" ON product_categories;
CREATE POLICY "Admin pode deletar categorias"
  ON product_categories FOR DELETE TO authenticated USING (true);

INSERT INTO product_categories (id, name, name_jp, sort_order)
SELECT v.id, v.name, v.name_jp, v.sort_order
FROM (VALUES
  ('judogi', 'Judogis', '柔道着', 0),
  ('faixas', 'Faixas', '帯', 1),
  ('bolsa', 'Bolsas', 'バッグ', 2),
  ('chinelo', 'Chinelos', 'サンダル', 3),
  ('garrafa', 'Garrafas', 'ボトル', 4),
  ('sobretudo', 'Sobretudos', 'コート', 5),
  ('conjunto', 'Conjuntos', 'セット', 6),
  ('caneca', 'Canecas', 'マグカップ', 7),
  ('livros', 'Livros', '本', 8),
  ('diversos', 'Diversos', 'その他', 9)
) AS v(id, name, name_jp, sort_order)
ON CONFLICT (id) DO NOTHING;
