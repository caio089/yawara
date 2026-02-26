import { createContext, useContext, useReducer } from 'react'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (item) => item.id === action.payload.id && item.size === action.payload.size
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === existing.id && item.size === existing.size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          (item) => !(item.id === action.payload.id && item.size === action.payload.size)
        ),
      }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id && item.size === action.payload.size
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter((item) => item.quantity > 0),
      }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  const addItem = (product, size = '') => {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, size } })
  }

  const removeItem = (id, size = '') => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, size } })
  }

  const updateQuantity = (id, size, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, size, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const sendToWhatsApp = () => {
    const phoneNumber = '5511999999999'
    let message = '🥋 *YAWARA — Pedido via Site*\n\n'
    message += '━━━━━━━━━━━━━━━━━━━━\n'

    state.items.forEach((item, index) => {
      message += `\n*${index + 1}. ${item.name}*\n`
      if (item.size) message += `   Tamanho: ${item.size}\n`
      message += `   Qtd: ${item.quantity} × R$ ${item.price.toFixed(2)}\n`
      message += `   Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n`
    })

    message += '\n━━━━━━━━━━━━━━━━━━━━\n'
    message += `\n💰 *TOTAL: R$ ${totalPrice.toFixed(2)}*\n`
    message += '\n━━━━━━━━━━━━━━━━━━━━\n'
    message += '\nOlá! Gostaria de finalizar este pedido. 🙏'

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank')
  }

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        sendToWhatsApp,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
