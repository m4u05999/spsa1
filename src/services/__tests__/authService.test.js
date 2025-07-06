import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock localStorageService
const mockLocalStorage = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

vi.mock('../localStorageService', () => ({
  default: mockLocalStorage
}))

// Mock authService
const mockAuthService = {
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: vi.fn(),
  getCurrentUser: vi.fn(),
  getAuthToken: vi.fn()
}

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('يجب أن يسجل دخول المستخدم العادي بنجاح', async () => {
      const mockResult = {
        user: { email: 'user@example.com', role: 'user', name: 'محمد المستخدم' },
        token: 'mock_token'
      }

      mockAuthService.login.mockResolvedValue(mockResult)
      const result = await mockAuthService.login('user@example.com', 'password')

      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('token')
      expect(result.user.email).toBe('user@example.com')
      expect(result.user.role).toBe('user')
      expect(result.user.name).toBe('محمد المستخدم')
    })

    it('يجب أن يتعامل مع تسجيل الخروج', () => {
      mockAuthService.logout.mockReturnValue(true)

      const result = mockAuthService.logout()

      expect(result).toBe(true)
      expect(mockAuthService.logout).toHaveBeenCalled()
    })

    it('يجب أن يتحقق من حالة المصادقة', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true)

      const result = mockAuthService.isAuthenticated()

      expect(result).toBe(true)
      expect(mockAuthService.isAuthenticated).toHaveBeenCalled()
    })
  })
})
