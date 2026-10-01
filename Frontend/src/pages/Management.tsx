import { Link } from 'react-router-dom'
import { Users, Mail, MapPin, ArrowRight, Crown, UserCog } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

interface Leader {
  office: string
  title: string
  initials: string
  color: string
  email: string
  location: string
  duties: string
}

const executives: Leader[] = [
  {
    office: 'Director',
    title: 'Director, U.I. Ventures',
    initials: 'DV',
    color: 'bg-primary-950',
    email: 'director.ventures@ui.edu.ng',
    location: 'Ventures House, Oduduwa Road',
    duties: 'Overall leadership of all six divisions, strategy, partnerships and reporting to the University management.',
  },
  {
    office: 'Deputy',
    title: 'Deputy Director (Operations)',
    initials: 'DO',
    color: 'bg-primary-700',
    email: 'operations.ventures@ui.edu.ng',
    location: 'Ventures House, Oduduwa Road',
    duties: 'Day-to-day operations, quality control across divisions and customer experience on the marketplace.',
  },
]

const divisionManagers: Leader[] = [
  { office: 'Bakery', title: 'Manager, U.I. Bakery / Fast Food', initials: 'BK', color: 'bg-secondary-500', email: 'bakery@univent.ui.edu.ng', location: 'Modern Bakery, Ajibode Road', duties: 'Daily bread & snacks production, hygiene compliance and wholesale distribution.' },
  { office: 'Hotels', title: 'Manager, U.I. Hotels', initials: 'HT', color: 'bg-primary-700', email: 'hotels@univent.ui.edu.ng', location: 'U.I. Hotels, Campus', duties: 'Rooms, bookings, conference halls, restaurant, pool and gym facilities.' },
  { office: 'Petrol', title: 'Manager, U.I. Petrol Station', initials: 'PS', color: 'bg-black', email: 'petrol@univent.ui.edu.ng', location: 'U.I. Petrol Station', duties: 'Fuel sales, lubricants, car wash and auto services.' },
  { office: 'Printing', title: 'Manager, U.I. Printing Press', initials: 'PP', color: 'bg-primary-950', email: 'printing@univent.ui.edu.ng', location: 'Printing Press Complex', duties: 'Offset & digital printing, branding and large-format jobs.' },
  { office: 'HSE', title: 'Head, Health, Safety & Environment', initials: 'HS', color: 'bg-primary-700', email: 'hse@univent.ui.edu.ng', location: 'HSE Unit Office', duties: 'Fumigation, waste management, safety training and compliance.' },
  { office: 'Consult', title: 'Head, Consultancy Services', initials: 'CS', color: 'bg-black', email: 'consult@univent.ui.edu.ng', location: 'Consultancy Unit Office', duties: 'Research, business and academic consultancy engagements.' },
]

function LeaderCard({ leader }: { leader: Leader }) {
  return (
    <Card><CardContent className="p-5">
      <div className="flex items-center gap-4">
        <span className={`h-14 w-14 rounded-2xl ${leader.color} text-white flex items-center justify-center font-extrabold text-lg shrink-0`}>{leader.initials}</span>
        <div>
          <Badge variant="outline">{leader.office}</Badge>
          <div className="font-bold mt-1">{leader.title}</div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-3">{leader.duties}</p>
      <div className="mt-3 space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-primary-700"><Mail className="h-4 w-4" /> {leader.email}</div>
        <div className="flex items-center gap-2 text-gray-500"><MapPin className="h-4 w-4" /> {leader.location}</div>
      </div>
    </CardContent></Card>
  )
}

export function Management() {
  return (
    <div>
      <div className="bg-primary-950 text-white">
        <div className="container-custom py-14">
          <Badge className="bg-secondary-400 text-black border-0">Management</Badge>
          <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mt-4 flex items-center gap-3">
            <Users className="h-10 w-10 text-secondary-400" /> Meet the Management
          </h1>
          <p className="mt-3 text-blue-100 max-w-2xl">The team behind the University of Ibadan Ventures — one leadership, six divisions, one marketplace.</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <h2 className="font-heading text-xl font-bold flex items-center gap-2"><Crown className="h-5 w-5 text-secondary-600" /> Executive Leadership</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-5">
          {executives.map(e => <LeaderCard key={e.title} leader={e} />)}
        </div>

        <h2 className="font-heading text-xl font-bold mt-10 flex items-center gap-2"><UserCog className="h-5 w-5 text-primary-700" /> Division Managers</h2>
        <p className="text-sm text-gray-500 mt-1">Each manager runs a division and manages its own products, bookings and orders on this marketplace.</p>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {divisionManagers.map(m => <LeaderCard key={m.title} leader={m} />)}
        </div>

        <Card className="mt-10 cursor-default bg-primary-950 text-white"><CardContent className="p-6 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <div className="font-bold text-lg">Want to partner or distribute?</div>
            <div className="text-sm text-blue-100">Wholesale bread (2,000–2,500 loaves), event bookings and print contracts welcome.</div>
          </div>
          <Link to="/contact"><Button variant="secondary">Contact Us <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </CardContent></Card>
      </div>
    </div>
  )
}
