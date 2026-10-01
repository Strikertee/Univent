import * as React from 'react'
import { Menu, X, ShoppingCart, LogOut, LayoutDashboard, Store, Heart, Bell } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { getInitials, formatCurrency } from '../../lib/utils'

const divisions = [
  { name: 'U.I. Bakery & Fast Food', slug: 'bakery-fastfood', icon: '🍞', color: 'bg-secondary-400' },
  { name: 'U.I. Petrol Station', slug: 'petrol-station', icon: '⛽', color: 'bg-primary-600' },
  { name: 'U.I. Printing Press', slug: 'printing-press', icon: '🖨️', color: 'bg-primary-950' },
  { name: 'U.I. Health, Safety & Environment', slug: 'health-safety', icon: '🏥', color: 'bg-primary-600' },
  { name: 'U.I. Consultancy Services', slug: 'consultancy', icon: '💼', color: 'bg-black' },
  { name: 'U.I. Hotels', slug: 'hotels', icon: '🏨', color: 'bg-secondary-500' },
]

export function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const { cart, toggleCart, closeCart } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const isAdmin = user?.role === 'super_admin' || user?.role === 'division_admin'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-sky-300 border-b border-sky-400 shadow-sm"
      >
        <nav className="container-custom" aria-label="Main navigation">
          <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Univent Home">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-700 shadow-glow">
                <span className="text-white font-extrabold text-lg">U</span>
              </div>
              <span className="hidden sm:block leading-none">
                <span className="font-heading font-extrabold text-xl text-black dark:text-white block">
                  Univ<span className="text-primary-600">ent</span>
                </span>
                <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-secondary-600">
                  University of Ibadan
                </span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              {divisions.map((division) => (
                <Link
                  key={division.slug}
                  to={`/division/${division.slug}`}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    location.pathname.startsWith(`/division/${division.slug}`)
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                >
                  <span className={cn('text-lg', division.color)}>{division.icon}</span>
                  <span>{division.name}</span>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Cart Button (Mobile) — customers only */}
              {!isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative lg:hidden"
                aria-label={`Shopping cart, ${cart.totalItems} items`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                    {cart.totalItems > 99 ? '99+' : cart.totalItems}
                  </span>
                )}
              </Button>
              )}

              <AnimatePresence mode="wait">
                {isAuthenticated && !isLoading ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="hidden lg:flex lg:items-center lg:gap-1"
                  >
                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                    </Button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-expanded={isProfileOpen}
                        aria-haspopup="true"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar} alt={user ? `${user.firstName} ${user.lastName}` : ''} />
                          <AvatarFallback>{getInitials(user?.firstName + ' ' + user?.lastName || '')}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm hidden sm:block">{user?.firstName}</span>
                      </button>

                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-900"
                        >
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <p className="font-semibold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                            <Badge variant="outline" className="mt-1.5 capitalize">{user?.role.replace('_', ' ')}</Badge>
                          </div>
                          <Link
                            to="/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <Store className="h-4 w-4" />
                            My Orders
                          </Link>
                          <Link
                            to="/bookings"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <Heart className="h-4 w-4" />
                            My Bookings
                          </Link>
                          <hr className="my-2 border-gray-100 dark:border-gray-700" />
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </div>

                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="hidden lg:flex lg:items-center lg:gap-2"
                  >
                    <Link to="/login">
                      <Button variant="ghost" size="sm">Sign In</Button>
                    </Link>
                    <Link to="/register">
                      <Button size="sm">Get Started</Button>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cart Button (Desktop) — customers only, always visible when not admin */}
              {!isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative hidden lg:inline-flex"
                aria-label={`Shopping cart, ${cart.totalItems} items`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-400 text-xs font-bold text-black">
                    {cart.totalItems > 99 ? '99+' : cart.totalItems}
                  </span>
                )}
              </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white lg:hidden shadow-xl"
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100">
                  <span className="font-heading font-bold text-xl text-gray-900">Menu</span>
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                  {divisions.map((division) => (
                    <Link
                      key={division.slug}
                      to={`/division/${division.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all',
                        location.pathname.startsWith(`/division/${division.slug}`)
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                      )}
                    >
                      <span className={cn('text-2xl', division.color)}>{division.icon}</span>
                      <span>{division.name}</span>
                    </Link>
                  ))}

                  <hr className="my-4 border-gray-100 dark:border-gray-700" />

                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Store className="h-5 w-5" />
                        My Orders
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Heart className="h-5 w-5" />
                        My Bookings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3 pt-4">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full justify-center" size="lg">Sign In</Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-center" size="lg">Create Account</Button>
                      </Link>
                    </div>
                  )}
                </nav>

                {/* Cart Summary (Mobile, customers only) */}
                {!isAdmin && cart.totalItems > 0 && (
                  <div className="border-t border-gray-100 p-4 dark:border-gray-700">
                    <Link to="/cart" onClick={() => { setIsMenuOpen(false); closeCart(); }}>
                      <Button className="w-full justify-between" size="lg">
                        <span>View Cart ({cart.totalItems} items)</span>
                        <span className="font-bold">{formatCurrency(cart.total)}</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}