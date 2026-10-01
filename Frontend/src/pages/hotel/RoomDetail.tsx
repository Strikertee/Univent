import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Star, Users, BedDouble, Check, CalendarDays, Minus, Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { hotelFacilities } from '../../data/mockData'
import { useCatalog, getAvailableRooms } from '../../store/catalog'
import { formatCurrency } from '../../lib/utils'
import { useCart } from '../../context/CartContext'
import { useIsAdmin } from '../../components/auth/RequireDivision'
import toast from 'react-hot-toast'

export function RoomDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const isAdmin = useIsAdmin()
  const { rooms: hotelRooms } = useCatalog()
  const room = hotelRooms.find(r => r.slug === slug)
  const [activeImg, setActiveImg] = useState(0)
  const [guests, setGuests] = useState(2)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  if (!room) return <div className="container-custom py-20 text-center">Room not found. <Link to="/division/hotels/rooms"><Button className="ml-2">All rooms</Button></Link></div>

  const nights = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 1
  const total = room.price * nights

  const handleBook = () => {
    if (!checkIn || !checkOut) { toast.error('Select check-in and check-out dates'); return }
    addItem({ type: 'room', roomId: room.id, quantity: 1, price: total, name: `${room.name} (${nights} night${nights > 1 ? 's' : ''})`, image: room.images[0], checkIn, checkOut, guests })
  }

  return (
    <div className="container-custom py-10">
      <Link to="/division/hotels/rooms" className="text-sm text-primary-700 font-semibold">← Back to rooms</Link>
      <div className="mt-4 grid lg:grid-cols-2 gap-8">
        <div>
          <img src={room.images[activeImg]} alt={room.name} className="w-full h-80 lg:h-96 object-cover rounded-2xl" />
          <div className="mt-3 flex gap-3">{room.images.map((img, i) => <button key={i} onClick={() => setActiveImg(i)} className={`h-20 w-24 rounded-xl overflow-hidden border-2 ${i === activeImg ? 'border-primary-600' : 'border-transparent'}`}><img src={img} alt="" className="h-full w-full object-cover" /></button>)}</div>
          <Card className="mt-6"><CardContent className="p-5">
            <h3 className="font-bold">Everything about this room</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3"><div className="text-gray-500 text-xs">Capacity</div><div className="font-bold flex items-center gap-1"><Users className="h-4 w-4" /> {room.capacity} Guests</div></div>
              <div className="bg-gray-50 rounded-xl p-3"><div className="text-gray-500 text-xs">Bed</div><div className="font-bold flex items-center gap-1"><BedDouble className="h-4 w-4" /> {room.bedType} ({room.bedSize})</div></div>
              <div className="bg-gray-50 rounded-xl p-3"><div className="text-gray-500 text-xs">Total rooms</div><div className="font-bold">{room.totalRooms} • {getAvailableRooms(room)} available</div></div>
              <div className="bg-gray-50 rounded-xl p-3"><div className="text-gray-500 text-xs">Features</div><div className="font-bold">{room.features.slice(0, 2).join(', ')}</div></div>
            </div>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">{room.description}</p>
            <h4 className="font-bold mt-4 text-sm">Amenities</h4>
            <div className="mt-2 flex flex-wrap gap-2">{room.amenities.map(a => <span key={a} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full"><Check className="h-3 w-3" /> {a}</span>)}</div>
          </CardContent></Card>
        </div>
        <div>
          <Badge>U.I. Hotels</Badge>
          <h1 className="font-heading text-3xl lg:text-4xl font-extrabold mt-2">{room.name}</h1>
          <div className="flex items-center gap-1 text-amber-500 mt-2">{[...Array(5)].map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}<span className="text-sm text-gray-500 ml-1">4.9 Excellent</span></div>
          <p className="text-gray-500 mt-2">{room.shortDescription}</p>
          <div className="text-3xl font-extrabold text-primary-700 mt-4">{formatCurrency(room.price)} <span className="text-sm font-normal text-gray-500">/ night</span></div>

          <Card className="mt-6"><CardContent className="p-5 space-y-4">
            <h3 className="font-bold flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Enter your details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Check-in</label><input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="mt-1 flex h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></div>
              <div><label className="text-sm font-medium">Check-out</label><input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="mt-1 flex h-11 w-full rounded-xl border border-gray-300 px-3 text-sm" /></div>
            </div>
            <div><label className="text-sm font-medium">Guests (max {room.capacity})</label>
              <div className="mt-1 flex items-center gap-3"><Button variant="outline" size="icon" onClick={() => setGuests(Math.max(1, guests - 1))}><Minus className="h-4 w-4" /></Button><b>{guests}</b><Button variant="outline" size="icon" onClick={() => setGuests(Math.min(room.capacity, guests + 1))}><Plus className="h-4 w-4" /></Button></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-sm flex justify-between"><span>{nights} night(s) × {formatCurrency(room.price)}</span><b>{formatCurrency(total)}</b></div>
            {isAdmin ? (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3">Admin accounts can't book rooms — bookings are for customers only.</p>
            ) : (
              <>
                <Button className="w-full" size="lg" onClick={handleBook}>Proceed — Add to Booking</Button>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/division/hotels/rooms/${room.slug}/book`)}>Full Booking Form</Button>
              </>
            )}
          </CardContent></Card>

          <Card className="mt-4"><CardContent className="p-5"><h4 className="font-bold text-sm">Hotel facilities included</h4><div className="mt-2 grid grid-cols-2 gap-2 text-xs">{hotelFacilities.slice(0, 6).map(f => <span key={f.id}>{f.icon} {f.name}</span>)}</div></CardContent></Card>
        </div>
      </div>
    </div>
  )
}
