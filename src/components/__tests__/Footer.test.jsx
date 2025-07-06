import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from '../Footer'

const TestWrapper = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
)

describe('Footer Component', () => {
  it('يجب أن يعرض عنوان الجمعية', () => {
    render(<Footer />, { wrapper: TestWrapper })

    expect(screen.getByText('الجمعية السعودية للعلوم السياسية')).toBeInTheDocument()
  })

  it('يجب أن يعرض معلومات التواصل', () => {
    render(<Footer />, { wrapper: TestWrapper })

    expect(screen.getByText('تواصل معنا')).toBeInTheDocument()
  })

  it('يجب أن يحتوي على الفئات الصحيحة للتصميم', () => {
    const { container } = render(<Footer />, { wrapper: TestWrapper })

    const footer = container.querySelector('footer')
    expect(footer).toHaveClass('bg-gray-900', 'text-white')
  })
})
