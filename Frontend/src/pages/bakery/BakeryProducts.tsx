import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { bakeryHistory } from '../../data/mockData'
import { useCatalog } from '../../store/catalog'
import { useIsAdmin } from '../../components/auth/RequireDivision'
import { formatCurrency } from '../../lib/utils'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

export function BakeryProducts() {
  const { addItem } = useCart()
  const isAdmin = useIsAdmin()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'bread' | 'snacks'>('all')

  const { products: bakeryProducts } = useCatalog()

  const filtered = useMemo(() => bakeryProducts.filter(p => {
    const matchTab = tab === 'all' || (tab === 'bread' ? p.categoryId === 'cat-bread' : p.categoryId === 'cat-snacks')
    return matchTab && p.name.toLowerCase().includes(search.toLowerCase())
  }), [bakeryProducts, search, tab])

  return (
    <div className="container-custom py-12">
      <Badge>Bakery & Fast Food</Badge>
      <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mt-3">U.I. Bread & Snacks</h1>
      <p className="text-gray-500 mt-2 max-w-3xl">Safe, bromate-free, soya-fortified. Minimum shelf life per regulatory preservative level.</p>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-gray-700 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all cursor-pointer" title="Click to expand">
        {bakeryHistory.slice(0, 400)}... <Link to="/division/bakery-fastfood" className="font-bold text-primary-700">Read full story</Link>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {(['all', 'bread', 'snacks'] as const).map(t => (
            <Button key={t} variant={tab === t ? 'default' : 'outline'} size="sm" onClick={() => setTab(t)} className="capitalize">{t === 'all' ? 'All' : t}</Button>
          ))}
        </div>
        <div className="flex-1"><Input placeholder="Search sardine, wheat, meatpie..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="overflow-hidden hover:-translate-y-1">
              <Link to={`/division/bakery-fastfood/products/${p.slug}`}><div className="relative h-44 overflow-hidden bg-secondary-100 flex items-center justify-center text-5xl"><span>🍞</span>
                {p.images[0] && (
                  <img src={p.images[0]} alt={p.name} className="absolute inset-0 h-full w-full object-cover hover:scale-105 transition-transform" loading="lazy"
                    onError={e => { e.currentTarget.style.display = 'none' }} />
                )}
                {p.stock <= 0 && (
                  <span className="absolute inset-0 bg-primary-950/70 flex items-center justify-center text-center px-4">
                    <span className="text-secondary-400 font-extrabold text-sm">In the making —<br />fresh batch soon!</span>
                  </span>
                )}
              </div></Link>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{p.categoryId === 'cat-bread' ? 'Bread' : 'Snacks'}</Badge>
                  {p.stock > 0 ? (
                    <Badge variant="secondary" className="text-[10px]">{p.stock} available</Badge>
                  ) : (
                    <Badge className="text-[10px] bg-primary-950 text-secondary-300 border-0">Currently making it</Badge>
                  )}
                </div>
                <Link to={`/division/bakery-fastfood/products/${p.slug}`}><h3 className="font-bold text-sm mt-1 hover:text-primary-700">{p.name}</h3></Link>
                <p className="text-xs text-gray-500 line-clamp-1">{p.shortDescription}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-extrabold text-primary-700">{formatCurrency(p.price)}</span>
                  {isAdmin ? null : p.stock > 0 ? (
                    <Button size="sm" onClick={() => { addItem({ type: 'product', productId: p.id, quantity: 1, price: p.price, name: p.name, image: p.images[0] }); toast.success(`${p.name} added`) }}>Add</Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>In the making</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
