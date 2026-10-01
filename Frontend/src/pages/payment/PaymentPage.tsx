import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Landmark, CheckCircle2, Check } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { ReceiptUpload } from '../../components/payment/ReceiptUpload'
import { VENTURES_ACCOUNT } from '../../data/account'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useIsAdmin } from '../../components/auth/RequireDivision'
import { formatCurrency } from '../../lib/utils'
import { getCheckoutDraft, saveOrder, makeRef } from '../../store/shop'
import { getProducts, updateProduct } from '../../store/catalog'
import toast from 'react-hot-toast'

export function PaymentPage() {
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const isAdmin = useIsAdmin()
  const draft = getCheckoutDraft()
  const [receipt, setReceipt] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [paidRef, setPaidRef] = useState<string | null>(null)
  const [wasDelivery, setWasDelivery] = useState(false)

  if (isAdmin) {
    return (
      <div className="container-custom py-16 max-w-md mx-auto text-center">
        <Card className="cursor-default"><CardContent className="p-8">
          <h1 className="font-heading text-xl font-bold mt-3">Payments are for customers</h1>
          <p className="text-sm text-gray-500 mt-2">Admin accounts can't pay for orders.</p>
          <Link to="/admin" className="mt-5 inline-block"><Button>Go to Admin</Button></Link>
        </CardContent></Card>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="container-custom py-20 text-center max-w-md mx-auto">
        <h1 className="font-heading text-2xl font-bold">No delivery details yet</h1>
        <p className="text-gray-500 mt-2">Please enter your delivery address first.</p>
        <Link to="/checkout" className="mt-5 inline-block"><Button>Back to Checkout</Button></Link>
      </div>
    )
  }

  if (cart.items.length === 0 && !paidRef) {
    return (
      <div className="container-custom py-20 text-center max-w-md mx-auto">
        <h1 className="font-heading text-2xl font-bold">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">Add bakery items or book a room to continue.</p>
        <Link to="/division/bakery-fastfood/products" className="mt-5 inline-block"><Button>Shop Bakery</Button></Link>
      </div>
    )
  }

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(VENTURES_ACCOUNT.accountNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Copy failed — type the number manually')
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!receipt) { toast.error('Please upload your transfer receipt first'); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))
    const ref = makeRef('UI')
    const catalog = getProducts()
    const divs = new Set(
      cart.items.map(i => {
        if (i.type === 'room') return 'div-hotels'
        if (i.type === 'product') return catalog.find(p => p.id === i.productId)?.divisionId || 'div-bakery'
        return 'div-hotels'
      })
    )
    saveOrder({
      ref,
      userId: user?.id || 'guest',
      userEmail: user?.email || draft.email,
      items: cart.items,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      total: cart.total,
      method: 'transfer',
      fulfillment: cart.fulfillment,
      divisionId: divs.size === 1 ? [...divs][0] : 'multiple',
      receipt,
      paymentStatus: 'awaiting_confirmation',
      firstName: draft.firstName,
      lastName: draft.lastName,
      email: draft.email,
      phone: draft.phone,
      address: draft.address,
      city: draft.city,
      state: draft.state,
    })
    cart.items.forEach(i => {
      if (i.type === 'product' && i.productId) {
        const p = catalog.find(prod => prod.id === i.productId)
        if (p) updateProduct(p.id, { stock: Math.max(0, p.stock - i.quantity) })
      }
    })
    clearCart()
    setSubmitting(false)
    setPaidRef(ref)
    setWasDelivery(cart.fulfillment === 'delivery')
    toast.success('Receipt received! Admin will confirm shortly.')
  }

  if (paidRef) {
    return (
      <div className="container-custom py-16 max-w-md mx-auto text-center">
        <Card className="cursor-default"><CardContent className="p-8">
          <CheckCircle2 className="h-16 w-16 text-primary-700 mx-auto" />
          <h1 className="font-heading text-2xl font-bold mt-4">Receipt received!</h1>
          <p className="text-gray-500 mt-2">Reference: <b className="text-black">{paidRef}</b></p>
          <p className="text-sm text-gray-500 mt-2">An admin will confirm your payment <b>within a minute</b> and approve your order. Watch its status under My Orders.</p>
          <p className="text-sm font-semibold text-primary-700 mt-2">{wasDelivery ? 'Your rider arrives in under 15 minutes anywhere on campus once approved.' : 'Come pick up anytime while stock lasts once approved.'}</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link to="/orders"><Button>View My Orders</Button></Link>
            <Link to="/"><Button variant="outline">Home</Button></Link>
          </div>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="container-custom py-10 grid lg:grid-cols-[1.4fr_1fr] gap-8">
      <Card className="cursor-default"><CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><Landmark className="h-6 w-6 text-primary-700" /> Pay by Transfer</h1>
          <Badge variant="secondary">Step 2 of 2</Badge>
        </div>
        <p className="text-sm text-gray-500 mt-1">Deliver to: {draft.address}, {draft.city} • {draft.phone}</p>

        {/* Ventures account — shown on every transfer */}
        <div className="mt-4 bg-primary-950 text-white rounded-xl p-5">
          <div className="text-xs uppercase tracking-widest text-blue-100">Transfer exactly {formatCurrency(cart.total)} to</div>
          <div className="font-bold text-lg mt-1">{VENTURES_ACCOUNT.accountName}</div>
          <div className="text-sm text-blue-100">{VENTURES_ACCOUNT.bank}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-wider text-secondary-400">{VENTURES_ACCOUNT.accountNumber}</span>
            <button type="button" onClick={copyNumber} className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg px-2.5 py-1.5">
              {copied ? <Check className="h-3.5 w-3.5" /> : null} {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium">Upload proof of payment / receipt *</label>
            <div className="mt-2"><ReceiptUpload value={receipt} onChange={setReceipt} /></div>
          </div>
          <Button className="w-full" size="lg" isLoading={submitting}>Submit Receipt • {formatCurrency(cart.total)}</Button>
          <p className="text-xs text-gray-500 text-center">An admin confirms transfer receipts within a minute, then your order is approved.</p>
        </form>
      </CardContent></Card>
      <Card className="h-fit cursor-default"><CardContent className="p-6 text-sm space-y-2">
        <h3 className="font-bold">Order ({cart.totalItems} items)</h3>
        {cart.items.map(i => <div key={i.id} className="flex justify-between gap-2"><span className="truncate">{i.name} × {i.quantity}</span><b className="shrink-0">{formatCurrency(i.price * i.quantity)}</b></div>)}
        <div className="flex justify-between"><span>Subtotal</span><b>{formatCurrency(cart.subtotal)}</b></div>
        <div className="flex justify-between"><span>{cart.fulfillment === 'delivery' ? 'Delivery (₦550)' : 'Pickup (free)'}</span><b>{cart.shipping === 0 ? '₦0' : formatCurrency(cart.shipping)}</b></div>
        <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span className="text-primary-700">{formatCurrency(cart.total)}</span></div>
      </CardContent></Card>
    </div>
  )
}
