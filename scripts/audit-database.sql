-- ============================================================
-- YAWARA — Auditoria de dados antigos (SQL Editor do Supabase)
-- Execute cada bloco separadamente ou tudo de uma vez
-- ============================================================

-- 1) Resumo geral
SELECT
  count(*) AS total_produtos,
  count(*) FILTER (WHERE available = true) AS ativos,
  count(*) FILTER (WHERE available = false) AS inativos,
  count(*) FILTER (WHERE image IS NULL OR trim(image) = '') AS sem_imagem,
  count(*) FILTER (WHERE price <= 0) AS preco_invalido,
  count(*) FILTER (WHERE badge IS NOT NULL AND trim(badge) <> '') AS com_badge_antigo
FROM products;

-- 2) Produtos inativos (ainda ocupam espaço no banco)
SELECT id, name, category, price, updated_at
FROM products
WHERE available = false
ORDER BY updated_at ASC;

-- 3) Produtos sem imagem
SELECT id, name, category, price, updated_at
FROM products
WHERE image IS NULL OR trim(image) = '';

-- 4) Produtos com preço zerado
SELECT id, name, category, price, updated_at
FROM products
WHERE price IS NULL OR price <= 0;

-- 5) Badge preenchido (campo legado — hoje o painel salva null)
SELECT id, name, badge, updated_at
FROM products
WHERE badge IS NOT NULL AND trim(badge) <> '';

-- 6) Bordado: opções cadastradas mas sem tabela de preços
SELECT id, name, embroidery, embroidery_prices
FROM products
WHERE embroidery IS NOT NULL
  AND array_length(embroidery, 1) > 0
  AND (embroidery_prices IS NULL OR embroidery_prices = '{}'::jsonb);

-- 7) Bordado: preços cadastrados mas sem opções
SELECT id, name, embroidery, embroidery_prices
FROM products
WHERE embroidery_prices IS NOT NULL
  AND embroidery_prices <> '{}'::jsonb
  AND (embroidery IS NULL OR array_length(embroidery, 1) IS NULL);

-- 8) Possível dessincronia embroidery x embroidery_prices (revisar manualmente)
SELECT
  id,
  name,
  embroidery,
  embroidery_prices,
  (
    SELECT coalesce(array_agg(key), ARRAY[]::text[])
    FROM jsonb_object_keys(embroidery_prices) AS key
    WHERE NOT (key = ANY (coalesce(embroidery, ARRAY[]::text[])))
  ) AS chaves_preco_sem_opcao
FROM products
WHERE embroidery_prices IS NOT NULL
  AND embroidery_prices <> '{}'::jsonb;

-- 9) Imagens externas (não hospedadas no bucket product-images)
SELECT id, name, image
FROM products
WHERE image IS NOT NULL
  AND image NOT LIKE '%/product-images/%'
  AND trim(image) <> '';

-- 10) Produtos não atualizados há mais de 180 dias
SELECT id, name, category, price, updated_at
FROM products
WHERE updated_at < now() - interval '180 days'
ORDER BY updated_at ASC;

-- 11) Contagem por categoria
SELECT category, count(*) AS total
FROM products
GROUP BY category
ORDER BY total DESC, category;

-- 12) Duplicatas prováveis (mesmo nome)
SELECT lower(trim(name)) AS nome_normalizado, count(*) AS qtd, array_agg(id ORDER BY id) AS ids
FROM products
GROUP BY lower(trim(name))
HAVING count(*) > 1;
