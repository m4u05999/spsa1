import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// مكون wrapper مبسط للاختبارات
const AllTheProviders = ({ children }) => {
  return (
    <MemoryRouter>
      {children}
    </MemoryRouter>
  )
}

// دالة render مخصصة تتضمن جميع الـ providers
const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// إعادة تصدير كل شيء
export * from '@testing-library/react'

// تصدير الـ render المخصص
export { customRender as render }

// Mock data للاختبارات
export const mockUser = {
  id: '1',
  name: 'محمد أحمد',
  email: 'mohammed@example.com',
  role: 'member',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z'
}

export const mockAdmin = {
  id: '2',
  name: 'أحمد محمد',
  email: 'admin@example.com',
  role: 'admin',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z'
}

export const mockNews = {
  id: '1',
  title: 'خبر تجريبي',
  content: 'محتوى الخبر التجريبي',
  author: 'الكاتب',
  publishedAt: '2024-01-01T00:00:00.000Z',
  isPublished: true
}

export const mockEvent = {
  id: '1',
  title: 'فعالية تجريبية',
  description: 'وصف الفعالية التجريبية',
  date: '2024-12-31T00:00:00.000Z',
  location: 'الرياض',
  isActive: true
}
