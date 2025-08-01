import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from '../Header'

// Mock useAuth hook
const mockUseAuth = vi.fn()
vi.mock('../../contexts/index.jsx', () => ({
  useAuth: () => mockUseAuth()
}))

// مكون wrapper للاختبار
const TestWrapper = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
)

describe('Header Component', () => {
  const mockLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.location.href
    delete window.location
    window.location = { href: '' }
  })

  describe('عندما لا يكون المستخدم مسجل الدخول', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        logout: mockLogout
      })
    })

    it('يجب أن يعرض شعار الجمعية', () => {
      render(<Header />, { wrapper: TestWrapper })

      const logo = screen.getByAltText('الجمعية السعودية للعلوم السياسية')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', '/assets/images/spsa-logo.PNG')
    })

    it('يجب أن يعرض القائمة الرئيسية', () => {
      render(<Header />, { wrapper: TestWrapper })

      const homeLinks = screen.getAllByText('الرئيسية')
      expect(homeLinks.length).toBeGreaterThan(0)

      const aboutLinks = screen.getAllByText('من نحن')
      expect(aboutLinks.length).toBeGreaterThan(0)
    })
  })
})
