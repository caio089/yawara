/**
 * Migra imagens de products e sponsored_athletes para o Cloudinary m26w57bc.
 *
 * Uso:
 *   npm run migrate:cloudinary:dry
 *   npm run migrate:cloudinary
 *
 * Requer no .env:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY (ou SUPABASE_SERVICE_ROLE_KEY)
 *   CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *   VITE_CLOUDINARY_UPLOAD_PRESET (opcional se usar signed)
 */

import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const dryRun = process.argv.includes('--dry-run')
const NEW_CLOUD = 'm26w57bc'
const urlCache = new Map()

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
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string' && value.startsWith('[')) {
    try {
      const arr = JSON.parse(value)
      return Array.isArray(arr) ? arr.filter(Boolean) : [value]
    } catch {
      return [value]
    }
  }
  return [value]
}

function serializeImageField(urls) {
  if (!urls.length) return null
  if (urls.length === 1) return urls[0]
  return JSON.stringify(urls)
}

function alreadyOnNewCloud(url) {
  return typeof url === 'string' && url.includes(`res.cloudinary.com/${NEW_CLOUD}/`)
}

function optimizeUrl(url) {
  if (!url || typeof url !== 'string') return url
  if (!url.includes('res.cloudinary.com/')) return url
  if (url.includes('/f_auto,q_auto/')) return url
  return url.replace('/upload/', '/upload/f_auto,q_auto/')
}

function signParams(params, apiSecret) {
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return createHash('sha1').update(toSign + apiSecret).digest('hex')
}

async function uploadRemoteUrl(sourceUrl, folder, apiKey, apiSecret, cloudName) {
  if (urlCache.has(sourceUrl)) return urlCache.get(sourceUrl)

  const timestamp = Math.floor(Date.now() / 1000)
  const params = { folder, timestamp }
  const signature = signParams(params, apiSecret)

  const body = new URLSearchParams()
  body.set('file', sourceUrl)
  body.set('api_key', apiKey)
  body.set('timestamp', String(timestamp))
  body.set('signature', signature)
  body.set('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message || `Upload falhou (${res.status})`)
  }

  const optimized = optimizeUrl(data.secure_url || data.url)
  urlCache.set(sourceUrl, optimized)
  return optimized
}

async function migrateUrlList(urls, folder, creds) {
  const next = []
  for (const url of urls) {
    if (!url) continue
    if (alreadyOnNewCloud(url)) {
      next.push(optimizeUrl(url))
      continue
    }
    if (dryRun) {
      console.log(`    [dry] ${url.slice(0, 90)}...`)
      next.push(`[NEW]${url}`)
      continue
    }
    const uploaded = await uploadRemoteUrl(url, folder, creds.apiKey, creds.apiSecret, creds.cloudName)
    console.log(`    ✓ ${uploaded.slice(0, 100)}`)
    next.push(uploaded)
  }
  return next
}

async function main() {
  loadEnvFile()

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || NEW_CLOUD
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!supabaseUrl || !supabaseKey) {
    console.error('Faltam VITE_SUPABASE_URL / chave Supabase no .env')
    process.exit(1)
  }
  if (!apiKey || !apiSecret) {
    console.error('Faltam CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET no .env')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const creds = { apiKey, apiSecret, cloudName }

  console.log(dryRun ? '=== DRY RUN (não grava) ===' : '=== MIGRAÇÃO Cloudinary ===')
  console.log(`Destino: ${cloudName}`)

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, image')
    .order('id')
  if (productsError) throw productsError

  let productsUpdated = 0
  for (const product of products || []) {
    const urls = parseImageField(product.image)
    if (!urls.length) continue
    const needs = urls.some((u) => !alreadyOnNewCloud(u))
    if (!needs) {
      console.log(`#${product.id} ${product.name} — já no ${NEW_CLOUD}`)
      continue
    }
    console.log(`#${product.id} ${product.name} (${urls.length} imagem(ns))`)
    const migrated = await migrateUrlList(urls, 'yawara/products', creds)
    const field = serializeImageField(migrated.map((u) => (u.startsWith('[NEW]') ? u.slice(5) : u)))
    if (!dryRun) {
      const { error } = await supabase.from('products').update({ image: field }).eq('id', product.id)
      if (error) throw new Error(`Produto #${product.id}: ${error.message}`)
    }
    productsUpdated += 1
  }

  const { data: athletes, error: athletesError } = await supabase
    .from('sponsored_athletes')
    .select('id, name, image')
    .order('id')
  if (athletesError) throw athletesError

  let athletesUpdated = 0
  for (const athlete of athletes || []) {
    const urls = parseImageField(athlete.image)
    if (!urls.length) continue
    const needs = urls.some((u) => !alreadyOnNewCloud(u))
    if (!needs) {
      console.log(`sponsored #${athlete.id} ${athlete.name} — já no ${NEW_CLOUD}`)
      continue
    }
    console.log(`sponsored #${athlete.id} ${athlete.name}`)
    const migrated = await migrateUrlList(urls, 'yawara/sponsored', creds)
    const field = migrated[0]?.startsWith('[NEW]') ? migrated[0].slice(5) : migrated[0]
    if (!dryRun) {
      const { error } = await supabase
        .from('sponsored_athletes')
        .update({ image: field })
        .eq('id', athlete.id)
      if (error) throw new Error(`Athlete #${athlete.id}: ${error.message}`)
    }
    athletesUpdated += 1
  }

  console.log('\nResumo:')
  console.log(`  Produtos atualizados: ${productsUpdated}`)
  console.log(`  Patrocinados atualizados: ${athletesUpdated}`)
  console.log(`  Uploads únicos: ${urlCache.size}`)
  if (dryRun) console.log('\nRode sem --dry-run para aplicar.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
