import { useState } from 'react'
import { Package, Pencil, Check, X } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { RequireDivision } from '../../components/auth/RequireDivision'
import { useCatalog, updateProduct } from '../../store/catalog'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../lib/utils'
import toast from 'react-hot-toast'

export function ProductManagement() {
  const { user } = useAuth()
  const { products } = useCatalog()
  const [editing, setEditing] = useState<string | null>(null)
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')

  // Bakery admin sees bakery products; super admin sees everything
  const visible = user?.role === 'super_admin' ? products : products.filter(p => p.divisionId === 'div-bakery')

  const startEdit = (id: string, p: number, s: number) => {
    setEditing(id)
    setPrice(String(p))
    setStock(String(s))
  }

  const save = (id: string) => {
    const newPrice = Number(price)
    const newStock = Math.max(0, Math.floor(Number(stock)))
    if (!newPrice || newPrice <= 0 || Number.isNaN(newStock)) { toast.error('Enter a valid price and stock'); return }
    updateProduct(id, { price: newPrice, stock: newStock })
    setEditing(null)
    toast.success('Product updated — live on the site now')
  }

  return (
    <RequireDivision divisionId="div-bakery" divisionName="U.I. Bakery">
      <div className="container-custom py-10">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-primary-700" /> Bakery Products</h1>
        <p className="text-sm text-gray-500 mt-1">Set each morning's stock at the start of the day — customers see live availability, and finished items show "In the making". Purchases reduce stock automatically.</p>
        <div className="mt-5 space-y-3">
          {visible.map(p => {
            const isEditing = editing === p.id
            return (
              <Card key={p.id} className="cursor-default"><CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img src={p.images[0]} className="h-12 w-12 rounded-lg object-cover shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <b className="text-sm">{p.name}</b>
                    <div className="text-xs text-gray-500">{p.sku} • {p.stock} in stock</div>
                    <Badge variant="outline" className="mt-1">{formatCurrency(p.price)}</Badge>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-primary-700" onClick={() => save(p.id)}><Check className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEdit(p.id, p.price, p.stock)}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                  )}
                </div>
                {isEditing && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Input label="Price (₦)" type="number" min={1} value={price} onChange={e => setPrice(e.target.value)} />
                    <Input label="Stock" type="number" min={0} value={stock} onChange={e => setStock(e.target.value)} />
                  </div>
                )}
              </CardContent></Card>
            )
          })}
        </div>
      </div>
    </RequireDivision>
  )
}
