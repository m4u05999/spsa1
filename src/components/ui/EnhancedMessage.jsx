/**
 * Enhanced Message Component
 * مكون الرسائل المحسنة
 * 
 * Displays error, success, warning, and info messages with improved UX
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced Message Component
 * مكون الرسائل المحسنة
 */
const EnhancedMessage = ({
  type = 'info',
  message,
  title,
  onClose,
  autoHide = true,
  duration = 5000,
  showIcon = true,
  className = '',
  actions = []
}) => {
  // Auto hide effect
  React.useEffect(() => {
    if (autoHide && message && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, message, onClose, duration]);

  // Don't render if no message
  if (!message) return null;

  // Get message styles based on type
  const getMessageStyles = () => {
    const baseStyles = 'rounded-lg p-4 mb-4 border-r-4 shadow-sm transition-all duration-300';
    
    switch (type) {
      case 'error':
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
    }
  };

  // Get icon based on type
  const getIcon = () => {
    if (!showIcon) return null;
    
    const iconStyles = 'w-5 h-5 ml-2 flex-shrink-0';
    
    switch (type) {
      case 'error':
        return (
          <svg className={`${iconStyles} text-red-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'success':
        return (
          <svg className={`${iconStyles} text-green-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={`${iconStyles} text-yellow-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className={`${iconStyles} text-blue-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`${getMessageStyles()} ${className}`} role="alert">
      <div className="flex items-start">
        {getIcon()}
        
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1 text-sm">
              {title}
            </h4>
          )}
          
          <div className="text-sm leading-relaxed">
            {message}
          </div>
          
          {actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    action.variant === 'primary'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="mr-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="إغلاق الرسالة"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

EnhancedMessage.propTypes = {
  type: PropTypes.oneOf(['error', 'success', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
  onClose: PropTypes.func,
  autoHide: PropTypes.bool,
  duration: PropTypes.number,
  showIcon: PropTypes.bool,
  className: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['primary', 'secondary'])
    })
  )
};

/**
 * Field Error Message Component
 * مكون رسالة خطأ الحقل
 */
export const FieldErrorMessage = ({ error, className = '' }) => {
  if (!error) return null;
  
  return (
    <div className={`text-red-600 text-sm mt-1 flex items-center ${className}`}>
      <svg className="w-4 h-4 ml-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>{error}</span>
    </div>
  );
};

FieldErrorMessage.propTypes = {
  error: PropTypes.string,
  className: PropTypes.string
};

/**
 * Loading Message Component
 * مكون رسالة التحميل
 */
export const LoadingMessage = ({ message = 'جاري التحميل...', className = '' }) => {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 ml-2"></div>
      <span className="text-gray-600">{message}</span>
    </div>
  );
};

LoadingMessage.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string
};

/**
 * Empty State Message Component
 * مكون رسالة الحالة الفارغة
 */
export const EmptyStateMessage = ({ 
  message = 'لا توجد بيانات للعرض', 
  icon,
  action,
  className = '' 
}) => {
  return (
    <div className={`text-center p-8 ${className}`}>
      {icon && (
        <div className="mb-4 flex justify-center">
          {icon}
        </div>
      )}
      <p className="text-gray-500 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

EmptyStateMessage.propTypes = {
  message: PropTypes.string,
  icon: PropTypes.node,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  }),
  className: PropTypes.string
};

export default EnhancedMessage;
