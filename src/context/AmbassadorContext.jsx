import { createContext, useContext, useState, useLayoutEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { uploadToCloudinary, isCloudinaryConfigured } from '../lib/cloudinary'

const AmbassadorContext = createContext()
const configured = isSupabaseConfigured()

export const FALLBACK_AMBASSADOR = {
  id: null,
  name: 'Rafaela Silva',
  club: 'Reação',
  role: 'Embaixadora',
  description:
    'Campeã Olímpica e Bicampeã Mundial, Rafaela Silva é a embaixadora oficial da Yawara Japan. Ela representa a força, a garra e a excelência do judô brasileiro no mundo.',
  highlight: 'Campeã Olímpica · Bicampeã Mundial',
  image: '/images/rafaela-silva.png',
}

function normalizeAmbassador(row) {
  if (!row) return FALLBACK_AMBASSADOR
  return {
    id: row.id,
    name: row.name || '',
    club: row.club || '',
    role: row.role || 'Embaixadora',
    description: row.description || '',
    highlight: row.highlight || '',
    image: row.image || '',
  }
}

function formatError(error) {
  const msg = error?.message || 'Não foi possível salvar no Supabase.'
  if (msg.includes('brand_ambassador') || msg.includes('schema cache')) {
    return 'A tabela brand_ambassador não existe. Execute scripts/migrate-brand-ambassador.sql no SQL Editor do Supabase.'
  }
  return msg
}

export function AmbassadorProvider({ children }) {
  const [ambassador, setAmbassador] = useState(FALLBACK_AMBASSADOR)
  const [loading, setLoading] = useState(true)

  const fetchAmbassador = useCallback(async () => {
    if (!configured) {
      setAmbassador(FALLBACK_AMBASSADOR)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('brand_ambassador')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (!error && data) {
        setAmbassador(normalizeAmbassador(data))
      } else if (error) {
        setAmbassador(FALLBACK_AMBASSADOR)
      } else {
        setAmbassador(FALLBACK_AMBASSADOR)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useLayoutEffect(() => {
    fetchAmbassador()
  }, [fetchAmbassador])

  const uploadImage = async (file) => {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary não configurado. Defina VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET.')
    }
    return uploadToCloudinary(file, 'yawara/ambassador')
  }

  const updateAmbassador = async (updates, imageFile) => {
    if (!configured) {
      const image = imageFile ? URL.createObjectURL(imageFile) : updates.image ?? ambassador.image
      setAmbassador((prev) => ({ ...prev, ...updates, image }))
      return { success: true }
    }

    let imageUrl = updates.image !== undefined ? updates.image : ambassador.image
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
    }

    const row = {
      name: updates.name?.trim() || '',
      club: updates.club?.trim() || null,
      role: updates.role?.trim() || 'Embaixadora',
      description: updates.description?.trim() || null,
      highlight: updates.highlight?.trim() || null,
      image: imageUrl || null,
    }

    if (ambassador.id) {
      const { error } = await supabase.from('brand_ambassador').update(row).eq('id', ambassador.id)
      if (error) return { success: false, error: formatError(error) }
    } else {
      const { error } = await supabase.from('brand_ambassador').insert(row)
      if (error) return { success: false, error: formatError(error) }
    }

    await fetchAmbassador()
    return { success: true }
  }

  return (
    <AmbassadorContext.Provider
      value={{
        ambassador,
        loading,
        fetchAmbassador,
        updateAmbassador,
      }}
    >
      {children}
    </AmbassadorContext.Provider>
  )
}

export function useAmbassador() {
  const ctx = useContext(AmbassadorContext)
  if (!ctx) throw new Error('useAmbassador must be used within AmbassadorProvider')
  return ctx
}
