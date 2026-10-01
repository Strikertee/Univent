import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { ApiResponse, ApiError } from '../types'

class ApiService {
  private client: AxiosInstance
  private static instance: ApiService

  private constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 30000,
    })

    this.setupInterceptors()
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: AxiosError) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  public getClient(): AxiosInstance {
    return this.client
  }

  /** True when the Laravel API answers — otherwise the site runs in demo mode. */
  async checkConnection(timeoutMs = 5000): Promise<boolean> {
    try {
      const res = await this.client.get<ApiResponse<unknown>>('/health', { timeout: timeoutMs })
      return res.data?.success === true
    } catch {
      return false
    }
  }

  // Auth
  async login(credentials: { email: string; password: string; remember?: boolean }) {
    const response = await this.client.post<ApiResponse<{ user: any; token: string }>>('/auth/login', credentials)
    return response.data
  }

  async register(data: { firstName: string; lastName: string; email: string; phone: string; password: string; passwordConfirmation: string }) {
    const response = await this.client.post<ApiResponse<{ user: any; token: string }>>('/auth/register', data)
    return response.data
  }

  async logout() {
    const response = await this.client.post<ApiResponse<null>>('/auth/logout')
    return response.data
  }

  async getProfile() {
    const response = await this.client.get<ApiResponse<{ user: any }>>('/auth/profile')
    return response.data
  }

  async updateProfile(data: Partial<any>) {
    const response = await this.client.put<ApiResponse<{ user: any }>>('/auth/profile', data)
    return response.data
  }

  async changePassword(data: { currentPassword: string; newPassword: string; newPasswordConfirmation: string }) {
    const response = await this.client.put<ApiResponse<null>>('/auth/password', data)
    return response.data
  }

  async requestPasswordReset(email: string) {
    const response = await this.client.post<ApiResponse<null>>('/auth/forgot-password', { email })
    return response.data
  }

  async resetPassword(data: { token: string; email: string; password: string; passwordConfirmation: string }) {
    const response = await this.client.post<ApiResponse<null>>('/auth/reset-password', data)
    return response.data
  }

  // Divisions
  async getDivisions(params?: { isActive?: boolean }) {
    const response = await this.client.get<ApiResponse<any[]>>('/divisions', { params })
    return response.data
  }

  async getDivision(slug: string) {
    const response = await this.client.get<ApiResponse<any>>(`/divisions/${slug}`)
    return response.data
  }

  async createDivision(data: any) {
    const response = await this.client.post<ApiResponse<any>>('/divisions', data)
    return response.data
  }

  async updateDivision(id: string, data: any) {
    const response = await this.client.put<ApiResponse<any>>(`/divisions/${id}`, data)
    return response.data
  }

  async deleteDivision(id: string) {
    const response = await this.client.delete<ApiResponse<null>>(`/divisions/${id}`)
    return response.data
  }

  // Categories
  async getCategories(params?: { divisionId?: string; isActive?: boolean }) {
    const response = await this.client.get<ApiResponse<any[]>>('/categories', { params })
    return response.data
  }

  async getCategory(id: string) {
    const response = await this.client.get<ApiResponse<any>>(`/categories/${id}`)
    return response.data
  }

  async createCategory(data: any) {
    const response = await this.client.post<ApiResponse<any>>('/categories', data)
    return response.data
  }

  async updateCategory(id: string, data: any) {
    const response = await this.client.put<ApiResponse<any>>(`/categories/${id}`, data)
    return response.data
  }

  async deleteCategory(id: string) {
    const response = await this.client.delete<ApiResponse<null>>(`/categories/${id}`)
    return response.data
  }

  // Products
  async getProducts(params?: any) {
    const response = await this.client.get<ApiResponse<any[]>>('/products', { params })
    return response.data
  }

  async getProduct(slug: string) {
    const response = await this.client.get<ApiResponse<any>>(`/products/${slug}`)
    return response.data
  }

  async createProduct(data: any) {
    const response = await this.client.post<ApiResponse<any>>('/products', data)
    return response.data
  }

  async updateProduct(id: string, data: any) {
    const response = await this.client.put<ApiResponse<any>>(`/products/${id}`, data)
    return response.data
  }

  async deleteProduct(id: string) {
    const response = await this.client.delete<ApiResponse<null>>(`/products/${id}`)
    return response.data
  }

  // Rooms
  async getRooms(params?: any) {
    const response = await this.client.get<ApiResponse<any[]>>('/rooms', { params })
    return response.data
  }

  async getRoom(slug: string) {
    const response = await this.client.get<ApiResponse<any>>(`/rooms/${slug}`)
    return response.data
  }

  async createRoom(data: any) {
    const response = await this.client.post<ApiResponse<any>>('/rooms', data)
    return response.data
  }

  async updateRoom(id: string, data: any) {
    const response = await this.client.put<ApiResponse<any>>(`/rooms/${id}`, data)
    return response.data
  }

  async deleteRoom(id: string) {
    const response = await this.client.delete<ApiResponse<null>>(`/rooms/${id}`)
    return response.data
  }

  async checkRoomAvailability(roomId: string, checkIn: string, checkOut: string) {
    const response = await this.client.get<ApiResponse<{ available: number; total: number }>>(`/rooms/${roomId}/availability`, {
      params: { checkIn, checkOut }
    })
    return response.data
  }

  // Facilities
  async getFacilities(params?: { divisionId?: string; isActive?: boolean }) {
    const response = await this.client.get<ApiResponse<any[]>>('/facilities', { params })
    return response.data
  }

  async getFacility(id: string) {
    const response = await this.client.get<ApiResponse<any>>(`/facilities/${id}`)
    return response.data
  }

  async createFacility(data: any) {
    const response = await this.client.post<ApiResponse<any>>('/facilities', data)
    return response.data
  }

  async updateFacility(id: string, data: any) {
    const response = await this.client.put<ApiResponse<any>>(`/facilities/${id}`, data)
    return response.data
  }

  async deleteFacility(id: string) {
    const response = await this.client.delete<ApiResponse<null>>(`/facilities/${id}`)
    return response.data
  }

  // Bookings
  async createBooking(data: any) {
    const response = await this.client.post<ApiResponse<any>>('/bookings', data)
    return response.data
  }

  async getBookings(params?: any) {
    const response = await this.client.get<ApiResponse<any[]>>('/bookings', { params })
    return response.data
  }

  async getBooking(id: string) {
    const response = await this.client.get<ApiResponse<any>>(`/bookings/${id}`)
    return response.data
  }

  async updateBooking(id: string, data: any) {
    const response = await this.client.put<ApiResponse<any>>(`/bookings/${id}`, data)
    return response.data
  }

  async cancelBooking(id: string) {
    const response = await this.client.post<ApiResponse<null>>(`/bookings/${id}/cancel`)
    return response.data
  }

  // Orders
  async createOrder(data: any) {
    const response = await this.client.post<ApiResponse<any>>('/orders', data)
    return response.data
  }

  async getOrders(params?: any) {
    const response = await this.client.get<ApiResponse<any[]>>('/orders', { params })
    return response.data
  }

  async getOrder(id: string) {
    const response = await this.client.get<ApiResponse<any>>(`/orders/${id}`)
    return response.data
  }

  async updateOrder(id: string, data: any) {
    const response = await this.client.put<ApiResponse<any>>(`/orders/${id}`, data)
    return response.data
  }

  // Users (Admin)
  async getUsers(params?: any) {
    const response = await this.client.get<ApiResponse<any[]>>('/users', { params })
    return response.data
  }

  async getUser(id: string) {
    const response = await this.client.get<ApiResponse<any>>(`/users/${id}`)
    return response.data
  }

  async createUser(data: any) {
    const response = await this.client.post<ApiResponse<any>>('/users', data)
    return response.data
  }

  async updateUser(id: string, data: any) {
    const response = await this.client.put<ApiResponse<any>>(`/users/${id}`, data)
    return response.data
  }

  async deleteUser(id: string) {
    const response = await this.client.delete<ApiResponse<null>>(`/users/${id}`)
    return response.data
  }

  // Dashboard
  async getDashboardStats(params?: any) {
    const response = await this.client.get<ApiResponse<any>>('/dashboard/stats', { params })
    return response.data
  }

  async getRevenueChart(params?: any) {
    const response = await this.client.get<ApiResponse<any[]>>('/dashboard/revenue-chart', { params })
    return response.data
  }

  async getOrdersChart(params?: any) {
    const response = await this.client.get<ApiResponse<any[]>>('/dashboard/orders-chart', { params })
    return response.data
  }

  // Settings
  async getSettings() {
    const response = await this.client.get<ApiResponse<any>>('/settings')
    return response.data
  }

  async updateSettings(data: any) {
    const response = await this.client.put<ApiResponse<any>>('/settings', data)
    return response.data
  }

  // Notifications
  async getNotifications(params?: any) {
    const response = await this.client.get<ApiResponse<any[]>>('/notifications', { params })
    return response.data
  }

  async markNotificationRead(id: string) {
    const response = await this.client.put<ApiResponse<null>>(`/notifications/${id}/read`)
    return response.data
  }

  async markAllNotificationsRead() {
    const response = await this.client.put<ApiResponse<null>>('/notifications/read-all')
    return response.data
  }

  // Reviews
  async getReviews(params?: any) {
    const response = await this.client.get<ApiResponse<any[]>>('/reviews', { params })
    return response.data
  }

  async createReview(data: any) {
    const response = await this.client.post<ApiResponse<any>>('/reviews', data)
    return response.data
  }

  async updateReview(id: string, data: any) {
    const response = await this.client.put<ApiResponse<any>>(`/reviews/${id}`, data)
    return response.data
  }

  async deleteReview(id: string) {
    const response = await this.client.delete<ApiResponse<null>>(`/reviews/${id}`)
    return response.data
  }

  // File Upload
  async uploadFile(file: File, folder: string = 'uploads') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    const response = await this.client.post<ApiResponse<{ url: string }>>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }

  async uploadMultipleFiles(files: File[], folder: string = 'uploads') {
    const formData = new FormData()
    files.forEach(file => formData.append('files[]', file))
    formData.append('folder', folder)
    const response = await this.client.post<ApiResponse<{ urls: string[] }>>('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
}

export const api = ApiService.getInstance()
export default api