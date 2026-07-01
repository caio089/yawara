export function slugifyCategory(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isValidCategorySlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}
