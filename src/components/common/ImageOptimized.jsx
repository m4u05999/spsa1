import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ImageOptimized = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  priority = false,
  quality = 75,
  placeholder = 'blur'
}) => {
  const [isLoading, setIsLoading] = useState(!priority);
  const [blurUrl, setBlurUrl] = useState('');

  useEffect(() => {
    if (!priority && placeholder === 'blur') {
      // Create a tiny placeholder
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 20;
        canvas.height = 20 * (img.height / img.width);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setBlurUrl(canvas.toDataURL('image/jpeg', 0.1));
      };
    }
  }, [src, priority, placeholder]);

  useEffect(() => {
    if (!priority) {
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoading(false);
    }
  }, [src, priority]);

  // Handle WebP support
  const srcSet = `${src}?w=${width}&q=${quality}&fm=webp 1x, ${src}?w=${width * 2}&q=${quality}&fm=webp 2x`;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto'
      }}
    >
      <img
        src={src}
        srcSet={srcSet}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        style={{
          filter: isLoading ? 'blur(20px)' : 'none',
          backgroundImage: blurUrl ? `url(${blurUrl})` : 'none',
          backgroundColor: '#f3f4f6'
        }}
        onLoad={() => setIsLoading(false)}
      />
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
  placeholder: PropTypes.oneOf(['blur', 'none'])
};

export default ImageOptimized;