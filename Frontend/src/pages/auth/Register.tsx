import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', passwordConfirmation: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.passwordConfirmation) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const u = await register(form)
      toast.success(`Welcome, ${u.firstName}!`)
      navigate(u.role === 'super_admin' || u.role === 'division_admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (err: any) { toast.error(err.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="container-custom py-12 max-w-lg mx-auto">
      <Card><CardHeader><CardTitle>Create account</CardTitle><CardDescription>Join Univent marketplace.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <Input label="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
            <Input label="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input label="Phone" placeholder="080..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            <PasswordInput label="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <PasswordInput label="Confirm password" value={form.passwordConfirmation} onChange={e => setForm({ ...form, passwordConfirmation: e.target.value })} required />
            <div className="sm:col-span-2"><Button className="w-full" size="lg" isLoading={loading}>Create Account</Button></div>
          </form>
          <p className="text-sm text-center mt-4 text-gray-500">Have an account? <Link to="/login" className="font-bold text-primary-700">Sign in</Link></p>
        </CardContent>
      </Card>
    </div>
  )
}
