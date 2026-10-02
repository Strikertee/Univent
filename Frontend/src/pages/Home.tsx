import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Truck, ShieldCheck, CreditCard, MapPin, BedDouble, Croissant, Fuel, Printer, HeartPulse, Briefcase } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { hotelFacilities } from '../data/mockData'
import { useDivisions } from '../store/divisions'
import { useCatalog } from '../store/catalog'
import { useIsAdmin } from '../components/auth/RequireDivision'
import { TestimonialsSection } from './info/InfoPages'
import { formatCurrency } from '../lib/utils'
import { useCart } from '../context/CartContext'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } })
}

export function Home() {
  const { addItem } = useCart()
  const isAdmin = useIsAdmin()
  const { rooms: hotelRooms, products: bakeryProducts } = useCatalog()
  const divisions = useDivisions()

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary-950 text-white">
        <div className="container-custom relative py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <Badge className="bg-secondary-400 text-black border-0 mb-6">University of Ibadan Ventures • Est. UI</Badge>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-balance">
              <span className="text-white">One Marketplace.</span><br />
              <span className="text-secondary-400">Six Trusted Divisions.</span>
            </h1>
            <p className="mt-6 text-lg text-blue-100 max-w-xl">
              Shop fresh <span className="text-secondary-300 font-semibold">U.I. Bread</span>, book hotel rooms from <span className="text-white font-bold">₦30,000</span>, print, fuel, consult & stay safe — all from the <span className="text-secondary-300">University community</span> you trust.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/divisions"><Button size="lg" variant="secondary">Explore Divisions <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
              <Link to="/division/hotels/rooms"><Button size="lg" variant="outline" className="bg-transparent border-secondary-400 text-secondary-300 hover:bg-secondary-400 hover:text-black hover:border-secondary-400">Book a Room</Button></Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-sm">
              {[['15k+', 'Happy Customers'], ['6', 'Divisions'], ['4.9', 'Avg Rating']].map(([v, l]) => (
                <div key={l}><div className="text-2xl font-extrabold text-secondary-300">{v}</div><div className="text-blue-100">{l}</div></div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <img src="/images/rooms/room-1.jpg" alt="UI Hotels" className="rounded-2xl h-64 w-full object-cover shadow-2xl rotate-[-2deg]" />
              <img src="/images/bakery/ui-bakery.jpg" alt="UI Bakery" className="rounded-2xl h-64 w-full object-cover shadow-2xl mt-8 rotate-[2deg]" />
              <img src="/images/rooms/room-2.jpg" alt="Dining" className="rounded-2xl h-48 w-full object-cover shadow-2xl rotate-[1deg]" />
              <img src="/images/rooms/ui-hotels-2.webp" alt="Fitness" className="rounded-2xl h-48 w-full object-cover shadow-2xl mt-[-1rem] rotate-[-1deg]" />
            </div>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -bottom-6 left-8 bg-white text-gray-900 rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"><BedDouble className="h-5 w-5 text-blue-700" /></div>
              <div><div className="font-bold text-sm">Premium Royal Suite</div><div className="text-xs text-gray-500">₦120,000 / night • Available</div></div>
            </motion.div>
          </motion.div>
        </div>
        {/* trust bar */}
        <div className="relative border-t border-white/10 bg-black/40">
          <div className="container-custom py-4 flex flex-wrap items-center justify-center gap-6 text-sm text-white">
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-secondary-400" /> Campus delivery</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-secondary-400" /> Bromate-free & hygienic</span>
            <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-secondary-400" /> Bank Transfer • Receipt confirmed</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-secondary-400" /> Oduduwa Rd, UI Ibadan</span>
          </div>
        </div>
      </section>

      {/* DIVISIONS */}
      <section className="section-padding container-custom">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div><h2 className="font-heading text-3xl lg:text-4xl font-bold">Shop by Division</h2><p className="text-gray-500 mt-2">Six ventures, one account, one checkout.</p></div>
          <Link to="/divisions"><Button variant="outline">View all <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {divisions.map((d, i) => (
            <motion.div key={d.id} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 + i * 0.45, ease: 'easeInOut', delay: i * 0.35 }}
              >
              <Link to={d.slug === 'hotels' ? '/division/hotels/rooms' : d.slug === 'bakery-fastfood' ? '/division/bakery-fastfood/products' : `/division/${d.slug}`}>
                <Card className="neon-float-card overflow-hidden group bg-white border-b-4 border-b-secondary-400">
                  <div className="relative h-48 overflow-hidden">
                    <img src={d.bannerImage} alt={d.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-black/45" />
                    <span className="absolute top-4 left-4 text-3xl bg-secondary-400 rounded-xl h-12 w-12 flex items-center justify-center shadow-glow-gold">{d.icon}</span>
                    <Badge className="absolute bottom-4 left-4 bg-primary-950 text-secondary-300 border-0">{d.shortDescription}</Badge>
                  </div>
                  <CardContent className="p-5 bg-white border-t-4 border-t-primary-950">
                    <h3 className="font-bold text-lg text-primary-950 group-hover:text-primary-700">{d.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{d.description}</p>
                    <span className="mt-3 inline-flex items-center text-sm font-semibold text-secondary-600">Enter division <ArrowRight className="ml-1 h-4 w-4" /></span>
                  </CardContent>
                </Card>
              </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOTEL FEATURED */}
      <section className="bg-gray-50 dark:bg-gray-950 py-16 lg:py-24">
        <div className="container-custom">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div><Badge variant="secondary">U.I. Hotels</Badge><h2 className="font-heading text-3xl lg:text-4xl font-bold mt-3">Book Your Stay</h2><p className="text-gray-500 mt-2">From ₦30,000 — Deluxe to Premium Royal Suite.</p></div>
            <Link to="/division/hotels/rooms"><Button>View all rooms <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotelRooms.slice(0, 3).map((r, i) => (
              <motion.div key={r.id} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
                <Card className="overflow-hidden">
                  <div className="relative h-56"><img src={r.images[0]} alt={r.name} className="h-full w-full object-cover" loading="lazy" />
                    <Badge className="absolute top-3 left-3 bg-primary-600 text-white">{r.capacity} Guests • {r.bedSize}</Badge>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-1 text-amber-500 text-sm">{[...Array(5)].map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-current" />)}<span className="text-gray-500 ml-1">4.9</span></div>
                    <h3 className="font-bold mt-1">{r.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{r.shortDescription}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div><span className="text-xl font-extrabold text-primary-700">{formatCurrency(r.price)}</span><span className="text-xs text-gray-500"> /night</span></div>
                      <Link to={`/division/hotels/rooms/${r.slug}`}><Button size="sm">Book Now!</Button></Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          {/* facilities strip */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {hotelFacilities.map(f => (
              <div key={f.id} className="bg-white dark:bg-gray-900 rounded-xl border p-4 text-center">
                <div className="text-2xl">{f.icon}</div><div className="font-semibold text-sm mt-1">{f.name}</div><div className="text-xs text-gray-500">{f.shortDescription}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BAKERY FEATURED */}
      <section className="section-padding container-custom">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
          <div>
            <Badge>U.I. Bakery & Fast Food</Badge>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mt-3">Bromate-Free. Soya-Fortified. Student-Loved.</h2>
            <p className="text-gray-600 mt-4 text-sm leading-relaxed">From the old bakery at Jaja Clinic to our ultra-modern bakery on Ajibode Rd (6th Dec 2016) — low sugar, hygienic, no cancer-causing bromate. Wholesale 2,000–2,500 loaves delivered South-West.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/division/bakery-fastfood/products"><Button>Shop Bakery <Croissant className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/division/bakery-fastfood"><Button variant="outline">Our Story</Button></Link>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-blue-600" /> No Bromate</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" /> Low Sugar</span>
              <span className="flex items-center gap-1"><Truck className="h-4 w-4 text-blue-600" /> Wholesale Delivery</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {bakeryProducts.filter(p => p.isFeatured).slice(0, 4).map(p => (
              <Card key={p.id} className="overflow-hidden">
                <div className="h-40 overflow-hidden"><img src={p.images[0]} alt={p.name} className="h-full w-full object-cover hover:scale-105 transition-transform" loading="lazy" /></div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm">{p.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{p.shortDescription}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-extrabold text-primary-700">{formatCurrency(p.price)}</span>
                    {!isAdmin && <Button size="sm" onClick={() => addItem({ type: 'product', productId: p.id, quantity: 1, price: p.price, name: p.name, image: p.images[0] })}>Add</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* OTHER DIVISIONS CTA */}
      <section className="container-custom pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Fuel, t: 'Petrol Station', d: 'Fuel, lubricants & car wash', slug: 'petrol-station' },
            { icon: Printer, t: 'Printing Press', d: 'Books, banners & branding', slug: 'printing-press' },
            { icon: HeartPulse, t: 'Health & Safety', d: 'Fumigation & HSE training', slug: 'health-safety' },
            { icon: Briefcase, t: 'Consultancy', d: 'Research & business advice', slug: 'consultancy' },
          ].map(c => (
            <Link key={c.slug} to={`/division/${c.slug}`} className="card-glow rounded-2xl border p-6 bg-white">
              <c.icon className="h-8 w-8 text-primary-700" /><h3 className="font-bold mt-3 text-black">{c.t}</h3><p className="text-sm text-gray-500">{c.d}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsSection />
    </div>
  )
}
