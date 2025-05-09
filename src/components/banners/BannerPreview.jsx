import React, { useState, useEffect } from 'react';
import { Modal, Button, Divider, Typography, Spin, Empty, Space, Card } from 'antd';
import { CloseOutlined, ArrowRightOutlined, LinkOutlined } from '@ant-design/icons';
import mediaService from '../../services/mediaService';

const { Title, Text, Paragraph } = Typography;

/**
 * معاينة البانر - يعرض البانر بناءً على الإعدادات المحددة
 */
const BannerPreview = ({ 
  banner, 
  mediaId, 
  visible = false, 
  onClose = () => {}, 
  preview = false,
  showLink = false,
  onLinkClick = null
}) => {
  const [mediaItem, setMediaItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // جلب بيانات الوسائط عند تغيير المعرف
  useEffect(() => {
    if (!mediaId) {
      setLoading(false);
      setError('لم يتم تحديد صورة للبانر');
      return;
    }

    try {
      const media = mediaService.getById(mediaId);
      if (media) {
        setMediaItem(media);
        setError(null);
      } else {
        setError('لم يتم العثور على الصورة المحددة');
      }
    } catch (err) {
      setError(`حدث خطأ أثناء تحميل صورة البانر: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [mediaId]);

  // استخراج خصائص التصميم من البانر
  const {
    title,
    link,
    design = {},
    type
  } = banner || {};

  const {
    width = 800,
    height = 300,
    backgroundColor = '#ffffff',
    textColor = '#000000',
    borderRadius = 0,
    padding = 16,
    overlay = false,
    overlayColor = 'rgba(0,0,0,0.5)',
    buttonText = '',
    buttonColor = '#3366cc',
    buttonTextColor = '#ffffff',
    buttonBorderRadius = 4,
    headline = '',
    headlineSize = 24,
    subtext = '',
    subtextSize = 16,
    responsive = true
  } = design;

  // معالجة النقر على الرابط
  const handleLinkClick = (e) => {
    if (preview) {
      e.preventDefault();
    } else if (onLinkClick) {
      e.preventDefault();
      onLinkClick(banner);
    }
  };

  // بناء أسلوب (style) البانر
  const bannerStyle = {
    position: 'relative',
    width: preview ? '100%' : (responsive ? '100%' : `${width}px`),
    maxWidth: preview ? '100%' : `${width}px`,
    height: `${height}px`,
    backgroundColor: backgroundColor,
    color: textColor,
    borderRadius: `${borderRadius}px`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: `${padding}px`,
    boxSizing: 'border-box',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    textAlign: 'center'
  };

  // محتوى البانر
  const renderBannerContent = () => {
    if (loading) {
      return (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" />
        </div>
      );
    }

    if (error || !mediaItem) {
      return (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty 
            description={error || 'لم يتم تحديد صورة للبانر'} 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </div>
      );
    }

    return (
      <a 
        href={link || '#'} 
        style={{ textDecoration: 'none', display: 'block', width: '100%', height: '100%' }}
        onClick={handleLinkClick}
        target={preview ? '_self' : '_blank'}
        rel="noopener noreferrer"
      >
        <div 
          style={{
            ...bannerStyle,
            backgroundImage: `url(${mediaItem.path})`,
            position: 'relative'
          }}
        >
          {/* طبقة التراكب (إذا كانت مفعلة) */}
          {overlay && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: overlayColor,
                zIndex: 1
              }}
            />
          )}

          {/* محتوى البانر */}
          <div 
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: `${padding}px`,
              boxSizing: 'border-box',
              color: textColor
            }}
          >
            {headline && (
              <h2 
                style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: `${headlineSize}px`,
                  color: textColor,
                  fontWeight: 'bold'
                }}
              >
                {headline}
              </h2>
            )}

            {subtext && (
              <p 
                style={{ 
                  margin: '0 0 24px 0',
                  fontSize: `${subtextSize}px`,
                  color: textColor
                }}
              >
                {subtext}
              </p>
            )}

            {buttonText && (
              <button
                style={{
                  backgroundColor: buttonColor,
                  color: buttonTextColor,
                  border: 'none',
                  borderRadius: `${buttonBorderRadius}px`,
                  padding: '8px 16px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                  zIndex: 3,
                  margin: 0
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {buttonText}
              </button>
            )}
          </div>
        </div>

        {/* رابط البانر (إذا تم تفعيل عرض الرابط) */}
        {showLink && (
          <div 
            style={{ 
              marginTop: '8px', 
              fontSize: '12px', 
              color: '#999', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LinkOutlined style={{ marginLeft: '4px' }} />
            <span>{link || '#'}</span>
          </div>
        )}
      </a>
    );
  };

  if (preview) {
    return (
      <Modal
        title={`معاينة البانر: ${title || 'بانر جديد'}`}
        visible={visible}
        onCancel={onClose}
        width={Math.min(width + 48, window.innerWidth - 48)}
        footer={[
          <Button key="close" onClick={onClose}>
            إغلاق
          </Button>
        ]}
        centered
      >
        <div className="banner-preview-wrapper">
          {renderBannerContent()}
        </div>
      </Modal>
    );
  }

  // عرض البانر مباشرة بدون نافذة منبثقة
  return (
    <div className="banner-preview-inline">
      {renderBannerContent()}
    </div>
  );
};

export default BannerPreview;