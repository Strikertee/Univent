import { useState } from 'react'
import { CalendarCheck, Undo2, XCircle, BadgeCheck, Receipt } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog'
import { RequireDivision } from '../../components/auth/RequireDivision'
import { useShopData, updateBooking } from '../../store/shop'
import { releaseRoomNumber } from '../../store/catalog'
import { formatCurrency } from '../../lib/utils'
import toast from 'react-hot-toast'

const ROOM_IDS: Record<string, string> = {
  'double-room-deluxe': 'room-double-deluxe',
  'royal-standard': 'room-royal-standard',
  'royal-executive': 'room-royal-executive',
  'luxury-king-bed': 'room-luxury-king',
  'executive-suite': 'room-executive-suite',
  'premium-royal-suite': 'room-premium-royal-suite',
}

export function BookingManagement() {
  const { bookings } = useShopData()
  const [receiptView, setReceiptView] = useState<string | null>(null)
  const receiptBooking = bookings.find(b => b.id === receiptView)

  const confirm = (id: string, ref: string) => {
    updateBooking(id, { status: 'approved', paymentStatus: 'confirmed', verifiedAt: new Date().toISOString() })
    toast.success(`Payment confirmed — ${ref} approved`)
  }

  const reject = (id: string, ref: string, roomSlug: string, roomNumber: string | null) => {
    if (!confirm(`Reject ${ref}'s receipt? The room will be released.`)) return
    if (roomNumber) releaseRoomNumber(ROOM_IDS[roomSlug] || '', roomNumber)
    updateBooking(id, { status: 'cancelled', paymentStatus: 'rejected' })
    toast.success(`${ref} rejected — room released`)
  }

  const markReversed = (id: string, ref: string, roomSlug: string, roomNumber: string | null) => {
    if (!confirm(`Mark ${ref} as REVERSED? The room will be released and approval removed.`)) return
    if (roomNumber) releaseRoomNumber(ROOM_IDS[roomSlug] || '', roomNumber)
    updateBooking(id, { status: 'cancelled', paymentStatus: 'reversed' })
    toast.success(`${ref} marked reversed — room released`)
  }

  const cancel = (id: string, ref: string, roomSlug: string, roomNumber: string | null) => {
    if (!confirm(`Cancel booking ${ref}? The room number will be freed.`)) return
    if (roomNumber) releaseRoomNumber(ROOM_IDS[roomSlug] || '', roomNumber)
    updateBooking(id, { status: 'cancelled' })
    toast.success(`${ref} cancelled`)
  }

  return (
    <RequireDivision divisionId="div-hotels" divisionName="U.I. Hotels">
    <div className="container-custom py-10">
      <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><CalendarCheck className="h-6 w-6 text-primary-700" /> Bookings ({bookings.length})</h1>
      <p className="text-sm text-gray-500 mt-1">Open each receipt, confirm genuine transfers within a minute. Rejected/reversed payments release the room — the guest gets nothing.</p>
      {bookings.length === 0 ? (
        <Card className="mt-4 cursor-default"><CardContent className="p-8 text-center text-gray-500">No bookings yet. Submissions from the hotel booking form will show here.</CardContent></Card>
      ) : (
        <div className="mt-4 space-y-2">
          {bookings.map(b => (
            <Card key={b.id} className="cursor-default"><CardContent className="p-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <b>{b.ref} — {b.roomName}</b>
                  <div className="text-xs text-gray-500">{b.firstName} {b.lastName} • {b.email} • {b.phone}</div>
                  <div className="text-sm text-gray-600">{b.checkIn} → {b.checkOut} • {b.nights} night(s) • {b.guests} guest(s)</div>
                  <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                    <Badge variant="outline">{formatCurrency(b.total)} • transfer</Badge>
                    {b.roomNumber && <Badge variant="secondary">Room {b.roomNumber}</Badge>}
                    <Badge variant={b.paymentStatus === 'confirmed' ? 'success' : b.paymentStatus === 'awaiting_confirmation' ? 'warning' : 'destructive'}>
                      {b.paymentStatus === 'awaiting_confirmation' ? 'Receipt uploaded' : b.paymentStatus}
                    </Badge>
                    <Badge variant={b.status === 'approved' ? 'success' : b.status === 'cancelled' ? 'destructive' : 'warning'}>{b.status}</Badge>
                  </div>
                </div>
                {b.receipt && (
                  <button onClick={() => setReceiptView(b.id)} className="shrink-0 rounded-lg overflow-hidden border-2 border-primary-200 hover:border-primary-600">
                    <img src={b.receipt} alt="Receipt" className="h-16 w-16 object-cover" />
                  </button>
                )}
              </div>
              {b.status !== 'cancelled' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.receipt && (
                    <Button size="sm" variant="outline" onClick={() => setReceiptView(b.id)}><Receipt className="h-3.5 w-3.5 mr-1" /> View receipt</Button>
                  )}
                  {b.status === 'pending' && (
                    <Button size="sm" onClick={() => confirm(b.id, b.ref)}><BadgeCheck className="h-3.5 w-3.5 mr-1" /> Confirm payment</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => reject(b.id, b.ref, b.roomSlug, b.roomNumber)}>Reject receipt</Button>
                  <Button size="sm" variant="outline" onClick={() => markReversed(b.id, b.ref, b.roomSlug, b.roomNumber)}>
                    <Undo2 className="h-3.5 w-3.5 mr-1" /> Mark reversed
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => cancel(b.id, b.ref, b.roomSlug, b.roomNumber)}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                </div>
              )}
            </CardContent></Card>
          ))}
        </div>
      )}

      <Dialog open={receiptView !== null} onOpenChange={open => { if (!open) setReceiptView(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Transfer receipt — {receiptBooking?.ref}</DialogTitle></DialogHeader>
          {receiptBooking?.receipt && <img src={receiptBooking.receipt} alt="Transfer receipt" className="w-full max-h-[60vh] object-contain bg-gray-50 rounded-xl" />}
          {receiptBooking && receiptBooking.status === 'pending' && (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => { confirm(receiptBooking.id, receiptBooking.ref); setReceiptView(null) }}><BadgeCheck className="h-4 w-4 mr-1" /> Confirm payment</Button>
              <Button variant="outline" className="flex-1" onClick={() => { reject(receiptBooking.id, receiptBooking.ref, receiptBooking.roomSlug, receiptBooking.roomNumber); setReceiptView(null) }}>Reject</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </RequireDivision>
  )
}
