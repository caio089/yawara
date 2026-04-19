import { createContext, useContext, useState, useLayoutEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { categories } from '../data/products'

const ProductsContext = createContext()
const configured = isSupabaseConfigured()

function parseImage(value) {
  if (!value) return { image: '', images: [] }
  if (typeof value === 'string' && value.startsWith('[')) {
    try {
      const arr = JSON.parse(value)
      if (Array.isArray(arr) && arr.length) return { image: arr[0], images: arr }
    } catch (_) {}
  }
  return { image: value, images: [value] }
}

function normalizeProduct(row) {
  const { image, images } = parseImage(row.image)
  const pixPrice = row.pix_price ?? row.pixPrice
  return {
    id: row.id,
    name: row.name,
    nameJp: row.name_jp ?? row.nameJp,
    description: row.description,
    price: row.price,
    pixPrice: pixPrice != null && pixPrice > 0 ? Number(pixPrice) : undefined,
    category: row.category,
    image,
    images,
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

  const getStoragePathsFromUrls = (urls) => {
    if (!urls?.length) return []
    return (Array.isArray(urls) ? urls : [urls])
      .filter(Boolean)
      .map((url) => {
        const parts = String(url).split('/product-images/')
        return parts[1]?.split('?')[0]?.trim()
      })
      .filter(Boolean)
  }

  const imageFieldFromOrderedLocal = (ordered) => {
    if (!ordered?.length) return ''
    const urls = ordered.map((x) => (typeof x === 'string' ? x : URL.createObjectURL(x)))
    return urls.length === 1 ? urls[0] : JSON.stringify(urls)
  }

  const resolveOrderedImageField = async (ordered) => {
    if (!ordered?.length) return ''
    const urls = []
    for (const item of ordered) {
      if (typeof item === 'string' && item) urls.push(item)
      else if (item instanceof File) {
        const url = await uploadImage(item)
        if (url) urls.push(url)
      }
    }
    return urls.length === 0 ? '' : urls.length === 1 ? urls[0] : JSON.stringify(urls)
  }

  const addProduct = async (product, orderedMedia) => {
    if (!configured) {
      const newId = Math.max(...products.map((p) => p.id), 0) + 1
      const imageField = imageFieldFromOrderedLocal(orderedMedia || [])
      const { image, images } = parseImage(imageField)
      setProducts((prev) => [
        ...prev,
        {
          ...product,
          id: newId,
          available: true,
          image,
          images: images.length ? images : image ? [image] : [],
        },
      ])
      return
    }
    let imageUrl = product.image
    if (orderedMedia?.length) {
      imageUrl = await resolveOrderedImageField(orderedMedia)
    }
    const { name, nameJp, description, price, pixPrice, category, sizes, colors, embroidery, available } = product
    const row = {
      name,
      name_jp: nameJp,
      description,
      price,
      pix_price: pixPrice != null && pixPrice > 0 ? pixPrice : null,
      category,
      image: imageUrl,
      badge: null,
      sizes: sizes?.length ? sizes : null,
      colors: colors?.length ? colors : null,
      embroidery: embroidery?.length ? embroidery : null,
      available: available !== false,
    }
    const { error } = await supabase.from('products').insert(row)
    if (!error) await fetchProducts()
  }

  const updateProduct = async (id, updates, orderedMedia) => {
    if (!configured) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          const next = { ...p, ...updates }
          if (orderedMedia?.length) {
            const imageField = imageFieldFromOrderedLocal(orderedMedia)
            const { image, images } = parseImage(imageField)
            return {
              ...next,
              image,
              images: images.length ? images : image ? [image] : [],
            }
          }
          return next
        })
      )
      return
    }
    const row = {
      name: updates.name,
      name_jp: updates.nameJp,
      description: updates.description,
      price: updates.price,
      category: updates.category,
      badge: null,
      sizes: updates.sizes?.length ? updates.sizes : null,
      colors: updates.colors?.length ? updates.colors : null,
      embroidery: updates.embroidery?.length ? updates.embroidery : null,
    }
    if (typeof updates.available === 'boolean') {
      row.available = updates.available
    }
    if (updates.pixPrice !== undefined) {
      row.pix_price = updates.pixPrice != null && updates.pixPrice > 0 ? updates.pixPrice : null
    }
    if (orderedMedia?.length) {
      row.image = await resolveOrderedImageField(orderedMedia)
    } else if (updates.image !== undefined) {
      row.image = updates.image
    }
    const { error } = await supabase.from('products').update(row).eq('id', id)
    if (!error) await fetchProducts()
  }

  const deleteProduct = async (id) => {
    const product = products.find((p) => p.id === id)
    if (!configured) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
      return
    }
    const urls = product?.images?.length ? product.images : (product?.image ? [product.image] : [])
    if (urls.length) {
      const paths = getStoragePathsFromUrls(urls)
      if (paths.length) await supabase.storage.from('product-images').remove(paths)
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

  const totalValueProducts = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0)

  return (
    <ProductsContext.Provider
      value={{
        products,
        activeProducts,
        categories,
        totalValueProducts,
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
