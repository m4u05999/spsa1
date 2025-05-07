// src/components/dashboard/ContentManager.jsx
import React, { useState } from 'react';

const ContentManager = () => {
  const [content, setContent] = useState([
    {
      id: 1,
      title: 'مقال: مستقبل العلاقات الدولية',
      type: 'article',
      status: 'published',
      date: '2024-01-25'
    },
    {
      id: 2,
      title: 'تقرير: ندوة السياسات العامة',
      type: 'report',
      status: 'draft',
      date: '2024-01-28'
    }
  ]);

  const updateContentStatus = (contentId, newStatus) => {
    setContent(content.map(item =>
      item.id === contentId ? { ...item, status: newStatus } : item
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">إدارة المحتوى</h2>
      <div className="space-y-4">
        {content.map((item) => (
          <div key={item.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-500">
                  النوع: {item.type} | التاريخ: {item.date}
                </p>
              </div>
              <select
                value={item.status}
                onChange={(e) => updateContentStatus(item.id, e.target.value)}
                className="border rounded-md px-2 py-1"
              >
                <option value="draft">مسودة</option>
                <option value="review">قيد المراجعة</option>
                <option value="published">منشور</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentManager;