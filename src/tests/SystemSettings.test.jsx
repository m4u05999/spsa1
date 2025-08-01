/**
 * SystemSettings Component Tests
 * اختبارات مكون إعدادات النظام
 */

import React from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock components to avoid complex dependencies
const MockComponent = ({ children, ...props }) => <div {...props}>{children}</div>;

// Mock all external dependencies
vi.mock('../hooks/useMasterData.js', () => ({
  useMasterData: vi.fn()
}));

vi.mock('../contexts/index.jsx.jsx', () => ({
  useAuth: vi.fn()
}));

vi.mock('../utils/permissions.js', () => ({
  checkPermission: vi.fn()
}));

// Import after mocking
import SystemSettings from '../pages/dashboard/modules/SystemSettings.jsx';
import { useMasterData } from '../hooks/useMasterData.js';
import { useAuth } from '../contexts/index.jsx.jsx';
import { checkPermission } from '../utils/permissions.js';

// Mock data
const mockUser = {
  id: '1',
  email: 'admin@test.com',
  role: 'admin'
};

const mockSystemSettings = {
  id: '1',
  title: 'إعدادات النظام',
  content: {
    general: {
      siteName: 'الجمعية السعودية للعلوم السياسية',
      siteDescription: 'البوابة الإلكترونية الرسمية',
      siteEmail: 'contact@saudipolsci.org',
      phoneNumber: '+966 11 123 4567',
      address: 'الرياض، المملكة العربية السعودية',
      logoUrl: '/assets/images/logo.png',
      primaryColor: '#1a8917',
      secondaryColor: '#daa520',
      faviconUrl: '/assets/images/favicon.ico'
    },
    language: {
      defaultLanguage: 'ar',
      enableEnglish: true,
      timezone: 'Asia/Riyadh',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24',
      firstDayOfWeek: 'saturday'
    },
    backup: {
      automaticBackup: true,
      backupFrequency: 'daily',
      backupTime: '03:00',
      retentionDays: 30,
      storageLimit: 5,
      lastBackupDate: '2024-05-01T03:00:00',
      backupLocation: 'cloud'
    }
  },
  contentType: 'system_settings',
  status: 'published'
};

// Mock functions
const mockGetContent = vi.fn();
const mockCreateContent = vi.fn();
const mockUpdateContent = vi.fn();
const mockDeleteContent = vi.fn();

