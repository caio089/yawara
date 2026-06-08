/**
 * Preenche embroidery_prices nos produtos que têm opções de bordado
 * mas ainda não têm preços salvos no Supabase.
 *
 * Uso:
 *   npm run backfill:embroidery:dry   (só mostra o que faria)
 *   npm run backfill:embroidery       (aplica no banco)
 *
 * Requer no .env: VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
 * (login admin não é necessário — UPDATE exige usuário autenticado no app;
 *  se falhar por RLS, use SUPABASE_SERVICE_ROLE_KEY no .env)
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const JUDOGI_DEFAULTS = {
  'Bordado no Peito': 370,
  'Bordado na Lapela e na Calça': 190,
  'Sem Bordado': 0,
}

const FAIXA_DEFAULTS = {
  'Sem bordado': 0,
  'Com bordado': 100,
  'Bordado sombreado': 200,
  'Bordado duplo': 200,
}

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

function defaultPrice(category, option) {
  if (category === 'judogi') return JUDOGI_DEFAULTS[option] ?? 0
  if (category === 'faixas') return FAIXA_DEFAULTS[option] ?? 0
  return 0
}

function buildPrices(category, embroidery, existing) {
  const prices = existing && typeof existing === 'object' ? { ...existing } : {}
  let changed = false
  for (const opt of embroidery) {
    if (!(opt in prices)) {
      prices[opt] = defaultPrice(category, opt)
      changed = true
    }
  }
  const orphanKeys = Object.keys(prices).filter((k) => !embroidery.includes(k))
  if (orphanKeys.length) {
    for (const k of orphanKeys) delete prices[k]
    changed = true
  }
  return { prices, changed }
}

function needsUpdate(product) {
  const embroidery = Array.isArray(product.embroidery) ? product.embroidery : []
  if (!embroidery.length) return false
  const existing = product.embroidery_prices
  const { changed } = buildPrices(product.category, embroidery, existing)
  return changed || !existing || Object.keys(existing).length === 0
}

loadEnvFile()

const dryRun = process.argv.includes('--dry-run')
const url = process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ou SUPABASE_SERVICE_ROLE_KEY) no .env')
  process.exit(1)
}

const supabase = createClient(url, key)

console.log(dryRun ? '\n[DRY RUN] Nenhuma alteração será salva.\n' : '\nAplicando correções no banco...\n')

const { data: products, error } = await supabase.from('products').select('*').order('id')
if (error) {
  console.error('Erro ao ler produtos:', error.message)
  process.exit(1)
}

const toFix = products.filter(needsUpdate)

if (!toFix.length) {
  console.log('Nenhum produto precisa de correção em embroidery_prices.')
  process.exit(0)
}

console.log(`Produtos a corrigir: ${toFix.length}\n`)

let ok = 0
let fail = 0

for (const product of toFix) {
  const embroidery = product.embroidery
  const { prices } = buildPrices(product.category, embroidery, product.embroidery_prices)

  console.log(`#${product.id} ${product.name}`)
  console.log(`  categoria: ${product.category}`)
  console.log(`  embroidery_prices: ${JSON.stringify(prices)}`)

  if (dryRun) {
    ok++
    continue
  }

  const { error: updateError } = await supabase
    .from('products')
    .update({ embroidery_prices: prices })
    .eq('id', product.id)

  if (updateError) {
    console.log(`  ERRO: ${updateError.message}`)
    fail++
  } else {
    console.log('  OK')
    ok++
  }
  console.log('')
}

console.log(`\nConcluído: ${ok} ${dryRun ? 'simulados' : 'atualizados'}, ${fail} erros.`)

if (fail > 0 && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('\nDica: se deu erro de permissão (RLS), adicione SUPABASE_SERVICE_ROLE_KEY no .env e rode de novo.')
}

if (dryRun) {
  console.log('\nPara aplicar de verdade: npm run backfill:embroidery\n')
}
