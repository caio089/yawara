/**
 * Remove arquivos órfãos do bucket product-images (não referenciados em nenhum produto).
 * Uso: npm run cleanup:storage
 * Requer SUPABASE_SERVICE_ROLE_KEY no .env (ou login admin não cobre list/delete em lote).
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
      if (item?.name && !item.name.endsWith('/')) files.push(item.name)
    }
    if (data.length < limit) break
    offset += limit
  }
  return files
}

loadEnvFile()

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

const { data: products, error: productsError } = await supabase
  .from('products')
  .select('id, name, image')

if (productsError) {
  console.error('Erro ao ler produtos:', productsError.message)
  process.exit(1)
}

const referenced = new Set()
for (const product of products) {
  for (const imageUrl of parseImageField(product.image)) {
    const path = storagePathFromUrl(imageUrl)
    if (path) referenced.add(path)
  }
}

const allFiles = await listAllStorageFiles(supabase)
const orphans = allFiles.filter((name) => !referenced.has(name))

console.log(`\nArquivos no bucket: ${allFiles.length}`)
console.log(`Referenciados por produtos: ${referenced.size}`)
console.log(`Órfãos a apagar: ${orphans.length}\n`)

if (!orphans.length) {
  console.log('Nada para apagar.')
  process.exit(0)
}

const batchSize = 50
let removed = 0
const errors = []

for (let i = 0; i < orphans.length; i += batchSize) {
  const batch = orphans.slice(i, i + batchSize)
  const { data, error } = await supabase.storage.from(BUCKET).remove(batch)
  if (error) {
    errors.push({ batch: i / batchSize + 1, message: error.message })
  } else {
    removed += data?.length ?? batch.length
    console.log(`Lote ${i / batchSize + 1}: ${batch.length} arquivo(s) removido(s)`)
  }
}

const remaining = await listAllStorageFiles(supabase)
const remainingOrphans = remaining.filter((name) => !referenced.has(name))

console.log(`\nConcluído.`)
console.log(`Removidos: ${removed}`)
console.log(`Erros: ${errors.length}`)
if (errors.length) errors.forEach((e) => console.log(`  - Lote ${e.batch}: ${e.message}`))
console.log(`Arquivos restantes no bucket: ${remaining.length}`)
console.log(`Órfãos restantes: ${remainingOrphans.length}\n`)

if (remainingOrphans.length) {
  console.log('Ainda órfãos (não removidos):')
  remainingOrphans.forEach((f) => console.log(`  - ${f}`))
  process.exit(1)
}
