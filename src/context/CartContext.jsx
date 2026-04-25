import { createContext, useContext, useReducer } from 'react'
import { getEmbroideryExtra, getFaixaCartUnitBasePrice } from '../utils/embroidery'

const CartContext = createContext()

function itemKey(item) {
  return `${item.id}|${item.size ?? ''}|${item.embroidery ?? ''}|${item.gender ?? ''}`
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const key = itemKey(action.payload)
      const existing = state.items.find((item) => itemKey(item) === key)
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            itemKey(item) === key ? { ...item, quantity: item.quantity + 1 } : item
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      }
    }
    case 'REMOVE_ITEM': {
      const { id, size, embroidery, gender } = action.payload
      return {
        ...state,
        items: state.items.filter(
          (item) => !(item.id === id && (item.size ?? '') === (size ?? '') && (item.embroidery ?? '') === (embroidery ?? '') && (item.gender ?? '') === (gender ?? ''))
        ),
      }
    }
    case 'UPDATE_QUANTITY': {
      const { id, size, embroidery, gender, quantity } = action.payload
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === id && (item.size ?? '') === (size ?? '') && (item.embroidery ?? '') === (embroidery ?? '') && (item.gender ?? '') === (gender ?? '')
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          )
          .filter((item) => item.quantity > 0),
      }
    }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  const addItem = (product, size = '', embroidery = '', gender = '') => {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, size, embroidery: embroidery || undefined, gender: gender || undefined } })
  }

  const removeItem = (id, size = '', embroidery = '', gender = '') => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, size, embroidery: embroidery || '', gender: gender || '' } })
  }

  const updateQuantity = (id, size, quantity, embroidery = '', gender = '') => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, size, embroidery: embroidery || '', gender: gender || '', quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = state.items.reduce((sum, item) => {
    const unitPrice = item.price + getEmbroideryExtra(item.category, item.embroidery, item.name)
    return sum + unitPrice * item.quantity
  }, 0)

  const sendToWhatsApp = () => {
    const hour = new Date().getHours()
    const phoneNumber = (hour >= 8 && hour < 18) ? '5511972224780' : '818036448596'
    let message = '🥋 *YAWARA — Pedido via Site*\n\n'
    message += '━━━━━━━━━━━━━━━━━━━━\n'

    state.items.forEach((item, index) => {
      const embroideryExtra = getEmbroideryExtra(item.category, item.embroidery, item.name)
      const unitPrice = getFaixaCartUnitBasePrice(item) + embroideryExtra
      message += `\n*${index + 1}. ${item.name}*\n`
      if (item.size) message += `   Tamanho: ${item.size}\n`
      if (item.gender) message += `   Gênero: ${item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}\n`
      if (item.embroidery) message += `   Bordado: ${item.embroidery}${embroideryExtra > 0 ? ` (+R$ ${embroideryExtra.toFixed(2)})` : ''}\n`
      message += `   Qtd: ${item.quantity} × R$ ${unitPrice.toFixed(2)}\n`
      message += `   Subtotal: R$ ${(unitPrice * item.quantity).toFixed(2)}\n`
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
