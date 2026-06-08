/**
 * Auditoria Yawara — Storage + banco de dados (Supabase)
 *
 * Uso:
 *   1. Copie .env.example para .env e preencha as chaves
 *   2. Para listar arquivos órfãos no Storage, adicione no .env:
 *      SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
 *   3. Execute: npm run audit:supabase
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'product-images'

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

function parseImageField(value) {
  if (!value) return []
  if (typeof value === 'string' && value.startsWith('[')) {
    try {
      const arr = JSON.parse(value)
      if (Array.isArray(arr)) return arr.filter(Boolean)
    } catch {
      return []
    }
  }
  return value ? [value] : []
}

function storagePathFromUrl(url) {
  const parts = String(url).split(`/${BUCKET}/`)
  return parts[1]?.split('?')[0]?.trim() || null
}

function isHostedImage(url) {
  return String(url).includes(`/${BUCKET}/`)
}

async function listAllStorageFiles(supabase) {
  const files = []
  let offset = 0
  const limit = 1000

  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list('', {
      limit,
      offset,
      sortBy: { column: 'created_at', order: 'desc' },
    })
    if (error) throw error
    if (!data?.length) break

    for (const item of data) {
      if (!item?.name || item.name.endsWith('/')) continue
      files.push({
        path: item.name,
        updatedAt: item.updated_at || item.created_at || null,
        size: item.metadata?.size ?? null,
      })
    }

    if (data.length < limit) break
    offset += limit
  }

  return files
}

function formatBytes(bytes) {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function section(title) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(title)
  console.log('='.repeat(60))
}

function printList(title, items, formatter = (x) => x) {
  console.log(`\n${title} (${items.length})`)
  if (!items.length) {
    console.log('  Nenhum.')
    return
  }
  items.forEach((item, i) => console.log(`  ${i + 1}. ${formatter(item)}`))
}

loadEnvFile()

const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !anonKey) {
  console.error('Erro: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env')
  process.exit(1)
}

const dbClient = createClient(url, anonKey)
const storageClient = serviceKey ? createClient(url, serviceKey) : null

section('YAWARA — Auditoria Supabase')
console.log(`Projeto: ${url}`)
console.log(`Data: ${new Date().toLocaleString('pt-BR')}`)

section('0. Colunas obrigatórias no banco')
const requiredColumns = ['embroidery_prices', 'gender_options', 'pix_price', 'embroidery']
const missingColumns = []
for (const column of requiredColumns) {
  const { error: columnError } = await dbClient.from('products').select(column).limit(1)
  if (columnError?.message?.includes('does not exist')) {
    missingColumns.push(column)
    console.log(`  ✗ ${column} — AUSENTE`)
  } else if (columnError) {
    console.log(`  ? ${column} — ${columnError.message}`)
  } else {
    console.log(`  ✓ ${column}`)
  }
}
if (missingColumns.length) {
  console.log('\n⚠️  Execute scripts/migrate-columns.sql no SQL Editor do Supabase.')
  console.log('   Sem isso, preços de bordado e gênero NÃO são salvos nem enviados ao site.')
}

const { data: products, error: productsError } = await dbClient
  .from('products')
  .select('*')
  .order('id', { ascending: true })

if (productsError) {
  console.error('\nErro ao ler produtos:', productsError.message)
  process.exit(1)
}

section('1. Resumo do banco (tabela products)')
console.log(`Total de produtos: ${products.length}`)
console.log(`Ativos: ${products.filter((p) => p.available).length}`)
console.log(`Inativos: ${products.filter((p) => !p.available).length}`)

const referencedPaths = new Map()
for (const product of products) {
  for (const imageUrl of parseImageField(product.image)) {
    const path = storagePathFromUrl(imageUrl)
    if (!path) continue
    if (!referencedPaths.has(path)) referencedPaths.set(path, [])
    referencedPaths.get(path).push({ id: product.id, name: product.name })
  }
}

const dbIssues = []

for (const product of products) {
  const images = parseImageField(product.image)
  const issues = []

  if (!images.length) issues.push('sem imagem')
  if (Number(product.price) <= 0) issues.push('preço zero ou inválido')
  if (product.badge) issues.push(`badge antigo: "${product.badge}"`)

  const embroidery = Array.isArray(product.embroidery) ? product.embroidery : []
  const prices = product.embroidery_prices && typeof product.embroidery_prices === 'object'
    ? product.embroidery_prices
    : {}

  const priceKeys = Object.keys(prices)
  const orphanPriceKeys = priceKeys.filter((k) => !embroidery.includes(k))
  const missingPriceKeys = embroidery.filter((k) => !(k in prices))

  if (orphanPriceKeys.length) {
    issues.push(`preços de bordado sem opção: ${orphanPriceKeys.join(', ')}`)
  }
  if (embroidery.length && missingPriceKeys.length) {
    issues.push(`opções de bordado sem preço: ${missingPriceKeys.join(', ')}`)
  }

  const externalImages = images.filter((u) => u && !isHostedImage(u))
  if (externalImages.length) {
    issues.push(`${externalImages.length} imagem(ns) externa(s) (não está no bucket)`)
  }

  if (issues.length) {
    dbIssues.push({ id: product.id, name: product.name, issues })
  }
}

section('2. Possíveis dados antigos / inconsistentes no banco')
printList('Produtos com alertas', dbIssues, (p) => `#${p.id} ${p.name} → ${p.issues.join('; ')}`)

const inactive = products.filter((p) => !p.available)
printList('Produtos inativos (ainda no banco)', inactive, (p) => `#${p.id} ${p.name} | R$ ${p.price}`)

section('3. Imagens referenciadas no banco')
console.log(`Arquivos únicos no bucket referenciados: ${referencedPaths.size}`)
for (const [path, refs] of referencedPaths.entries()) {
  const names = refs.map((r) => `#${r.id} ${r.name}`).join(' | ')
  console.log(`  - ${path}`)
  console.log(`    usado em: ${names}`)
}

section('4. Storage (bucket product-images)')

if (!storageClient) {
  console.log('\n⚠️  SUPABASE_SERVICE_ROLE_KEY não definida no .env')
  console.log('   Não foi possível listar arquivos do Storage.')
  console.log('   Adicione a service role em: Supabase → Settings → API → service_role')
  console.log('   Depois rode novamente: npm run audit:supabase')
} else {
  try {
    const storageFiles = await listAllStorageFiles(storageClient)
    const storagePaths = new Set(storageFiles.map((f) => f.path))

    const orphaned = storageFiles.filter((f) => !referencedPaths.has(f.path))
    const missingInStorage = [...referencedPaths.keys()].filter((p) => !storagePaths.has(p))

    console.log(`Total de arquivos no bucket: ${storageFiles.length}`)
    console.log(`Referenciados por produtos: ${referencedPaths.size}`)
    console.log(`Órfãos (no Storage, mas nenhum produto usa): ${orphaned.length}`)

    const orphanSize = orphaned.reduce((sum, f) => sum + (f.size || 0), 0)
    console.log(`Espaço estimado em órfãos: ${formatBytes(orphanSize)}`)

    printList(
      'Arquivos órfãos no Storage (candidatos a exclusão)',
      orphaned,
      (f) => `${f.path} | ${formatBytes(f.size)} | atualizado: ${f.updatedAt || '—'}`
    )

    printList(
      'Referências quebradas (no banco, mas arquivo não existe no Storage)',
      missingInStorage,
      (p) => p
    )

    if (orphaned.length) {
      section('5. SQL / ação sugerida para limpar Storage')
      console.log('Arquivos órfãos (remova pelo Dashboard ou Storage API):')
      orphaned.forEach((f) => console.log(`  - ${f.path}`))
      console.log('\nNo Supabase Dashboard: Storage → product-images → selecione e delete.')
    } else {
      section('5. Storage')
      console.log('Nenhum arquivo órfão encontrado no bucket.')
    }
  } catch (err) {
    console.error('\nErro ao listar Storage:', err.message)
  }
}

section('6. SQL extra (cole no SQL Editor do Supabase)')
console.log(`
-- Produtos sem imagem
SELECT id, name, category, price, updated_at
FROM products
WHERE image IS NULL OR trim(image) = '';

-- Preços de bordado órfãos (chave no JSON sem opção correspondente)
-- Revise manualmente os resultados:
SELECT id, name, embroidery, embroidery_prices
FROM products
WHERE embroidery_prices IS NOT NULL;

-- Produtos inativos há muito tempo
SELECT id, name, category, price, available, updated_at
FROM products
WHERE available = false
ORDER BY updated_at ASC;

-- Contagem por categoria
SELECT category, count(*) AS total
FROM products
GROUP BY category
ORDER BY total DESC;
`)

console.log('\nAuditoria concluída.\n')
