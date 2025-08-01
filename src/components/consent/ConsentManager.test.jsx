// src/components/consent/ConsentManager.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ConsentManager from './ConsentManager';

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

describe('ConsentManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Initial Render', () => {
    test('renders consent manager with all consent types', () => {
      renderWithRouter(<ConsentManager />);
      
      expect(screen.getByText('إدارة الموافقات والخصوصية')).toBeInTheDocument();
      expect(screen.getByText('الموافقة على جمع البيانات الأساسية')).toBeInTheDocument();
      expect(screen.getByText('الموافقة على الرسائل التسويقية')).toBeInTheDocument();
      expect(screen.getByText('الموافقة على ملفات الارتباط (Cookies)')).toBeInTheDocument();
      expect(screen.getByText('الموافقة على مشاركة البيانات التحليلية')).toBeInTheDocument();
      expect(screen.getByText('الموافقة على الإشعارات')).toBeInTheDocument();
      expect(screen.getByText('الموافقة على الاتصالات الأكاديمية')).toBeInTheDocument();
      expect(screen.getByText('الموافقة على مشاركة البيانات مع الشركاء')).toBeInTheDocument();
    });

    test('renders save button', () => {
      renderWithRouter(<ConsentManager />);
      expect(screen.getByText('حفظ الموافقات')).toBeInTheDocument();
    });

    test('renders privacy dashboard link', () => {
      renderWithRouter(<ConsentManager />);
      expect(screen.getByText('عرض سياسة الخصوصية الكاملة')).toBeInTheDocument();
    });
  });

  describe('Loading Existing Consents', () => {
    test('loads existing consents from localStorage on mount', () => {
      const existingConsents = {
        basicData: { granted: true, timestamp: '2024-01-01T00:00:00.000Z' },
        marketing: { granted: false, timestamp: '2024-01-01T00:00:00.000Z' }
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingConsents));
      
      renderWithRouter(<ConsentManager />);
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('userConsents');
      
      // Check if consents are loaded properly by looking at toggle states
      const basicDataToggle = screen.getByLabelText('الموافقة على جمع البيانات الأساسية');
      const marketingToggle = screen.getByLabelText('الموافقة على الرسائل التسويقية');
      
      expect(basicDataToggle).toBeChecked();
      expect(marketingToggle).not.toBeChecked();
    });

    test('handles corrupted localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      
      renderWithRouter(<ConsentManager />);
      
      // Should render without crashing
      expect(screen.getByText('إدارة الموافقات والخصوصية')).toBeInTheDocument();
    });
  });

  describe('Consent Toggle Functionality', () => {
    test('toggles consent when switch is clicked', async () => {
      renderWithRouter(<ConsentManager />);
      
      const marketingToggle = screen.getByLabelText('الموافقة على الرسائل التسويقية');
      
      expect(marketingToggle).not.toBeChecked();
      
      fireEvent.click(marketingToggle);
      
      await waitFor(() => {
        expect(marketingToggle).toBeChecked();
      });
    });

    test('handles required consents properly', () => {
      renderWithRouter(<ConsentManager />);
      
      const requiredToggle = screen.getByLabelText('الموافقة على جمع البيانات الأساسية');
      
      // Should start as checked (required)
      expect(requiredToggle).toBeChecked();
      
      // Try to uncheck - should remain checked
      fireEvent.click(requiredToggle);
      expect(requiredToggle).toBeChecked();
    });
  });

  describe('Save Functionality', () => {
    test('saves consents to localStorage when save button is clicked', async () => {
      renderWithRouter(<ConsentManager />);
      
      const marketingToggle = screen.getByLabelText('الموافقة على الرسائل التسويقية');
      fireEvent.click(marketingToggle);
      
      const saveButton = screen.getByText('حفظ الموافقات');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'userConsents',
          expect.stringContaining('"marketing":{"granted":true')
        );
      });
      
      expect(screen.getByText('تم حفظ الموافقات بنجاح')).toBeInTheDocument();
    });

    test('shows success message after saving', async () => {
      renderWithRouter(<ConsentManager />);
      
      const saveButton = screen.getByText('حفظ الموافقات');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('تم حفظ الموافقات بنجاح')).toBeInTheDocument();
      });
      
      // Success message should disappear after timeout
      await waitFor(() => {
        expect(screen.queryByText('تم حفظ الموافقات بنجاح')).not.toBeInTheDocument();
      }, { timeout: 4000 });
    });
  });

  describe('Privacy Policy Link', () => {
    test('renders privacy policy link correctly', () => {
      renderWithRouter(<ConsentManager />);
      
      const privacyLink = screen.getByText('عرض سياسة الخصوصية الكاملة');
      expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
    });
  });

  describe('Consent Descriptions', () => {
    test('displays correct descriptions for each consent type', () => {
      renderWithRouter(<ConsentManager />);
      
      expect(screen.getByText('ضروري لتشغيل الحساب والخدمات الأساسية')).toBeInTheDocument();
      expect(screen.getByText('إرسال رسائل إعلانية وعروض خاصة')).toBeInTheDocument();
      expect(screen.getByText('تحسين تجربة التصفح وحفظ التفضيلات')).toBeInTheDocument();
      expect(screen.getByText('تحليل استخدام الموقع لتحسين الخدمات')).toBeInTheDocument();
      expect(screen.getByText('إرسال إشعارات الأنشطة والفعاليات')).toBeInTheDocument();
      expect(screen.getByText('إرسال دعوات المؤتمرات والندوات العلمية')).toBeInTheDocument();
      expect(screen.getByText('مشاركة البيانات مع الجهات الأكاديمية المعتمدة')).toBeInTheDocument();
    });
  });

  describe('Version Tracking', () => {
    test('saves version information with consents', async () => {
      renderWithRouter(<ConsentManager />);
      
      const saveButton = screen.getByText('حفظ الموافقات');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'userConsents',
          expect.stringContaining('"version":"1.0"')
        );
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderWithRouter(<ConsentManager />);
      
      const toggles = screen.getAllByRole('checkbox');
      toggles.forEach(toggle => {
        expect(toggle).toHaveAttribute('aria-labelledby');
      });
    });

    test('supports keyboard navigation', () => {
      renderWithRouter(<ConsentManager />);
      
      const firstToggle = screen.getByLabelText('الموافقة على جمع البيانات الأساسية');
      firstToggle.focus();
      expect(document.activeElement).toBe(firstToggle);
    });
  });

  describe('Error Handling', () => {
    test('handles localStorage write errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      renderWithRouter(<ConsentManager />);
      
      const saveButton = screen.getByText('حفظ الموافقات');
      fireEvent.click(saveButton);
      
      // Should not crash the component
      expect(screen.getByText('إدارة الموافقات والخصوصية')).toBeInTheDocument();
    });

    test('handles localStorage read errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      
      renderWithRouter(<ConsentManager />);
      
      // Should render with default state
      expect(screen.getByText('إدارة الموافقات والخصوصية')).toBeInTheDocument();
    });
  });

  describe('Data Format Validation', () => {
    test('saves consents in correct format', async () => {
      renderWithRouter(<ConsentManager />);
      
      const saveButton = screen.getByText('حفظ الموافقات');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        const savedData = mockLocalStorage.setItem.mock.calls[0][1];
        const parsedData = JSON.parse(savedData);
        
        expect(parsedData).toHaveProperty('basicData');
        expect(parsedData).toHaveProperty('version');
        expect(parsedData).toHaveProperty('lastUpdated');
        
        Object.keys(parsedData).forEach(key => {
          if (key !== 'version' && key !== 'lastUpdated') {
            expect(parsedData[key]).toHaveProperty('granted');
            expect(parsedData[key]).toHaveProperty('timestamp');
            expect(typeof parsedData[key].granted).toBe('boolean');
            expect(typeof parsedData[key].timestamp).toBe('string');
          }
        });
      });
    });
  });
});