import { useState } from 'react'
import { ClipboardList, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'
import { addDailySale, deleteDailySale, useDailySales, salesTotal, todayISO } from '../../store/sales'
import { divisions } from '../../data/mockData'
import { formatCurrency } from '../../lib/utils'
import toast from 'react-hot-toast'

export function DailySales() {
  const { user } = useAuth()
  const isSuper = user?.role === 'super_admin'
  const [filterDiv, setFilterDiv] = useState<string>(isSuper ? 'all' : (user?.divisionId || 'all'))
  const [form, setForm] = useState({ date: todayISO(), item: '', amount: '' })

  const myDivisionId = isSuper ? (filterDiv === 'all' ? '' : filterDiv) : (user?.divisionId || '')
  const sales = useDailySales(isSuper ? (filterDiv === 'all' ? undefined : filterDiv) : user?.divisionId)
  const total = salesTotal(sales)
  const myDivision = divisions.find(d => d.id === (isSuper ? myDivisionId : user?.divisionId))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetId = isSuper ? myDivisionId : (user?.divisionId || '')
    const target = divisions.find(d => d.id === targetId)
    if (!target) { toast.error(isSuper ? 'Pick a division first' : 'No division assigned'); return }
    if (!form.item.trim() || !form.date) { toast.error('Describe what was sold / service rendered'); return }
    const amount = Number(form.amount)
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return }
    addDailySale({
      divisionId: target.id,
      divisionName: target.name,
      date: form.date,
      item: form.item.trim(),
      amount,
      enteredBy: `${user?.firstName} ${user?.lastName}`.trim() || user?.email || 'Admin',
    })
    setForm({ date: todayISO(), item: '', amount: '' })
    toast.success('Daily sale logged')
  }

  return (
    <div className="container-custom py-10">
      <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><ClipboardList className="h-6 w-6 text-primary-700" /> Daily Sales</h1>
      <p className="text-sm text-gray-500 mt-1">
        {isSuper ? 'All divisions. Pick a division to log for it, or filter the list.' : `Log what ${myDivision?.name || 'your division'} sold or rendered each day.`}
      </p>

      <div className="mt-5 grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
        <Card className="cursor-default"><CardContent className="p-5">
          <h3 className="font-bold flex items-center gap-2"><Plus className="h-4 w-4 text-primary-700" /> Log sales / service</h3>
          <form onSubmit={submit} className="mt-3 space-y-3">
            {isSuper && (
              <div>
                <label className="text-sm font-medium">Division *</label>
                <Select value={filterDiv} onValueChange={setFilterDiv}>
                  <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">— Select —</SelectItem>
                    {divisions.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Input label="Date *" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            <Input label="What was sold / service rendered *" placeholder="e.g. 120 loaves wheat bread; 3 suits pressed; hall hire" value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} required />
            <Input label="Amount made (₦) *" type="number" min={1} placeholder="45000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            <Button className="w-full">Save Entry</Button>
          </form>
        </CardContent></Card>

        <div>
          <Card className="cursor-default bg-primary-950 text-white"><CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-100">{isSuper && filterDiv !== 'all' ? divisions.find(d => d.id === filterDiv)?.name : isSuper ? 'All divisions' : myDivision?.name} • {sales.length} entries</div>
              <div className="text-3xl font-extrabold text-secondary-400">{formatCurrency(total)}</div>
            </div>
            {isSuper && (
              <div className="w-48">
                <Select value={filterDiv} onValueChange={setFilterDiv}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Filter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All divisions</SelectItem>
                    {divisions.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent></Card>

          <div className="mt-3 space-y-2">
            {sales.length === 0 && (
              <Card className="cursor-default"><CardContent className="p-6 text-center text-sm text-gray-500">No entries yet. Log today's sales using the form.</CardContent></Card>
            )}
            {sales.map(s => (
              <Card key={s.id} className="cursor-default"><CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <b className="text-sm">{s.item}</b>
                  <div className="text-xs text-gray-500">{s.date} • {s.divisionName} • by {s.enteredBy}</div>
                </div>
                <b className="text-primary-700">{formatCurrency(s.amount)}</b>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => { deleteDailySale(s.id); toast.success('Entry removed') }}><Trash2 className="h-4 w-4" /></Button>
              </CardContent></Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
