export const GENDER_OPTIONS = ['masculino', 'feminino', 'unisex']

export function normalizeCategory(category) {
  return String(category || '').toLowerCase().trim()
}

export function isGenderCategory(category) {
  const value = normalizeCategory(category)
  return value === 'conjunto' || value === 'sobretudo'
}

export function isSaunaMizunoProduct(product) {
  const name = (product?.name || '').toLowerCase()
  return name.includes('sauna') && name.includes('mizuno')
}

/** Opções salvas no admin para o formulário de edição */
export function getInitialGenderOptionsForAdmin(product) {
  if (!product || !isGenderCategory(product.category)) return []
  const saved = product.genderOptions ?? product.gender_options
  if (Array.isArray(saved)) {
    return saved.filter((opt) => GENDER_OPTIONS.includes(opt))
  }
  if (isSaunaMizunoProduct(product)) return []
  return [...GENDER_OPTIONS]
}

export function getGenderOptionsForProduct(product) {
  if (!product || !isGenderCategory(product.category)) return []

  const saved = product.genderOptions ?? product.gender_options
  if (Array.isArray(saved)) {
    return saved.filter((opt) => GENDER_OPTIONS.includes(opt))
  }

  // Legado: produtos sem gender_options no banco
  if (isSaunaMizunoProduct(product)) return []
  return [...GENDER_OPTIONS]
}

export function shouldShowGenderOption(product) {
  return getGenderOptionsForProduct(product).length > 0
}

export function genderLabel(option) {
  if (option === 'masculino') return 'Masculino'
  if (option === 'feminino') return 'Feminino'
  if (option === 'unisex') return 'Unisex'
  return option
}
