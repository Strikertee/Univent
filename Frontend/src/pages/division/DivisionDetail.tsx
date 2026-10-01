import { useParams, Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { divisions, hotelFacilities, bakeryHistory } from '../../data/mockData'
import { useCatalog } from '../../store/catalog'
import { formatCurrency } from '../../lib/utils'
import { ArrowRight } from 'lucide-react'

export function DivisionDetail() {
  const { slug } = useParams()
  const { rooms: hotelRooms, products: bakeryProducts } = useCatalog()
  const division = divisions.find(d => d.slug === slug)

  if (!division) return <div className="container-custom py-20 text-center"><h1 className="text-2xl font-bold">Division not found</h1><Link to="/divisions" className="mt-4 inline-block"><Button>All divisions</Button></Link></div>

  const isHotel = slug === 'hotels'
  const isBakery = slug === 'bakery-fastfood'

  return (
    <div>
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img src={division.bannerImage} alt={division.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute bottom-0 container-custom pb-8 text-white">
          <Badge className="bg-white/15 text-white border-white/20">{division.shortDescription}</Badge>
          <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mt-3">{division.name}</h1>
        </div>
      </div>

      <div className={`container-custom py-12 gap-10 ${(isHotel || isBakery) ? 'grid lg:grid-cols-[1.4fr_1fr]' : 'max-w-3xl'}`}>
        <div>
          <h2 className="font-bold text-xl">About this division</h2>
          <p className="text-gray-600 mt-3 leading-relaxed">{division.description}</p>
          {isBakery && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-bold">Our Bakery Story</h3>
              <p className="text-sm text-gray-700 mt-3 whitespace-pre-line leading-relaxed">{bakeryHistory}</p>
              <Link to="/division/bakery-fastfood/products" className="mt-4 inline-block"><Button>Shop Bread & Snacks <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            </div>
          )}
          {isHotel && (
            <div className="mt-6">
              <h3 className="font-bold text-lg">Facilities available</h3>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {hotelFacilities.map(f => (
                  <div key={f.id} className="border rounded-xl p-4 flex gap-3"><span className="text-2xl">{f.icon}</span><div><div className="font-semibold text-sm">{f.name}</div><div className="text-xs text-gray-500">{f.shortDescription}</div></div></div>
                ))}
              </div>
              <Link to="/division/hotels/rooms" className="mt-5 inline-block"><Button>View Rooms & Book <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            </div>
          )}
          {!isHotel && !isBakery && (
            <Card className="mt-6"><CardContent className="p-6"><h3 className="font-bold">Request a service</h3><p className="text-sm text-gray-500 mt-1">Contact the {division.name} team for quotes: ventures@ui.edu.ng • +234 800 123 4567</p><div className="mt-4 flex gap-3"><Link to="/cart"><Button>Contact Sales</Button></Link></div></CardContent></Card>
          )}
        </div>
        {(isHotel || isBakery) && (
        <div>
          <h3 className="font-bold">{isHotel ? 'Popular rooms' : 'Best sellers'}</h3>
          <div className="mt-4 space-y-4">
            {(isHotel ? hotelRooms.slice(0, 3) : bakeryProducts.slice(0, 3)).map((item: any) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="flex gap-3 p-3">
                  <img src={item.images[0]} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1"><div className="font-semibold text-sm">{item.name}</div><div className="text-xs text-gray-500">{item.shortDescription}</div><div className="font-bold text-primary-700 mt-1">{formatCurrency(item.price)}</div></div>
                </div>
              </Card>
            ))}
          </div>
          {isHotel && <Link to="/division/hotels/rooms" className="mt-4 inline-block"><Button variant="outline" className="w-full">All Rooms</Button></Link>}
          {isBakery && <Link to="/division/bakery-fastfood/products" className="mt-4 inline-block"><Button variant="outline" className="w-full">All Products</Button></Link>}
        </div>
        )}
      </div>
    </div>
  )
}
