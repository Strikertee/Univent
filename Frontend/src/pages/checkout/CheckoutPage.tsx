import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, ArrowRight, ShieldAlert } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useCart } from '../../context/CartContext'
import { useIsAdmin } from '../../components/auth/RequireDivision'
import { formatCurrency } from '../../lib/utils'
import { saveCheckoutDraft, getCheckoutDraft } from '../../store/shop'
import toast from 'react-hot-toast'

export function CheckoutPage() {
  const { cart } = useCart()
  const isAdmin = useIsAdmin()
  const navigate = useNavigate()
  const existing = getCheckoutDraft()
  const [form, setForm] = useState({
    firstName: existing?.firstName || '',
    lastName: existing?.lastName || '',
    email: existing?.email || '',
    phone: existing?.phone || '',
    address: existing?.address || '',
    city: existing?.city || 'Ibadan',
    state: existing?.state || 'Oyo',
  })

  const next = (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.items.length === 0) { toast.error('Your cart is empty'); return }
    saveCheckoutDraft(form)
    navigate('/payment')
  }

  if (isAdmin) {
    return (
      <div className="container-custom py-16 max-w-md mx-auto text-center">
        <Card className="cursor-default"><CardContent className="p-8">
          <ShieldAlert className="h-12 w-12 text-secondary-600 mx-auto" />
          <h1 className="font-heading text-xl font-bold mt-3">Checkout is for customers</h1>
          <p className="text-sm text-gray-500 mt-2">Admin accounts can't place orders.</p>
          <Link to="/admin" className="mt-5 inline-block"><Button>Go to Admin</Button></Link>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="container-custom py-10 grid lg:grid-cols-[1.4fr_1fr] gap-8">
      <Card className="cursor-default"><CardContent className="p-6">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary-700" /> Delivery Details
        </h1>
        <p className="text-sm text-gray-500 mt-1">Step 1 of 2 — where should we deliver? Payment comes next.</p>
        <form onSubmit={next} className="mt-5 grid sm:grid-cols-2 gap-4">
          <Input label="First name *" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
          <Input label="Last name *" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
          <Input label="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone *" placeholder="080..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
          <div className="sm:col-span-2"><Input label="Delivery address *" placeholder="Room 12, Block C, Independence Hall, UI" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required /></div>
          {cart.fulfillment === 'delivery' && (
            <div className="sm:col-span-2 bg-secondary-100 border border-secondary-300 rounded-xl p-3 text-sm">
              <b>Riders deliver in under 15 minutes</b> anywhere on campus — please describe your hall, block and room clearly above so they find you fast.
            </div>
          )}
          <Input label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
          <Input label="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
          <div className="sm:col-span-2"><Button className="w-full" size="lg">Continue to Payment <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
        </form>
      </CardContent></Card>
      <Card className="h-fit cursor-default"><CardContent className="p-6 text-sm space-y-2">
        <h3 className="font-bold">Order ({cart.totalItems} items)</h3>
        {cart.items.map(i => <div key={i.id} className="flex justify-between gap-2"><span className="truncate">{i.name} × {i.quantity}</span><b className="shrink-0">{formatCurrency(i.price * i.quantity)}</b></div>)}
        <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span className="text-primary-700">{formatCurrency(cart.total)}</span></div>
      </CardContent></Card>
    </div>
  )
}
