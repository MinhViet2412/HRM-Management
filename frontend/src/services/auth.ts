import api from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  employee?: {
    id: string
    employeeCode: string
    firstName: string
    lastName: string
    department?: {
      name: string
    }
    position?: {
      title: string
    }
  }
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  async register(data: RegisterData): Promise<User> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me')
    return response.data
  },

  async forgotPassword(payload: { email: string; newPassword: string }): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', payload)
    return response.data
  },
}