describe('SystemSettings Component', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock window.alert to avoid JSDOM errors
    global.alert = vi.fn();

    // Setup default permissions (allow access)
    const { checkPermission } = await import('../utils/permissions.js');
    vi.mocked(checkPermission).mockReturnValue(true);

    // Setup auth mock
    const { useAuth } = await import('../contexts/index.jsx.jsx');
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true
    });

    // Setup MasterDataService mock
    const { useMasterData } = await import('../hooks/useMasterData.js');
    vi.mocked(useMasterData).mockReturnValue({
      data: [mockSystemSettings],
      loading: false,
      error: null,
      getContent: mockGetContent,
      createContent: mockCreateContent,
      updateContent: mockUpdateContent,
      deleteContent: mockDeleteContent
    });

    // Setup default mock responses
    mockGetContent.mockResolvedValue([mockSystemSettings]);
    mockCreateContent.mockResolvedValue(mockSystemSettings);
    mockUpdateContent.mockResolvedValue(mockSystemSettings);
  });

  test('renders system settings interface correctly', async () => {
    render(<SystemSettings />);
    
    await waitFor(() => {
      expect(screen.getByText('إعدادات النظام')).toBeInTheDocument();
    });
    
    // Check main tabs
    expect(screen.getByText('إعدادات عامة')).toBeInTheDocument();
    expect(screen.getByText('اللغة والمنطقة')).toBeInTheDocument();
    expect(screen.getByText('النسخ الاحتياطي')).toBeInTheDocument();
    expect(screen.getByText('وسائل التواصل')).toBeInTheDocument();
    expect(screen.getByText('البريد الإلكتروني')).toBeInTheDocument();
    expect(screen.getByText('الإشعارات')).toBeInTheDocument();
    expect(screen.getByText('الأمان')).toBeInTheDocument();
    
    // Check save button
    expect(screen.getByText('حفظ الإعدادات')).toBeInTheDocument();
    
    // Check data source indicator
    expect(screen.getByText('مصدر البيانات: MasterDataService')).toBeInTheDocument();
  });

  test('loads system settings from MasterDataService on mount', async () => {
    render(<SystemSettings />);
    
    await waitFor(() => {
      expect(mockGetContent).toHaveBeenCalledWith({
        contentType: 'system_settings',
        limit: 1
      });
    });
  });

  test('displays loaded settings data correctly', async () => {
    render(<SystemSettings />);
    
    await waitFor(() => {
      // Check if general settings are displayed (site name input should have the value)
      const siteNameInput = screen.getByDisplayValue('الجمعية السعودية للعلوم السياسية');
      expect(siteNameInput).toBeInTheDocument();
    });
  });

  test('handles tab switching correctly', async () => {
    render(<SystemSettings />);
    
    await waitFor(() => {
      expect(screen.getByText('إعدادات عامة')).toBeInTheDocument();
    });
    
    // Click on language tab
    const languageTab = screen.getByText('اللغة والمنطقة');
    fireEvent.click(languageTab);
    
    // Should show language settings
    await waitFor(() => {
      expect(screen.getByText('اللغة الافتراضية')).toBeInTheDocument();
    });
  });

  test('handles form input changes correctly', async () => {
    render(<SystemSettings />);
    
    await waitFor(() => {
      const siteNameInput = screen.getByDisplayValue('الجمعية السعودية للعلوم السياسية');
      expect(siteNameInput).toBeInTheDocument();
      
      // Change the site name
      fireEvent.change(siteNameInput, { target: { value: 'اسم جديد للموقع' } });
      
      // Check if the value changed
      expect(siteNameInput.value).toBe('اسم جديد للموقع');
    });
  });

  test('saves settings to MasterDataService successfully', async () => {
    render(<SystemSettings />);
    
    await waitFor(() => {
      expect(screen.getByText('حفظ الإعدادات')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByText('حفظ الإعدادات');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateContent).toHaveBeenCalled();
    });
  });

  test('creates new settings if none exist', async () => {
    // Setup specific mock for this test - empty data and empty getContent response
    const { useMasterData } = await import('../hooks/useMasterData.js');
    vi.mocked(useMasterData).mockReturnValue({
      data: [], // Empty data array
      loading: false,
      error: null,
      getContent: mockGetContent,
      createContent: mockCreateContent,
      updateContent: mockUpdateContent,
      deleteContent: mockDeleteContent
    });

    // Mock empty response for getContent - both for initial load and save check
    mockGetContent.mockResolvedValue([]); // Use mockResolvedValue instead of mockResolvedValueOnce

    render(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('حفظ الإعدادات')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('حفظ الإعدادات');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreateContent).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test('shows loading state while fetching data', async () => {
    // Mock loading state
    const { useMasterData } = await import('../hooks/useMasterData.js');
    vi.mocked(useMasterData).mockReturnValue({
      data: [],
      loading: true,
      error: null,
      getContent: mockGetContent,
      createContent: mockCreateContent,
      updateContent: mockUpdateContent,
      deleteContent: mockDeleteContent
    });
    
    render(<SystemSettings />);
    
    expect(screen.getByText('🔄 جاري التحميل...')).toBeInTheDocument();
  });

  test('handles MasterDataService errors gracefully', async () => {
    // Mock error state
    const { useMasterData } = await import('../hooks/useMasterData.js');
    vi.mocked(useMasterData).mockReturnValue({
      data: [],
      loading: false,
      error: 'Service error',
      getContent: mockGetContent,
      createContent: mockCreateContent,
      updateContent: mockUpdateContent,
      deleteContent: mockDeleteContent
    });
    
    render(<SystemSettings />);
    
    expect(screen.getByText('⚠️ خطأ في الاتصال بالخدمة')).toBeInTheDocument();
  });

  test('handles permission denied correctly', async () => {
    // Mock permission denied
    const { checkPermission } = await import('../utils/permissions.js');
    vi.mocked(checkPermission).mockReturnValue(false);
    
    render(<SystemSettings />);
    
    expect(screen.getByText('غير مصرح لك')).toBeInTheDocument();
    expect(screen.getByText('ليس لديك صلاحية لإدارة إعدادات النظام')).toBeInTheDocument();
  });

  test('shows backup settings correctly', async () => {
    render(<SystemSettings />);
    
    await waitFor(() => {
      expect(screen.getByText('النسخ الاحتياطي')).toBeInTheDocument();
    });
    
    // Click on backup tab
    const backupTab = screen.getByText('النسخ الاحتياطي');
    fireEvent.click(backupTab);
    
    await waitFor(() => {
      expect(screen.getByText('النسخ الاحتياطي التلقائي')).toBeInTheDocument();
      expect(screen.getByText('تكرار النسخ الاحتياطي')).toBeInTheDocument();
    });
  });

  test('handles checkbox changes correctly', async () => {
    render(<SystemSettings />);
    
    await waitFor(() => {
      expect(screen.getByText('النسخ الاحتياطي')).toBeInTheDocument();
    });
    
    // Click on backup tab
    const backupTab = screen.getByText('النسخ الاحتياطي');
    fireEvent.click(backupTab);
    
    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      
      // Toggle checkbox
      fireEvent.click(checkbox);
      
      // Checkbox state should change
      expect(checkbox.checked).toBe(false);
    });
  });

  test('disables save button during loading', async () => {
    // Mock loading state
    const { useMasterData } = await import('../hooks/useMasterData.js');
    vi.mocked(useMasterData).mockReturnValue({
      data: [],
      loading: true,
      error: null,
      getContent: mockGetContent,
      createContent: mockCreateContent,
      updateContent: mockUpdateContent,
      deleteContent: mockDeleteContent
    });
    
    render(<SystemSettings />);
    
    const saveButton = screen.getByText('حفظ الإعدادات');
    expect(saveButton).toBeDisabled();
  });

  test('shows data source and last update information', async () => {
    render(<SystemSettings />);
    
    await waitFor(() => {
      expect(screen.getByText('مصدر البيانات: MasterDataService')).toBeInTheDocument();
      expect(screen.getByText(/آخر تحديث:/)).toBeInTheDocument();
    });
  });
});
