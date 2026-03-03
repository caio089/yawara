import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'

export default function Catalog() {
  const { products, categories } = useProducts()
  const [activeCategory, setActiveCategory] = useState('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = [...products]

    if (activeCategory !== 'todos') {
      result = result.filter((p) => p.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.nameJp && p.nameJp.includes(query))
      )
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  }, [products, activeCategory, searchQuery, sortBy])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative bg-kuro pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 seigaiha-pattern opacity-15" />

        <div className="absolute top-0 right-0 w-1/2 h-full hidden md:block">
          <motion.img
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            src="/images/rafaela-silva.png"
            alt="Rafaela Silva"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-kuro via-kuro/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-kuro via-transparent to-kuro/30" />
        </div>

        <div className="relative md:hidden w-full h-64 overflow-hidden -mt-28">
          <motion.img
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            src="/images/rafaela-silva.png"
            alt="Rafaela Silva"
            className="w-full h-full object-cover object-[center_20%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-kuro via-transparent to-kuro" />
          <div className="absolute inset-0 bg-gradient-to-r from-kuro/50 via-transparent to-kuro/50" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 mt-6 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md"
          >
            <span className="text-kin text-xs tracking-[0.3em] uppercase font-medium">
              Coleção completa
            </span>
            <h1 className="font-jp text-4xl sm:text-5xl font-bold text-shiro mt-3 tracking-wide">
              Catálogo
            </h1>
            <p className="text-shiro/40 mt-3 max-w-md text-sm leading-relaxed">
              Produtos autênticos de judô importados do Japão. Qualidade e tradição para
              atletas de todos os níveis.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        {/* Search + Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-kuro/30"
            />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30 focus:ring-2 focus:ring-aka/10 transition-all placeholder:text-kuro/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-kuro/30 hover:text-kuro"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 sm:hidden ${
              showFilters
                ? 'bg-kuro text-shiro'
                : 'bg-shiro border border-washi-dark text-kuro/60'
            }`}
          >
            <SlidersHorizontal size={16} />
            Filtros
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3.5 bg-shiro border border-washi-dark rounded-xl text-sm text-kuro/60 focus:outline-none focus:border-aka/30 cursor-pointer"
          >
            <option value="default">Ordenar por</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="name">Nome A-Z</option>
          </select>
        </motion.div>

        {/* Categories */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-kuro text-shiro shadow-md'
                    : 'bg-shiro text-kuro/60 hover:bg-kuro/5 border border-washi-dark'
                }`}
              >
                <span>{cat.name}</span>
                <span className="ml-2 font-jp text-[10px] opacity-50">{cat.nameJp}</span>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Results count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-kuro/40 mb-6"
        >
          {filtered.length} {filtered.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
        </motion.p>

        {/* Products Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <p className="font-jp text-5xl text-kuro/5 mb-4">見つかりません</p>
            <p className="text-kuro/40 text-sm">Nenhum produto encontrado.</p>
            <button
              onClick={() => {
                setActiveCategory('todos')
                setSearchQuery('')
              }}
              className="mt-4 text-aka text-sm hover:underline"
            >
              Limpar filtros
            </button>
          </motion.div>
        )}
      </section>
    </div>
  )
}
