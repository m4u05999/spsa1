// إدارة المحتوى مع التحسينات الأمنية والأداء
// 
// الميزات المضافة:
// - تنظيف البيانات الحساسة قبل التصدير
// - التحقق من معدل الطلبات لمنع إساءة الاستخدام
// - تصفية وتنظيف HTML من المحتوى المدخل
// - التحقق من صحة معرفات العناصر
// - حدود أمنية على عدد العناصر المعالجة
// - رسائل خطأ باللغة العربية

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/index.jsx';
import { checkPermission } from '../../../utils/permissions';
import ContentManager from '../../../components/content/ContentManager.jsx';
import { useDashboardContent } from '../../../hooks/useUnifiedContent.js';
import { CONTENT_TYPES, CONTENT_STATUS } from '../../../schemas/contentManagementSchema.js';
import { 
  sanitizeHtml, 
  validateId, 
  sanitizeFilename, 
  removeSensitiveFields,
  rateLimiter 
} from '../../../utils/securityHelpers.js';

const ContentManagement = () => {
  const { user } = useAuth();
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showMessage, setShowMessage] = useState({ show: false, type: '', message: '' });

  // Use the new unified content management system
  const {
    content,
    loading,
    error,
    createContent,
    updateContent,
    deleteContent,
    publishContent,
    unpublishContent,
    refresh
  } = useDashboardContent({
    autoLoad: true,
    enableRealtime: true
  });

  // عرض رسالة مؤقتة
  const displayMessage = (type, message) => {
    setShowMessage({ show: true, type, message });
    setTimeout(() => {
      setShowMessage({ show: false, type: '', message: '' });
    }, 3000);
  };

  // Handle content type filter change
  const handleContentTypeChange = (type) => {
    setSelectedContentType(type);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // حفظ تفضيل وضع العرض في localStorage
    localStorage.setItem('contentViewMode', mode);
  };

  // تحميل تفضيل وضع العرض
  useEffect(() => {
    const savedViewMode = localStorage.getItem('contentViewMode');
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    // التحقق من صحة الإجراء
    const allowedActions = ['publish', 'unpublish', 'delete'];
    if (!allowedActions.includes(action)) {
      displayMessage('error', 'إجراء غير مسموح');
      return;
    }

    // التحقق من وجود عناصر محددة
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      displayMessage('warning', 'يرجى تحديد عناصر للعمل عليها');
      return;
    }

    // التحقق من الحد الأقصى للعناصر (حماية من DoS)
    if (selectedItems.length > 100) {
      displayMessage('warning', 'يمكن معالجة 100 عنصر كحد أقصى في المرة الواحدة');
      return;
    }

    // التحقق من الصلاحيات
    const hasPermission = action === 'delete' ? canDeleteContent : canManageContent;
    if (!hasPermission) {
      displayMessage('error', 'ليس لديك صلاحية لتنفيذ هذا الإجراء');
      return;
    }

    try {
      let success = 0;
      const promises = selectedItems.map(async (itemId) => {
        try {
          // التحقق من صحة معرف العنصر باستخدام وظيفة الأمان
          if (!validateId(itemId)) {
            throw new Error('معرف عنصر غير صحيح');
          }
          
          // التحقق من معدل الطلبات لمنع إساءة الاستخدام
          if (!rateLimiter.isAllowed(`user_${user.id}_bulk_action`)) {
            throw new Error('تم تجاوز الحد الأقصى للطلبات');
          }

          switch (action) {
            case 'publish':
              await publishContent(itemId);
              break;
            case 'unpublish':
              await unpublishContent(itemId);
              break;
            case 'delete':
              await deleteContent(itemId);
              break;
          }
          success++;
        } catch (err) {
          console.error(`فشل في تنفيذ ${action} على العنصر ${itemId}:`, err);
        }
      });

      await Promise.all(promises);
      
      if (success === selectedItems.length) {
        displayMessage('success', `تم تنفيذ العملية على ${success} عنصر بنجاح`);
      } else {
        displayMessage('warning', `تم تنفيذ العملية على ${success} من ${selectedItems.length} عنصر`);
      }

      setSelectedItems([]); // إلغاء التحديد
      await refresh(); // تحديث البيانات
    } catch (error) {
      console.error('فشل في تنفيذ العملية المجمعة:', error);
      displayMessage('error', 'فشل في تنفيذ العملية المجمعة');
    }
  };

  // Handle content export
  const handleExport = async (format) => {
    if (selectedItems.length === 0) {
      displayMessage('warning', 'يرجى تحديد عناصر للتصدير');
      return;
    }

    try {
      // التحقق من صلاحية التصدير
      if (!canManageContent) {
        displayMessage('error', 'ليس لديك صلاحية لتصدير البيانات');
        return;
      }

      // التحقق من معدل طلبات التصدير
      if (!rateLimiter.isAllowed(`user_${user.id}_export`)) {
        displayMessage('error', 'تم تجاوز الحد الأقصى لطلبات التصدير. يرجى المحاولة لاحقاً');
        return;
      }

      // الحصول على البيانات المحددة وتنظيفها
      const selectedContent = content
        .filter(item => selectedItems.includes(item.id) && validateId(item.id))
        .map(item => sanitizeContentForExport(item));
      
      // التحقق من حد التصدير (الحد الأقصى 1000 عنصر)
      if (selectedContent.length > 1000) {
        displayMessage('warning', 'يمكن تصدير 1000 عنصر كحد أقصى في المرة الواحدة');
        return;
      }

      let exportData;
      let filename;
      let mimeType;

      // التحقق من تنسيق الملف المسموح
      const allowedFormats = ['json', 'csv'];
      if (!allowedFormats.includes(format)) {
        throw new Error(`تنسيق التصدير غير مدعوم: ${format}`);
      }

      const dateStr = new Date().toISOString().split('T')[0];
      const baseFilename = `content-export-${dateStr}`;

      switch (format) {
        case 'json':
          exportData = JSON.stringify(selectedContent, null, 2);
          filename = sanitizeFilename(`${baseFilename}.json`);
          mimeType = 'application/json';
          break;
        case 'csv':
          exportData = convertToCSV(selectedContent);
          filename = sanitizeFilename(`${baseFilename}.csv`);
          mimeType = 'text/csv';
          break;
      }

      // إنشاء وتحميل الملف
      const blob = new Blob([exportData], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      displayMessage('success', 'تم تصدير البيانات بنجاح');
    } catch (error) {
      console.error('فشل في تصدير البيانات:', error);
      displayMessage('error', 'فشل في تصدير البيانات');
    }
  };

  // تنظيف المحتوى للتصدير - إزالة البيانات الحساسة
  const sanitizeContentForExport = (item) => {
    if (!item || typeof item !== 'object') return {};
    
    // قائمة الحقول المسموح بتصديرها
    const allowedFields = [
      'id', 'title', 'type', 'status', 'createdAt', 'updatedAt', 
      'category', 'tags', 'summary', 'publishedAt', 'author'
    ];
    
    const sanitized = {};
    allowedFields.forEach(field => {
      if (item.hasOwnProperty(field)) {
        // تنظيف النص من أي HTML أو سكريبت باستخدام دالة الأمان
        if (typeof item[field] === 'string') {
          sanitized[field] = sanitizeHtml(item[field]);
        } else {
          sanitized[field] = item[field];
        }
      }
    });
    
    return sanitized;
  };

  // تحويل البيانات إلى CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = ['ID', 'العنوان', 'النوع', 'الحالة', 'تاريخ الإنشاء'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.id || '',
        `"${(item.title || '').replace(/"/g, '""')}"`, // تجنب CSV injection
        item.type || '',
        item.status || '',
        item.createdAt || ''
      ].join(','))
    ].join('\n');
    
    return csvContent;
  };
  // Check permissions
  const canManageContent = checkPermission(user, 'content', 'write');
  const canDeleteContent = checkPermission(user, 'content', 'delete');

  if (!canManageContent) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">غير مصرح</h3>
          <p className="text-gray-600">ليس لديك صلاحية لإدارة المحتوى</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Message Display */}
      {showMessage.show && (
        <div className={`p-4 rounded-md ${
          showMessage.type === 'success' ? 'bg-green-100 text-green-800' :
          showMessage.type === 'error' ? 'bg-red-100 text-red-800' :
          showMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {showMessage.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المحتوى</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة جميع المحتويات في النظام</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
          {selectedItems.length > 0 && (
            <>
              <button
                onClick={() => handleBulkAction('publish')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                نشر المحدد ({selectedItems.length})
              </button>
              <button
                onClick={() => handleBulkAction('unpublish')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                إلغاء النشر
              </button>
              {canDeleteContent && (
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  حذف المحدد
                </button>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('json')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  تصدير JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  تصدير CSV
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Type Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse px-6" aria-label="Tabs">
            {[
              { key: 'all', label: 'الكل', count: null },
              { key: CONTENT_TYPES.NEWS, label: 'الأخبار', count: null },
              { key: CONTENT_TYPES.ARTICLE, label: 'المقالات', count: null },
              { key: CONTENT_TYPES.EVENT, label: 'الفعاليات', count: null },
              { key: CONTENT_TYPES.LECTURE, label: 'المحاضرات', count: null },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleContentTypeChange(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedContentType === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Manager Component */}
        <div className="p-6">
          <ContentManager
            contentType={selectedContentType === 'all' ? null : selectedContentType}
            showFilters={true}
            showBulkActions={true}
            showSearch={true}
            showViewModes={true}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            enableSelection={true}
            enableSorting={true}
            enableExport={true}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onBulkAction={handleBulkAction}
            onExport={handleExport}
            permissions={{
              canCreate: canManageContent,
              canEdit: canManageContent,
              canDelete: canDeleteContent,
              canPublish: canManageContent
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;