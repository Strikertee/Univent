import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Cart, CartItem, DELIVERY_FEE } from '../types'

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
  setFulfillment: (f: Fulfillment) => void
  getItemCount: (type: CartItem['type'], id: string) => number
  isInCart: (type: CartItem['type'], id: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const FULFILLMENT_KEY = 'univent_fulfillment'

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
  }, [cart])

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
    // Auto-open cart when adding items
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.id !== id)
      const totals = calculateTotals(updatedItems, prevCart.fulfillment)
      return { ...prevCart, items: updatedItems, ...totals }
    })
  }, [])

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
  }, [removeItem])

  const clearCart = useCallback(() => {
    setCart(prev => ({ ...initialCart, fulfillment: prev.fulfillment }))
  }, [])

  const setFulfillment = useCallback((f: Fulfillment) => {
    localStorage.setItem(FULFILLMENT_KEY, f)
    setCart(prevCart => {
      const totals = calculateTotals(prevCart.items, f)
      return { ...prevCart, fulfillment: f, ...totals }
    })
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