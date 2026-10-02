import { BarChart3, TrendingUp, Wallet, Bike, Store } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useShopData } from '../../store/shop'
import { useDailySales, salesTotal } from '../../store/sales'
import { useDivisions } from '../../store/divisions'
import { formatCurrency } from '../../lib/utils'

const BAR_COLORS = ['bg-primary-700', 'bg-secondary-400', 'bg-primary-950', 'bg-black', 'bg-primary-500', 'bg-secondary-600']

/** Super-admin analytics: per-division revenue, grand total, key metrics. */
export function SuperAnalytics() {
  const { orders, bookings } = useShopData()
  const sales = useDailySales()
  const divisions = useDivisions()

  const verifiedBookings = bookings.filter(b => b.status === 'approved' && b.paymentStatus === 'confirmed')
  const bookingsRevenue = verifiedBookings.reduce((s, b) => s + b.total, 0)

  const perDivision = divisions.map((d, i) => {
    const orderRev = orders.filter(o => o.divisionId === d.id).reduce((s, o) => s + o.total, 0)
    const orderCount = orders.filter(o => o.divisionId === d.id).length
    const bookRev = d.id === 'div-hotels' ? bookingsRevenue : 0
    const bookCount = d.id === 'div-hotels' ? verifiedBookings.length : 0
    const divSales = sales.filter(s => s.divisionId === d.id)
    const salesRev = salesTotal(divSales)
    return {
      ...d,
      orderRev, orderCount, bookRev, bookCount,
      salesRev, salesCount: divSales.length,
      total: orderRev + bookRev + salesRev,
      color: BAR_COLORS[i % BAR_COLORS.length],
    }
  })

  const mixedRev = orders.filter(o => o.divisionId === 'multiple').reduce((s, o) => s + o.total, 0)
  const mixedCount = orders.filter(o => o.divisionId === 'multiple').length
  const grandTotal = perDivision.reduce((s, d) => s + d.total, 0) + mixedRev
  const maxRev = Math.max(1, ...perDivision.map(d => d.total), mixedRev)

  const avgOrder = orders.length > 0 ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0
  const pickupCount = orders.filter(o => o.fulfillment === 'pickup').length
  const deliveryCount = orders.filter(o => o.fulfillment === 'delivery').length
  const awaitingCount =
    orders.filter(o => o.paymentStatus === 'awaiting_confirmation').length +
    bookings.filter(b => b.paymentStatus === 'awaiting_confirmation' && b.status === 'pending').length

  return (
    <div className="mt-8">
      <h2 className="font-heading text-xl font-bold flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary-700" /> Venture Analytics
      </h2>

      {/* Grand total */}
      <Card className="mt-3 cursor-default bg-primary-950 text-white">
        <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-blue-100 uppercase tracking-widest">Grand total — all divisions</div>
            <div className="text-4xl font-extrabold text-secondary-400">{formatCurrency(grandTotal)}</div>
            <div className="text-xs text-blue-100 mt-1">Orders + verified hotel payments + daily sales logs</div>
          </div>
          <div className="flex gap-6 text-sm">
            <div><div className="text-xl font-bold">{orders.length}</div><div className="text-blue-100 text-xs">Orders</div></div>
            <div><div className="text-xl font-bold">{verifiedBookings.length}</div><div className="text-blue-100 text-xs">Verified bookings</div></div>
            <div><div className="text-xl font-bold">{sales.length}</div><div className="text-blue-100 text-xs">Sales entries</div></div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by division (bar chart) */}
      <Card className="mt-4 cursor-default"><CardContent className="p-6">
        <h3 className="font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary-700" /> Revenue by division</h3>
        <div className="mt-4 space-y-3">
          {perDivision.map(d => (
            <div key={d.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold">{d.icon} {d.name}</span>
                <b className="text-primary-700">{formatCurrency(d.total)}</b>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full rounded-full ${d.color}`} style={{ width: `${Math.max(2, (d.total / maxRev) * 100)}%` }} />
              </div>
            </div>
          ))}
          {mixedCount > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold">Multi-division orders</span>
                <b className="text-primary-700">{formatCurrency(mixedRev)}</b>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-gray-400" style={{ width: `${Math.max(2, (mixedRev / maxRev) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      </CardContent></Card>

      {/* Per-division breakdown */}
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {perDivision.map(d => (
          <Card key={d.id} className="cursor-default"><CardContent className="p-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{d.icon}</span>
              <b className="text-sm">{d.name}</b>
            </div>
            <div className="text-2xl font-extrabold text-primary-700 mt-2 break-words">{formatCurrency(d.total)}</div>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <div className="flex justify-between"><span>Shop orders ({d.orderCount})</span><b>{formatCurrency(d.orderRev)}</b></div>
              {d.id === 'div-hotels' && <div className="flex justify-between"><span>Hotel payments ({d.bookCount})</span><b>{formatCurrency(d.bookRev)}</b></div>}
              <div className="flex justify-between"><span>Daily sales ({d.salesCount})</span><b>{formatCurrency(d.salesRev)}</b></div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-default"><CardContent className="p-5">
          <Wallet className="h-5 w-5 text-primary-700" />
          <div className="text-xl font-extrabold mt-1">{formatCurrency(avgOrder)}</div>
          <div className="text-xs text-gray-500">Average order value</div>
        </CardContent></Card>
        <Card className="cursor-default"><CardContent className="p-5">
          <Bike className="h-5 w-5 text-secondary-600" />
          <div className="text-xl font-extrabold mt-1">{deliveryCount} / {pickupCount}</div>
          <div className="text-xs text-gray-500">Delivery vs pickup orders</div>
        </CardContent></Card>
        <Card className="cursor-default"><CardContent className="p-5">
          <Store className="h-5 w-5 text-secondary-600" />
          <div className="text-xl font-extrabold mt-1">{awaitingCount}</div>
          <div className="text-xs text-gray-500">Receipts awaiting confirmation</div>
        </CardContent></Card>
        <Card className="cursor-default"><CardContent className="p-5">
          <TrendingUp className="h-5 w-5 text-primary-700" />
          <div className="text-xl font-extrabold mt-1">{bookings.length}</div>
          <div className="text-xs text-gray-500">Total reservations <Badge variant="outline" className="ml-1">{verifiedBookings.length} verified</Badge></div>
        </CardContent></Card>
      </div>
    </div>
  )
}
