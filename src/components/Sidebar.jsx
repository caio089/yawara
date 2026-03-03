import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  Info,
  Users,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { useCart } from '../context/CartContext'

const navItems = [
  { path: '/', label: 'Home', labelJp: 'ホーム', icon: Home },
  { path: '/catalogo', label: 'Catálogo', labelJp: 'カタログ', icon: ShoppingBag },
  { path: '/carrinho', label: 'Carrinho', labelJp: 'カート', icon: ShoppingCart },
  { path: '/parceiros', label: 'Parceiros', labelJp: 'パートナー', icon: Users },
  { path: '/sobre', label: 'Sobre Nós', labelJp: '私たちについて', icon: Info },
]

const sidebarVariants = {
  open: {
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30, staggerChildren: 0.07, delayChildren: 0.15 },
  },
  closed: {
    x: '-100%',
    transition: { type: 'spring', stiffness: 300, damping: 30, staggerChildren: 0.04, staggerDirection: -1 },
  },
}

const itemVariants = {
  open: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  closed: { x: -40, opacity: 0, transition: { duration: 0.2 } },
}

const overlayVariants = {
  open: { opacity: 1, transition: { duration: 0.3 } },
  closed: { opacity: 0, transition: { duration: 0.2 } },
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { totalItems } = useCart()
  const location = useLocation()

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 z-50 p-3 bg-kuro/90 backdrop-blur-sm text-shiro rounded-full shadow-lg hover:bg-aka transition-all duration-300 group"
        aria-label="Abrir menu"
      >
        <Menu size={22} className="group-hover:rotate-180 transition-transform duration-500" />
      </button>

      {totalItems > 0 && (
        <NavLink to="/carrinho">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="fixed top-6 right-6 z-50 p-3 bg-aka text-shiro rounded-full shadow-lg hover:bg-aka-light transition-colors cursor-pointer"
          >
            <ShoppingCart size={22} />
            <span className="absolute -top-1 -right-1 bg-kin text-kuro text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          </motion.div>
        </NavLink>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-kuro/60 backdrop-blur-sm z-50"
            />

            <motion.nav
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 left-0 h-full w-80 bg-kuro z-50 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="absolute inset-0 seigaiha-pattern opacity-30 pointer-events-none" />

              <div className="relative p-8 flex items-center justify-between border-b border-shiro/10">
                <div>
                  <h2 className="text-2xl font-bold text-shiro font-jp tracking-wider">
                    YAWARA
                  </h2>
                  <p className="text-kin text-xs mt-1 font-jp tracking-widest">柔JAPAN</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-shiro/60 hover:text-shiro hover:bg-shiro/10 rounded-full transition-all duration-300"
                  aria-label="Fechar menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative flex-1 py-8 px-4">
                <motion.div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                      <motion.div key={item.path} variants={itemVariants}>
                        <NavLink
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={`group flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 ${
                            isActive
                              ? 'bg-aka text-shiro shadow-lg shadow-aka/30'
                              : 'text-shiro/70 hover:bg-shiro/5 hover:text-shiro'
                          }`}
                        >
                          <div
                            className={`p-2.5 rounded-lg transition-all duration-300 ${
                              isActive
                                ? 'bg-shiro/20'
                                : 'bg-shiro/5 group-hover:bg-shiro/10'
                            }`}
                          >
                            <Icon size={20} />
                            {item.path === '/carrinho' && totalItems > 0 && (
                              <span className="absolute -top-1 -right-1 bg-kin text-kuro text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {totalItems}
                              </span>
                            )}
                          </div>

                          <div className="flex-1">
                            <span className="font-medium text-sm block">{item.label}</span>
                            <span
                              className={`text-[10px] font-jp tracking-wider ${
                                isActive ? 'text-shiro/60' : 'text-shiro/30'
                              }`}
                            >
                              {item.labelJp}
                            </span>
                          </div>

                          <ChevronRight
                            size={16}
                            className={`transition-all duration-300 ${
                              isActive
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'
                            }`}
                          />
                        </NavLink>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </div>

              <motion.div
                variants={itemVariants}
                className="relative p-6 border-t border-shiro/10"
              >
                <div className="text-center">
                  <p className="text-shiro/30 text-[10px] font-jp tracking-[0.3em]">
                    精力善用 — 自他共栄
                  </p>
                  <p className="text-shiro/20 text-[9px] mt-2 tracking-wider">
                    Máximo de eficiência — Prosperidade mútua
                  </p>
                  <p className="text-shiro/15 text-[9px] mt-4 tracking-wide">
                    Site desenvolvido por Caio Campos{' '}
                    <a
                      href="https://instagram.com/caio_campos66"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-shiro/30 hover:text-kin transition-colors"
                    >
                      @Caio_campos66
                    </a>
                  </p>
                </div>
              </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
