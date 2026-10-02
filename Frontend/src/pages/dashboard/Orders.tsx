import { Link } from 'react-router-dom'
import { Package, ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useShopData } from '../../store/shop'
import { formatCurrency } from '../../lib/utils'

export function Orders() {
  const { user } = useAuth()
  const { orders } = useShopData(user?.id)

  if (orders.length === 0) {
    return (
      <div className="container-custom py-16 max-w-lg mx-auto text-center">
        <ShoppingBag className="h-16 w-16 text-primary-200 mx-auto" />
        <h1 className="font-heading text-2xl font-bold mt-4">No orders yet</h1>
        <p className="text-gray-500 mt-2">Your completed payments will appear here with live status.</p>
        <Link to="/division/bakery-fastfood/products" className="mt-5 inline-block"><Button>Shop Bakery</Button></Link>
      </div>
    )
  }

  return (
    <div className="container-custom py-10 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-primary-700" /> My Orders ({orders.length})</h1>
      <div className="mt-5 space-y-3">
        {orders.map(o => (
          <Card key={o.id} className="cursor-default"><CardContent className="p-4">
            <div className="flex justify-between items-start gap-3">
              <div>
                <b>{o.ref}</b>
                <div className="text-sm text-gray-500 break-words">{o.items.map(i => `${i.name} × ${i.quantity}`).join(', ')}</div>
                <div className="text-xs text-gray-400 mt-1">{o.date} • Transfer • {o.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'} • {o.address}, {o.city}</div>
                <div className="font-bold mt-1 text-primary-700">{formatCurrency(o.total)}</div>
                {o.paymentStatus === 'awaiting_confirmation' && (
                  <p className="text-xs text-gray-500 mt-1">Receipt received — admin confirms within a minute.</p>
                )}
                {o.paymentStatus === 'rejected' && (
                  <p className="text-xs text-red-600 mt-1">Receipt was not approved — contact ventures@ui.edu.ng with your reference.</p>
                )}
              </div>
              <Badge variant={o.paymentStatus === 'confirmed' ? 'success' : o.paymentStatus === 'rejected' ? 'destructive' : 'warning'}>
                {o.paymentStatus === 'confirmed' ? 'Approved' : o.paymentStatus === 'rejected' ? 'Not approved' : 'Confirming…'}
              </Badge>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
