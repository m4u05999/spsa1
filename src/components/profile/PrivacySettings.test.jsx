// src/components/profile/PrivacySettings.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PrivacySettings from './PrivacySettings';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Wrapper component for routing
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('PrivacySettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Initial Render', () => {
    test('renders privacy settings component', () => {
      renderWithRouter(<PrivacySettings />);
      
      expect(screen.getByText('إعدادات الخصوصية السريعة')).toBeInTheDocument();
    });

    test('renders privacy level selector', () => {
      renderWithRouter(<PrivacySettings />);
      
      expect(screen.getByText('مستوى الخصوصية')).toBeInTheDocument();
      expect(screen.getByText('أساسي')).toBeInTheDocument();
      expect(screen.getByText('متوسط')).toBeInTheDocument();
      expect(screen.getByText('عالي')).toBeInTheDocument();
    });

    test('renders quick toggle switches', () => {
      renderWithRouter(<PrivacySettings />);
      
      expect(screen.getByText('الإعدادات السريعة')).toBeInTheDocument();
      expect(screen.getByLabelText('الرسائل التسويقية')).toBeInTheDocument();
      expect(screen.getByLabelText('الإشعارات')).toBeInTheDocument();
      expect(screen.getByLabelText('مشاركة البيانات التحليلية')).toBeInTheDocument();
    });

    test('renders privacy dashboard link', () => {
      renderWithRouter(<PrivacySettings />);
      
      expect(screen.getByText('إدارة الموافقات الكاملة')).toBeInTheDocument();
    });

    test('renders save button', () => {
      renderWithRouter(<PrivacySettings />);
      
      expect(screen.getByText('حفظ الإعدادات')).toBeInTheDocument();
    });
  });

  describe('Privacy Level Selection', () => {
    test('starts with basic privacy level by default', () => {
      renderWithRouter(<PrivacySettings />);
      
      const basicButton = screen.getByText('أساسي');
      expect(basicButton.closest('button')).toHaveClass('active');
    });

    test('allows changing privacy level', async () => {
      renderWithRouter(<PrivacySettings />);
      
      const mediumButton = screen.getByText('متوسط');
      fireEvent.click(mediumButton);
      
      await waitFor(() => {
        expect(mediumButton.closest('button')).toHaveClass('active');
      });
    });

    test('updates toggle switches when privacy level changes', async () => {
      renderWithRouter(<PrivacySettings />);
      
      const highButton = screen.getByText('عالي');
      fireEvent.click(highButton);
      
      await waitFor(() => {
        // In high privacy mode, marketing should be disabled
        const marketingToggle = screen.getByLabelText('الرسائل التسويقية');
        expect(marketingToggle).not.toBeChecked();
      });
    });
  });

  describe('Quick Toggle Functionality', () => {
    test('toggles marketing consent', async () => {
      renderWithRouter(<PrivacySettings />);
      
      const marketingToggle = screen.getByLabelText('الرسائل التسويقية');
      
      // Should start unchecked in basic mode
      expect(marketingToggle).not.toBeChecked();
      
      fireEvent.click(marketingToggle);
      
      await waitFor(() => {
        expect(marketingToggle).toBeChecked();
      });
    });

    test('toggles notifications consent', async () => {
      renderWithRouter(<PrivacySettings />);
      
      const notificationsToggle = screen.getByLabelText('الإشعارات');
      
      fireEvent.click(notificationsToggle);
      
      await waitFor(() => {
        expect(notificationsToggle).toBeChecked();
      });
    });

    test('toggles analytics consent', async () => {
      renderWithRouter(<PrivacySettings />);
      
      const analyticsToggle = screen.getByLabelText('مشاركة البيانات التحليلية');
      
      fireEvent.click(analyticsToggle);
      
      await waitFor(() => {
        expect(analyticsToggle).toBeChecked();
      });
    });
  });

  describe('Privacy Level Presets', () => {
    test('basic level enables basic consents only', async () => {
      renderWithRouter(<PrivacySettings />);
      
      const basicButton = screen.getByText('أساسي');
      fireEvent.click(basicButton);
      
      await waitFor(() => {
        const marketingToggle = screen.getByLabelText('الرسائل التسويقية');
        const notificationsToggle = screen.getByLabelText('الإشعارات');
        const analyticsToggle = screen.getByLabelText('مشاركة البيانات التحليلية');
        
        expect(marketingToggle).not.toBeChecked();
        expect(notificationsToggle).toBeChecked(); // Basic notifications are on
        expect(analyticsToggle).not.toBeChecked();
      });
    });

    test('medium level enables moderate consents', async () => {
      renderWithRouter(<PrivacySettings />);
      
      const mediumButton = screen.getByText('متوسط');
      fireEvent.click(mediumButton);
      
      await waitFor(() => {
        const marketingToggle = screen.getByLabelText('الرسائل التسويقية');
        const notificationsToggle = screen.getByLabelText('الإشعارات');
        const analyticsToggle = screen.getByLabelText('مشاركة البيانات التحليلية');
        
        expect(marketingToggle).toBeChecked();
        expect(notificationsToggle).toBeChecked();
        expect(analyticsToggle).toBeChecked();
      });
    });

    test('high level minimizes data sharing', async () => {
      renderWithRouter(<PrivacySettings />);
      
      const highButton = screen.getByText('عالي');
      fireEvent.click(highButton);
      
      await waitFor(() => {
        const marketingToggle = screen.getByLabelText('الرسائل التسويقية');
        const notificationsToggle = screen.getByLabelText('الإشعارات');
        const analyticsToggle = screen.getByLabelText('مشاركة البيانات التحليلية');
        
        expect(marketingToggle).not.toBeChecked();
        expect(notificationsToggle).toBeChecked(); // Essential notifications only
        expect(analyticsToggle).not.toBeChecked();
      });
    });
  });

  describe('Save Functionality', () => {
    test('saves settings to localStorage when save button is clicked', async () => {
      renderWithRouter(<PrivacySettings />);
      
      const mediumButton = screen.getByText('متوسط');
      fireEvent.click(mediumButton);
      
      const saveButton = screen.getByText('حفظ الإعدادات');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'userConsents',
          expect.stringContaining('"marketing":{"granted":true')
        );
      });
      
      expect(screen.getByText('تم حفظ الإعدادات بنجاح')).toBeInTheDocument();
    });

    test('shows success message after saving', async () => {
      renderWithRouter(<PrivacySettings />);
      
      const saveButton = screen.getByText('حفظ الإعدادات');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('تم حفظ الإعدادات بنجاح')).toBeInTheDocument();
      });
      
      // Success message should disappear after timeout
      await waitFor(() => {
        expect(screen.queryByText('تم حفظ الإعدادات بنجاح')).not.toBeInTheDocument();
      }, { timeout: 4000 });
    });
  });

  describe('Privacy Level Descriptions', () => {
    test('displays correct descriptions for each privacy level', () => {
      renderWithRouter(<PrivacySettings />);
      
      expect(screen.getByText('الحد الأدنى من الخصوصية')).toBeInTheDocument();
      expect(screen.getByText('توازن بين الخصوصية والخدمات')).toBeInTheDocument();
      expect(screen.getByText('أقصى حماية للخصوصية')).toBeInTheDocument();
    });

    test('shows privacy level meter', () => {
      renderWithRouter(<PrivacySettings />);
      
      expect(screen.getByText('مقياس الخصوصية')).toBeInTheDocument();
      
      // Should show different percentages for different levels
      const basicButton = screen.getByText('أساسي');
      fireEvent.click(basicButton);
      
      expect(screen.getByText('40%')).toBeInTheDocument();
    });
  });

  describe('Loading Existing Settings', () => {
    test('loads existing settings from localStorage on mount', () => {
      const existingConsents = {
        marketing: { granted: true, timestamp: '2024-01-01T00:00:00.000Z' },
        notifications: { granted: false, timestamp: '2024-01-01T00:00:00.000Z' },
        analytics: { granted: true, timestamp: '2024-01-01T00:00:00.000Z' }
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingConsents));
      
      renderWithRouter(<PrivacySettings />);
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('userConsents');
      
      // Check if settings are loaded properly
      const marketingToggle = screen.getByLabelText('الرسائل التسويقية');
      const notificationsToggle = screen.getByLabelText('الإشعارات');
      const analyticsToggle = screen.getByLabelText('مشاركة البيانات التحليلية');
      
      expect(marketingToggle).toBeChecked();
      expect(notificationsToggle).not.toBeChecked();
      expect(analyticsToggle).toBeChecked();
    });

    test('handles corrupted localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      
      renderWithRouter(<PrivacySettings />);
      
      // Should render without crashing
      expect(screen.getByText('إعدادات الخصوصية السريعة')).toBeInTheDocument();
    });
  });

  describe('Privacy Dashboard Link', () => {
    test('renders link to full privacy dashboard', () => {
      renderWithRouter(<PrivacySettings />);
      
      const dashboardLink = screen.getByText('إدارة الموافقات الكاملة');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard/privacy');
    });
  });

  describe('Statistics Display', () => {
    test('shows privacy statistics', () => {
      renderWithRouter(<PrivacySettings />);
      
      expect(screen.getByText('إحصائيات الخصوصية')).toBeInTheDocument();
      expect(screen.getByText('الموافقات النشطة')).toBeInTheDocument();
      expect(screen.getByText('آخر تحديث')).toBeInTheDocument();
    });

    test('updates statistics when settings change', async () => {
      renderWithRouter(<PrivacySettings />);
      
      const mediumButton = screen.getByText('متوسط');
      fireEvent.click(mediumButton);
      
      await waitFor(() => {
        // Should show updated active consents count
        expect(screen.getByText('3 من 3')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles localStorage write errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      renderWithRouter(<PrivacySettings />);
      
      const saveButton = screen.getByText('حفظ الإعدادات');
      fireEvent.click(saveButton);
      
      // Should not crash the component
      expect(screen.getByText('إعدادات الخصوصية السريعة')).toBeInTheDocument();
    });

    test('handles localStorage read errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      
      renderWithRouter(<PrivacySettings />);
      
      // Should render with default state
      expect(screen.getByText('إعدادات الخصوصية السريعة')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for toggles', () => {
      renderWithRouter(<PrivacySettings />);
      
      const toggles = screen.getAllByRole('checkbox');
      toggles.forEach(toggle => {
        expect(toggle).toHaveAttribute('aria-labelledby');
      });
    });

    test('has proper ARIA labels for privacy level buttons', () => {
      renderWithRouter(<PrivacySettings />);
      
      const basicButton = screen.getByText('أساسي');
      const mediumButton = screen.getByText('متوسط');
      const highButton = screen.getByText('عالي');
      
      expect(basicButton.closest('button')).toHaveAttribute('aria-pressed');
      expect(mediumButton.closest('button')).toHaveAttribute('aria-pressed');
      expect(highButton.closest('button')).toHaveAttribute('aria-pressed');
    });

    test('supports keyboard navigation', () => {
      renderWithRouter(<PrivacySettings />);
      
      const firstToggle = screen.getByLabelText('الرسائل التسويقية');
      firstToggle.focus();
      expect(document.activeElement).toBe(firstToggle);
    });
  });

  describe('Data Format Validation', () => {
    test('saves consents in correct format', async () => {
      renderWithRouter(<PrivacySettings />);
      
      const saveButton = screen.getByText('حفظ الإعدادات');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        const savedData = mockLocalStorage.setItem.mock.calls[0][1];
        const parsedData = JSON.parse(savedData);
        
        expect(parsedData).toHaveProperty('marketing');
        expect(parsedData).toHaveProperty('notifications');
        expect(parsedData).toHaveProperty('analytics');
        expect(parsedData).toHaveProperty('version');
        expect(parsedData).toHaveProperty('lastUpdated');
        
        // Validate structure of each consent
        ['marketing', 'notifications', 'analytics'].forEach(key => {
          expect(parsedData[key]).toHaveProperty('granted');
          expect(parsedData[key]).toHaveProperty('timestamp');
          expect(typeof parsedData[key].granted).toBe('boolean');
          expect(typeof parsedData[key].timestamp).toBe('string');
        });
      });
    });
  });
});