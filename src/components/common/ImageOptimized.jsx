import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { imageOptimizer } from '../../utils/performanceOptimizer';
import { getFeatureFlag } from '../../config/featureFlags';

const ImageOptimized = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  sizes = '100vw',
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(!priority);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!getFeatureFlag('ENABLE_LAZY_LOADING') || priority || isInView) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px' // Start loading 50px before the image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, isInView]);

  // Handle image loading
  const handleImageLoad = useCallback((event) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(event);
  }, [onLoad]);

  const handleImageError = useCallback((event) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(event);
  }, [onError]);

  // Generate optimized URLs
  const optimizedSrc = imageOptimizer.generateOptimizedUrl(src, { width, height, quality });
  const responsiveSrcSet = width ? imageOptimizer.createResponsiveSrcSet(src, [
    Math.round(width * 0.5),
    width,
    Math.round(width * 1.5),
    Math.round(width * 2)
  ]) : '';

  // Fallback image for errors
  const fallbackSrc = '/images/placeholder.jpg';

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto'
      }}
    >
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">جاري التحميل...</div>
        </div>
      )}

      {/* Error placeholder */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500 text-sm text-center">
            <div className="mb-2">⚠️</div>
            <div>فشل تحميل الصورة</div>
          </div>
        </div>
      )}

      {/* Main image */}
      {(isInView || priority) && (
        <img
          src={hasError ? fallbackSrc : optimizedSrc}
          srcSet={hasError ? '' : responsiveSrcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`
            w-full h-full object-cover transition-all duration-300
            ${isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}
            ${hasError ? 'hidden' : 'block'}
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

ImageOptimized.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  priority: PropTypes.bool,
  quality: PropTypes.number,
  placeholder: PropTypes.oneOf(['blur', 'none']),
  sizes: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default ImageOptimized;