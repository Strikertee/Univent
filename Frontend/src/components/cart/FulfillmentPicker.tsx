import { Store, Bike } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { DELIVERY_FEE } from '../../types'
import { formatCurrency } from '../../lib/utils'

export function FulfillmentPicker() {
  const { cart, setFulfillment } = useCart()
  const hasProducts = cart.items.some(i => i.type === 'product')

  return (
    <div className="space-y-2">
      <div className="text-sm font-bold">How do you want your items?</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setFulfillment('pickup')}
          className={`border-2 rounded-xl p-3 text-left transition-all ${cart.fulfillment === 'pickup' ? 'border-primary-600 bg-primary-50 shadow-glow' : 'border-gray-200 hover:border-primary-300'}`}
        >
          <Store className="h-5 w-5 text-primary-700" />
          <div className="font-bold text-sm mt-1">Pick up</div>
          <div className="text-[11px] text-gray-500">Come anytime • Free</div>
        </button>
        <button
          type="button"
          onClick={() => setFulfillment('delivery')}
          className={`border-2 rounded-xl p-3 text-left transition-all ${cart.fulfillment === 'delivery' ? 'border-secondary-500 bg-secondary-50 shadow-glow-gold' : 'border-gray-200 hover:border-secondary-400'}`}
        >
          <Bike className="h-5 w-5 text-secondary-600" />
          <div className="font-bold text-sm mt-1">Deliver</div>
          <div className="text-[11px] text-gray-500">Under 15 mins on campus • {formatCurrency(DELIVERY_FEE)}</div>
        </button>
      </div>
      {!hasProducts && cart.fulfillment === 'delivery' && (
        <p className="text-[11px] text-gray-500">Delivery fee applies to bakery product orders only.</p>
      )}
    </div>
  )
}
