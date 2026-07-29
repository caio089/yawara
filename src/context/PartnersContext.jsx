import { createContext, useContext, useState, useLayoutEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { uploadToCloudinary, isCloudinaryConfigured } from '../lib/cloudinary'

const PartnersContext = createContext()
const configured = isSupabaseConfigured()

const FALLBACK_PARTNERS = [
  { id: 1, name: 'Moacir Mendes', club: 'Alliance Canoas Norte', image: '/images/moacir-mendes.png', role: 'Parceiro', sortOrder: 0, imagePosition: 'top' },
  { id: 2, name: 'Tiago Camilo', club: 'Instituto Tiago Camilo', image: '/images/thiago-camilo.png', role: 'Amigo da Marca', sortOrder: 1, imagePosition: 'top' },
  { id: 3, name: 'João Derly', club: 'Sogipa', image: '/images/joao-derly.png', role: 'Parceiro', sortOrder: 2, imagePosition: 'top' },
  { id: 4, name: 'Chrystian Silva', club: 'Clube Paineiras do Morumby', image: '/images/chrystian-silva.png', role: 'Parceiro', sortOrder: 3, imagePosition: 'top' },
  { id: 5, name: 'Thiago de Remédios', club: 'Estrela de Davi - PA', image: '/images/thiago-remedios.png', role: 'Parceiro', sortOrder: 4, imagePosition: 'top' },
  { id: 6, name: 'Cauã Schramm', club: 'GNU', image: '/images/caua-schramm.png', role: 'Parceiro', sortOrder: 5, imagePosition: 'top' },
]

function normalizePartner(row) {
  return {
    id: row.id,
    name: row.name,
    club: row.club || '',
    image: row.image || '',
    role: row.role === 'Amigo da Marca' ? 'Amigo da Marca' : 'Parceiro',
    sortOrder: row.sort_order ?? row.sortOrder ?? 0,
    imagePosition: row.image_position ?? row.imagePosition ?? 'top',
  }
}

function formatError(error) {
  const msg = error?.message || 'Não foi possível salvar no Supabase.'
  if (msg.includes('brand_partners') || msg.includes('schema cache')) {
    return 'A tabela brand_partners não existe. Execute scripts/migrate-brand-partners.sql no SQL Editor do Supabase.'
  }
  return msg
}

export function PartnersProvider({ children }) {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPartners = useCallback(async () => {
    if (!configured) {
      setPartners(FALLBACK_PARTNERS)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('brand_partners')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true })
      if (!error && data?.length) {
        setPartners(data.map(normalizePartner))
      } else if (!error) {
        setPartners([])
      } else {
        // Tabela ainda não criada ou falha temporária: mantém fallback estático
        setPartners(FALLBACK_PARTNERS)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useLayoutEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const uploadImage = async (file) => {
    if (!configured) return null
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary não configurado. Defina VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET.')
    }
    return uploadToCloudinary(file, 'yawara/partners')
  }

  const addPartner = async (partner, imageFile) => {
    if (!configured) {
      const newId = Math.max(...partners.map((p) => p.id), 0) + 1
      const image = imageFile ? URL.createObjectURL(imageFile) : partner.image || ''
      setPartners((prev) => [...prev, { ...partner, id: newId, image }])
      return { success: true }
    }

    let imageUrl = partner.image || null
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
    }

    const row = {
      name: partner.name,
      club: partner.club || null,
      image: imageUrl,
      role: partner.role === 'Amigo da Marca' ? 'Amigo da Marca' : 'Parceiro',
      sort_order: Number(partner.sortOrder) || 0,
      image_position: partner.imagePosition === 'center' ? 'center' : 'top',
    }

    const { error } = await supabase.from('brand_partners').insert(row)
    if (error) return { success: false, error: formatError(error) }
    await fetchPartners()
    return { success: true }
  }

  const updatePartner = async (id, updates, imageFile) => {
    if (!configured) {
      setPartners((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          const image = imageFile ? URL.createObjectURL(imageFile) : updates.image ?? p.image
          return { ...p, ...updates, image }
        })
      )
      return { success: true }
    }

    const row = {
      name: updates.name,
      club: updates.club || null,
      role: updates.role === 'Amigo da Marca' ? 'Amigo da Marca' : 'Parceiro',
      sort_order: Number(updates.sortOrder) ?? 0,
      image_position: updates.imagePosition === 'center' ? 'center' : 'top',
    }

    if (imageFile) {
      row.image = await uploadImage(imageFile)
    } else if (updates.image !== undefined) {
      row.image = updates.image || null
    }

    const { error } = await supabase.from('brand_partners').update(row).eq('id', id)
    if (error) return { success: false, error: formatError(error) }
    await fetchPartners()
    return { success: true }
  }

  const deletePartner = async (id) => {
    if (!configured) {
      setPartners((prev) => prev.filter((p) => p.id !== id))
      return { success: true }
    }
    const { error } = await supabase.from('brand_partners').delete().eq('id', id)
    if (error) return { success: false, error: formatError(error) }
    await fetchPartners()
    return { success: true }
  }

  return (
    <PartnersContext.Provider
      value={{
        partners,
        loading,
        fetchPartners,
        addPartner,
        updatePartner,
        deletePartner,
      }}
    >
      {children}
    </PartnersContext.Provider>
  )
}

export function useBrandPartners() {
  const ctx = useContext(PartnersContext)
  if (!ctx) throw new Error('useBrandPartners must be used within PartnersProvider')
  return ctx
}
