// src/tests/NewsDetailsPage.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock environment variables
vi.mock('../config/environment', () => ({
  default: {
    VITE_APP_ENV: 'test',
    VITE_SUPABASE_URL: 'test-url',
    VITE_SUPABASE_ANON_KEY: 'test-key'
  }
}));

// Mock the useMasterData hook
vi.mock('../hooks/useMasterData', () => ({
  useMasterData: vi.fn()
}));

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: '1' }))
  };
});

// Mock ImageComponent
vi.mock('../components/ImageComponent', () => ({
  default: ({ src, alt, className }) => (
    <img src={src} alt={alt} className={className} />
  )
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NewsDetailsPage', () => {
  let NewsDetailsPage;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Import the component after mocks are set up
    NewsDetailsPage = (await import('../pages/news/NewsDetailsPage')).default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render loading state', async () => {
    const { useMasterData } = await import('../hooks/useMasterData');
    vi.mocked(useMasterData).mockReturnValue({
      data: [],
      loading: true,
      error: null,
      getContentById: vi.fn(),
      searchContent: vi.fn()
    });

    renderWithRouter(<NewsDetailsPage />);

    // Check for loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render error state', async () => {
    const { useMasterData } = await import('../hooks/useMasterData');
    vi.mocked(useMasterData).mockReturnValue({
      data: [],
      loading: false,
      error: 'خطأ في تحميل البيانات',
      getContentById: vi.fn(),
      searchContent: vi.fn()
    });

    renderWithRouter(<NewsDetailsPage />);

    expect(screen.getByText('خطأ في تحميل البيانات')).toBeInTheDocument();
    expect(screen.getByText('العودة إلى صفحة الأخبار')).toBeInTheDocument();
  });

  it('should import and render without crashing', async () => {
    const { useMasterData } = await import('../hooks/useMasterData');
    vi.mocked(useMasterData).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      getContentById: vi.fn(),
      searchContent: vi.fn()
    });

    const { container } = renderWithRouter(<NewsDetailsPage />);
    expect(container).toBeInTheDocument();
  });
});
