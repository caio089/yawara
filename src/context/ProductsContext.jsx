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
  return {
    id: row.id,
    name: row.name,
    nameJp: row.name_jp ?? row.nameJp,
    description: row.description,
    price: row.price,
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

  const addProduct = async (product, imageFileOrFiles, _existingUrls) => {
    if (!configured) {
      const newId = Math.max(...products.map((p) => p.id), 0) + 1
      setProducts((prev) => [...prev, { ...product, id: newId, available: true }])
      return
    }
    let imageUrl = product.image
    if (imageFileOrFiles?.length) {
      const files = Array.isArray(imageFileOrFiles) ? imageFileOrFiles : [imageFileOrFiles]
      const urls = []
      for (const file of files) {
        const url = await uploadImage(file)
        if (url) urls.push(url)
      }
      imageUrl = urls.length > 1 ? JSON.stringify(urls) : urls[0] || imageUrl
    }
    const { name, nameJp, description, price, category, sizes, colors, embroidery, available } = product
    const row = {
      name,
      name_jp: nameJp,
      description,
      price,
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

  const updateProduct = async (id, updates, imageFileOrFiles, existingUrls = []) => {
    if (!configured) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
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
    if (imageFileOrFiles?.length) {
      const files = Array.isArray(imageFileOrFiles) ? imageFileOrFiles : [imageFileOrFiles]
      const urls = []
      for (const file of files) {
        const url = await uploadImage(file)
        if (url) urls.push(url)
      }
      const allUrls = [...(Array.isArray(existingUrls) ? existingUrls : []), ...urls]
      row.image = allUrls.length > 1 ? JSON.stringify(allUrls) : allUrls[0] || updates.image
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
