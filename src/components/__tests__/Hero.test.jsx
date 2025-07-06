import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Hero from '../Hero'

const TestWrapper = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
)

// Mock للـ theme utils
vi.mock('../../utils/theme', () => ({
  buttonStyles: {
    primary: 'bg-blue-500 text-white px-4 py-2 rounded'
  },
  colors: {}
}))

// Mock setInterval to prevent automatic slide changes during tests
const originalSetInterval = global.setInterval
const originalClearInterval = global.clearInterval

describe('Hero Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Mock setInterval to return a controllable timer
    global.setInterval = vi.fn(() => 123)
    global.clearInterval = vi.fn()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    // Restore original functions
    global.setInterval = originalSetInterval
    global.clearInterval = originalClearInterval
  })

  it('يجب أن يعرض الشريحة الأولى بشكل افتراضي', async () => {
    await act(async () => {
      render(<Hero />, { wrapper: TestWrapper })
    })

    // انتظار تحديثات الـ state المتزامنة
    await act(async () => {
      vi.advanceTimersByTime(0)
    })

    expect(screen.getByText('محاضرة الأمير تركي الفيصل')).toBeInTheDocument()
    expect(screen.getByText('٢٤ مايو ٢٠٢٥')).toBeInTheDocument()
  })

  it('يجب أن يعرض التاريخ والوصف لكل شريحة', async () => {
    await act(async () => {
      render(<Hero />, { wrapper: TestWrapper })
    })

    // انتظار تحديثات الـ state المتزامنة
    await act(async () => {
      vi.advanceTimersByTime(0)
    })

    expect(screen.getByText('٢٤ مايو ٢٠٢٥')).toBeInTheDocument()
    expect(screen.getByText(/محاضرة يلقيها صاحب السمو الملكي/)).toBeInTheDocument()
  })
})
