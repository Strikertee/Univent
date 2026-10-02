import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export function Login() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as any
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  // If already logged in, bounce to the right home
  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === 'super_admin' || user.role === 'division_admin' ? '/admin' : '/dashboard'
      navigate(dest, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const destinationFor = (role: string) => {
    if (role === 'super_admin' || role === 'division_admin') return '/admin'
    return location.state?.from?.pathname || '/dashboard'
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const loggedIn = await login(form)
      toast.success(`Welcome back, ${loggedIn.firstName}!`)
      navigate(destinationFor(loggedIn.role), { replace: true })
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-custom py-16 max-w-md mx-auto">
      <Card className="cursor-default"><CardHeader><CardTitle>Welcome back</CardTitle><CardDescription>Sign in to shop, book & track orders.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <PasswordInput label="Password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <Button className="w-full" size="lg" isLoading={loading}>Sign In</Button>
          </form>
          <p className="text-sm text-center mt-4 text-gray-500">No account? <Link to="/register" className="font-bold text-primary-700">Create one</Link></p>
          <p className="text-xs text-center mt-3 text-gray-400">Staff? Use the credentials issued by U.I. Ventures admin.</p>
        </CardContent>
      </Card>
    </div>
  )
}
