import { Landmark, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { VENTURES_ACCOUNT } from '../../data/account'
import { api } from '../../services/api'

export function Settings() {
  const [connected, setConnected] = useState<boolean | null>(null)

  useEffect(() => {
    api.checkConnection().then(setConnected)
  }, [])

  return (
    <div className="container-custom py-10 max-w-2xl"><h1 className="font-heading text-2xl font-bold">Settings</h1>
      <Card className="mt-4 cursor-default"><CardContent className="p-5 flex items-center gap-3">
        {connected === null ? (
          <Badge variant="outline">Checking API…</Badge>
        ) : connected ? (
          <span className="flex items-center gap-2 text-sm font-bold text-primary-700"><Wifi className="h-4 w-4" /> API connected — live backend</span>
        ) : (
          <span className="flex items-center gap-2 text-sm font-bold text-secondary-700"><WifiOff className="h-4 w-4" /> Demo mode — backend not reachable</span>
        )}
        <span className="text-xs text-gray-500 ml-auto">GET /api/health</span>
      </CardContent></Card>
      <Card className="mt-4"><CardHeader><CardTitle>Payments — Bank Transfer Only</CardTitle></CardHeader><CardContent className="space-y-3">
        <div className="bg-primary-950 text-white rounded-xl p-5">
          <div className="text-xs uppercase tracking-widest text-blue-100 flex items-center gap-1.5"><Landmark className="h-3.5 w-3.5" /> Ventures account shown to all customers</div>
          <div className="font-bold text-lg mt-1">{VENTURES_ACCOUNT.accountName}</div>
          <div className="text-sm text-blue-100">{VENTURES_ACCOUNT.bank}</div>
          <div className="text-xl font-extrabold tracking-wider text-secondary-400 mt-1">{VENTURES_ACCOUNT.accountNumber}</div>
        </div>
        <p className="text-sm text-gray-500">To change the account, edit <b>src/data/account.ts</b> — every transfer point on the site updates automatically. Customers upload transfer receipts; admins confirm each one within a minute from Orders / Bookings.</p>
      </CardContent></Card>
    </div>
  )
}
