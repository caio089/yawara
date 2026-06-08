import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Eye } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { faixaUsesFixedBordadoBase, getFaixaBordadoBasePrice, getFaixaCardDisplayPrice } from '../utils/embroidery'
import { shouldShowGenderOption } from '../utils/productOptions'

export default function ProductCard({ product, index }) {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [selectedSize] = useState(product.sizes?.[0] || '')

  const displayPrice = getFaixaCardDisplayPrice(product)

  const handleAdd = (e) => {
    e.stopPropagation()
    if (!product.available) return
    if (shouldShowGenderOption(product)) {
      navigate(`/produto/${product.id}`)
      return
    }
    const toAdd = {
      ...product,
      embroideryOptions: product.embroidery,
      price: faixaUsesFixedBordadoBase(product.category, product.name, product.embroidery)
        ? getFaixaBordadoBasePrice(product)
        : product.price,
    }
    addItem(toAdd, selectedSize)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const goToDetail = () => navigate(`/produto/${product.id}`)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onClick={goToDetail}
      className={`group bg-shiro rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col cursor-pointer ${!product.available ? 'opacity-85' : ''}`}
    >
      <div className="relative overflow-hidden aspect-square bg-washi-dark">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${product.available ? 'group-hover:scale-110' : 'grayscale'}`}
          loading="lazy"
        />

        {!product.available && (
          <div className="absolute inset-0 bg-kuro/40 flex items-center justify-center">
            <span className="bg-kuro/90 text-shiro text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full">
              Indisponível
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-kuro/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {product.images?.length > 1 && (
          <span className="absolute top-2 left-2 bg-kuro/80 text-shiro text-[10px] font-medium px-2 py-0.5 rounded-full">
            +{product.images.length - 1} fotos
          </span>
        )}

        {product.badge && (
          <motion.span
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-4 right-4 bg-aka text-shiro text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
          >
            {product.badge}
          </motion.span>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-shiro/90 backdrop-blur-sm text-kuro px-5 py-2.5 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2">
          <Eye size={14} />
          Ver detalhes
        </div>
      </div>

      <div className="p-3 sm:p-5 flex flex-col flex-1 min-w-0 overflow-visible">
        <h3 className="font-medium text-xs sm:text-sm text-kuro leading-snug mb-1 break-words pl-[0.15em]">{product.name}</h3>

        <p className="text-[10px] font-jp text-kuro/30 tracking-wider mb-2 sm:mb-3">
          {product.nameJp || product.name_jp}
        </p>

        <div className="mt-auto pt-3 sm:pt-4 border-t border-washi-dark space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div>
            <span className="text-base sm:text-lg font-bold text-kuro block">
              R$ {displayPrice.toFixed(2)}
            </span>
            {product.pixPrice && (
              <span className="text-[10px] text-green-600 font-medium">ou R$ {product.pixPrice.toFixed(2)} no PIX</span>
            )}
          </div>

          {product.available ? (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleAdd}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-medium transition-all duration-300 ${
                added
                  ? 'bg-green-600 text-shiro'
                  : 'bg-kuro text-shiro hover:bg-aka'
              }`}
            >
              {added ? (
                <>
                  <Check size={12} className="sm:w-3.5 sm:h-3.5" />
                  Adicionado
                </>
              ) : (
                <>
                  <ShoppingCart size={12} className="sm:w-3.5 sm:h-3.5" />
                  Adicionar
                </>
              )}
            </motion.button>
          ) : (
            <span className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-medium bg-washi text-kuro/50 cursor-not-allowed">
              Indisponível
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
