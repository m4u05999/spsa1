// src/components/media/MediaCard.jsx
import React from 'react';
import { Card, Typography, Space, Tooltip, Tag, Checkbox } from 'antd';
import {
  FileImageOutlined,
  FileOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  EyeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { MEDIA_TYPES } from '../../models/Media';

const { Meta } = Card;
const { Text } = Typography;

/**
 * بطاقة عرض عنصر وسائط
 * @param {Object} media - كائن الوسائط للعرض
 * @param {Boolean} selected - هل العنصر محدد حاليًا
 * @param {Function} onSelect - دالة تستدعى عند تحديد العنصر
 * @param {Function} onViewDetails - دالة تستدعى لعرض تفاصيل العنصر
 * @param {Boolean} selectable - هل يمكن تحديد البطاقة
 */
const MediaCard = ({ media, selected = false, onSelect, onViewDetails, selectable = true }) => {
  if (!media) {
    return null;
  }

  // تحديد أيقونة العنصر بناءً على نوعه
  const getMediaIcon = () => {
    switch (media.type) {
      case MEDIA_TYPES.IMAGE:
        return <FileImageOutlined style={{ fontSize: '36px' }} />;
      case MEDIA_TYPES.VIDEO:
        return <VideoCameraOutlined style={{ fontSize: '36px' }} />;
      case MEDIA_TYPES.AUDIO:
        return <SoundOutlined style={{ fontSize: '36px' }} />;
      case MEDIA_TYPES.DOCUMENT:
        return <FileTextOutlined style={{ fontSize: '36px' }} />;
      default:
        return <FileOutlined style={{ fontSize: '36px' }} />;
    }
  };

  // إظهار محتوى الوسائط (صورة مصغرة أو أيقونة)
  const renderMediaContent = () => {
    if (media.type === MEDIA_TYPES.IMAGE && media.dataUrl) {
      return (
        <div 
          style={{
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <img
            src={media.dataUrl || media.path}
            alt={media.alt || media.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      );
    } else {
      return (
        <div 
          style={{
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}
        >
          {getMediaIcon()}
        </div>
      );
    }
  };

  // تحديد لون البطاقة بناءً على حالة التحديد
  const cardStyle = selected ? 
    { borderColor: '#1890ff', boxShadow: '0 2px 8px rgba(24, 144, 255, 0.2)' } : 
    {};

  return (
    <Card
      hoverable
      style={{ ...cardStyle, position: 'relative' }}
      bodyStyle={{ padding: '12px' }}
      cover={renderMediaContent()}
      onClick={onSelect}
      actions={[
        <Tooltip key="view" title="عرض التفاصيل">
          <EyeOutlined key="view" onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }} />
        </Tooltip>
      ]}
    >
      {selectable && (
        <Checkbox
          checked={selected}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            padding: '4px'
          }}
        />
      )}
      
      <Meta
        title={
          <Tooltip title={media.name}>
            <div style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              direction: 'rtl'
            }}>
              {media.name}
            </div>
          </Tooltip>
        }
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {media.getFormattedSize ? media.getFormattedSize() : `${Math.round(media.size / 1024)} كيلوبايت`}
            </Text>
            
            {media.category && (
              <Tag color="blue">{media.category}</Tag>
            )}
            
            {media.tags && media.tags.length > 0 && (
              <div style={{ marginTop: '4px', overflow: 'hidden' }}>
                {media.tags.slice(0, 2).map(tag => (
                  <Tag key={tag} style={{ marginBottom: '4px' }}>{tag}</Tag>
                ))}
                {media.tags.length > 2 && (
                  <Tag>+{media.tags.length - 2}</Tag>
                )}
              </div>
            )}
            
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {new Date(media.createdAt).toLocaleDateString('ar-SA')}
            </Text>
          </Space>
        }
      />
    </Card>
  );
};

export default MediaCard;