/**
 * Optimized Loader Component
 * مكون التحميل المحسن
 * 
 * Provides optimized loading states with performance monitoring
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { performanceOptimizer } from '../../utils/performanceOptimizer';

const OptimizedLoader = ({ 
  type = 'page',
  message = 'جاري التحميل...',
  showProgress = false,
  timeout = 10000,
  onTimeout,
  className = ''
}) => {
  const [progress, setProgress] = useState(0);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    let progressInterval;
    let timeoutTimer;

    if (showProgress) {
      // Simulate progress for better UX
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // Don't complete until actual loading is done
          return prev + Math.random() * 10;
        });
      }, 200);
    }

    if (timeout > 0) {
      timeoutTimer = setTimeout(() => {
        setHasTimedOut(true);
        onTimeout?.();
      }, timeout);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
  }, [showProgress, timeout, onTimeout]);

  if (hasTimedOut) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[200px] p-8 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">انتهت مهلة التحميل</h3>
          <p className="text-gray-500 mb-4">يستغرق التحميل وقتاً أطول من المتوقع</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    );
  }

  const getLoaderContent = () => {
    switch (type) {
      case 'page':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-4">
                {/* Header skeleton */}
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                
                {/* Content skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>

                {/* Cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-lg shadow p-6">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'component':
        return (
          <div className={`flex items-center justify-center p-8 ${className}`}>
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">{message}</p>
              {showProgress && (
                <div className="mt-4 w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        );

      case 'inline':
        return (
          <div className={`flex items-center space-x-2 space-x-reverse ${className}`}>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">{message}</span>
          </div>
        );

      case 'button':
        return (
          <div className={`flex items-center justify-center space-x-2 space-x-reverse ${className}`}>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>{message}</span>
          </div>
        );

      case 'overlay':
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-700 font-medium">{message}</p>
                {showProgress && (
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`flex items-center justify-center p-4 ${className}`}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        );
    }
  };

  return getLoaderContent();
};

OptimizedLoader.propTypes = {
  type: PropTypes.oneOf(['page', 'component', 'inline', 'button', 'overlay']),
  message: PropTypes.string,
  showProgress: PropTypes.bool,
  timeout: PropTypes.number,
  onTimeout: PropTypes.func,
  className: PropTypes.string
};

export default OptimizedLoader;

// Specialized loader components for common use cases
export const PageLoader = (props) => <OptimizedLoader type="page" {...props} />;
export const ComponentLoader = (props) => <OptimizedLoader type="component" {...props} />;
export const InlineLoader = (props) => <OptimizedLoader type="inline" {...props} />;
export const ButtonLoader = (props) => <OptimizedLoader type="button" {...props} />;
export const OverlayLoader = (props) => <OptimizedLoader type="overlay" {...props} />;

// Performance-aware loader hook
export const useOptimizedLoader = (isLoading, options = {}) => {
  const [startTime] = useState(() => Date.now());
  
  useEffect(() => {
    if (!isLoading && startTime) {
      const loadTime = Date.now() - startTime;
      performanceOptimizer.performanceOptimizer.init();
      
      // Log slow loading times
      if (loadTime > 2000) {
        console.warn(`Slow loading detected: ${loadTime}ms`);
      }
    }
  }, [isLoading, startTime]);

  return {
    LoaderComponent: OptimizedLoader,
    loadTime: isLoading ? null : Date.now() - startTime
  };
};
