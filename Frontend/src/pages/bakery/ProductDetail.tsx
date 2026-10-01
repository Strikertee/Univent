import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { Minus, Plus, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useCatalog } from '../../store/catalog'
import { useIsAdmin } from '../../components/auth/RequireDivision'
import { formatCurrency } from '../../lib/utils'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

export function ProductDetail() {
  const { slug } = useParams()
  const { products: bakeryProducts } = useCatalog()
  const isAdmin = useIsAdmin()
  const product = bakeryProducts.find(p => p.slug === slug)
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  if (!product) return <div className="container-custom py-20">Product not found</div>

  return (
    <div className="container-custom py-10 grid lg:grid-cols-2 gap-10">
      <div><img src={product.images[0]} alt={product.name} className="w-full h-80 lg:h-[28rem] object-cover rounded-2xl" />
        <div className="mt-4 flex gap-2 text-xs"><span className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> No Bromate</span><span className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full">Low Sugar</span><span className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full">Soya Fortified</span></div>
      </div>
      <div>
        <Link to="/division/bakery-fastfood/products" className="text-sm text-primary-700 font-semibold">← All products</Link>
        <Badge variant="outline" className="mt-3">{product.sku}</Badge>{' '}
        {product.stock > 0 ? (
          <Badge variant="secondary" className="mt-3">{product.stock} available — pick up anytime</Badge>
        ) : (
          <Badge className="mt-3 bg-primary-950 text-secondary-300 border-0">In the making — currently making it</Badge>
        )}
        <h1 className="font-heading text-3xl lg:text-4xl font-extrabold mt-2">{product.name}</h1>
        <p className="text-gray-500 mt-1">{product.shortDescription}</p>
        <div className="text-3xl font-extrabold text-primary-700 mt-4">{formatCurrency(product.price)}</div>
        <p className="text-sm text-gray-600 mt-4 leading-relaxed">{product.description}</p>
        {Object.keys(product.specifications).length > 0 && (
          <Card className="mt-5"><CardContent className="p-4 text-sm"><h4 className="font-bold mb-2">Specifications</h4>{Object.entries(product.specifications).map(([k, v]) => <div key={k} className="flex justify-between py-1 border-b last:border-0"><span className="text-gray-500">{k}</span><b>{v}</b></div>)}</CardContent></Card>
        )}
        <div className="mt-5 flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setQty(Math.max(1, qty - 1))} disabled={product.stock <= 0 || isAdmin}><Minus className="h-4 w-4" /></Button><b className="w-8 text-center">{qty}</b>
          <Button variant="outline" size="icon" onClick={() => setQty(Math.min(product.stock, qty + 1))} disabled={product.stock <= 0 || isAdmin}><Plus className="h-4 w-4" /></Button>
          {isAdmin ? (
            <p className="flex-1 text-sm text-gray-500 bg-gray-50 rounded-xl p-3 text-center">Admin accounts can't shop — products are for customers only.</p>
          ) : product.stock > 0 ? (
            <Button className="flex-1" size="lg" onClick={() => { addItem({ type: 'product', productId: product.id, quantity: qty, price: product.price, name: product.name, image: product.images[0] }); toast.success('Added to cart') }}>Add to Cart • {formatCurrency(product.price * qty)}</Button>
          ) : (
            <Button className="flex-1" size="lg" variant="outline" disabled>In the making — check back soon</Button>
          )}
        </div>
        {product.stock <= 0 && (
          <p className="text-sm text-gray-500 mt-3">This product has finished for now. Our bakers are currently making a fresh batch — check back soon or try pickup later today.</p>
        )}
      </div>
    </div>
  )
}
