import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

/** True for super_admin / division_admin — shopping & booking are customers-only. */
export function useIsAdmin(): boolean {
  const { user } = useAuth()
  return user?.role === 'super_admin' || user?.role === 'division_admin'
}

/** Renders children only for super_admin or the division_admin of `divisionId`. */
export function RequireDivision({ divisionId, divisionName, children }: {
  divisionId: string
  divisionName: string
  children: ReactNode
}) {
  const { user } = useAuth()
  const allowed = user?.role === 'super_admin' || (user?.role === 'division_admin' && user?.divisionId === divisionId)

  if (!allowed) {
    return (
      <div className="container-custom py-16 max-w-md mx-auto text-center">
        <Card className="cursor-default"><CardContent className="p-8">
          <ShieldAlert className="h-12 w-12 text-secondary-600 mx-auto" />
          <h1 className="font-heading text-xl font-bold mt-3">Restricted area</h1>
          <p className="text-sm text-gray-500 mt-2">This section belongs to the <b>{divisionName}</b> manager. You are signed in as {user?.email}.</p>
          <Link to="/admin" className="mt-5 inline-block"><Button>Back to Admin</Button></Link>
        </CardContent></Card>
      </div>
    )
  }

  return <>{children}</>
}
