import { divisions } from '../../data/mockData'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

export function DivisionManagement() {
  return (
    <div className="container-custom py-10">
      <div className="flex justify-between items-center"><h1 className="font-heading text-2xl font-bold">Divisions (Super Admin)</h1><Button>Add Division</Button></div>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">{divisions.map(d => <Card key={d.id}><CardContent className="p-4 flex gap-3 items-center"><span className="text-3xl">{d.icon}</span><div className="flex-1"><b>{d.name}</b><div className="text-xs text-gray-500">/{d.slug} • Admin: TBD</div></div><Badge variant="success">Active</Badge></CardContent></Card>)}</div>
      <p className="text-xs text-gray-500 mt-4">Assign a division_admin per division in Users. API scopes data by division_id except super_admin.</p>
    </div>
  )
}
