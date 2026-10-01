import { useState } from 'react'
import { BedDouble, Pencil, Check, X } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { RequireDivision } from '../../components/auth/RequireDivision'
import { useCatalog, updateRoom, getAvailableRooms } from '../../store/catalog'
import { formatCurrency } from '../../lib/utils'
import toast from 'react-hot-toast'

export function RoomManagement() {
  const { rooms } = useCatalog()
  const [editing, setEditing] = useState<string | null>(null)
  const [price, setPrice] = useState('')
  const [total, setTotal] = useState('')

  const startEdit = (id: string, p: number, t: number) => {
    setEditing(id)
    setPrice(String(p))
    setTotal(String(t))
  }

  const save = (id: string) => {
    const newPrice = Number(price)
    const newTotal = Math.max(1, Math.floor(Number(total)))
    if (!newPrice || newPrice <= 0 || !newTotal) { toast.error('Enter a valid price and room count'); return }
    updateRoom(id, { price: newPrice, totalRooms: newTotal })
    setEditing(null)
    toast.success('Room updated — live on the site now')
  }

  return (
    <RequireDivision divisionId="div-hotels" divisionName="U.I. Hotels">
      <div className="container-custom py-10">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><BedDouble className="h-6 w-6 text-primary-700" /> Hotel Rooms</h1>
        <p className="text-sm text-gray-500 mt-1">Edit prices and number of rooms. Availability drops automatically with each booking.</p>
        <div className="mt-5 space-y-3">
          {rooms.map(r => {
            const left = getAvailableRooms(r)
            const isEditing = editing === r.id
            return (
              <Card key={r.id} className="cursor-default"><CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img src={r.images[0]} className="h-14 w-14 rounded-lg object-cover shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <b className="text-sm">{r.name}</b>
                    <div className="text-xs text-gray-500">{r.bedSize} bed • capacity {r.capacity}</div>
                    <div className="mt-1 flex gap-2">
                      <Badge variant={left > 0 ? 'success' : 'destructive'}>{left}/{r.totalRooms} available</Badge>
                      <Badge variant="outline">{formatCurrency(r.price)}/night</Badge>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-primary-700" onClick={() => save(r.id)}><Check className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEdit(r.id, r.price, r.totalRooms)}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                  )}
                </div>
                {isEditing && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Input label="Price per night (₦)" type="number" min={1} value={price} onChange={e => setPrice(e.target.value)} />
                    <Input label="Number of rooms" type="number" min={1} value={total} onChange={e => setTotal(e.target.value)} />
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
