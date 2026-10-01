import { Link } from 'react-router-dom'
import { BedDouble, CalendarDays, Clock, AlertTriangle, BadgeCheck } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useShopData, SavedBooking } from '../../store/shop'
import { useCatalog } from '../../store/catalog'
import { formatCurrency } from '../../lib/utils'

function BookingCard({ booking }: { booking: SavedBooking }) {
  const { rooms } = useCatalog()
  const room = rooms.find(r => r.slug === booking.roomSlug)
  const awaiting = booking.paymentStatus === 'awaiting_confirmation' && booking.status === 'pending'
  const approved = booking.status === 'approved' && booking.paymentStatus === 'confirmed'
  const dead = booking.paymentStatus === 'rejected' || booking.paymentStatus === 'reversed' || booking.status === 'cancelled'

  return (
    <Card className="cursor-default"><CardContent className="p-4">
      <div className="flex gap-4">
        {booking.image && <img src={booking.image} alt={booking.roomName} className="h-24 w-24 rounded-xl object-cover shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-3">
            <div>
              <b>{booking.ref} — {booking.roomName}</b>
              <div className="text-sm text-gray-500">{booking.checkIn} → {booking.checkOut} • {booking.nights} night(s) • {booking.guests} guest(s)</div>
              <div className="text-xs text-gray-400 mt-1">Booked {booking.date} • Transfer of {formatCurrency(booking.total)}</div>
            </div>
            {approved && <Badge variant="success">Approved</Badge>}
            {awaiting && <Badge variant="warning">Confirming…</Badge>}
            {dead && <Badge variant="destructive">Not approved</Badge>}
          </div>

          {booking.roomNumber && !dead && (
            <div className="mt-2 inline-flex items-center gap-2 bg-primary-950 text-white rounded-lg px-3 py-1.5 text-sm">
              <BedDouble className="h-4 w-4 text-secondary-400" />
              Room <b className="text-secondary-400">{booking.roomNumber}</b>
              {approved && <span className="text-xs text-blue-100">• confirmed</span>}
            </div>
          )}

          {room && (
            <div className="mt-2 text-xs text-gray-500">
              {room.capacity} guests • {room.bedType} ({room.bedSize}) • {room.amenities.slice(0, 4).join(' • ')}
            </div>
          )}

          {awaiting && (
            <div className="mt-3 bg-secondary-100 border border-secondary-300 rounded-xl p-3 flex gap-2">
              <Clock className="h-4 w-4 text-secondary-700 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700">Receipt received — an admin confirms transfer payments <b>within a minute</b>. Your room is reserved meanwhile.</p>
            </div>
          )}

          {dead && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{booking.paymentStatus === 'reversed' ? 'This payment was reversed — the room was released and no approval was issued.' : 'This receipt was not approved — no room was issued.'} Please re-book or contact hotels@univent.ui.edu.ng.</span>
            </div>
          )}

          {approved && (
            <div className="mt-3 text-xs text-gray-600 bg-primary-50 border border-primary-200 rounded-xl p-3 flex gap-2">
              <BadgeCheck className="h-4 w-4 text-primary-700 shrink-0" />
              <span>Show this reference at check-in: <b>{booking.ref}</b> • {booking.firstName} {booking.lastName} • {booking.phone}
              {booking.requests && <span> • Note: {booking.requests}</span>}</span>
            </div>
          )}
        </div>
      </div>
    </CardContent></Card>
  )
}

export function Bookings() {
  const { user } = useAuth()
  const { bookings } = useShopData(user?.id)

  if (bookings.length === 0) {
    return (
      <div className="container-custom py-16 max-w-lg mx-auto text-center">
        <CalendarDays className="h-16 w-16 text-primary-200 mx-auto" />
        <h1 className="font-heading text-2xl font-bold mt-4">No bookings yet</h1>
        <p className="text-gray-500 mt-2">Your hotel reservations will appear here once submitted.</p>
        <Link to="/division/hotels/rooms" className="mt-5 inline-block"><Button>Book a Room</Button></Link>
      </div>
    )
  }

  return (
    <div className="container-custom py-10 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><BedDouble className="h-6 w-6 text-primary-700" /> My Bookings ({bookings.length})</h1>
      <div className="mt-5 space-y-3">
        {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
      </div>
    </div>
  )
}
