import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { Cart, CartItem, DELIVERY_FEE } from '../types'
import { api, hasRealToken } from '../services/api'

export type Fulfillment = 'pickup' | 'delivery'

interface CartContextType {
  cart: Cart
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  /** Wipe locally WITHOUT syncing (logout) — the server copy stays for other devices. */
  clearLocalCart: () => void
  setFulfillment: (f: Fulfillment) => void
  getItemCount: (type: CartItem['type'], id: string) => number
  isInCart: (type: CartItem['type'], id: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const FULFILLMENT_KEY = 'univent_fulfillment'
export const CART_UPDATED_KEY = 'univent_cart_updated'

/** Allows non-React code (sync layer) to replace the cart, e.g. after a server pull. */
let externalReplacer: ((cart: Cart, updatedAt: string) => void) | null = null
export function _registerCartReplacer(fn: (cart: Cart, updatedAt: string) => void) {
  externalReplacer = fn
}
export function replaceCartState(cart: Cart, updatedAt: string) {
  externalReplacer?.(cart, updatedAt)
}

/** Pushes the cart to the account (roaming) — no-op without a real login token. */
async function pushCartToServer(cart: Cart, updatedAt: string): Promise<void> {
  if (!hasRealToken()) return
  try {
    await api.getClient().put('/cart', {
      items: cart.items.map(i => ({
        id: i.id, type: i.type, productId: i.productId, roomId: i.roomId,
        facilityId: i.facilityId, quantity: i.quantity, price: i.price,
        name: i.name, image: i.image, checkIn: i.checkIn, checkOut: i.checkOut,
        guests: i.guests,
      })),
      fulfillment: cart.fulfillment,
      updatedAt,
    }, { timeout: 15000 })
  } catch (error) {
    console.warn('Cart sync failed (kept locally):', error)
  }
}

const initialCart: Cart = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  fulfillment: 'pickup',
}

function calculateTotals(items: CartItem[], fulfillment: Fulfillment): Omit<Cart, 'items' | 'fulfillment'> {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = 0 // No tax applied
  // Delivery fee applies only to product orders collected for delivery (₦550 flat)
  const hasProducts = items.some(i => i.type === 'product')
  const shipping = fulfillment === 'delivery' && hasProducts ? DELIVERY_FEE : 0
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = subtotal + tax + shipping

  return {
    totalItems,
    subtotal,
    tax,
    shipping,
    discount: 0,
    total,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCart)
  const [isOpen, setIsOpen] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<string>(() => localStorage.getItem(CART_UPDATED_KEY) || '')
  const skipPush = useRef(true) // skip the very first (mount) effect run
  const suppressPush = useRef(false) // pulls / logout wipes must not echo back up
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load cart + fulfillment choice from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('univent_cart')
    const storedFulfillment = localStorage.getItem(FULFILLMENT_KEY) as Fulfillment | null
    const fulfillment: Fulfillment = storedFulfillment === 'delivery' ? 'delivery' : 'pickup'
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart)
        const totals = calculateTotals(parsedCart.items || [], fulfillment)
        setCart({ ...parsedCart, fulfillment, ...totals })
      } catch (error) {
        console.error('Failed to parse cart:', error)
      }
    } else {
      setCart({ ...initialCart, fulfillment })
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('univent_cart', JSON.stringify(cart))
    localStorage.setItem(CART_UPDATED_KEY, updatedAt)
  }, [cart, updatedAt])

  const stamp = useCallback(() => {
    const ts = new Date().toISOString()
    setUpdatedAt(ts)
    return ts
  }, [])

  // Push cart to the account (roaming) when logged in with a real token.
  useEffect(() => {
    if (skipPush.current) {
      skipPush.current = false
      return
    }
    if (suppressPush.current) {
      suppressPush.current = false
      return
    }
    const token = localStorage.getItem('auth_token')
    if (!token || token.startsWith('demo-')) return
    if (pushTimer.current) clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(() => {
      pushCartToServer(cart, updatedAt).catch(() => {})
    }, 1500)
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, updatedAt])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), [])

  const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
    setCart(prevCart => {
      const existingIndex = prevCart.items.findIndex(
        item => item.type === newItem.type &&
        ((item.type === 'product' && item.productId === newItem.productId) ||
         (item.type === 'room' && item.roomId === newItem.roomId) ||
         (item.type === 'facility' && item.facilityId === newItem.facilityId))
      )

      let updatedItems: CartItem[]

      if (existingIndex >= 0) {
        // Update quantity of existing item
        updatedItems = prevCart.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      } else {
        // Add new item
        updatedItems = [
          ...prevCart.items,
          { ...newItem, id: `${newItem.type}_${newItem.productId || newItem.roomId || newItem.facilityId}_${Date.now()}` }
        ]
      }

      const totals = calculateTotals(updatedItems, prevCart.fulfillment)
      return { ...prevCart, items: updatedItems, ...totals }
    })
    stamp()
    // Auto-open cart when adding items
    setIsOpen(true)
  }, [stamp])

  const removeItem = useCallback((id: string) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.id !== id)
      const totals = calculateTotals(updatedItems, prevCart.fulfillment)
      return { ...prevCart, items: updatedItems, ...totals }
    })
    stamp()
  }, [stamp])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
      const totals = calculateTotals(updatedItems, prevCart.fulfillment)
      return { ...prevCart, items: updatedItems, ...totals }
    })
    stamp()
  }, [removeItem, stamp])

  const clearCart = useCallback(() => {
    setCart(prev => ({ ...initialCart, fulfillment: prev.fulfillment }))
    stamp()
  }, [stamp])

  /** Wipe locally WITHOUT syncing (logout) — the server copy stays for other devices. */
  const clearLocalCart = useCallback(() => {
    suppressPush.current = true
    setCart({ ...initialCart })
    setUpdatedAt('')
    localStorage.removeItem('univent_cart')
    localStorage.removeItem(CART_UPDATED_KEY)
    setIsOpen(false)
  }, [])

  const setFulfillment = useCallback((f: Fulfillment) => {
    localStorage.setItem(FULFILLMENT_KEY, f)
    setCart(prevCart => {
      const totals = calculateTotals(prevCart.items, f)
      return { ...prevCart, fulfillment: f, ...totals }
    })
    stamp()
  }, [stamp])

  // Register the external replacer used by the sync layer after a server pull.
  useEffect(() => {
    _registerCartReplacer((c: Cart, ts: string) => {
      suppressPush.current = true
      const totals = calculateTotals(c.items || [], c.fulfillment || 'pickup')
      setCart({ ...c, ...totals })
      setUpdatedAt(ts)
    })
    return () => _registerCartReplacer(() => {})
  }, [])

  const getItemCount = useCallback((type: CartItem['type'], id: string) => {
    const item = cart.items.find(
      i => i.type === type &&
      ((type === 'product' && i.productId === id) ||
       (type === 'room' && i.roomId === id) ||
       (type === 'facility' && i.facilityId === id))
    )
    return item?.quantity || 0
  }, [cart.items])

  const isInCart = useCallback((type: CartItem['type'], id: string) => {
    return cart.items.some(
      i => i.type === type &&
      ((type === 'product' && i.productId === id) ||
       (type === 'room' && i.roomId === id) ||
       (type === 'facility' && i.facilityId === id))
    )
  }, [cart.items])

  return (
    <CartContext.Provider value={{
      cart,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      clearLocalCart,
      setFulfillment,
      getItemCount,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
