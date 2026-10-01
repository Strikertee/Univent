import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Users, BedDouble, Wifi, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useCatalog, getAvailableRooms } from '../../store/catalog'
import { formatCurrency } from '../../lib/utils'

export function HotelRooms() {
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState(130000)

  const { rooms: hotelRooms } = useCatalog()

  const filtered = useMemo(() => hotelRooms.filter(r =>
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.shortDescription.toLowerCase().includes(search.toLowerCase())) &&
    r.price <= maxPrice
  ), [hotelRooms, search, maxPrice])

  return (
    <div className="container-custom py-12">
      <Badge>U.I. Hotels • Accommodation Categories</Badge>
      <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mt-3">Choose Your Room</h1>
      <p className="text-gray-500 mt-2 max-w-2xl">Click <b>Book Now!</b> to see full details, capacity, amenities, then enter your details to submit your booking.</p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><Input placeholder="Search rooms e.g. Executive, Deluxe..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="flex items-center gap-2 text-sm">Max: <input type="range" min={30000} max={130000} step={2500} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} /><b>{formatCurrency(maxPrice)}</b></div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="overflow-hidden hover:-translate-y-1">
              <div className="relative h-56">
                <img src={r.images[0]} alt={r.name} className="h-full w-full object-cover" loading="lazy" />
                <Badge className="absolute top-3 left-3 bg-primary-600 text-white">{getAvailableRooms(r)} left</Badge>
                <Badge variant="secondary" className="absolute top-3 right-3">{r.bedSize} Bed</Badge>
              </div>
              <CardContent className="p-5">
                <div className="flex items-center gap-1 text-amber-500 text-xs">{[...Array(5)].map((_, k) => <Star key={k} className="h-3 w-3 fill-current" />)}<span className="text-gray-500 ml-1">4.8 • {r.capacity * 37} reviews</span></div>
                <h3 className="font-bold text-lg mt-1">{r.name}</h3>
                <p className="text-sm text-gray-500">{r.shortDescription}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1"><Users className="h-3 w-3" /> {r.capacity} Guests</span>
                  <span className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1"><BedDouble className="h-3 w-3" /> {r.bedType}</span>
                  <span className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1"><Wifi className="h-3 w-3" /> Free WiFi</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div><div className="text-2xl font-extrabold text-primary-700">{formatCurrency(r.price)}</div><div className="text-xs text-gray-500">per night</div></div>
                </div>
                <Link to={`/division/hotels/rooms/${r.slug}`} className="mt-4 block"><Button className="w-full">Book Now! <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16 text-gray-500">No rooms match your search.</div>}
    </div>
  )
}
