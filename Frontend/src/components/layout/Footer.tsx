import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react'

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Management', href: '/management' },
    { label: 'Our Divisions', href: '/divisions' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/blog' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQs', href: '/faq' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Accessibility', href: '/accessibility' },
  ],
  divisions: [
    { label: 'U.I. Bakery & Fast Food', href: '/division/bakery-fastfood' },
    { label: 'U.I. Petrol Station', href: '/division/petrol-station' },
    { label: 'U.I. Printing Press', href: '/division/printing-press' },
    { label: 'U.I. Health & Safety', href: '/division/health-safety' },
    { label: 'U.I. Consultancy', href: '/division/consultancy' },
    { label: 'U.I. Hotels', href: '/division/hotels' },
  ],
}

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/univent', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com/univent', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com/univent', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com/company/univent', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com/univent', label: 'YouTube' },
]

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="container-custom py-16 lg:py-24">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6" aria-label="Univent Home">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 shadow-glow">
                <span className="text-white font-extrabold text-2xl">U</span>
              </div>
              <span className="leading-none">
                <span className="font-heading font-extrabold text-2xl text-black dark:text-white block">Univ<span className="text-primary-600">ent</span></span>
                <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-secondary-600">University of Ibadan</span>
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs text-balance">
              <span className="text-black dark:text-white font-semibold">University of Ibadan Ventures</span> - Your trusted marketplace for quality products,
              services, and accommodation within the University community.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-all"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Divisions */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Our Divisions</h3>
            <ul className="space-y-3">
              {footerLinks.divisions.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h3>
            <address className="not-italic space-y-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">University of Ibadan Ventures</p>
                  <p className="text-sm">Oduduwa Road, University of Ibadan</p>
                  <p className="text-sm">Ibadan, Oyo State, Nigeria</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary-600 shrink-0" />
                <a href="tel:+2348001234567" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  +234 800 123 4567
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-600 shrink-0" />
                <a href="mailto:ventures@ui.edu.ng" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  ventures@ui.edu.ng
                </a>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} University of Ibadan Ventures. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <span>Secure Payments:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary-700">Bank Transfer</span>
                <span className="text-xs">• receipt confirmed by admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}