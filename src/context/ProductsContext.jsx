import { createContext, useContext, useState, useLayoutEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { categories } from '../data/products'

const ProductsContext = createContext()
const configured = isSupabaseConfigured()

function normalizeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    nameJp: row.name_jp ?? row.nameJp,
    description: row.description,
    price: row.price,
    category: row.category,
    image: row.image,
    badge: row.badge ?? null,
    available: row.available ?? true,
    sizes: row.sizes ?? undefined,
    colors: row.colors ?? undefined,
    embroidery: row.embroidery ?? undefined,
  }
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    if (!configured) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setProducts(data.map(normalizeProduct))
      } else {
        setProducts([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useLayoutEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const activeProducts = products.filter((p) => p.available)

  const uploadImage = async (file) => {
    if (!configured) return null
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  const addProduct = async (product, imageFile) => {
    if (!configured) {
      const newId = Math.max(...products.map((p) => p.id), 0) + 1
      setProducts((prev) => [...prev, { ...product, id: newId, available: true }])
      return
    }
    let imageUrl = product.image
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
    }
    const { name, nameJp, description, price, category, badge, sizes, colors, embroidery } = product
    const row = {
      name,
      name_jp: nameJp,
      description,
      price,
      category,
      image: imageUrl,
      badge: badge || null,
      sizes: sizes?.length ? sizes : null,
      colors: colors?.length ? colors : null,
      embroidery: embroidery?.length ? embroidery : null,
      available: true,
    }
    const { error } = await supabase.from('products').insert(row)
    if (!error) await fetchProducts()
  }

  const updateProduct = async (id, updates, imageFile) => {
    if (!configured) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
      return
    }
    let imageUrl = updates.image
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
    }
    const row = {
      name: updates.name,
      name_jp: updates.nameJp,
      description: updates.description,
      price: updates.price,
      category: updates.category,
      image: imageUrl,
      badge: updates.badge || null,
      sizes: updates.sizes?.length ? updates.sizes : null,
      colors: updates.colors?.length ? updates.colors : null,
      embroidery: updates.embroidery?.length ? updates.embroidery : null,
    }
    const { error } = await supabase.from('products').update(row).eq('id', id)
    if (!error) await fetchProducts()
  }

  const deleteProduct = async (id) => {
    if (!configured) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
      return
    }
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) await fetchProducts()
  }

  const toggleAvailability = async (id) => {
    const product = products.find((p) => p.id === id)
    if (!product) return
    if (!configured) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p))
      )
      return
    }
    const { error } = await supabase
      .from('products')
      .update({ available: !product.available })
      .eq('id', id)
    if (!error) await fetchProducts()
  }

  const averageTicket =
    activeProducts.length > 0
      ? activeProducts.reduce((sum, p) => sum + p.price, 0) / activeProducts.length
      : 0

  return (
    <ProductsContext.Provider
      value={{
        products,
        activeProducts,
        categories,
        averageTicket,
        loading,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleAvailability,
        uploadImage,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export const useProducts = () => {
  const context = useContext(ProductsContext)
  if (!context) throw new Error('useProducts must be used within ProductsProvider')
  return context
}
