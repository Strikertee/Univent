import { Link } from 'react-router-dom'
import { Store, BedDouble, Package, Users, CalendarCheck, Settings as SettingsIcon, LayoutGrid, Dumbbell, ClipboardList } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useShopData } from '../../store/shop'
import { useDailySales, salesTotal } from '../../store/sales'
import { divisions } from '../../data/mockData'
import { formatCurrency } from '../../lib/utils'
import { SuperAnalytics } from './Analytics'

const allLinks = [
  { to: '/admin/divisions', icon: LayoutGrid, t: 'Divisions', d: '6 divisions • super admin', divisions: ['*'] },
  { to: '/admin/products', icon: Package, t: 'Products', d: 'Bakery prices & stock', divisions: ['*', 'div-bakery'] },
  { to: '/admin/rooms', icon: BedDouble, t: 'Rooms', d: 'Prices & room count', divisions: ['*', 'div-hotels'] },
  { to: '/admin/facilities', icon: Dumbbell, t: 'Facilities', d: 'Pool, gym...', divisions: ['*', 'div-hotels'] },
  { to: '/admin/orders', icon: Store, t: 'Orders', d: 'Customer payments', divisions: ['*', 'div-hotels', 'div-bakery'] },
  { to: '/admin/bookings', icon: CalendarCheck, t: 'Bookings', d: 'Hotel reservations', divisions: ['*', 'div-hotels'] },
  { to: '/admin/sales', icon: ClipboardList, t: 'Daily Sales', d: 'Log what was sold daily', divisions: ['*', 'div-bakery', 'div-hotels', 'div-petrol', 'div-printing', 'div-hse', 'div-consult'] },
  { to: '/admin/users', icon: Users, t: 'Users', d: 'Admins & customers', divisions: ['*'] },
  { to: '/admin/settings', icon: SettingsIcon, t: 'Settings', d: 'Payments, site', divisions: ['*'] },
]

export function AdminDashboard() {
  const { user } = useAuth()
  const { orders, bookings } = useShopData()
  const sales = useDailySales()
  const isSuper = user?.role === 'super_admin'
  const myDivision = divisions.find(d => d.id === user?.divisionId)

  const scopedOrders = isSuper ? orders : orders.filter(o => o.divisionId === user?.divisionId || o.divisionId === 'multiple')
  const scopedBookings = isSuper ? bookings : bookings.filter(b => b.roomSlug && user?.divisionId === 'div-hotels')
  const scopedSales = isSuper ? sales : sales.filter(s => s.divisionId === user?.divisionId)
  // Only CONFIRMED (admin-verified transfer) hotel payments count as revenue
  const verifiedBookingsTotal = scopedBookings
    .filter(b => b.status === 'approved' && b.paymentStatus === 'confirmed')
    .reduce((s, b) => s + b.total, 0)
  const revenue = scopedOrders.reduce((s, o) => s + o.total, 0) + salesTotal(scopedSales) + verifiedBookingsTotal

  const links = allLinks.filter(l =>
    isSuper ? l.divisions.includes('*') : l.divisions.includes(user?.divisionId || '')
  )

  return (
    <div className="container-custom py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-3xl font-bold">{isSuper ? 'Super Admin' : `${myDivision?.name || 'Division'} Manager`}</h1>
        {!isSuper && myDivision && <Badge variant="secondary">{myDivision.shortDescription}</Badge>}
      </div>
      <p className="text-gray-500">
        {isSuper
          ? 'Oversee all 6 divisions.'
          : `You manage ${myDivision?.name || 'your division'} only — other divisions are hidden from you.`}
      </p>
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          [formatCurrency(revenue), 'Revenue (orders + verified hotel payments + daily sales)'],
          [String(scopedOrders.length), 'Orders'],
          [String(scopedBookings.length), 'Bookings'],
          [formatCurrency(verifiedBookingsTotal), 'Hotel payments verified'],
        ].map(([v, l]) => (
          <Card key={l} className="cursor-default"><CardContent className="p-5"><div className="text-2xl font-extrabold text-primary-700">{v}</div><div className="text-sm text-gray-500">{l}</div></CardContent></Card>
        ))}
      </div>
      {!isSuper && myDivision && (
        <Card className="mt-4 cursor-default"><CardContent className="p-5 flex gap-4 items-center">
          <span className="text-4xl">{myDivision.icon}</span>
          <div><div className="font-bold">{myDivision.name}</div><div className="text-sm text-gray-500">{myDivision.description}</div></div>
        </CardContent></Card>
      )}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {links.map(l => <Link key={l.to} to={l.to}><Card><CardContent className="p-5"><l.icon className="h-6 w-6 text-primary-700" /><div className="font-bold mt-2">{l.t}</div><div className="text-xs text-gray-500">{l.d}</div></CardContent></Card></Link>)}
      </div>

      {isSuper && <SuperAnalytics />}
    </div>
  )
}
