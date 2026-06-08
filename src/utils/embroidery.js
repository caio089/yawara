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

export const FAIXA_EMBROIDERY_OPTIONS = ['Sem bordado', 'Com bordado', 'Bordado sombreado']

function faixaEmbroideryOptionList(productOrItem) {
  if (Array.isArray(productOrItem?.embroideryOptions) && productOrItem.embroideryOptions.length) {
    return productOrItem.embroideryOptions
  }
  if (Array.isArray(productOrItem?.embroidery) && productOrItem.embroidery.length) {
    return productOrItem.embroidery
  }
  return []
}

/** Faixa com opções de bordado cadastradas no admin (preço base + acréscimo por opção). */
export function faixaUsesFixedBordadoBase(category, productName, embroideryList) {
  if (category !== 'faixas' || isFaixaColoridaProduct(productName)) return false
  if (Array.isArray(embroideryList) && embroideryList.length > 0) return true
  return false
}

export function faixaHasEmbroideryPricing(productOrItem) {
  if (!productOrItem || productOrItem.category !== 'faixas' || isFaixaColoridaProduct(productOrItem.name)) {
    return false
  }
  if (faixaEmbroideryOptionList(productOrItem).length > 0) return true
  const prices = resolveEmbroideryPrices(productOrItem)
  if (prices && Object.keys(prices).length > 0) return true
  return typeof productOrItem.embroidery === 'string' && productOrItem.embroidery.length > 0
}

/** Preço no card / catálogo: faixas linha Yawara ou com opções de bordado usam a base R$ 450. */
export function getFaixaCardDisplayPrice(product) {
  if (!product) return 0
  if (faixaUsesFixedBordadoBase(product.category, product.name, product.embroidery)) {
    return getFaixaBordadoBasePrice(product)
  }
  return product.price
}

/** No carrinho, `embroidery` na linha é a opção escolhida (string). */
export function getFaixaCartUnitBasePrice(item) {
  if (item.category !== 'faixas' || isFaixaColoridaProduct(item.name)) return item.price
  if (faixaHasEmbroideryPricing(item)) return getFaixaBordadoBasePrice(item)
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

/** Valor padrão de acréscimo (usado ao cadastrar no admin). */
export function getDefaultEmbroideryPrice(category, embroideryOption) {
  if (!embroideryOption) return 0
  if (category === 'judogi') return getJudogiEmbroideryExtra(embroideryOption)
  if (category === 'faixas') return getFaixaEmbroideryExtra(embroideryOption)
  return 0
}

export function resolveEmbroideryPrices(productOrPrices) {
  if (!productOrPrices) return null
  const prices = productOrPrices.embroideryPrices ?? productOrPrices.embroidery_prices
  return prices && typeof prices === 'object' ? prices : null
}

function resolveEmbroideryPrice(customPrices, embroideryOption) {
  if (!customPrices || !embroideryOption) return undefined
  if (embroideryOption in customPrices) {
    const n = Number(customPrices[embroideryOption])
    return Number.isFinite(n) ? n : 0
  }
  const normalized = embroideryOption.toLowerCase()
  const matchedKey = Object.keys(customPrices).find((key) => key.toLowerCase() === normalized)
  if (!matchedKey) return undefined
  const n = Number(customPrices[matchedKey])
  return Number.isFinite(n) ? n : 0
}

/** Retorna o acréscimo de bordado. Usa preços do admin quando disponíveis. */
export function getEmbroideryExtra(category, embroideryOption, productName = '', productOrPrices = null) {
  if (!embroideryOption) return 0
  if (category === 'faixas' && productName.toLowerCase().includes('colorida')) return 0

  const customPrices = resolveEmbroideryPrices(productOrPrices)
  const customPrice = resolveEmbroideryPrice(customPrices, embroideryOption)
  if (customPrice !== undefined) return customPrice

  if (category === 'judogi') return getJudogiEmbroideryExtra(embroideryOption)
  if (category === 'faixas') return getFaixaEmbroideryExtra(embroideryOption)
  return 0
}

export function getCartUnitPrice(item) {
  if (!item) return 0
  const extra = getEmbroideryExtra(item.category, item.embroidery, item.name, item)
  return getFaixaCartUnitBasePrice(item) + extra
}
