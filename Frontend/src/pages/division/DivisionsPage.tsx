import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useDivisions } from '../../store/divisions'

export function DivisionsPage() {
  const divisions = useDivisions()
  return (
    <div className="container-custom py-12">
      <h1 className="font-heading text-3xl lg:text-4xl font-bold">All Divisions</h1>
      <p className="text-gray-500 mt-2">Choose a division to shop, book or request a service.</p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {divisions.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link to={d.slug === 'hotels' ? '/division/hotels/rooms' : d.slug === 'bakery-fastfood' ? '/division/bakery-fastfood/products' : `/division/${d.slug}`}>
              <Card className="overflow-hidden group">
                <div className="relative h-44"><img src={d.bannerImage} alt={d.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/45" />
                  <span className="absolute top-3 left-3 bg-white rounded-xl h-11 w-11 flex items-center justify-center text-2xl">{d.icon}</span>
                </div>
                <CardContent className="p-5">
                  <Badge variant="outline">{d.shortDescription}</Badge>
                  <h3 className="font-bold mt-2">{d.name}</h3>
                  <span className="text-sm font-semibold text-primary-700 inline-flex items-center mt-2">Open <ArrowRight className="ml-1 h-4 w-4" /></span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
