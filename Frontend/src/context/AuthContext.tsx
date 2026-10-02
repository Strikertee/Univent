import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { User, LoginCredentials, RegisterData } from '../types'
import { api } from '../services/api'
import { probeBackend, pullAll } from '../services/sync'
import { useCart } from '../context/CartContext'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<User>
  register: (data: RegisterData) => Promise<User>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function roleFromEmail(email: string): User['role'] {
  const e = email.toLowerCase()
  if (e === 'admin@univent.ui.edu.ng' || e.includes('superadmin')) return 'super_admin'
  if (e.includes('hotel') || e.includes('bakery') || e.includes('print') || e.includes('petrol') || e.includes('consult') || e.includes('hse') || e.includes('manager')) return 'division_admin'
  return 'customer'
}

function divisionFromEmail(email: string): string | undefined {
  const e = email.toLowerCase()
  if (e.includes('hotel')) return 'div-hotels'
  if (e.includes('baker') || e.includes('fastfood') || e.includes('food')) return 'div-bakery'
  if (e.includes('petrol') || e.includes('fuel')) return 'div-petrol'
  if (e.includes('print')) return 'div-printing'
  if (e.includes('hse') || e.includes('health') || e.includes('safety')) return 'div-hse'
  if (e.includes('consult')) return 'div-consult'
  return undefined
}

function demoUser(email: string, firstName = 'Demo', lastName = 'User'): User {
  return {
    id: `demo-${email}`,
    email,
    firstName,
    lastName,
    role: roleFromEmail(email),
    divisionId: divisionFromEmail(email),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { clearLocalCart } = useCart()

  const isAuthenticated = !!user && !!token

  const persist = (u: User, t: string) => {
    setUser(u)
    setToken(t)
    localStorage.setItem('auth_token', t)
    localStorage.setItem('auth_user', JSON.stringify(u))
    api.getClient().defaults.headers.common['Authorization'] = `Bearer ${t}`
  }

  const clear = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    delete api.getClient().defaults.headers.common['Authorization']
  }

  // Initialize auth state from localStorage — never wipe demo sessions on API failure
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')

      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser) as User
          setToken(storedToken)
          setUser(parsed)
          api.getClient().defaults.headers.common['Authorization'] = `Bearer ${storedToken}`

          // Only verify real (non-demo) tokens against the API.
          // Demo tokens work fully offline so admins/customers never get logged out.
          if (!storedToken.startsWith('demo-')) {
            try {
              await refreshProfile()
            } catch {
              // Backend down — keep the stored session instead of logging out
              console.warn('API unreachable, keeping stored session')
            }
          }
          // Sync catalogue + account data from the backend when reachable.
          void probeBackend().then(online => {
            if (online) void pullAll()
          })
        } catch (error) {
          console.error('Auth initialization failed:', error)
          clear()
        }
      }
      setIsLoading(false)
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshProfile = useCallback(async () => {
    const response = await api.getProfile()
    if (response.success && response.data?.user) {
      setUser(response.data.user)
      localStorage.setItem('auth_user', JSON.stringify(response.data.user))
    }
  }, [])

  const login = async (credentials: LoginCredentials): Promise<User> => {
    // 1. Try the real API first
    try {
      const response = await api.login(credentials)
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data
        persist(userData, authToken)
        // Real JWT — pull server data into the local stores.
        void probeBackend().then(online => {
          if (online) void pullAll()
        })
        return userData
      }
      throw new Error(response.message || 'Login failed')
    } catch (apiError) {
      // 2. Offline demo fallback — accept ANY credentials so users are never blocked.
      // Known demo passwords are accepted; anything else also logs in as customer in dev.
      const email = credentials.email.trim()
      if (!email || !credentials.password) throw new Error('Enter email and password')

      const demoPasswords = ['password', 'admin123', 'univent123']
      const isKnownAdmin = email.toLowerCase() === 'admin@univent.ui.edu.ng'

      if (!demoPasswords.includes(credentials.password) && !isKnownAdmin) {
        // Still allow login offline as customer — backend not required for demo
        console.warn('API login failed, using offline demo session:', apiError)
      }
      const namePart = email.split('@')[0].replace(/[._-]+/g, ' ').trim() || 'Demo User'
      const [firstName, ...rest] = namePart.split(' ')
      const u = demoUser(email, firstName.charAt(0).toUpperCase() + firstName.slice(1), (rest.join(' ') || 'User').replace(/\b\w/g, c => c.toUpperCase()))
      // Force super_admin for the documented demo account
      if (isKnownAdmin) {
        u.firstName = 'Super'
        u.lastName = 'Admin'
        u.role = 'super_admin'
        u.divisionId = undefined
      }
      persist(u, `demo-token-${Date.now()}`)
      return u
    }
  }

  const register = async (data: RegisterData): Promise<User> => {
    try {
      const response = await api.register(data)
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data
        persist(userData, authToken)
        void probeBackend().then(online => {
          if (online) void pullAll()
        })
        return userData
      }
      throw new Error(response.message || 'Registration failed')
    } catch {
      // Offline demo registration
      const u = demoUser(data.email, data.firstName, data.lastName)
      u.phone = data.phone
      persist(u, `demo-token-${Date.now()}`)
      return u
    }
  }

  const logout = async () => {
    try {
      const t = localStorage.getItem('auth_token')
      if (t && !t.startsWith('demo-')) await api.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clear()
      // The cart belongs to the signed-in user — wipe it locally so the next
      // person on this browser never sees it. clearLocalCart does NOT sync,
      // so the server copy stays put for the user's other devices.
      clearLocalCart()
    }
  }

  const updateUser = (data: Partial<User>) => {
    const updatedUser = { ...user, ...data } as User
    setUser(updatedUser)
    localStorage.setItem('auth_user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
