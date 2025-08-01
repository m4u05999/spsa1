// src/tests/Home.test.jsx
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

// Mock Hero component
vi.mock('../components/Hero', () => ({
  default: () => <div data-testid="hero-component">Hero Component</div>
}));

// Mock LatestPublications component
vi.mock('../components/LatestPublications', () => ({
  default: () => <div data-testid="latest-publications">Latest Publications</div>
}));

// Mock ImageComponent
vi.mock('../components/ImageComponent', () => ({
  default: ({ src, alt, className }) => (
    <img src={src} alt={alt} className={className} />
  )
}));

// Helper function to render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home', () => {
  let Home;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    // Import the component after mocks are set up
    Home = (await import('../pages/Home')).default;
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
      getContent: vi.fn(),
      searchContent: vi.fn()
    });

    renderWithRouter(<Home />);
    
    expect(screen.getByText('جاري تحميل البيانات...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render error state', async () => {
    const { useMasterData } = await import('../hooks/useMasterData');
    vi.mocked(useMasterData).mockReturnValue({
      data: [],
      loading: false,
      error: 'خطأ في الاتصال',
      getContent: vi.fn(),
      searchContent: vi.fn()
    });

    renderWithRouter(<Home />);
    
    expect(screen.getByText('خطأ في تحميل البيانات: خطأ في الاتصال')).toBeInTheDocument();
  });

  it('should render successfully when data is loaded', async () => {
    const { useMasterData } = await import('../hooks/useMasterData');
    const mockGetContent = vi.fn().mockResolvedValue([]);
    
    vi.mocked(useMasterData).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      getContent: mockGetContent,
      searchContent: vi.fn()
    });

    const { container } = renderWithRouter(<Home />);
    
    // Check that the component renders without crashing
    expect(container).toBeInTheDocument();
    
    // Check that Hero and LatestPublications components are rendered
    expect(screen.getByTestId('hero-component')).toBeInTheDocument();
    expect(screen.getByTestId('latest-publications')).toBeInTheDocument();
  });

  it('should call getContent for different content types on mount', async () => {
    const { useMasterData } = await import('../hooks/useMasterData');
    const mockGetContent = vi.fn().mockResolvedValue([]);
    
    vi.mocked(useMasterData).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      getContent: mockGetContent,
      searchContent: vi.fn()
    });

    renderWithRouter(<Home />);
    
    // Wait for useEffect to run
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Verify that getContent was called for different content types
    expect(mockGetContent).toHaveBeenCalledWith({
      contentType: 'breaking-news',
      limit: 5,
      sortBy: 'date',
      sortOrder: 'desc'
    });
    
    expect(mockGetContent).toHaveBeenCalledWith({
      contentType: 'events',
      limit: 3,
      sortBy: 'date',
      sortOrder: 'asc'
    });
    
    expect(mockGetContent).toHaveBeenCalledWith({
      contentType: 'researchers',
      limit: 3,
      featured: true
    });
  });
});
