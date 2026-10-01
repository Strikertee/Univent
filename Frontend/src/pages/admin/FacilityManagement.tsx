import { hotelFacilities } from '../../data/mockData'
import { Card, CardContent } from '../../components/ui/Card'
import { RequireDivision } from '../../components/auth/RequireDivision'
export function FacilityManagement() {
  return (
    <RequireDivision divisionId="div-hotels" divisionName="U.I. Hotels">
    <div className="container-custom py-10">
      <div className="flex justify-between items-center"><h1 className="font-heading text-2xl font-bold">Hotel Facilities</h1></div>
      <p className="text-sm text-gray-500 mt-1">Conference hall, pool, gym, restaurant — shown to customers on the hotel page.</p>
      <div className="mt-5 grid sm:grid-cols-2 gap-3">{hotelFacilities.map(f => <Card key={f.id} className="cursor-default"><CardContent className="p-4"><div className="text-2xl">{f.icon}</div><b>{f.name}</b><div className="text-xs text-gray-500">{f.shortDescription}</div></CardContent></Card>)}</div>
    </div>
    </RequireDivision>
  )
}
