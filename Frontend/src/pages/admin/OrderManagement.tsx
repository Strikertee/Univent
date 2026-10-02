import { useState } from 'react'
import { Store, BadgeCheck, Receipt } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog'
import { useAuth } from '../../context/AuthContext'
import { useShopData, updateOrder } from '../../store/shop'
import { formatCurrency } from '../../lib/utils'
import toast from 'react-hot-toast'

export function OrderManagement() {
  const { user } = useAuth()
  const { orders } = useShopData()
  const [receiptView, setReceiptView] = useState<string | null>(null)
  const receiptOrder = orders.find(o => o.id === receiptView)
  const isSuper = user?.role === 'super_admin'
  // Division admins only see orders containing their division's items
  const visible = isSuper ? orders : orders.filter(o => o.divisionId === user?.divisionId || o.divisionId === 'multiple')

  const approvePayment = (id: string, ref: string) => {
    updateOrder(id, { paymentStatus: 'confirmed', status: 'Delivered' })
    toast.success(`Payment confirmed — ${ref} approved`)
  }

  const reject = (id: string, ref: string) => {
    if (!window.confirm(`Reject ${ref}'s receipt?`)) return
    updateOrder(id, { paymentStatus: 'rejected', status: 'Cancelled' })
    toast.success(`${ref} rejected`)
  }

  return (
    <div className="container-custom py-10">
      <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><Store className="h-6 w-6 text-primary-700" /> Orders ({visible.length})</h1>
      <p className="text-sm text-gray-500 mt-1">{isSuper ? 'All divisions.' : 'Only orders with your division\u2019s items.'} Open each receipt and confirm genuine transfers within a minute.</p>
      {visible.length === 0 ? (
        <Card className="mt-4 cursor-default"><CardContent className="p-8 text-center text-gray-500">No orders yet. Orders placed through Payment will show here.</CardContent></Card>
      ) : (
        <div className="mt-4 space-y-2">
          {visible.map(o => (
            <Card key={o.id} className="cursor-default"><CardContent className="p-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <b>{o.ref}</b>
                  <div className="text-xs text-gray-500">{o.firstName} {o.lastName} • {o.email} • {o.phone}</div>
                  <div className="text-sm text-gray-600 break-words">{o.items.map(i => `${i.name} × ${i.quantity}`).join(', ')}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <Badge variant="outline" className="mr-1">{o.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}</Badge>
                    {o.address}, {o.city}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                    <b className="text-primary-700">{formatCurrency(o.total)}</b>
                    <Badge variant={o.paymentStatus === 'confirmed' ? 'success' : o.paymentStatus === 'awaiting_confirmation' ? 'warning' : 'destructive'}>
                      {o.paymentStatus === 'awaiting_confirmation' ? 'Receipt uploaded' : o.paymentStatus}
                    </Badge>
                    <Badge variant={o.status === 'Delivered' ? 'success' : o.status === 'Cancelled' ? 'destructive' : 'warning'}>{o.status}</Badge>
                  </div>
                </div>
                {o.receipt && (
                  <button onClick={() => setReceiptView(o.id)} className="shrink-0 rounded-lg overflow-hidden border-2 border-primary-200 hover:border-primary-600">
                    <img src={o.receipt} alt="Receipt" className="h-16 w-16 object-cover" />
                  </button>
                )}
              </div>
              {o.paymentStatus === 'awaiting_confirmation' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {o.receipt && <Button size="sm" variant="outline" onClick={() => setReceiptView(o.id)}><Receipt className="h-3.5 w-3.5 mr-1" /> View receipt</Button>}
                  <Button size="sm" onClick={() => approvePayment(o.id, o.ref)}><BadgeCheck className="h-3.5 w-3.5 mr-1" /> Confirm payment</Button>
                  <Button size="sm" variant="outline" onClick={() => reject(o.id, o.ref)}>Reject</Button>
                </div>
              )}
            </CardContent></Card>
          ))}
        </div>
      )}

      <Dialog open={receiptView !== null} onOpenChange={open => { if (!open) setReceiptView(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Transfer receipt — {receiptOrder?.ref}</DialogTitle></DialogHeader>
          {receiptOrder?.receipt && <img src={receiptOrder.receipt} alt="Transfer receipt" className="w-full max-h-[60vh] object-contain bg-gray-50 rounded-xl" />}
          {receiptOrder && receiptOrder.paymentStatus === 'awaiting_confirmation' && (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => { approvePayment(receiptOrder.id, receiptOrder.ref); setReceiptView(null) }}><BadgeCheck className="h-4 w-4 mr-1" /> Confirm payment</Button>
              <Button variant="outline" className="flex-1" onClick={() => { reject(receiptOrder.id, receiptOrder.ref); setReceiptView(null) }}>Reject</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
