/**
 * Valores adicionais de bordado (em reais).
 * Judogi: peito +R$ 370 | lapela/calça +R$ 190
 * Faixa: sem bordado R$ 450 | com bordado R$ 550 | bordado sombreado R$ 650 (base + extra)
 */
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
