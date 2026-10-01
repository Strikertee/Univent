import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' })
  return (
    <div className="container-custom py-10 max-w-lg">
      <Card><CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
          <Input label="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
          <Input label="Email" value={user?.email || ''} disabled />
          <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Button onClick={() => { updateUser(form); toast.success('Profile updated') }}>Save changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}
