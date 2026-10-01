import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home'
import { DivisionsPage } from './pages/division/DivisionsPage'
import { DivisionDetail } from './pages/division/DivisionDetail'
import { HotelRooms } from './pages/hotel/HotelRooms'
import { RoomDetail } from './pages/hotel/RoomDetail'
import { BookingPage } from './pages/hotel/BookingPage'
import { BakeryProducts } from './pages/bakery/BakeryProducts'
import { ProductDetail } from './pages/bakery/ProductDetail'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { CartPage } from './pages/cart/CartPage'
import { CheckoutPage } from './pages/checkout/CheckoutPage'
import { PaymentPage } from './pages/payment/PaymentPage'
import { Management } from './pages/Management'
import { Dashboard } from './pages/dashboard/Dashboard'
import { Orders } from './pages/dashboard/Orders'
import { Bookings } from './pages/dashboard/Bookings'
import { Profile } from './pages/dashboard/Profile'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminRoute } from './components/auth/AdminRoute'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { DivisionManagement } from './pages/admin/DivisionManagement'
import { ProductManagement } from './pages/admin/ProductManagement'
import { RoomManagement } from './pages/admin/RoomManagement'
import { FacilityManagement } from './pages/admin/FacilityManagement'
import { OrderManagement } from './pages/admin/OrderManagement'
import { BookingManagement } from './pages/admin/BookingManagement'
import { UserManagement } from './pages/admin/UserManagement'
import { Settings } from './pages/admin/Settings'
import { DailySales } from './pages/admin/DailySales'
import { About, Careers, Press, Blog, Help, Contact, Faq, Shipping, Returns, Privacy, Terms, Cookies, AccessibilityM } from './pages/info/InfoPages'
import { NotFound } from './pages/NotFound'

export function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/divisions" element={<DivisionsPage />} />
        <Route path="/management" element={<Management />} />

        {/* Division landing pages (story, facilities) + sub-pages */}
        <Route path="/division/:slug" element={<DivisionDetail />} />

        {/* Hotel Routes */}
        <Route path="/division/hotels/rooms" element={<HotelRooms />} />
        <Route path="/division/hotels/rooms/:slug" element={<RoomDetail />} />
        <Route path="/division/hotels/rooms/:slug/book" element={<BookingPage />} />

        {/* Bakery Routes */}
        <Route path="/division/bakery-fastfood/products" element={<BakeryProducts />} />
        <Route path="/division/bakery-fastfood/products/:slug" element={<ProductDetail />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Cart & Checkout */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* Company / Support / Legal — no more 404s */}
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/press" element={<Press />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/accessibility" element={<AccessibilityM />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/divisions" element={<DivisionManagement />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/rooms" element={<RoomManagement />} />
          <Route path="/admin/facilities" element={<FacilityManagement />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
          <Route path="/admin/bookings" element={<BookingManagement />} />
          <Route path="/admin/sales" element={<DailySales />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
