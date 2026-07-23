import { createContext, useContext, useState, useLayoutEffect, useCallback, useMemo } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { uploadToCloudinary, isCloudinaryConfigured } from '../lib/cloudinary'
import { categories as fallbackCategories } from '../data/products'

const ProductsContext = createContext()
const configured = isSupabaseConfigured()
const ALL_CATEGORY = { id: 'todos', name: 'Todos', nameJp: '全て' }

function normalizeCategoryRow(row) {
  return {
    id: row.id,
    name: row.name,
    nameJp: row.name_jp ?? row.nameJp ?? '',
    sortOrder: row.sort_order ?? row.sortOrder ?? 0,
  }
}

function formatMutationError(error) {
  const msg = error?.message || 'Não foi possível salvar no Supabase.'
  if (msg.includes('embroidery_prices')) {
    return 'A coluna embroidery_prices não existe no banco. Execute scripts/migrate-columns.sql no SQL Editor do Supabase.'
  }
  if (msg.includes('gender_options')) {
    return 'A coluna gender_options não existe no banco. Execute scripts/migrate-columns.sql no SQL Editor do Supabase.'
  }
  if (msg.includes('product_categories')) {
    return 'A tabela product_categories não existe no banco. Execute scripts/migrate-product-categories.sql no SQL Editor do Supabase.'
  }
  return msg
}

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
    embroideryPrices: row.embroidery_prices ?? row.embroideryPrices ?? undefined,
    genderOptions: row.gender_options ?? row.genderOptions ?? undefined,
  }
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [productCategories, setProductCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    if (!configured) {
      setProductCategories(
        fallbackCategories
          .filter((c) => c.id !== 'todos')
          .map((c, i) => ({ id: c.id, name: c.name, nameJp: c.nameJp || '', sortOrder: i }))
      )
      setCategoriesLoading(false)
      return
    }
    setCategoriesLoading(true)
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true })
      if (!error && data?.length) {
        setProductCategories(data.map(normalizeCategoryRow))
      } else if (!error) {
        setProductCategories(
          fallbackCategories
            .filter((c) => c.id !== 'todos')
            .map((c, i) => ({ id: c.id, name: c.name, nameJp: c.nameJp || '', sortOrder: i }))
        )
      } else {
        setProductCategories([])
      }
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

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
    fetchCategories()
    fetchProducts()
  }, [fetchCategories, fetchProducts])

  const categories = useMemo(
    () => [ALL_CATEGORY, ...productCategories.map((c) => ({ id: c.id, name: c.name, nameJp: c.nameJp }))],
    [productCategories]
  )

  const categoryOptions = useMemo(
    () => productCategories.map((c) => ({ value: c.id, label: c.name })),
    [productCategories]
  )

  const getCategoryLabel = useCallback(
    (categoryId) => {
      const found = productCategories.find((c) => c.id === categoryId)
      return found?.name || categoryId || ''
    },
    [productCategories]
  )

  const countProductsInCategory = useCallback(
    (categoryId) => products.filter((p) => p.category === categoryId).length,
    [products]
  )

  const addCategory = async ({ id, name, nameJp, sortOrder }) => {
    if (!configured) {
      setProductCategories((prev) => [...prev, { id, name, nameJp: nameJp || '', sortOrder: sortOrder ?? 0 }])
      return { success: true }
    }
    const { error } = await supabase.from('product_categories').insert({
      id,
      name,
      name_jp: nameJp || null,
      sort_order: sortOrder ?? 0,
    })
    if (error) return { success: false, error: formatMutationError(error) }
    await fetchCategories()
    return { success: true }
  }

  const updateCategory = async (id, { name, nameJp, sortOrder }) => {
    if (!configured) {
      setProductCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name, nameJp: nameJp || '', sortOrder: sortOrder ?? 0 } : c))
      )
      return { success: true }
    }
    const { error } = await supabase
      .from('product_categories')
      .update({
        name,
        name_jp: nameJp || null,
        sort_order: sortOrder ?? 0,
      })
      .eq('id', id)
    if (error) return { success: false, error: formatMutationError(error) }
    await fetchCategories()
    return { success: true }
  }

  const deleteCategory = async (id) => {
    if (countProductsInCategory(id) > 0) {
      return { success: false, error: 'Existem produtos nesta categoria. Mova ou exclua os produtos antes.' }
    }
    if (!configured) {
      setProductCategories((prev) => prev.filter((c) => c.id !== id))
      return { success: true }
    }
    const { error } = await supabase.from('product_categories').delete().eq('id', id)
    if (error) return { success: false, error: formatMutationError(error) }
    await fetchCategories()
    return { success: true }
  }

  const activeProducts = products.filter((p) => p.available)

  const uploadImage = async (file) => {
    if (!configured) return null
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary não configurado. Defina VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET.')
    }
    return uploadToCloudinary(file, 'yawara/products')
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
      return { success: true }
    }
    let imageUrl = product.image
    if (orderedMedia?.length) {
      imageUrl = await resolveOrderedImageField(orderedMedia)
    }
    const { name, nameJp, description, price, pixPrice, category, sizes, colors, embroidery, embroideryPrices, genderOptions, available } = product
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
      embroidery_prices: embroideryPrices && Object.keys(embroideryPrices).length ? embroideryPrices : null,
      gender_options: Array.isArray(genderOptions) ? genderOptions : null,
      available: available !== false,
    }
    const { error } = await supabase.from('products').insert(row)
    if (error) return { success: false, error: formatMutationError(error) }
    await fetchProducts()
    return { success: true }
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
      return { success: true }
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
      embroidery_prices: updates.embroideryPrices && Object.keys(updates.embroideryPrices).length
        ? updates.embroideryPrices
        : null,
      gender_options: Array.isArray(updates.genderOptions) ? updates.genderOptions : null,
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
    if (error) return { success: false, error: formatMutationError(error) }

    await fetchProducts()
    return { success: true }
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

  const totalValueProducts = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0)

  return (
    <ProductsContext.Provider
      value={{
        products,
        activeProducts,
        categories,
        productCategories,
        categoryOptions,
        categoriesLoading,
        getCategoryLabel,
        countProductsInCategory,
        addCategory,
        updateCategory,
        deleteCategory,
        totalValueProducts,
        loading,
        fetchProducts,
        fetchCategories,
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
