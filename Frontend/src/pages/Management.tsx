import { Link } from 'react-router-dom'
import { Users, Mail, MapPin, ArrowRight, Crown } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

interface BoardMember {
  name: string
  title: string
  photo: string
  bio: string
  email: string
}

const chairman: BoardMember = {
  name: 'Dr. Kemi A. Emmina',
  title: 'Chairman, Board of Directors',
  photo: '/images/management/Dr-Kemi-Eminna.jpg',
  bio: 'He is a lecturer in the Department of Religious Studies and Philosophy, Delta State University, Abraka, a former Special Adviser on Research and Documentation to the former Speaker of the Delta State House of Assembly, and a Past President of the University of Ibadan Alumni Association.',
  email: 'board@univent.ui.edu.ng',
}

const directors: BoardMember[] = [
  {
    name: 'Prof. Kayode Adebowale, FAS',
    title: 'Director (Vice-Chancellor, University of Ibadan)',
    photo: '/images/management/Prof-Kayode-Adebowale.jpg',
    bio: 'The University of Ibadan is ably represented on the Board by Professor Adebowale, the Vice-Chancellor of this great citadel of learning. He is a Professor in the Department of Chemistry, Faculty of Science, and has contributed immensely to the growth of U.I. Ventures Limited.',
    email: 'vc@ui.edu.ng',
  },
  {
    name: 'Prince Oluyemisi Adetayo Adeaga (JP)',
    title: 'Director',
    photo: '/images/management/Prince-Oluyemisi-Adetayo.jpg',
    bio: 'He is a Financial Manager with a B.Sc in Business Administration and an MBA in Marketing. He has served many years as an accountant, business mogul, astute administrator and social worker, with a meritorious career progression in the Oyo State Civil Service from the Executive cadre to the Auditor cadre and then Director.',
    email: 'board@univent.ui.edu.ng',
  },
  {
    name: 'Mr. Adewuyi Popoola',
    title: 'Director (Bursar, University of Ibadan)',
    photo: '/images/management/Mr-Adewuyi-Popoola.jpg',
    bio: 'He is another inestimable member of U.I. Ventures Limited. Mr. Popoola is an administrator, Fellow of the Institute of Chartered Accountants of Nigeria, and the Head of the Bursary Department of the University of Ibadan.',
    email: 'bursar@ui.edu.ng',
  },
  {
    name: 'Mr. Ganiyu Oke Saliu',
    title: 'Director (Registrar, University of Ibadan)',
    photo: '/images/management/Mr-Ganiu-Oke.jpg',
    bio: 'He is an administrator to the core and represents the University of Ibadan on the Board of Directors of U.I. Ventures Limited. He is the Registrar of the University of Ibadan.',
    email: 'registrar@ui.edu.ng',
  },
]

function MemberCard({ member, large }: { member: BoardMember; large?: boolean }) {
  return (
    <Card className="cursor-default overflow-hidden">
      <div className={large ? 'grid sm:grid-cols-[220px_1fr]' : ''}>
        <img src={member.photo} alt={member.name} className={large ? 'h-64 sm:h-full w-full object-cover object-top' : 'h-72 w-full object-cover object-top'} loading="lazy" />
        <CardContent className="p-5">
          <Badge variant="secondary">{member.title}</Badge>
          <h3 className={`font-heading font-extrabold mt-2 ${large ? 'text-2xl' : 'text-lg'}`}>{member.name}</h3>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{member.bio}</p>
          <div className="flex items-center gap-2 text-sm text-primary-700 mt-3"><Mail className="h-4 w-4" /> {member.email}</div>
        </CardContent>
      </div>
    </Card>
  )
}

export function Management() {
  return (
    <div>
      <div className="bg-primary-950 text-white">
        <div className="container-custom py-14">
          <Badge className="bg-secondary-400 text-black border-0">Management</Badge>
          <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mt-4 flex items-center gap-3">
            <Users className="h-10 w-10 text-secondary-400" /> Board of Directors
          </h1>
          <p className="mt-3 text-blue-100 max-w-2xl">The distinguished leaders steering U.I. Ventures Limited — six divisions, one marketplace.</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <h2 className="font-heading text-xl font-bold flex items-center gap-2"><Crown className="h-5 w-5 text-secondary-600" /> Chairman of the Board</h2>
        <div className="mt-4 max-w-3xl">
          <MemberCard member={chairman} large />
        </div>

        <h2 className="font-heading text-xl font-bold mt-10">Directors</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-5">
          {directors.map(d => <MemberCard key={d.name} member={d} />)}
        </div>

        <Card className="mt-10 cursor-default bg-primary-950 text-white"><CardContent className="p-6 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <div className="font-bold text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-secondary-400" /> Ventures House, Oduduwa Road, University of Ibadan</div>
            <div className="text-sm text-blue-100">For partnerships, wholesale and corporate enquiries, reach the board secretariat.</div>
          </div>
          <Link to="/contact"><Button variant="secondary">Contact Us <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </CardContent></Card>
      </div>
    </div>
  )
}
