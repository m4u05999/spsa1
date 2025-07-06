/**
 * Enhanced Error Messages Hook
 * خطاف رسائل الخطأ المحسنة
 * 
 * Provides centralized error message management with improved UX
 */

import { useState, useCallback } from 'react';
import { 
  getErrorMessage, 
  formatValidationErrors,
  API_ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WARNING_MESSAGES,
  INFO_MESSAGES 
} from '../utils/errorMessages.js';

/**
 * Enhanced error messages hook
 * خطاف رسائل الخطأ المحسنة
 */
export const useErrorMessages = () => {
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  /**
   * Clear all messages
   * مسح جميع الرسائل
   */
  const clearAllMessages = useCallback(() => {
    setErrors({});
    setGlobalError('');
    setSuccessMessage('');
    setWarningMessage('');
    setInfoMessage('');
  }, []);

  /**
   * Clear specific error
   * مسح خطأ محدد
   */
  const clearError = useCallback((field) => {
    if (field) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } else {
      setGlobalError('');
    }
  }, []);

  /**
   * Set field error
   * تعيين خطأ حقل
   */
  const setFieldError = useCallback((field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  /**
   * Set multiple field errors
   * تعيين أخطاء متعددة للحقول
   */
  const setFieldErrors = useCallback((fieldErrors) => {
    const formattedErrors = formatValidationErrors(fieldErrors);
    setErrors(formattedErrors);
  }, []);

  /**
   * Handle API errors
   * معالجة أخطاء API
   */
  const handleApiError = useCallback((error) => {
    console.error('API Error:', error);

    // Clear previous messages
    clearAllMessages();

    // Handle different error types
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          if (data.details && Array.isArray(data.details)) {
            // Validation errors
            const validationErrors = {};
            data.details.forEach(detail => {
              validationErrors[detail.field] = detail.message;
            });
            setFieldErrors(validationErrors);
          } else {
            setGlobalError(data.message || API_ERROR_MESSAGES.VALIDATION.invalidData);
          }
          break;
          
        case 401:
          setGlobalError(API_ERROR_MESSAGES.AUTH.unauthorized);
          break;
          
        case 403:
          setGlobalError(API_ERROR_MESSAGES.NETWORK.forbidden);
          break;
          
        case 404:
          setGlobalError(API_ERROR_MESSAGES.NETWORK.notFound);
          break;
          
        case 409:
          setGlobalError(API_ERROR_MESSAGES.VALIDATION.duplicateEntry);
          break;
          
        case 429:
          setGlobalError(API_ERROR_MESSAGES.RATE_LIMIT.tooManyRequests);
          break;
          
        case 500:
        default:
          setGlobalError(API_ERROR_MESSAGES.NETWORK.serverError);
          break;
      }
    } else if (error.request) {
      // Network error
      if (!navigator.onLine) {
        setGlobalError(API_ERROR_MESSAGES.NETWORK.offline);
      } else {
        setGlobalError(API_ERROR_MESSAGES.NETWORK.timeout);
      }
    } else {
      // Other error
      setGlobalError(error.message || 'حدث خطأ غير متوقع');
    }
  }, [clearAllMessages, setFieldErrors]);

  /**
   * Handle authentication errors
   * معالجة أخطاء المصادقة
   */
  const handleAuthError = useCallback((error) => {
    const errorCode = error.code || error.message;
    
    switch (errorCode) {
      case 'invalid_credentials':
      case 'auth/invalid-credential':
        setGlobalError(API_ERROR_MESSAGES.AUTH.invalidCredentials);
        break;
        
      case 'account_locked':
      case 'auth/too-many-requests':
        setGlobalError(API_ERROR_MESSAGES.AUTH.accountLocked);
        break;
        
      case 'session_expired':
      case 'auth/id-token-expired':
        setGlobalError(API_ERROR_MESSAGES.AUTH.sessionExpired);
        break;
        
      case 'email_not_verified':
      case 'auth/email-not-verified':
        setGlobalError(API_ERROR_MESSAGES.AUTH.emailNotVerified);
        break;
        
      case 'account_disabled':
      case 'auth/user-disabled':
        setGlobalError(API_ERROR_MESSAGES.AUTH.accountDisabled);
        break;
        
      default:
        setGlobalError(API_ERROR_MESSAGES.AUTH.invalidCredentials);
        break;
    }
  }, []);

  /**
   * Handle payment errors
   * معالجة أخطاء الدفع
   */
  const handlePaymentError = useCallback((error) => {
    const errorCode = error.code || error.type;
    
    switch (errorCode) {
      case 'card_declined':
        setGlobalError(API_ERROR_MESSAGES.PAYMENT.cardDeclined);
        break;
        
      case 'insufficient_funds':
        setGlobalError(API_ERROR_MESSAGES.PAYMENT.insufficientFunds);
        break;
        
      case 'expired_card':
        setGlobalError(API_ERROR_MESSAGES.PAYMENT.expiredCard);
        break;
        
      case 'invalid_card':
        setGlobalError(API_ERROR_MESSAGES.PAYMENT.invalidCard);
        break;
        
      case 'processing_error':
        setGlobalError(API_ERROR_MESSAGES.PAYMENT.processingError);
        break;
        
      default:
        setGlobalError(API_ERROR_MESSAGES.PAYMENT.paymentFailed);
        break;
    }
  }, []);

  /**
   * Show success message
   * عرض رسالة نجاح
   */
  const showSuccess = useCallback((message, autoHide = true) => {
    setSuccessMessage(message);
    
    if (autoHide) {
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }
  }, []);

  /**
   * Show warning message
   * عرض رسالة تحذير
   */
  const showWarning = useCallback((message, autoHide = true) => {
    setWarningMessage(message);
    
    if (autoHide) {
      setTimeout(() => {
        setWarningMessage('');
      }, 8000);
    }
  }, []);

  /**
   * Show info message
   * عرض رسالة معلومات
   */
  const showInfo = useCallback((message, autoHide = true) => {
    setInfoMessage(message);
    
    if (autoHide) {
      setTimeout(() => {
        setInfoMessage('');
      }, 4000);
    }
  }, []);

  /**
   * Get error message for field
   * الحصول على رسالة خطأ للحقل
   */
  const getFieldError = useCallback((field) => {
    return errors[field] || '';
  }, [errors]);

  /**
   * Check if field has error
   * فحص ما إذا كان الحقل يحتوي على خطأ
   */
  const hasFieldError = useCallback((field) => {
    return Boolean(errors[field]);
  }, [errors]);

  /**
   * Check if form has any errors
   * فحص ما إذا كان النموذج يحتوي على أي أخطاء
   */
  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0 || Boolean(globalError);
  }, [errors, globalError]);

  /**
   * Get formatted error message
   * الحصول على رسالة خطأ منسقة
   */
  const getMessage = useCallback((category, key, params = {}) => {
    return getErrorMessage(category, key, params);
  }, []);

  return {
    // State
    errors,
    globalError,
    successMessage,
    warningMessage,
    infoMessage,
    
    // Actions
    clearAllMessages,
    clearError,
    setFieldError,
    setFieldErrors,
    handleApiError,
    handleAuthError,
    handlePaymentError,
    showSuccess,
    showWarning,
    showInfo,
    
    // Getters
    getFieldError,
    hasFieldError,
    hasErrors,
    getMessage,
    
    // Constants
    API_ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    WARNING_MESSAGES,
    INFO_MESSAGES
  };
};

export default useErrorMessages;
