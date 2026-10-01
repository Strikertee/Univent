import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
const users = [
  { n: 'Super Admin', e: 'admin@univent.ui.edu.ng', r: 'super_admin', d: 'All divisions' },
  { n: 'Hotel Manager', e: 'hotels@univent.ui.edu.ng', r: 'division_admin', d: 'U.I. Hotels' },
  { n: 'Bakery Manager', e: 'bakery@univent.ui.edu.ng', r: 'division_admin', d: 'Bakery/Fast Food' },
  { n: 'Adaeze O.', e: 'adaeze@mail.com', r: 'customer', d: '-' },
]
export function UserManagement() {
  return (
    <div className="container-custom py-10"><div className="flex justify-between items-center"><h1 className="font-heading text-2xl font-bold">Users</h1><Button>Invite Admin</Button></div>
      <div className="mt-4 space-y-2">{users.map(u => <Card key={u.e}><CardContent className="p-4 flex items-center gap-3"><div className="flex-1"><b>{u.n}</b><div className="text-xs text-gray-500">{u.e} • {u.d}</div></div><Badge variant="outline">{u.r}</Badge></CardContent></Card>)}</div>
    </div>
  )
}
