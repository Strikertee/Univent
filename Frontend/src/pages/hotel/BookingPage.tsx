import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { BedDouble, CheckCircle2, Landmark, ArrowLeft, Wifi, Copy, Check } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Badge } from '../../components/ui/Badge'
import { ReceiptUpload } from '../../components/payment/ReceiptUpload'
import { VENTURES_ACCOUNT } from '../../data/account'
import { useCatalog, getAvailableRooms, assignRoomNumber } from '../../store/catalog'
import { useAuth } from '../../context/AuthContext'
import { useIsAdmin } from '../../components/auth/RequireDivision'
import { formatCurrency } from '../../lib/utils'
import { saveBooking, makeRef } from '../../store/shop'
import toast from 'react-hot-toast'

export function BookingPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const isAdmin = useIsAdmin()
  const { rooms: hotelRooms } = useCatalog()
  const room = hotelRooms.find(r => r.slug === slug)
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', checkIn: '', checkOut: '', adults: 2, children: 0, requests: '' })
  const [receipt, setReceipt] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState<{ ref: string; roomNumber: string } | null>(null)

  if (!room) return <div className="container-custom py-20">Room not found</div>

  if (isAdmin) {
    return (
      <div className="container-custom py-16 max-w-md mx-auto text-center">
        <Card className="cursor-default"><CardContent className="p-8">
          <h1 className="font-heading text-xl font-bold">Admins can't book rooms</h1>
          <p className="text-sm text-gray-500 mt-2">Bookings are for customers only. Manage reservations in the admin panel instead.</p>
          <Link to="/admin/bookings" className="mt-5 inline-block"><Button>Go to Bookings Panel</Button></Link>
        </CardContent></Card>
      </div>
    )
  }

  const nights = form.checkIn && form.checkOut ? Math.max(1, Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000)) : 1
  const subtotal = room.price * nights
  const total = subtotal
  const left = getAvailableRooms(room)

  const toPay = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.email || !form.phone || !form.checkIn || !form.checkOut) { toast.error('Fill all required fields'); return }
    if (left <= 0) { toast.error('Sorry, this room is fully booked'); return }
    setStep(2)
    window.scrollTo({ top: 0 })
  }

  const pay = async () => {
    if (!receipt) { toast.error('Please upload your transfer receipt first'); return }
    setPaying(true)
    await new Promise(r => setTimeout(r, 1200))
    try {
      const ref = makeRef('BK')
      const roomNumber = assignRoomNumber(room.id, room.totalRooms)
      saveBooking({
        ref,
        userId: user?.id || 'guest',
        userEmail: user?.email || form.email,
        roomSlug: room.slug,
        roomName: room.name,
        image: room.images[0],
        pricePerNight: room.price,
        nights,
        subtotal,
        tax: 0,
        total,
        method: 'transfer',
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: form.adults + form.children,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        requests: form.requests,
        status: 'pending',
        paymentStatus: 'awaiting_confirmation',
        roomNumber,
        receipt,
        verifiedAt: null,
      })
      setPaying(false)
      setDone({ ref, roomNumber })
      toast.success(`Receipt received! Room ${roomNumber} reserved for you`)
    } catch {
      setPaying(false)
      toast.error('Something went wrong — no booking was created')
    }
  }

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(VENTURES_ACCOUNT.accountNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Copy failed — type the number manually')
    }
  }

  if (done) {
    return (
      <div className="container-custom py-16 max-w-lg mx-auto text-center">
        <Card className="cursor-default"><CardContent className="p-8">
          <CheckCircle2 className="h-16 w-16 text-primary-700 mx-auto" />
          <h1 className="font-heading text-2xl font-bold mt-4">Payment received!</h1>
          <div className="mt-4 bg-primary-950 text-white rounded-xl p-5">
            <div className="text-xs uppercase tracking-widest text-blue-100">Your room number</div>
            <div className="text-4xl font-extrabold text-secondary-400">{done.roomNumber}</div>
            <div className="text-sm mt-1">{room.name} • {nights} night(s) • {formatCurrency(total)} paid</div>
            <div className="text-xs text-blue-100 mt-1">Ref: {done.ref}</div>
          </div>
          <p className="text-sm text-gray-500 mt-4">An admin will confirm your transfer <b>within a minute</b> and approve your booking. Watch its status under My Bookings.</p>
          <Link to="/bookings" className="mt-5 inline-block"><Button size="lg" className="w-full">Go to My Bookings</Button></Link>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="container-custom py-10 grid lg:grid-cols-[1.3fr_1fr] gap-8">
      <Card className="cursor-default"><CardContent className="p-6">
        <div className="flex items-center gap-2">
          <Badge variant={step === 1 ? 'default' : 'outline'}>1. Your details</Badge>
          <Badge variant={step === 2 ? 'default' : 'outline'}>2. Pay</Badge>
        </div>
        <h1 className="font-heading text-2xl font-bold mt-3">Book {room.name}</h1>

        {step === 1 ? (
          <form onSubmit={toPay} className="mt-5 grid sm:grid-cols-2 gap-4">
            <Input label="First name *" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Last name *" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            <Input label="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone *" placeholder="080..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input label="Check-in *" type="date" value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} />
            <Input label="Check-out *" type="date" value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} />
            <Input label="Adults" type="number" min={1} max={room.capacity} value={String(form.adults)} onChange={e => setForm({ ...form, adults: Number(e.target.value) })} />
            <Input label="Children" type="number" min={0} value={String(form.children)} onChange={e => setForm({ ...form, children: Number(e.target.value) })} />
            <div className="sm:col-span-2"><Textarea label="Special requests" placeholder="Early check-in, extra bed..." value={form.requests} onChange={e => setForm({ ...form, requests: e.target.value })} /></div>
            <div className="sm:col-span-2"><Button type="submit" size="lg" className="w-full">Continue to Payment • {formatCurrency(total)}</Button></div>
          </form>
        ) : (
          <div className="mt-5">
            <p className="text-sm text-gray-500">Paying for <b className="text-black">{nights} night(s)</b> as <b className="text-black">{form.firstName} {form.lastName}</b> ({form.checkIn} → {form.checkOut}).</p>
            <div className="mt-3 bg-primary-950 text-white rounded-xl p-5">
              <div className="text-xs uppercase tracking-widest text-blue-100 flex items-center gap-1.5"><Landmark className="h-3.5 w-3.5" /> Transfer exactly {formatCurrency(total)} to</div>
              <div className="font-bold mt-1">{VENTURES_ACCOUNT.accountName}</div>
              <div className="text-sm text-blue-100">{VENTURES_ACCOUNT.bank}</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-wider text-secondary-400">{VENTURES_ACCOUNT.accountNumber}</span>
                <button type="button" onClick={copyNumber} className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg px-2.5 py-1.5">
                  {copied ? <Check className="h-3.5 w-3.5" /> : null} {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Upload proof of payment / receipt *</label>
              <div className="mt-2"><ReceiptUpload value={receipt} onChange={setReceipt} /></div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button className="flex-1" size="lg" isLoading={paying} onClick={pay}>Submit Receipt • {formatCurrency(total)}</Button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">An admin confirms transfer receipts within a minute, then your room is approved.</p>
          </div>
        )}
      </CardContent></Card>

      <Card className="h-fit lg:sticky lg:top-24 cursor-default"><CardContent className="p-6">
        <img src={room.images[0]} alt={room.name} className="h-44 w-full object-cover rounded-xl" />
        <h3 className="font-bold mt-4 flex items-center gap-2"><BedDouble className="h-4 w-4 text-primary-700" /> {room.name}</h3>
        <p className="text-sm text-gray-500">{room.shortDescription}</p>
        <div className="mt-2 flex items-center gap-1 text-xs text-primary-700"><Wifi className="h-3.5 w-3.5" /> {left} of {room.totalRooms} rooms left</div>
        <div className="mt-4 space-y-2 text-sm border-t pt-4">
          <div className="flex justify-between"><span>Price/night</span><b>{formatCurrency(room.price)}</b></div>
          <div className="flex justify-between"><span>Nights</span><b>{nights}</b></div>
          <div className="flex justify-between text-base font-bold border-t pt-2"><span>Total</span><span className="text-primary-700">{formatCurrency(total)}</span></div>
        </div>
      </CardContent></Card>
    </div>
  )
}
