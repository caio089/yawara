import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Eye } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product, index }) {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [selectedSize] = useState(product.sizes?.[0] || '')

  const handleAdd = (e) => {
    e.stopPropagation()
    addItem(product, selectedSize)
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
      className="group bg-shiro rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col cursor-pointer"
    >
      <div className="relative overflow-hidden aspect-square bg-washi-dark">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-kuro/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-medium text-sm text-kuro leading-snug">{product.name}</h3>
        </div>

        <p className="text-[10px] font-jp text-kuro/30 tracking-wider mb-3">
          {product.nameJp || product.name_jp}
        </p>

        <p className="text-xs text-kuro/50 leading-relaxed mb-4 line-clamp-2 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-washi-dark">
          <div>
            <span className="text-lg font-bold text-kuro">
              R$ {product.price.toFixed(2)}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleAdd}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
              added
                ? 'bg-green-600 text-shiro'
                : 'bg-kuro text-shiro hover:bg-aka'
            }`}
          >
            {added ? (
              <>
                <Check size={14} />
                Adicionado
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                Adicionar
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
