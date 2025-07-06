import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * مكون مخصص للصور يدعم الصور الاحتياطية ويتعامل مع أخطاء التحميل
 * 
 * @param {string} src - مسار الصورة الأساسية
 * @param {string} alt - النص البديل للصورة
 * @param {string} className - فئات CSS المطبقة على الصورة
 * @param {string} fallbackSrc - مسار الصورة الاحتياطية التي سيتم عرضها إذا فشل تحميل الصورة الأساسية
 * @returns {JSX.Element} مكون الصورة
 */
const ImageComponent = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc = '/assets/images/placeholder.svg'  // صورة احتياطية افتراضية (SVG)
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * معالج خطأ تحميل الصورة - يغير الحالة لاستخدام الصورة الاحتياطية
   */
  const handleError = () => {
    console.warn(`فشل في تحميل الصورة من: ${src}، استخدام الصورة الاحتياطية بدلاً من ذلك.`);
    setError(true);
    setLoading(false);
  };

  /**
   * يتم تنفيذه عند الانتهاء من تحميل الصورة
   */
  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className={`image-container relative ${loading ? 'image-loading' : ''}`}>
      <img 
        src={error ? fallbackSrc : src} 
        alt={alt || 'صورة'} 
        className={className}
        onError={handleError}
        onLoad={handleLoad}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-60">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <span className="block text-sm font-medium text-gray-700">جارٍ التحميل...</span>
          </div>
        </div>
      )}
    </div>
  );
};

ImageComponent.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  fallbackSrc: PropTypes.string
};

export default ImageComponent;
