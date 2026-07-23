import { createContext, useContext, useState, useLayoutEffect, useCallback, useMemo } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { uploadToCloudinary, isCloudinaryConfigured } from '../lib/cloudinary'

const SponsoredContext = createContext()
const configured = isSupabaseConfigured()

function normalizeAthlete(row) {
  return {
    id: row.id,
    name: row.name,
    club: row.club || '',
    image: row.image || '',
    displayRow: row.display_row ?? row.displayRow ?? 1,
    sortOrder: row.sort_order ?? row.sortOrder ?? 0,
    imagePosition: row.image_position ?? row.imagePosition ?? 'top',
    role: row.role || 'Patrocinado',
  }
}

export function SponsoredProvider({ children }) {
  const [athletes, setAthletes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAthletes = useCallback(async () => {
    if (!configured) {
      setAthletes([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sponsored_athletes')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true })
      if (!error && data) {
        setAthletes(data.map(normalizeAthlete))
      } else {
        setAthletes([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useLayoutEffect(() => {
    fetchAthletes()
  }, [fetchAthletes])

  const sponsoredTop = useMemo(
    () => athletes.filter((a) => a.displayRow === 1).sort((a, b) => a.sortOrder - b.sortOrder),
    [athletes]
  )

  const sponsoredBottom = useMemo(
    () => athletes.filter((a) => a.displayRow === 2).sort((a, b) => a.sortOrder - b.sortOrder),
    [athletes]
  )

  const uploadImage = async (file) => {
    if (!configured) return null
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary não configurado. Defina VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET.')
    }
    return uploadToCloudinary(file, 'yawara/sponsored')
  }

  const addAthlete = async (athlete, imageFile) => {
    if (!configured) {
      const newId = Math.max(...athletes.map((a) => a.id), 0) + 1
      const image = imageFile ? URL.createObjectURL(imageFile) : athlete.image || ''
      setAthletes((prev) => [...prev, { ...athlete, id: newId, image }])
      return { success: true }
    }

    let imageUrl = athlete.image || null
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
    }

    const row = {
      name: athlete.name,
      club: athlete.club || null,
      image: imageUrl,
      display_row: athlete.displayRow === 2 ? 2 : 1,
      sort_order: Number(athlete.sortOrder) || 0,
      image_position: athlete.imagePosition === 'center' ? 'center' : 'top',
      role: athlete.role === 'Patrocinada' ? 'Patrocinada' : 'Patrocinado',
    }

    const { error } = await supabase.from('sponsored_athletes').insert(row)
    if (error) return { success: false, error: error.message }
    await fetchAthletes()
    return { success: true }
  }

  const updateAthlete = async (id, updates, imageFile) => {
    if (!configured) {
      setAthletes((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a
          const image = imageFile ? URL.createObjectURL(imageFile) : updates.image ?? a.image
          return { ...a, ...updates, image }
        })
      )
      return { success: true }
    }

    const row = {
      name: updates.name,
      club: updates.club || null,
      display_row: updates.displayRow === 2 ? 2 : 1,
      sort_order: Number(updates.sortOrder) ?? 0,
      image_position: updates.imagePosition === 'center' ? 'center' : 'top',
      role: updates.role === 'Patrocinada' ? 'Patrocinada' : 'Patrocinado',
    }

    if (imageFile) {
      row.image = await uploadImage(imageFile)
    } else if (updates.image !== undefined) {
      row.image = updates.image || null
    }

    const { error } = await supabase.from('sponsored_athletes').update(row).eq('id', id)
    if (error) return { success: false, error: error.message }
    await fetchAthletes()
    return { success: true }
  }

  const deleteAthlete = async (id) => {
    if (!configured) {
      setAthletes((prev) => prev.filter((a) => a.id !== id))
      return { success: true }
    }
    const { error } = await supabase.from('sponsored_athletes').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    await fetchAthletes()
    return { success: true }
  }

  return (
    <SponsoredContext.Provider
      value={{
        athletes,
        sponsoredTop,
        sponsoredBottom,
        loading,
        fetchAthletes,
        addAthlete,
        updateAthlete,
        deleteAthlete,
      }}
    >
      {children}
    </SponsoredContext.Provider>
  )
}

export function useSponsored() {
  const ctx = useContext(SponsoredContext)
  if (!ctx) throw new Error('useSponsored must be used within SponsoredProvider')
  return ctx
}
