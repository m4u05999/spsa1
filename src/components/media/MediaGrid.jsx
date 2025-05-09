// src/components/media/MediaGrid.jsx
import React from 'react';
import { Row, Col, Empty, Typography } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import MediaCard from './MediaCard';

const { Text } = Typography;

/**
 * شبكة الوسائط - تعرض عناصر الوسائط في شكل شبكة
 * @param {Array} items - قائمة عناصر الوسائط للعرض
 * @param {Array} selectedItems - قائمة بمعرفات العناصر المحددة
 * @param {Function} onSelect - وظيفة تستدعى عند اختيار عنصر
 * @param {Function} onViewDetails - وظيفة تستدعى لعرض تفاصيل العنصر
 * @param {boolean} multiple - هل يمكن اختيار عدة عناصر؟
 */
const MediaGrid = ({ items, selectedItems = [], onSelect, onViewDetails, multiple = false }) => {
  if (!items || items.length === 0) {
    return (
      <Empty
        image={<FileImageOutlined style={{ fontSize: 60 }} />}
        imageStyle={{ height: 80 }}
        description={
          <Text>لا توجد ملفات وسائط</Text>
        }
      />
    );
  }

  // تحديد حجم البطاقات بناءً على حجم الشاشة
  const getColSpan = () => {
    return {
      xs: 24,   // Extra small screens (< 576px) - 1 item per row
      sm: 12,   // Small screens (≥ 576px) - 2 items per row
      md: 8,    // Medium screens (≥ 768px) - 3 items per row
      lg: 6,    // Large screens (≥ 992px) - 4 items per row
      xl: 4,    // Extra large screens (≥ 1200px) - 6 items per row
      xxl: 4,   // Extra extra large screens (≥ 1600px) - 6 items per row
    };
  };

  return (
    <Row gutter={[16, 16]} className="media-grid">
      {items.map(item => (
        <Col key={item.id} {...getColSpan()}>
          <MediaCard
            media={item}
            selected={selectedItems.includes(item.id)}
            onSelect={() => onSelect(item)}
            onViewDetails={() => onViewDetails(item)}
            selectable={multiple}
          />
        </Col>
      ))}
    </Row>
  );
};

export default MediaGrid;