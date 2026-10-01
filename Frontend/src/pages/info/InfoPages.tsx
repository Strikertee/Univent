import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ArrowRight, Briefcase, Newspaper, BookOpen, LifeBuoy, Mail, HelpCircle, Truck, RotateCcw, ShieldCheck, FileText, Cookie, Accessibility } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { testimonials } from '../../data/mockData'
import { useState } from 'react'
import toast from 'react-hot-toast'

function PageHero({ badge, title, sub }: { badge: string; title: string; sub: string }) {
  return (
    <div className="bg-primary-950 text-white">
      <div className="container-custom py-14">
        <Badge className="bg-secondary-400 text-black border-0">{badge}</Badge>
        <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mt-4">{title}</h1>
        <p className="mt-3 text-blue-100 max-w-2xl">{sub}</p>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section className="bg-black text-white py-16 lg:py-24">
      <div className="container-custom">
        <Badge className="bg-secondary-400 text-black border-0">Testimonials</Badge>
        <h2 className="font-heading text-3xl lg:text-4xl font-extrabold mt-3">Loved by <span className="text-secondary-400">students</span>, lecturers, staff & <span className="text-primary-300">global guests</span></h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <Card className="bg-white text-gray-900 h-full"><CardContent className="p-5">
                <div className="flex gap-0.5 text-secondary-500">{[...Array(t.rating)].map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}</div>
                <p className="text-sm mt-3 leading-relaxed">“{t.quote}”</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className={`h-10 w-10 rounded-full ${t.color} text-white flex items-center justify-center font-bold text-sm`}>{t.initials}</span>
                  <div><div className="font-bold text-sm">{t.name}</div><div className="text-xs text-gray-500">{t.role} • {t.faculty}</div></div>
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function About() {
  return (
    <div>
      <PageHero badge="About Us" title="University of Ibadan Ventures" sub="Six divisions. One trusted marketplace serving campus and beyond since the days of the old Jaja bakery." />
      <div className="container-custom py-12 grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-bold text-xl">Who we are</h2>
          <p className="text-gray-600 mt-3 text-sm leading-relaxed">Univent unites U.I. Bakery & Fast Food, Petrol Station, Printing Press, Health Safety & Environment, Consultancy Services and U.I. Hotels into one modern shopping experience — shop bread, book rooms, request printing, fuel, HSE and consultancy from a single account.</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[['6', 'Divisions'], ['15k+', 'Customers'], ['4.9★', 'Rating']].map(([v, l]) => <Card key={l}><CardContent className="p-4"><div className="text-2xl font-extrabold text-primary-700">{v}</div><div className="text-xs text-gray-500">{l}</div></CardContent></Card>)}
          </div>
        </div>
        <Card><CardContent className="p-6"><h3 className="font-bold">Our promise</h3><ul className="mt-3 space-y-2 text-sm text-gray-600"><li>✓ Bromate-free, hygienic food production</li><li>✓ Transparent pricing in Naira, bank transfer with admin-confirmed receipts</li><li>✓ Campus pickup + South-West wholesale delivery (2,000–2,500 loaves)</li><li>✓ Real human support: ventures@ui.edu.ng</li></ul><Link to="/divisions" className="mt-4 inline-block"><Button>Explore divisions <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></CardContent></Card>
      </div>
      <TestimonialsSection />
    </div>
  )
}

export function Careers() {
  const jobs = [
    { t: 'Head Baker — U.I. Bakery', d: 'Ibadan • Full-time', s: 'Lead daily production in our Ajibode modern bakery.' },
    { t: 'Front Desk Officer — U.I. Hotels', d: 'Ibadan • Full-time', s: 'Own guest check-in, bookings and concierge.' },
    { t: 'Digital Print Operator', d: 'Ibadan • Full-time', s: 'Large-format, offset and finishing.' },
    { t: 'HSE Field Officer', d: 'South-West • Contract', s: 'Fumigation, audits and safety training.' },
  ]
  return (
    <div>
      <PageHero badge="Careers" title="Grow with Univent" sub="Join the team behind the University's most trusted ventures." />
      <div className="container-custom py-12 grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div className="space-y-4">{jobs.map(j => <Card key={j.t}><CardContent className="p-5 flex flex-wrap gap-3 items-center justify-between"><div><div className="font-bold flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary-700" /> {j.t}</div><div className="text-xs text-gray-500 mt-1">{j.d} — {j.s}</div></div><Button size="sm">Apply</Button></CardContent></Card>)}</div>
        <Card><CardContent className="p-6"><h3 className="font-bold">Don't see a role?</h3><p className="text-sm text-gray-500 mt-1">Send your CV to careers@univent.ui.edu.ng</p></CardContent></Card>
      </div>
    </div>
  )
}

export function Press() {
  const items = [
    { d: 'Sep 2026', t: 'Univent launches unified marketplace', s: 'All six divisions now shoppable from one account.' },
    { d: 'Aug 2026', t: 'Modern bakery hits 2,500 loaves/day', s: 'Ajibode facility scales wholesale across South-West.' },
    { d: 'Jul 2026', t: 'U.I. Hotels adds Premium Royal Suite', s: 'Top-floor suite with jacuzzi and concierge opens.' },
  ]
  return (
    <div>
      <PageHero badge="Press" title="Newsroom" sub="Announcements, milestones and media resources." />
      <div className="container-custom py-12 space-y-4">{items.map(n => <Card key={n.t}><CardContent className="p-5 flex gap-4"><Newspaper className="h-6 w-6 text-primary-700 shrink-0" /><div><div className="text-xs text-gray-500">{n.d}</div><div className="font-bold">{n.t}</div><div className="text-sm text-gray-500">{n.s}</div></div></CardContent></Card>)}<p className="text-sm text-gray-500">Media enquiries: press@univent.ui.edu.ng</p></div>
    </div>
  )
}

export function Blog() {
  const posts = [
    { t: 'Why bromate-free bread matters', s: 'Shelf life, sugar and soya fortification explained.', tag: 'Bakery' },
    { t: 'Guide: choosing the right hotel room', s: 'Deluxe vs Executive vs Royal Suite — capacity and value.', tag: 'Hotels' },
    { t: 'How wholesale bread delivery works', s: '2,000–2,500 loaves anywhere in the South-West.', tag: 'Wholesale' },
  ]
  return (
    <div>
      <PageHero badge="Blog" title="Stories & guides" sub="Bread science, travel tips and campus living." />
      <div className="container-custom py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{posts.map(p => <Card key={p.t}><CardContent className="p-5"><Badge variant="secondary">{p.tag}</Badge><div className="font-bold mt-2 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary-700" /> {p.t}</div><div className="text-sm text-gray-500 mt-1">{p.s}</div><Button size="sm" variant="outline" className="mt-3">Read</Button></CardContent></Card>)}</div>
    </div>
  )
}

export function Help() {
  return (
    <div>
      <PageHero badge="Help Center" title="How can we help?" sub="Orders, bookings, payments and delivery — answered." />
      <div className="container-custom py-12 grid sm:grid-cols-2 gap-4">
        {[['Track my order', 'Go to Orders after login to see live status.'], ['Change booking dates', 'Contact hotels@univent.ui.edu.ng 48hrs ahead.'], ['Payment not approved?', 'Upload a clear photo of your transfer receipt — admins confirm within a minute.'], ['Wholesale bread?', 'Order 2,000–2,500 loaves for South-West delivery.']].map(([t, s]) => <Card key={t}><CardContent className="p-5"><div className="font-bold flex items-center gap-2"><LifeBuoy className="h-4 w-4 text-primary-700" /> {t}</div><div className="text-sm text-gray-500 mt-1">{s}</div></CardContent></Card>)}
      </div>
    </div>
  )
}

export function Contact() {
  const [sent, setSent] = useState(false)
  return (
    <div>
      <PageHero badge="Contact Us" title="Talk to a human" sub="We reply within one business day." />
      <div className="container-custom py-12 grid lg:grid-cols-2 gap-8">
        <Card><CardContent className="p-6 space-y-4">
          <Input label="Name" placeholder="Your name" /><Input label="Email" placeholder="you@example.com" /><Textarea label="Message" placeholder="How can we help?" />
          <Button onClick={() => { setSent(true); toast.success('Message sent!') }}>Send message</Button>
          {sent && <p className="text-sm text-primary-700">Thanks — our team will reach out shortly.</p>}
        </CardContent></Card>
        <Card><CardContent className="p-6 text-sm space-y-3"><div className="font-bold flex items-center gap-2"><Mail className="h-4 w-4 text-primary-700" /> ventures@ui.edu.ng • +234 800 123 4567</div><p className="text-gray-500">Oduduwa Road, University of Ibadan, Ibadan, Oyo State.</p><p className="text-gray-500">Hotel reservations: hotels@univent.ui.edu.ng • Bakery wholesale: bakery@univent.ui.edu.ng</p></CardContent></Card>
      </div>
    </div>
  )
}

export function Faq() {
  const faqs = [
    ['Do I need an account to book?', 'Yes — it takes 30 seconds and lets you track orders and bookings.'],
    ['Is U.I. bread really bromate-free?', 'Yes. Regulatory-minimum preservatives only, low sugar, soya-fortified.'],
    ['Which payments do you accept?', 'Bank transfer in Naira — upload your receipt and an admin confirms within a minute.'],
    ['Do you deliver off-campus?', 'Yes — campus delivery plus South-West wholesale bread runs.'],
  ]
  return (
    <div>
      <PageHero badge="FAQs" title="Quick answers" sub="Everything customers ask us most." />
      <div className="container-custom py-12 space-y-3 max-w-3xl">{faqs.map(([q, a]) => <Card key={q}><CardContent className="p-5"><div className="font-bold flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary-700" /> {q}</div><div className="text-sm text-gray-500 mt-1">{a}</div></CardContent></Card>)}</div>
    </div>
  )
}

export function Shipping() {
  return (
    <div>
      <PageHero badge="Shipping Info" title="Fast, traceable delivery" sub="Campus pickup is free. Off-campus fees at checkout." />
      <div className="container-custom py-12 grid sm:grid-cols-3 gap-4">
        {[['Campus Pickup — Free', 'Pick up at division outlets with your order ID.'], ['Standard — ₦2,000', '1–3 days within Ibadan. Free over ₦50,000.'], ['Wholesale Bread Runs', '2,000–2,500 loaves across South-West.']].map(([t, s]) => <Card key={t}><CardContent className="p-5"><Truck className="h-6 w-6 text-primary-700" /><div className="font-bold mt-2">{t}</div><div className="text-sm text-gray-500">{s}</div></CardContent></Card>)}
      </div>
    </div>
  )
}

export function Returns() {
  return (
    <div>
      <PageHero badge="Returns" title="No-stress returns" sub="Fresh food and hospitality, handled fairly." />
      <div className="container-custom py-12 max-w-3xl space-y-3">
        <Card><CardContent className="p-5 text-sm text-gray-600"><div className="font-bold text-black flex items-center gap-2"><RotateCcw className="h-4 w-4 text-primary-700" /> Bakery & snacks</div>Report quality issues within 24hrs with photos for instant replacement or refund.</CardContent></Card>
        <Card><CardContent className="p-5 text-sm text-gray-600"><div className="font-bold text-black">Hotel bookings</div>Free cancellation up to 48hrs before check-in. 50% within 48hrs. No-show is non-refundable.</CardContent></Card>
      </div>
    </div>
  )
}

function LegalShell({ icon: Icon, badge, title, children }: any) {
  return (
    <div>
      <PageHero badge={badge} title={title} sub="Last updated September 2026." />
      <div className="container-custom py-12 max-w-3xl"><Card><CardContent className="p-6 text-sm text-gray-600 space-y-3"><div className="font-bold text-black flex items-center gap-2"><Icon className="h-4 w-4 text-primary-700" /> {title}</div>{children}</CardContent></Card></div>
    </div>
  )
}

export function Privacy() {
  return <LegalShell icon={ShieldCheck} badge="Privacy Policy" title="Your data, protected"><p>We collect only what checkout needs: name, contact, delivery address, order history and your uploaded transfer receipts. No card numbers are ever handled on this site.</p><p>Contact privacy@univent.ui.edu.ng to access or delete your data.</p></LegalShell>
}
export function Terms() {
  return <LegalShell icon={FileText} badge="Terms of Service" title="Fair use, fair trade"><p>By shopping on Univent you agree to accurate details, timely pickup, and our per-division cancellation rules. Prices are in Naira with no hidden charges.</p><p>Abuse, fraud or chargeback manipulation leads to account suspension.</p></LegalShell>
}
export function Cookies() {
  return <LegalShell icon={Cookie} badge="Cookie Policy" title="Cookies, simply"><p>We use essential cookies for cart and login, plus analytics to improve the marketplace. Disable non-essential cookies anytime in your browser — checkout still works.</p></LegalShell>
}
export function AccessibilityM() {
  return <LegalShell icon={Accessibility} badge="Accessibility" title="Open to everyone"><p>Univent targets WCAG 2.1 AA: keyboard navigation, visible focus rings, sufficient contrast in our blue/black/yellow theme, and screen-reader labels on all actions.</p><p>Report barriers to access@univent.ui.edu.ng.</p></LegalShell>
}
