import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronRight, Shield, Award, Truck, Search, X, Trophy } from 'lucide-react'
import { useRef, useState, useMemo, useEffect } from 'react'
import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const features = [
  {
    icon: Shield,
    title: 'Qualidade Garantida',
    titleJp: '品質保証',
    desc: 'Todos os produtos passam por rigoroso controle de qualidade antes de chegar até você.',
  },
  {
    icon: Award,
    title: 'Autenticidade',
    titleJp: '本物',
    desc: 'Produtos importados diretamente do Japão com certificado de autenticidade.',
  },
  {
    icon: Truck,
    title: 'Envio Nacional e Internacional',
    titleJp: '国内外配送',
    desc: 'Entrega para todo o Brasil e exterior com embalagem premium e rastreamento completo.',
  },
]

const PREVIEW_LIMIT = 8

export default function Home() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const videoRef = useRef(null)
  const { products, categories, loading: productsLoading } = useProducts()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('todos')
  const [sortBy, setSortBy] = useState('default')

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

  const preview = filtered.slice(0, PREVIEW_LIMIT)
  const hasMore = filtered.length > PREVIEW_LIMIT

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const play = () => {
      video.play().catch(() => {})
    }
    play()
    const onPause = () => {
      if (!video.ended) play()
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') play()
    }
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', play)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', play)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <div className="overflow-hidden">
      {/* === HERO === */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-kuro">
          <motion.div
            style={{ y: heroY }}
            className="absolute inset-[-20%] overflow-hidden"
          >
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              className="w-full h-full object-cover opacity-80 pointer-events-none"
              style={{ objectFit: 'cover' }}
              src="/videos/video yawara.mp4"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-kuro/25 via-kuro/35 to-kuro" />
          <div className="absolute inset-0 bg-gradient-to-r from-kuro/20 via-transparent to-kuro/20" />
          <div className="absolute inset-0 seigaiha-pattern opacity-10" />
        </div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-6"
          >
            <motion.img
              src="/images/logo-yawara.png"
              alt="Yawara Japan"
              className="w-28 sm:w-32 md:w-36 mx-auto drop-shadow-[0_0_30px_rgba(0,0,0,0.4)]"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.5}
            className="mb-4"
          >
            <h1 className="font-jp text-7xl sm:text-8xl md:text-9xl font-black text-shiro tracking-wider leading-none">
              YAWARA
            </h1>
            <p className="font-jp text-kin text-lg sm:text-xl tracking-[0.5em] font-medium mt-2">
              JAPAN
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-kin to-transparent mx-auto mb-8" />
          </motion.div>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-shiro/60 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-12 font-light"
          >
            Equipamentos e acessórios premium de judô, importados diretamente do Japão.
            Tradição, qualidade e autenticidade em cada peça.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={2.5}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/catalogo')}
              className="group bg-aka hover:bg-aka-light text-shiro px-8 py-4 rounded-full font-medium flex items-center gap-3 transition-all duration-300 shadow-lg shadow-aka/30 text-sm tracking-wide"
            >
              Ver Catálogo
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/sobre')}
              className="group border border-shiro/20 text-shiro/80 hover:text-shiro hover:border-shiro/40 px-8 py-4 rounded-full font-medium flex items-center gap-3 transition-all duration-300 text-sm tracking-wide"
            >
              Nossa História
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-shiro/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 bg-shiro/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>


      {/* === FEATURES === */}
      <section className="py-6 sm:py-8 bg-shiro border-b border-washi-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0 sm:divide-x divide-washi-dark">
            {features.map((feat, i) => {
              const Icon = feat.icon
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="flex items-center gap-2 sm:px-6"
                >
                  <Icon size={16} className="text-aka shrink-0" />
                  <span className="text-[11px] sm:text-xs font-medium text-kuro/70">{feat.title}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>


      {/* === CATALOG PREVIEW === */}
      <section className="py-24 bg-washi relative">
        <div className="absolute inset-0 bg-japanese-pattern" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-aka text-xs tracking-[0.3em] uppercase font-medium">
              Nossos Produtos
            </span>
            <h2 className="font-jp text-3xl sm:text-4xl font-bold text-kuro mt-3 tracking-wide">
              Catálogo
            </h2>
            <div className="w-12 h-0.5 bg-aka mx-auto mt-4" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-kuro/30" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30 focus:ring-2 focus:ring-aka/10 transition-all placeholder:text-kuro/30"
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

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm text-kuro/60 focus:outline-none focus:border-aka/30 cursor-pointer"
            >
              <option value="default">Ordenar por</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="name">Nome A-Z</option>
            </select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-kuro text-shiro shadow-md'
                    : 'bg-shiro text-kuro/60 hover:bg-kuro/5 border border-washi-dark'
                }`}
              >
                <span>{cat.name}</span>
                <span className="ml-1.5 font-jp text-[10px] opacity-50">{cat.nameJp}</span>
              </motion.button>
            ))}
          </motion.div>

          <p className="text-xs text-kuro/40 mb-6">
            {productsLoading ? 'Carregando...' : `${filtered.length} ${filtered.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`}
          </p>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-shiro rounded-2xl overflow-hidden border border-washi-dark"
                >
                  <div className="aspect-square bg-washi-dark/30 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-washi-dark/30 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-washi-dark/20 rounded animate-pulse w-1/2" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : preview.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {preview.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-jp text-4xl text-kuro/5 mb-3">見つかりません</p>
              <p className="text-kuro/40 text-sm">Nenhum produto encontrado.</p>
              <button
                onClick={() => {
                  setActiveCategory('todos')
                  setSearchQuery('')
                  setSortBy('default')
                }}
                className="mt-3 text-aka text-sm hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}

          {hasMore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-14"
            >
              <p className="text-kuro/40 text-sm mb-5">
                Veja todos os {filtered.length} produtos disponíveis
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/catalogo')}
                className="group bg-aka hover:bg-aka-light text-shiro px-10 py-4 rounded-full font-medium shadow-lg shadow-aka/20 transition-all duration-300 text-sm tracking-wide inline-flex items-center gap-3"
              >
                Ver Catálogo Completo
                <ChevronRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>

      {/* === PARTNERS CTA === */}
      <section className="relative bg-kuro overflow-hidden">
        <div className="absolute inset-0 seigaiha-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-kuro via-kuro/95 to-kuro" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex -space-x-4 shrink-0">
              {[
                '/images/thiago-camilo.png',
                '/images/rafaela-silva.png',
                '/images/chrystian-silva.png',
                '/images/joao-derly.png',
                '/images/guilherme-oliveira.png',
              ].map((src, i) => (
                <motion.img
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  src={src}
                  alt="Atleta"
                  className="w-14 h-14 rounded-full border-2 border-kuro object-cover"
                />
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="w-14 h-14 rounded-full border-2 border-kuro bg-aka flex items-center justify-center"
              >
                <Trophy size={18} className="text-shiro" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-1 text-center md:text-left"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-shiro mb-2">
                Conheça quem veste Yawara
              </h3>
              <p className="text-shiro/40 text-sm max-w-md leading-relaxed">
                Atletas campeões, academias de elite e projetos sociais que confiam
                na qualidade Yawara Japan. Conheça nosso time.
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/parceiros')}
              className="group shrink-0 bg-kin hover:bg-kin/90 text-kuro px-8 py-4 rounded-full font-medium shadow-lg shadow-kin/20 transition-all duration-300 text-sm tracking-wide inline-flex items-center gap-3"
            >
              Ver Parceiros
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  )
}
