/**
 * Valores adicionais de bordado (em reais).
 * Judogi: peito +R$ 370 | lapela/calça +R$ 190
 * Faixa (com opções de bordado): base R$ 450 + extras | sem bordado R$ 450 | com bordado R$ 550 | sombreado R$ 650
 */
export const FAIXA_BORDADO_BASE_PRICE = 450

function asPositiveNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Permite sobrescrever a base fixa de faixas via `price` do produto (admin). */
export function getFaixaBordadoBasePrice(productOrItem) {
  const override = asPositiveNumber(productOrItem?.price)
  return override ?? FAIXA_BORDADO_BASE_PRICE
}

export function isFaixaColoridaProduct(productName = '') {
  return productName.toLowerCase().includes('colorida')
}

/** Faixa com bordado: linha Yawara no nome (Kodnaha, Preta Yawara, etc.) ou cadastro com opções de bordado. */
export function faixaUsesFixedBordadoBase(category, productName, embroideryList) {
  if (category !== 'faixas' || isFaixaColoridaProduct(productName)) return false
  const n = (productName || '').toLowerCase()
  if (n.includes('yawara')) return true
  return Array.isArray(embroideryList) && embroideryList.length > 0
}

/** Preço no card / catálogo: faixas linha Yawara ou com opções de bordado usam a base R$ 450. */
export function getFaixaCardDisplayPrice(product) {
  if (!product) return 0
  if (faixaUsesFixedBordadoBase(product.category, product.name, product.embroidery)) {
    return getFaixaBordadoBasePrice(product)
  }
  return product.price
}

/** No carrinho, `embroidery` na linha vira a opção escolhida (string). */
export function getFaixaCartUnitBasePrice(item) {
  if (item.category !== 'faixas' || isFaixaColoridaProduct(item.name)) return item.price
  const list = Array.isArray(item.embroidery) ? item.embroidery : []
  if (faixaUsesFixedBordadoBase(item.category, item.name, list)) return getFaixaBordadoBasePrice(item)
  if (typeof item.embroidery === 'string' && item.embroidery.length > 0) return getFaixaBordadoBasePrice(item)
  return item.price
}
export const JUDOGI_EMBROIDERY_EXTRA = {
  'Bordado no Peito': 370,
  'Bordado na Lapela e na Calça': 190,
  'Sem Bordado': 0,
}

export const FAIXA_EMBROIDERY_EXTRA = {
  'Sem bordado': 0,
  'Com bordado': 100,
  'Bordado sombreado': 200,
  'Bordado duplo': 200, // legado, mesmo valor que Bordado sombreado
}

export function getJudogiEmbroideryExtra(embroideryOption) {
  if (!embroideryOption) return 0
  return JUDOGI_EMBROIDERY_EXTRA[embroideryOption] ?? 0
}

export function getFaixaEmbroideryExtra(embroideryOption) {
  if (!embroideryOption) return 0
  return FAIXA_EMBROIDERY_EXTRA[embroideryOption] ?? 0
}

/** Retorna o acréscimo de bordado conforme a categoria do produto. productName opcional para exceções (ex: faixas coloridas = bordado grátis). */
export function getEmbroideryExtra(category, embroideryOption, productName = '') {
  if (!embroideryOption) return 0
  if (category === 'faixas' && productName.toLowerCase().includes('colorida')) return 0
  if (category === 'judogi') return getJudogiEmbroideryExtra(embroideryOption)
  if (category === 'faixas') return getFaixaEmbroideryExtra(embroideryOption)
  return 0
}
