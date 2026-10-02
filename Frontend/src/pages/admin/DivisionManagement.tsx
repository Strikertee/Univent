import { useState } from 'react'
import { LayoutGrid, Plus } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { useDivisions, createDivision } from '../../store/divisions'
import toast from 'react-hot-toast'

export function DivisionManagement() {
  const divisions = useDivisions()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', shortDescription: '', description: '' })
  const [saving, setSaving] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Give the division a name'); return }
    setSaving(true)
    try {
      const d = createDivision({
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
      })
      toast.success(`${d.name} added`)
      setForm({ name: '', shortDescription: '', description: '' })
      setOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Could not add division')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-custom py-10">
      <div className="flex justify-between items-center gap-3">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-primary-700" /> Divisions ({divisions.length})
        </h1>
        <Button onClick={() => setOpen(v => !v)}><Plus className="h-4 w-4 mr-1" /> Add Division</Button>
      </div>
      <p className="text-xs text-gray-500 mt-1">Super admin only. New divisions appear across the site instantly.</p>

      {open && (
        <Card className="mt-4 cursor-default"><CardContent className="p-5">
          <h3 className="font-bold">New division</h3>
          <form onSubmit={submit} className="mt-3 grid sm:grid-cols-2 gap-4">
            <Input label="Division name *" placeholder="e.g. U.I. Table Water" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Short tagline" placeholder="e.g. Pure campus water" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} />
            <div className="sm:col-span-2"><Textarea label="Description" placeholder="What does this division do?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="sm:col-span-2 flex gap-2">
              <Button isLoading={saving}>Save Division</Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </CardContent></Card>
      )}

      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        {divisions.map(d => (
          <Card key={d.id} className="cursor-default"><CardContent className="p-4 flex gap-3 items-center">
            <span className="text-3xl shrink-0">{d.icon}</span>
            <div className="flex-1 min-w-0">
              <b className="truncate block">{d.name}</b>
              <div className="text-xs text-gray-500 truncate">/{d.slug}</div>
            </div>
            <Badge variant="success">Active</Badge>
          </CardContent></Card>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4">Assign a division_admin per division in Users. API scopes data by division_id except super_admin.</p>
    </div>
  )
}
