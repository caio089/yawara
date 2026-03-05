import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  ArrowLeft,
  Package,
} from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
    sendToWhatsApp,
  } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <section className="relative bg-kuro pt-28 pb-16 overflow-hidden">
          <div className="absolute inset-0 seigaiha-pattern opacity-15" />
          <div className="relative max-w-6xl mx-auto px-6">
            <span className="text-kin text-xs tracking-[0.3em] uppercase font-medium">
              Seu carrinho
            </span>
            <h1 className="font-jp text-4xl sm:text-5xl font-bold text-shiro mt-3 tracking-wide">
              Carrinho
            </h1>
          </div>
        </section>

        <section className="max-w-2xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-24 h-24 mx-auto mb-8 bg-washi-dark rounded-full flex items-center justify-center">
              <ShoppingBag size={40} className="text-kuro/20" />
            </div>
            <p className="font-jp text-4xl text-kuro/5 font-black mb-4 select-none">
              空っぽ
            </p>
            <h2 className="text-xl font-semibold text-kuro mb-2">
              Seu carrinho está vazio
            </h2>
            <p className="text-kuro/40 text-sm mb-8">
              Explore nosso catálogo e adicione produtos incríveis ao seu carrinho.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/catalogo')}
              className="bg-aka hover:bg-aka-light text-shiro px-8 py-3.5 rounded-full font-medium text-sm transition-all duration-300 shadow-lg shadow-aka/20"
            >
              Explorar Catálogo
            </motion.button>
          </motion.div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative bg-kuro pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 seigaiha-pattern opacity-15" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-kin text-xs tracking-[0.3em] uppercase font-medium">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'}
            </span>
            <h1 className="font-jp text-4xl sm:text-5xl font-bold text-shiro mt-3 tracking-wide">
              Carrinho
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-6 gap-4">
              <button
                onClick={() => navigate('/catalogo')}
                className="flex items-center gap-2 text-kuro/50 hover:text-kuro text-sm transition-colors min-h-[44px] py-2 touch-manipulation"
              >
                <ArrowLeft size={18} />
                Continuar comprando
              </button>
              <button
                onClick={clearCart}
                className="text-xs text-kuro/30 hover:text-aka transition-colors min-h-[44px] py-2 px-2 touch-manipulation"
              >
                Limpar carrinho
              </button>
            </div>

            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.id}-${item.size}`}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-shiro rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5"
                >
                  <div className="flex gap-4 sm:flex-1 sm:min-w-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-washi-dark">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-kuro truncate">
                        {item.name}
                      </h3>
                      <p className="text-[10px] font-jp text-kuro/25 tracking-wider mt-0.5 truncate">
                        {item.nameJp}
                      </p>
                      {item.size && (
                        <span className="inline-block mt-2 text-[10px] bg-washi px-2 py-1 rounded text-kuro/50">
                          Tam: {item.size}
                        </span>
                      )}
                      <div className="mt-2">
                        <p className="text-sm font-bold text-kuro">
                          R$ {item.price.toFixed(2)}
                        </p>
                        {item.pixPrice && (
                          <p className="text-[10px] text-green-600 font-medium">ou R$ {item.pixPrice.toFixed(2)} no PIX</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-3 border-t border-washi-dark pt-4 sm:border-0 sm:pt-0">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity - 1)
                        }
                        className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-washi flex items-center justify-center text-kuro/60 hover:bg-kuro/10 active:bg-kuro/20 transition-colors touch-manipulation"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 sm:w-8 text-center text-sm font-medium text-kuro min-w-[2rem]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity + 1)
                        }
                        className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-washi flex items-center justify-center text-kuro/60 hover:bg-kuro/10 active:bg-kuro/20 transition-colors touch-manipulation"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-kuro whitespace-nowrap">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.size)}
                        className="p-2.5 -m-2.5 text-kuro/30 hover:text-aka active:text-aka transition-colors touch-manipulation"
                        aria-label="Remover item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-shiro rounded-2xl p-6 sm:p-8 shadow-sm sticky top-20 sm:top-8"
            >
              <h2 className="font-semibold text-kuro mb-6 flex items-center gap-2">
                <Package size={18} className="text-aka" />
                Resumo do Pedido
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-kuro/50">
                  <span>Subtotal ({totalItems} itens)</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-kuro/50">
                  <span>Frete</span>
                  <span className="text-green-600 text-xs font-medium">A combinar</span>
                </div>

                <div className="h-px bg-washi-dark my-4" />

                <div className="flex justify-between text-lg font-bold text-kuro">
                  <span>Total</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={sendToWhatsApp}
                className="w-full mt-6 sm:mt-8 bg-green-600 hover:bg-green-700 text-shiro py-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-green-600/20 text-sm min-h-[52px] touch-manipulation"
              >
                <MessageCircle size={18} />
                Finalizar pelo WhatsApp
              </motion.button>

              <p className="text-[10px] text-kuro/30 text-center mt-4 leading-relaxed">
                Ao clicar, você será redirecionado para o WhatsApp com o resumo do seu
                pedido para finalizar a compra.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
