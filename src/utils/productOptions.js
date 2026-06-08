export const GENDER_OPTIONS = ['masculino', 'feminino', 'unisex']

export function normalizeCategory(category) {
  return String(category || '').toLowerCase().trim()
}

export function isGenderCategory(category) {
  const value = normalizeCategory(category)
  return value === 'conjunto' || value === 'sobretudo'
}

export function shouldShowGenderOption(product) {
  if (!product || !isGenderCategory(product.category)) return false
  const name = (product.name || '').toLowerCase()
  if (name.includes('sauna') && name.includes('mizuno')) return false
  return true
}

export function getGenderOptionsForProduct(product) {
  if (!shouldShowGenderOption(product)) return []
  const saved = product.genderOptions ?? product.gender_options
  if (Array.isArray(saved) && saved.length > 0) return saved
  return [...GENDER_OPTIONS]
}

export function genderLabel(option) {
  if (option === 'masculino') return 'Masculino'
  if (option === 'feminino') return 'Feminino'
  if (option === 'unisex') return 'Unisex'
  return option
}
