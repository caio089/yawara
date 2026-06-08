import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, ChevronLeft, Package, Ruler, Shield, Truck, Scissors, Palette } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { getEmbroideryExtra, faixaUsesFixedBordadoBase, getFaixaBordadoBasePrice } from '../utils/embroidery'
import { shouldShowGenderOption, getGenderOptionsForProduct, genderLabel } from '../utils/productOptions'
import ProductCard from '../components/ProductCard'

const categoryLabels = {
  judogi: 'Judogi',
  faixas: 'Faixa',
  bolsa: 'Bolsa',
  chinelo: 'Chinelo',
  garrafa: 'Garrafa',
  sobretudo: 'Sobretudo',
  conjunto: 'Conjunto',
  caneca: 'Caneca',
  livros: 'Livro',
  diversos: 'Diversos',
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { products } = useProducts()
  const [added, setAdded] = useState(false)

  const product = products.find((p) => p.id === Number(id))
  const images = product?.images?.length ? product.images : (product?.image ? [product.image] : [])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '')
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '')
  const usesFixedFaixaBase = product
    ? faixaUsesFixedBordadoBase(product.category, product.name, product.embroidery)
    : false
  const embroideryOpcoes = product?.embroidery?.length ? product.embroidery : []
  const [selectedEmbroidery, setSelectedEmbroidery] = useState(() => product?.embroidery?.[0] || '')
  const [selectedGender, setSelectedGender] = useState('masculino')

  useEffect(() => {
    if (!product) return
    setSelectedEmbroidery(product.embroidery?.[0] || '')
    const genders = getGenderOptionsForProduct(product)
    setSelectedGender(genders[0] || 'masculino')
  }, [product?.id])

  const related = useMemo(() => {
    if (!product) return []
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4)
  }, [product, products])

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-jp text-5xl text-kuro/5">見つかりません</p>
        <p className="text-kuro/50">Produto não encontrado.</p>
        <button onClick={() => navigate('/catalogo')} className="text-aka hover:underline text-sm">
          Voltar ao catálogo
        </button>
      </div>
    )
  }

  const showGenderOption = shouldShowGenderOption(product)
  const genderOptions = getGenderOptionsForProduct(product)
  const embroideryExtra = getEmbroideryExtra(product.category, selectedEmbroidery, product.name, product)
  const faixaBasePrice = usesFixedFaixaBase ? getFaixaBordadoBasePrice(product) : product.price
  const finalPrice = usesFixedFaixaBase
    ? faixaBasePrice + embroideryExtra
    : product.price + embroideryExtra
  const priceBreakdownBase = usesFixedFaixaBase ? faixaBasePrice : product.price

  const handleAdd = () => {
    if (!product.available) return
    const embroidery = (product.category === 'judogi' || product.category === 'faixas') ? selectedEmbroidery : undefined
    const gender = showGenderOption ? selectedGender : undefined
    const productToAdd = {
      ...product,
      embroideryOptions: product.embroidery,
      price: usesFixedFaixaBase ? faixaBasePrice : product.price,
    }
    addItem(productToAdd, selectedSize, embroidery, gender)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const specs = [
    { icon: Package, label: 'Categoria', value: categoryLabels[product.category] || product.category },
    ...(product.sizes ? [{ icon: Ruler, label: 'Tamanhos', value: product.sizes.join(', ') }] : []),
    ...(product.colors ? [{ icon: Palette, label: 'Cores', value: product.colors.join(', ') }] : []),
    ...(product.embroidery ? [{ icon: Scissors, label: 'Bordado', value: product.embroidery.join(', ') }] : []),
    { icon: Shield, label: 'Garantia', value: 'Autenticidade certificada' },
    { icon: Truck, label: 'Envio', value: 'Nacional e Internacional' },
  ]

  return (
    <div className="min-h-screen bg-shiro">
      {!product.available && (
        <div className="bg-orange-500/90 text-shiro text-center py-2.5 px-4 text-sm font-medium">
          Este produto está temporariamente indisponível.
        </div>
      )}
      <section className="relative bg-kuro pt-20 pb-3 overflow-hidden">
        <div className="absolute inset-0 seigaiha-pattern opacity-15" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-shiro/50 hover:text-shiro text-xs transition-colors"
          >
            <ChevronLeft size={14} />
            Voltar
          </motion.button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-2xl overflow-hidden shadow-xl bg-washi-dark flex items-center justify-center min-h-[280px] sm:min-h-[360px] lg:min-h-[420px] aspect-[4/5] max-h-[85vh]"
            >
              <img
                src={images[selectedImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-kuro/70 backdrop-blur-sm rounded-full px-2 py-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(i) }}
                      className={`w-2 h-2 rounded-full transition-all ${i === selectedImageIndex ? 'bg-shiro scale-125' : 'bg-shiro/50 hover:bg-shiro/80'}`}
                      aria-label={`Foto ${i + 1}`}
                    />
                  ))}
                </div>
              )}
              {product.badge && (
                <span className="absolute top-5 right-5 bg-aka text-shiro text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full">
                  {product.badge}
                </span>
              )}
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImageIndex ? 'border-kuro shadow-md' : 'border-washi-dark hover:border-kuro/50'}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-contain bg-washi-dark" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col justify-center py-4 pt-6 sm:pt-8 overflow-visible"
          >
            <p className="text-aka text-xs tracking-[0.3em] uppercase font-medium mb-2 pl-[0.2em]">
              {categoryLabels[product.category] || product.category}
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-kuro leading-tight mb-1 break-words">
              {product.name}
            </h1>
            <p className="text-sm font-jp text-kuro/25 tracking-wider mb-6">
              {product.nameJp || product.name_jp}
            </p>

            <p className="text-kuro/60 leading-relaxed mb-8">
              {product.description}
            </p>

            {product.sizes && (
              <div className="mb-6">
                <p className="text-xs font-medium text-kuro/50 mb-3 uppercase tracking-wider">
                  Tamanho
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        selectedSize === size
                          ? 'bg-kuro text-shiro shadow-md'
                          : 'bg-washi text-kuro/60 hover:bg-kuro/10 border border-washi-dark'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && (
              <div className="mb-6">
                <p className="text-xs font-medium text-kuro/50 mb-3 uppercase tracking-wider">
                  Cor
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        selectedColor === color
                          ? 'bg-kuro text-shiro shadow-md'
                          : 'bg-washi text-kuro/60 hover:bg-kuro/10 border border-washi-dark'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showGenderOption && (
              <div className="mb-6">
                <p className="text-xs font-medium text-kuro/50 mb-3 uppercase tracking-wider">
                  Gênero
                </p>
                <div className="flex gap-2 flex-wrap">
                  {genderOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedGender(opt)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 capitalize ${
                        selectedGender === opt
                          ? 'bg-kuro text-shiro shadow-md'
                          : 'bg-washi text-kuro/60 hover:bg-kuro/10 border border-washi-dark'
                      }`}
                    >
                      {genderLabel(opt)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(embroideryOpcoes.length > 0) && (
              <div className="mb-6">
                <p className="text-xs font-medium text-kuro/50 mb-3 uppercase tracking-wider">
                  Bordado
                </p>
                <div className="flex gap-2 flex-wrap">
                  {embroideryOpcoes.map((opt) => {
                    const optExtra = getEmbroideryExtra(product.category, opt, product.name, product)
                    const priceForOpt = usesFixedFaixaBase
                      ? faixaBasePrice + optExtra
                      : (product.category === 'faixas' ? product.price + optExtra : null)
                    const showPrice = product.category === 'faixas' || usesFixedFaixaBase
                    return (
                      <button
                        key={opt}
                        onClick={() => setSelectedEmbroidery(opt)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          selectedEmbroidery === opt
                            ? 'bg-aka text-shiro shadow-md'
                            : 'bg-washi text-kuro/60 hover:bg-kuro/10 border border-washi-dark'
                        }`}
                      >
                        {opt}
                        {showPrice && priceForOpt != null && <span className="ml-1.5 font-semibold">R$ {Number(priceForOpt).toFixed(2)}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-end gap-6 mb-8">
              <div>
                <p className="text-xs text-kuro/40 mb-1">Preço</p>
                <span className="text-4xl font-bold text-kuro">
                  R$ {finalPrice.toFixed(2)}
                </span>
                {((product.category === 'judogi' || product.category === 'faixas') && selectedEmbroidery && embroideryExtra > 0) && (
                  <p className="text-xs text-kuro/50 mt-1">
                    (base R$ {priceBreakdownBase.toFixed(2)} + bordado R$ {embroideryExtra.toFixed(2)})
                  </p>
                )}
              </div>
              {product.pixPrice ? (
                <p className="text-sm text-green-600 font-semibold pb-1">
                  ou R$ {(product.pixPrice + embroideryExtra).toFixed(2)} no PIX
                </p>
              ) : null}
            </div>

            {product.available ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                className={`flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg ${
                  added
                    ? 'bg-green-600 text-shiro shadow-green-600/20'
                    : 'bg-aka text-shiro hover:bg-aka-light shadow-aka/20'
                }`}
              >
                {added ? (
                  <>
                    <Check size={18} />
                    Adicionado ao carrinho!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Adicionar ao carrinho
                  </>
                )}
              </motion.button>
            ) : (
              <button
                disabled
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 rounded-xl text-sm font-medium bg-washi text-kuro/50 cursor-not-allowed border border-washi-dark"
              >
                Indisponível
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h3 className="text-sm font-semibold text-kuro mb-6 uppercase tracking-wider">
          Especificações
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {specs.map((spec) => {
            const Icon = spec.icon
            return (
              <div
                key={spec.label}
                className="flex items-start gap-3 p-4 rounded-xl bg-washi border border-washi-dark"
              >
                <Icon size={18} className="text-aka shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-kuro/40 uppercase tracking-wider">{spec.label}</p>
                  <p className="text-xs font-medium text-kuro mt-0.5">{spec.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="border-t border-washi-dark pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-aka text-xs tracking-[0.3em] uppercase font-medium">
                  Veja também
                </span>
                <h3 className="text-xl font-bold text-kuro mt-1">
                  Produtos Relacionados
                </h3>
              </div>
              <button
                onClick={() => navigate('/catalogo')}
                className="text-xs text-kuro/50 hover:text-aka transition-colors flex items-center gap-1"
              >
                Ver todos
                <ChevronLeft size={14} className="rotate-180" />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
