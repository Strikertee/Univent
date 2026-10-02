import { Link, Navigate } from 'react-router-dom'
import {
  Package, BedDouble, User, ShoppingCart, Plus, Minus,
  Trash2, ArrowRight, Store, Hotel, Croissant, Fuel, Printer, HeartPulse, Briefcase, Wallet,
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useShopData } from '../../store/shop'
import { useDivisions } from '../../store/divisions'
import { useCatalog } from '../../store/catalog'
import { FulfillmentPicker } from '../../components/cart/FulfillmentPicker'
import { formatCurrency } from '../../lib/utils'
import toast from 'react-hot-toast'

const divisionIcons: Record<string, any> = {
  'bakery-fastfood': Croissant,
  'petrol-station': Fuel,
  'printing-press': Printer,
  'health-safety': HeartPulse,
  'consultancy': Briefcase,
  'hotels': Hotel,
}

function divisionLink(slug: string): string {
  if (slug === 'hotels') return '/division/hotels'
  if (slug === 'bakery-fastfood') return '/division/bakery-fastfood/products'
  return `/division/${slug}`
}

export function Dashboard() {
  const { user } = useAuth()
  const { cart, addItem, updateQuantity, removeItem } = useCart()
  const { products: bakeryProducts } = useCatalog()
  const divisions = useDivisions()
  const { orders, bookings } = useShopData(user?.id)
  const isAdmin = user?.role === 'super_admin' || user?.role === 'division_admin'
  if (isAdmin) return <Navigate to="/admin" replace />

  const qtyInCart = (productId: string) => cart.items.find(i => i.type === 'product' && i.productId === productId)?.quantity || 0
  const cartItemId = (productId: string) => cart.items.find(i => i.type === 'product' && i.productId === productId)?.id

  const inc = (id: string, name: string, price: number, image: string, stock: number) => {
    if (qtyInCart(id) >= stock) { toast.error(`Only ${stock} available today`); return }
    addItem({ type: 'product', productId: id, quantity: 1, price, name, image })
  }
  const dec = (productId: string) => {
    const cid = cartItemId(productId)
    if (!cid) return
    updateQuantity(cid, qtyInCart(productId) - 1)
  }

  return (
    <div className="container-custom py-10">
      <h1 className="font-heading text-3xl font-bold">Hello, {user?.firstName || 'Guest'} 👋</h1>
      <p className="text-gray-500">Pick a division to shop or book — everything lives in one cart.</p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Package, label: 'My Orders', value: orders.length, to: '/orders', color: 'bg-primary-700' },
          { icon: BedDouble, label: 'My Bookings', value: bookings.length, to: '/bookings', color: 'bg-primary-950' },
          { icon: ShoppingCart, label: 'Cart Items', value: cart.totalItems, to: '/cart', color: 'bg-secondary-500' },
          { icon: User, label: 'Profile', value: '→', to: '/profile', color: 'bg-black' },
        ].map(s => (
          <Link key={s.label} to={s.to}>
            <Card><CardContent className="p-5 flex items-center gap-3">
              <span className={`h-11 w-11 rounded-xl ${s.color} text-white flex items-center justify-center shrink-0`}><s.icon className="h-5 w-5" /></span>
              <span className="min-w-0"><span className="text-2xl font-extrabold block leading-none break-words">{s.value}</span><span className="text-xs text-gray-500">{s.label}</span></span>
            </CardContent></Card>
          </Link>
        ))}
      </div>

      {/* Divisions */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold flex items-center gap-2"><Store className="h-5 w-5 text-primary-700" /> Choose a Division</h2>
        <Link to="/divisions" className="text-sm font-bold text-primary-700 inline-flex items-center">All <ArrowRight className="ml-1 h-4 w-4" /></Link>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {divisions.map(d => {
          const Icon = divisionIcons[d.slug] || Store
          return (
            <Link key={d.id} to={divisionLink(d.slug)}>
              <Card><CardContent className="p-5 flex items-center gap-4">
                <span className="text-3xl bg-secondary-100 rounded-xl h-14 w-14 flex items-center justify-center shrink-0">{d.icon}</span>
                <span className="flex-1">
                  <span className="font-bold text-sm flex items-center gap-2"><Icon className="h-4 w-4 text-primary-700" />{d.name}</span>
                  <span className="text-xs text-gray-500 block mt-0.5">{d.shortDescription}</span>
                  <span className="text-xs font-bold text-secondary-600 mt-1 block">
                    {d.slug === 'hotels' ? 'View rooms & facilities →' : d.slug === 'bakery-fastfood' ? 'Shop & fill your cart →' : 'Open division →'}
                  </span>
                </span>
              </CardContent></Card>
            </Link>
          )
        })}
      </div>

      {/* Bakery quick shop + cart editor */}
      <div className="mt-10 grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <Card className="cursor-default"><CardContent className="p-6">
          <h2 className="font-heading text-xl font-bold flex items-center gap-2"><Croissant className="h-5 w-5 text-secondary-600" /> Bakery Quick Shop</h2>
          <p className="text-xs text-gray-500 mt-1">Tap + to add, − to reduce. Your cart updates instantly.</p>
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto pr-1">
            {bakeryProducts.slice(0, 8).map(p => {
              const q = qtyInCart(p.id)
              return (
                <div key={p.id} className="flex items-center gap-3 border rounded-xl p-2.5">
                  <img src={p.images[0]} alt={p.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{p.name}</div>
                    <div className="text-xs text-primary-700 font-bold truncate">{formatCurrency(p.price)} • {p.stock > 0 ? <span className="text-gray-500 font-normal">{p.stock} available</span> : <span className="text-secondary-600 font-semibold">In the making</span>}</div>
                  </div>
                  {p.stock <= 0 ? (
                    <Badge className="bg-primary-950 text-secondary-300 border-0 text-[10px] shrink-0">In the making</Badge>
                  ) : q === 0 ? (
                    <Button size="sm" className="shrink-0" onClick={() => { inc(p.id, p.name, p.price, p.images[0], p.stock); toast.success(`${p.name} added`) }}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => dec(p.id)}><Minus className="h-3.5 w-3.5" /></Button>
                      <b className="w-5 text-center shrink-0">{q}</b>
                      <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => inc(p.id, p.name, p.price, p.images[0], p.stock)}><Plus className="h-3.5 w-3.5" /></Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <Link to="/division/bakery-fastfood/products" className="mt-3 inline-block"><Button variant="outline" size="sm">See all bread & snacks <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
        </CardContent></Card>

        <Card className="cursor-default h-fit lg:sticky lg:top-24"><CardContent className="p-6">
          <h2 className="font-heading text-xl font-bold flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary-700" /> My Cart</h2>
          {cart.items.length === 0 ? (
            <p className="text-sm text-gray-500 mt-3">Cart is empty. Add bakery items above to get started.</p>
          ) : (
            <>
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                {cart.items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm border rounded-lg p-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{item.name}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(item.price)} each</div>
                    </div>
                    <Button size="icon" variant="outline" className="h-7 w-7 shrink-0" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                    <b className="w-4 text-center text-sm shrink-0">{item.quantity}</b>
                    <Button size="icon" variant="outline" className="h-7 w-7 shrink-0" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-red-500" onClick={() => removeItem(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1 text-sm border-t pt-3">
                <FulfillmentPicker />
                <div className="flex justify-between"><span>Subtotal</span><b>{formatCurrency(cart.subtotal)}</b></div>
                <div className="flex justify-between"><span>{cart.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}</span><b>{cart.shipping === 0 ? 'Free' : formatCurrency(cart.shipping)}</b></div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary-700">{formatCurrency(cart.total)}</span></div>
              </div>
              <Link to="/checkout" className="mt-3 block"><Button className="w-full"><Wallet className="h-4 w-4 mr-2" /> Proceed to Payment</Button></Link>
            </>
          )}
          <div className="mt-3 flex items-center justify-between">
            <Badge variant="secondary">{orders.length} orders</Badge>
            <Badge variant="outline">{bookings.length} bookings</Badge>
          </div>
        </CardContent></Card>
      </div>
    </div>
  )
}
