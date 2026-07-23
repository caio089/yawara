const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''

export function isCloudinaryConfigured() {
  return Boolean(cloudName && uploadPreset)
}

/** URL otimizada (auto format/quality) a partir do secure_url ou public_id */
export function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return url
  if (!url.includes('res.cloudinary.com/')) return url
  if (url.includes('/f_auto,q_auto/')) return url
  return url.replace('/upload/', '/upload/f_auto,q_auto/')
}

/**
 * Upload de arquivo para Cloudinary (unsigned preset).
 * folder: 'yawara/products' | 'yawara/sponsored'
 */
export async function uploadToCloudinary(file, folder = 'yawara/products') {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary não configurado. Defina VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET.')
  }

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', uploadPreset)
  form.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Falha no upload para o Cloudinary.')
  }

  return optimizeCloudinaryUrl(data.secure_url || data.url)
}
