// src/components/security/SecurityProvider.jsx
/**
 * Security provider component for XSS and CSRF protection
 * مكون موفر الأمان للحماية من XSS و CSRF
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { sanitizeHTML, sanitizeInput, CSRFManager } from '../../utils/security.js';
import { ENV } from '../../config/environment.js';

// Security context
const SecurityContext = createContext(null);

/**
 * Security provider component
 * مكون موفر الأمان
 */
export const SecurityProvider = ({ children }) => {
  const [csrfToken, setCsrfToken] = useState(null);
  const [securityHeaders, setSecurityHeaders] = useState({});

  useEffect(() => {
    // Initialize security in next tick to avoid blocking UI
    const initSecurity = () => {
      try {
        // Initialize CSRF token
        const token = CSRFManager.generateToken();
        setCsrfToken(token);

        // Set security headers for fetch requests
        const headers = {
          'X-CSRF-Token': token,
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
        };
        setSecurityHeaders(headers);

        // Add global fetch interceptor for security
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
          const secureOptions = {
            ...options,
            headers: {
              ...headers,
              ...options.headers,
            },
            credentials: 'same-origin', // Prevent CSRF
          };

          // Add CSRF token to POST, PUT, DELETE requests
          if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(secureOptions.method?.toUpperCase())) {
            secureOptions.headers['X-CSRF-Token'] = CSRFManager.getToken();
          }

          return originalFetch(url, secureOptions);
        };

        // Store original fetch for cleanup
        return originalFetch;
      } catch (error) {
        if (ENV.IS_DEVELOPMENT) {
          console.warn('Security initialization failed:', error);
        }
        return null;
      }
    };

    // Defer security initialization to avoid blocking UI
    const timeoutId = setTimeout(() => {
      const originalFetch = initSecurity();

      // Store cleanup function
      if (originalFetch) {
        window._securityCleanup = () => {
          window.fetch = originalFetch;
        };
      }
    }, 50); // Very small delay

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      if (window._securityCleanup) {
        window._securityCleanup();
        delete window._securityCleanup;
      }
    };
  }, []);

  // Security utilities
  const securityUtils = {
    // Sanitize HTML content
    sanitizeHTML: (html) => sanitizeHTML(html),
    
    // Sanitize user input
    sanitizeInput: (input, type) => sanitizeInput(input, type),
    
    // Get CSRF token
    getCSRFToken: () => CSRFManager.getToken(),
    
    // Validate CSRF token
    validateCSRFToken: (token) => CSRFManager.validateToken(token),
    
    // Create secure form data
    createSecureFormData: (data) => {
      const formData = new FormData();
      formData.append('_token', CSRFManager.getToken());
      
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          formData.append(key, sanitizeInput(value));
        } else {
          formData.append(key, value);
        }
      });
      
      return formData;
    },
    
    // Secure API call wrapper
    secureApiCall: async (url, options = {}) => {
      const secureOptions = {
        ...options,
        headers: {
          ...securityHeaders,
          ...options.headers,
        },
        credentials: 'same-origin',
      };

      // Add CSRF token for state-changing requests
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(secureOptions.method?.toUpperCase())) {
        secureOptions.headers['X-CSRF-Token'] = CSRFManager.getToken();
      }

      try {
        const response = await fetch(url, secureOptions);
        
        // Check for security headers in response
        if (ENV.IS_DEVELOPMENT) {
          console.log('Security headers received:', {
            'X-Frame-Options': response.headers.get('X-Frame-Options'),
            'X-Content-Type-Options': response.headers.get('X-Content-Type-Options'),
            'X-XSS-Protection': response.headers.get('X-XSS-Protection'),
          });
        }
        
        return response;
      } catch (error) {
        console.error('Secure API call failed:', error);
        throw error;
      }
    }
  };

  const value = {
    csrfToken,
    securityHeaders,
    ...securityUtils
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

/**
 * Hook to use security context
 * خطاف لاستخدام سياق الأمان
 */
export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

/**
 * HOC for secure components
 * مكون عالي المستوى للمكونات الآمنة
 */
export const withSecurity = (WrappedComponent) => {
  return function SecurityWrappedComponent(props) {
    const security = useSecurity();
    
    return (
      <WrappedComponent
        {...props}
        security={security}
      />
    );
  };
};

/**
 * Secure content renderer component
 * مكون عرض المحتوى الآمن
 */
export const SecureContent = ({ 
  content, 
  type = 'html', 
  allowedTags = [], 
  className = '',
  ...props 
}) => {
  const { sanitizeHTML, sanitizeInput } = useSecurity();
  
  const renderContent = () => {
    switch (type) {
      case 'html':
        return {
          __html: sanitizeHTML(content)
        };
      
      case 'text':
        return sanitizeInput(content, 'text');
      
      default:
        return sanitizeInput(content, type);
    }
  };

  if (type === 'html') {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={renderContent()}
        {...props}
      />
    );
  }

  return (
    <div className={className} {...props}>
      {renderContent()}
    </div>
  );
};

/**
 * Secure form component with CSRF protection
 * مكون نموذج آمن مع حماية CSRF
 */
export const SecureForm = ({ 
  onSubmit, 
  children, 
  method = 'POST',
  action,
  className = '',
  ...props 
}) => {
  const { getCSRFToken, sanitizeInput } = useSecurity();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {};
    
    // Sanitize all form data
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        data[key] = sanitizeInput(value);
      } else {
        data[key] = value;
      }
    }
    
    // Add CSRF token
    data._token = getCSRFToken();
    
    if (onSubmit) {
      await onSubmit(data, event);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      method={method}
      action={action}
      className={className}
      {...props}
    >
      {/* Hidden CSRF token field */}
      <input
        type="hidden"
        name="_token"
        value={getCSRFToken()}
      />
      
      {children}
    </form>
  );
};

/**
 * Secure input component with automatic sanitization
 * مكون إدخال آمن مع تنظيف تلقائي
 */
export const SecureInput = ({ 
  type = 'text', 
  value, 
  onChange, 
  sanitizeType,
  maxLength,
  pattern,
  ...props 
}) => {
  const { sanitizeInput } = useSecurity();

  const handleChange = (event) => {
    let newValue = event.target.value;
    
    // Apply length limit
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }
    
    // Sanitize input
    if (sanitizeType) {
      newValue = sanitizeInput(newValue, sanitizeType);
    }
    
    // Update the event value
    event.target.value = newValue;
    
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      maxLength={maxLength}
      pattern={pattern}
      {...props}
    />
  );
};

export default SecurityProvider;
