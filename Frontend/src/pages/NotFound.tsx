import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl font-extrabold text-primary-700">404</div>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="text-gray-500 mt-2">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-6"><Button>Back Home</Button></Link>
    </div>
  )
}
