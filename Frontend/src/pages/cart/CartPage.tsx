import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus, ShieldAlert } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { FulfillmentPicker } from '../../components/cart/FulfillmentPicker'
import { useCart } from '../../context/CartContext'
import { useIsAdmin } from '../../components/auth/RequireDivision'
import { formatCurrency } from '../../lib/utils'

export function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart()
  const isAdmin = useIsAdmin()
  if (isAdmin) {
    return (
      <div className="container-custom py-16 max-w-md mx-auto text-center">
        <Card className="cursor-default"><CardContent className="p-8">
          <ShieldAlert className="h-12 w-12 text-secondary-600 mx-auto" />
          <h1 className="font-heading text-xl font-bold mt-3">Carts are for customers</h1>
          <p className="text-sm text-gray-500 mt-2">Admin accounts can't shop. Manage the marketplace from your admin panel instead.</p>
          <Link to="/admin" className="mt-5 inline-block"><Button>Go to Admin</Button></Link>
        </CardContent></Card>
      </div>
    )
  }
  if (cart.items.length === 0) return <div className="container-custom py-20 text-center"><h1 className="text-2xl font-bold">Your cart is empty</h1><Link to="/" className="mt-4 inline-block"><Button>Continue shopping</Button></Link></div>
  return (
    <div className="container-custom py-10 grid lg:grid-cols-[1.5fr_1fr] gap-8">
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-bold">Cart ({cart.totalItems})</h1>
        {cart.items.map(item => (
          <Card key={item.id}><CardContent className="p-4 flex gap-4">
            <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
            <div className="flex-1"><div className="font-bold text-sm">{item.name}</div><div className="text-xs text-gray-500">{formatCurrency(item.price)} each</div>
              <div className="mt-2 flex items-center gap-2"><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button><b>{item.quantity}</b><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="text-red-500 ml-auto" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button></div>
            </div>
            <div className="font-bold">{formatCurrency(item.price * item.quantity)}</div>
          </CardContent></Card>
        ))}
        <Button variant="outline" onClick={clearCart}>Clear cart</Button>
      </div>
      <Card className="h-fit lg:sticky lg:top-24"><CardContent className="p-6 space-y-2 text-sm">
        <h3 className="font-bold text-base">Summary</h3>
        <FulfillmentPicker />
        <div className="flex justify-between"><span>Subtotal</span><b>{formatCurrency(cart.subtotal)}</b></div>
        <div className="flex justify-between"><span>{cart.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}</span><b>{cart.shipping === 0 ? 'Free' : formatCurrency(cart.shipping)}</b></div>
        <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{formatCurrency(cart.total)}</span></div>
        <Link to="/checkout"><Button className="w-full mt-3" size="lg">Checkout</Button></Link>
      </CardContent></Card>
    </div>
  )
}
