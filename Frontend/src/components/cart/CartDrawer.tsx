import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, Package, Bed, Dumbbell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { FulfillmentPicker } from './FulfillmentPicker'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../lib/utils'

export function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const isAdmin = user?.role === 'super_admin' || user?.role === 'division_admin'

  if (isAdmin) return null
  if (!isOpen && cart.totalItems === 0) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Cart Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white shadow-xl flex flex-col"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-heading font-semibold text-lg text-gray-900">Shopping Cart</h2>
                <Button variant="ghost" size="icon" onClick={closeCart} aria-label="Close cart">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Package className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 mb-6">Add some products or book a room to get started</p>
                    <Button onClick={closeCart} className="w-full sm:w-auto">
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-3"
                      >
                        <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              {item.type === 'product' && <Package className="h-8 w-8 text-gray-400" />}
                              {item.type === 'room' && <Bed className="h-8 w-8 text-gray-400" />}
                              {item.type === 'facility' && <Dumbbell className="h-8 w-8 text-gray-400" />}
                            </div>
                          )}
                          <Badge
                            variant="outline"
                            className="absolute top-1 left-1 text-xs"
                          >
                            {item.type === 'product' ? 'Product' : item.type === 'room' ? 'Room' : 'Facility'}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                          <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
                          {item.checkIn && item.checkOut && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(item.checkIn).toLocaleDateString()} - {new Date(item.checkOut).toLocaleDateString()}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-auto h-8 w-8 text-red-500 hover:bg-red-50"
                              onClick={() => removeItem(item.id)}
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              {cart.items.length > 0 && (
                <div className="border-t border-gray-100 p-4 space-y-3">
                  <FulfillmentPicker />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{cart.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}</span>
                    <span className="font-medium">
                      {cart.shipping === 0 ? 'Free' : formatCurrency(cart.shipping)}
                    </span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-sm text-primary-700">
                      <span>Discount</span>
                      <span>-{formatCurrency(cart.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold border-t border-gray-100 pt-3">
                    <span>Total</span>
                    <span>{formatCurrency(cart.total)}</span>
                  </div>

                  <Link to="/checkout" onClick={closeCart}>
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full" onClick={closeCart}>
                      Keep Shopping
                    </Button>
                    <Link to="/cart" onClick={closeCart}>
                      <Button variant="outline" className="w-full">
                        Full Cart
                      </Button>
                    </Link>
                  </div>

                  <Button variant="ghost" className="w-full text-red-500" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}