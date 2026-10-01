// Core Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  divisionId?: string
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type UserRole = 
  | 'super_admin'
  | 'division_admin'
  | 'customer'
  | 'staff'

export interface Division {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  logo: string
  bannerImage?: string
  icon: string
  color: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  adminId?: string
  categories?: Category[]
  products?: Product[]
  rooms?: Room[]
  facilities?: Facility[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image?: string
  divisionId: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  products?: Product[]
  rooms?: Room[]
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  originalPrice?: number
  images: string[]
  categoryId: string
  divisionId: string
  sku: string
  stock: number
  isActive: boolean
  isFeatured: boolean
  tags: string[]
  specifications: Record<string, string>
  createdAt: string
  updatedAt: string
  category?: Category
  division?: Division
}

export interface Room {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  originalPrice?: number
  images: string[]
  categoryId: string
  divisionId: string
  capacity: number
  bedType: string
  bedSize: string
  amenities: string[]
  features: string[]
  isActive: boolean
  isFeatured: boolean
  totalRooms: number
  availableRooms: number
  createdAt: string
  updatedAt: string
  category?: Category
  division?: Division
}

export interface Facility {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  images: string[]
  divisionId: string
  icon: string
  isActive: boolean
  operatingHours?: OperatingHours
  price?: number
  requiresBooking: boolean
  createdAt: string
  updatedAt: string
  division?: Division
}

export interface OperatingHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface DayHours {
  open: string
  close: string
  isClosed: boolean
}

// Cart & Orders
export interface CartItem {
  id: string
  type: 'product' | 'room' | 'facility'
  productId?: string
  roomId?: string
  facilityId?: string
  quantity: number
  price: number
  name: string
  image: string
  metadata?: Record<string, unknown>
  checkIn?: string
  checkOut?: string
  guests?: number
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  couponCode?: string
  fulfillment: 'pickup' | 'delivery'
}

export const DELIVERY_FEE = 550

export interface Order {
  id: string
  userId: string
  divisionId: string
  items: OrderItem[]
  status: OrderStatus
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
  paymentStatus: PaymentStatus
  paymentMethod?: string
  paymentReference?: string
  shippingAddress: Address
  billingAddress: Address
  notes?: string
  createdAt: string
  updatedAt: string
  user?: User
  division?: Division
}

export interface OrderItem {
  id: string
  orderId: string
  type: 'product' | 'room' | 'facility'
  productId?: string
  roomId?: string
  facilityId?: string
  quantity: number
  price: number
  name: string
  image: string
  metadata?: Record<string, unknown>
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'

export interface Address {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

// Booking
export interface Booking {
  id: string
  userId: string
  roomId: string
  divisionId: string
  checkIn: string
  checkOut: string
  guests: number
  adults: number
  children: number
  totalNights: number
  pricePerNight: number
  subtotal: number
  tax: number
  total: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  specialRequests?: string
  createdAt: string
  updatedAt: string
  room?: Room
  user?: User
  division?: Division
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
  meta?: PaginationMeta
}

export interface PaginationMeta {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  from: number
  to: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  statusCode: number
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  passwordConfirmation: string
}

export interface AuthResponse {
  user: User
  token: string
  tokenType: string
  expiresIn: number
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordReset {
  token: string
  email: string
  password: string
  passwordConfirmation: string
}

// Filter & Search
export interface ProductFilters {
  categoryId?: string
  divisionId?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  tags?: string[]
  isFeatured?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating'
  page?: number
  perPage?: number
}

export interface RoomFilters {
  categoryId?: string
  divisionId?: string
  minPrice?: number
  maxPrice?: number
  capacity?: number
  checkIn?: string
  checkOut?: string
  guests?: number
  amenities?: string[]
  isFeatured?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  page?: number
  perPage?: number
}

// Settings
export interface SiteSettings {
  siteName: string
  siteDescription: string
  logo: string
  favicon: string
  primaryColor: string
  secondaryColor: string
  contactEmail: string
  contactPhone: string
  address: string
  socialLinks: SocialLinks
  seo: SeoSettings
  payment: PaymentSettings
  shipping: ShippingSettings
}

export interface SocialLinks {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  youtube?: string
}

export interface SeoSettings {
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  ogImage: string
}

export interface PaymentSettings {
  paystackPublicKey: string
  paystackSecretKey: string
  flutterwavePublicKey: string
  flutterwaveSecretKey: string
  bankAccounts: BankAccount[]
}

export interface BankAccount {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
  isDefault: boolean
}

export interface ShippingSettings {
  freeShippingThreshold: number
  standardShippingCost: number
  expressShippingCost: number
  pickupLocations: PickupLocation[]
}

export interface PickupLocation {
  id: string
  name: string
  address: string
  phone: string
  operatingHours: OperatingHours
  divisionId?: string
}

// Notification
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  isRead: boolean
  createdAt: string
}

export type NotificationType = 
  | 'order_placed'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'booking_confirmed'
  | 'booking_reminder'
  | 'payment_received'
  | 'payment_failed'
  | 'promotion'
  | 'system'

// Dashboard Stats
export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  recentOrders: Order[]
  topProducts: Product[]
  revenueChart: ChartDataPoint[]
  ordersChart: ChartDataPoint[]
}

export interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

// Review
export interface Review {
  id: string
  userId: string
  productId?: string
  roomId?: string
  facilityId?: string
  divisionId: string
  rating: number
  title: string
  comment: string
  images: string[]
  isVerified: boolean
  isApproved: boolean
  createdAt: string
  updatedAt: string
  user?: User
}