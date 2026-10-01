import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { CartDrawer } from '../cart/CartDrawer'
import { ScrollToTop } from './ScrollToTop'

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1 pt-16 lg:pt-20 bg-neon-dots">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
