// src/pages/admin/ContentManagementWithSync.jsx
/**
 * Content Management with Real-time Sync - Phase 5
 * إدارة المحتوى مع المزامنة الفورية - المرحلة الخامسة
 * 
 * Features:
 * - Real-time content synchronization
 * - Live updates from other admin users
 * - Performance optimized interface
 * - PDPL-compliant content management
 */

import React, { useState, useEffect } from 'react';
import { useContent } from '../../contexts/ContentContext.jsx';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.js';
import SyncStatusIndicator, { SyncStatusBadge } from '../../components/common/SyncStatusIndicator.jsx';
import RealtimeSyncTest from '../../components/admin/RealtimeSyncTest.jsx';
import { CONTENT_TYPES, CONTENT_STATUS } from '../../schemas/contentManagementSchema.js';
import { SYNC_EVENTS } from '../../services/realtimeSyncService.js';
import { ENV } from '../../config/environment.js';

/**
 * Content Management with Real-time Sync Page
 */
const ContentManagementWithSync = () => {
  const {
    content,
    loading,
    error,
    realtimeSync,
    createContentWithSync,
    updateContentWithSync,
    deleteContentWithSync,
    loadContent,
    isRealtimeSyncEnabled
  } = useContent();

  const {
    isConnected,
    lastUpdate,
    syncStatus
  } = useRealtimeSync({
    autoConnect: true,
    onUpdate: (event) => {
      // Handle real-time updates
      console.log('Real-time update received:', event);
      setLastUpdateNotification({
        type: event.type,
        timestamp: new Date(event.timestamp),
        data: event.data
      });
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setLastUpdateNotification(null);
      }, 5000);
    }
  });

  const [selectedContent, setSelectedContent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdateNotification, setLastUpdateNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: CONTENT_TYPES.NEWS,
    status: CONTENT_STATUS.DRAFT,
    tags: []
  });

  /**
   * Handle form submission with real-time sync
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      
      if (isEditing && selectedContent) {
        // Update existing content with sync
        result = await updateContentWithSync(selectedContent.id, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create new content with sync
        result = await createContentWithSync({
          ...formData,
          author: 'Admin User', // In real app, get from auth context
          createdAt: new Date().toISOString()
        });
      }

      if (result && result.success) {
        // Reset form
        setFormData({
          title: '',
          content: '',
          type: CONTENT_TYPES.NEWS,
          status: CONTENT_STATUS.DRAFT,
          tags: []
        });
        setIsEditing(false);
        setSelectedContent(null);
        
        // Show success message
        alert(isEditing ? 'تم تحديث المحتوى بنجاح' : 'تم إنشاء المحتوى بنجاح');
      } else {
        alert('فشل في حفظ المحتوى: ' + (result?.error || 'خطأ غير معروف'));
      }

    } catch (error) {
      console.error('Error saving content:', error);
      alert('حدث خطأ أثناء حفظ المحتوى');
    }
  };

  /**
   * Handle content deletion with real-time sync
   */
  const handleDelete = async (contentId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
      return;
    }

    try {
      const result = await deleteContentWithSync(contentId);
      
      if (result && result.success) {
        alert('تم حذف المحتوى بنجاح');
        
        // Clear selection if deleted content was selected
        if (selectedContent && selectedContent.id === contentId) {
          setSelectedContent(null);
          setIsEditing(false);
        }
      } else {
        alert('فشل في حذف المحتوى: ' + (result?.error || 'خطأ غير معروف'));
      }

    } catch (error) {
      console.error('Error deleting content:', error);
      alert('حدث خطأ أثناء حذف المحتوى');
    }
  };

  /**
   * Handle content selection for editing
   */
  const handleEdit = (contentItem) => {
    setSelectedContent(contentItem);
    setFormData({
      title: contentItem.title || '',
      content: contentItem.content || '',
      type: contentItem.type || CONTENT_TYPES.NEWS,
      status: contentItem.status || CONTENT_STATUS.DRAFT,
      tags: contentItem.tags || []
    });
    setIsEditing(true);
  };

  /**
   * Cancel editing
   */
  const handleCancel = () => {
    setIsEditing(false);
    setSelectedContent(null);
    setFormData({
      title: '',
      content: '',
      type: CONTENT_TYPES.NEWS,
      status: CONTENT_STATUS.DRAFT,
      tags: []
    });
  };

  /**
   * Format content type for display
   */
  const formatContentType = (type) => {
    const types = {
      [CONTENT_TYPES.NEWS]: 'أخبار',
      [CONTENT_TYPES.EVENT]: 'فعاليات',
      [CONTENT_TYPES.ARTICLE]: 'مقالات',
      [CONTENT_TYPES.LECTURE]: 'محاضرات'
    };
    return types[type] || type;
  };

  /**
   * Format content status for display
   */
  const formatContentStatus = (status) => {
    const statuses = {
      [CONTENT_STATUS.DRAFT]: 'مسودة',
      [CONTENT_STATUS.PUBLISHED]: 'منشور',
      [CONTENT_STATUS.ARCHIVED]: 'مؤرشف'
    };
    return statuses[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                إدارة المحتوى مع المزامنة الفورية
              </h1>
              <p className="text-gray-600 mt-1">
                المرحلة الخامسة - نظام المزامنة الفورية
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <SyncStatusBadge />
              
              {isRealtimeSyncEnabled && (
                <div className="text-sm text-green-600">
                  ✅ المزامنة الفورية مفعلة
                </div>
              )}
            </div>
          </div>

          {/* Real-time Status Info */}
          {realtimeSync && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">حالة الاتصال:</span>
                  <span className={`mr-2 font-medium ${
                    isConnected ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isConnected ? 'متصل' : 'غير متصل'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">التحديثات المعلقة:</span>
                  <span className="mr-2 font-medium">
                    {realtimeSync.pendingUpdates || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">آخر تحديث:</span>
                  <span className="mr-2 font-medium">
                    {realtimeSync.lastUpdate 
                      ? new Date(realtimeSync.lastUpdate).toLocaleString('ar-SA')
                      : 'لم يحدث'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">المزامنة الفورية:</span>
                  <span className={`mr-2 font-medium ${
                    realtimeSync.isEnabled ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {realtimeSync.isEnabled ? 'مفعلة' : 'معطلة'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Update Notification */}
        {lastUpdateNotification && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-600">🔄</span>
              <span className="font-medium text-green-800">
                تحديث فوري: {lastUpdateNotification.type}
              </span>
              <span className="text-sm text-green-600">
                {lastUpdateNotification.timestamp.toLocaleTimeString('ar-SA')}
              </span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isEditing ? 'تحرير المحتوى' : 'إضافة محتوى جديد'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المحتوى
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    النوع
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(CONTENT_TYPES).map(type => (
                      <option key={type} value={type}>
                        {formatContentType(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(CONTENT_STATUS).map(status => (
                      <option key={status} value={status}>
                        {formatContentStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري الحفظ...' : (isEditing ? 'تحديث' : 'إضافة')}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Content List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              قائمة المحتوى ({content.length})
            </h2>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">جاري التحميل...</p>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {content.map(item => (
                <div
                  key={item.id}
                  className={`p-3 border rounded-lg ${
                    selectedContent?.id === item.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatContentType(item.type)} • {formatContentStatus(item.status)}
                      </p>
                      {item.createdAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 mr-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        تحرير
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {content.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  لا يوجد محتوى حالياً
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Development Tools */}
        {ENV.IS_DEVELOPMENT && (
          <div className="mt-6">
            <RealtimeSyncTest />
          </div>
        )}

        {/* Sync Status Indicator */}
        <SyncStatusIndicator 
          showDetails={true}
          position="bottom-right"
        />
      </div>
    </div>
  );
};

export default ContentManagementWithSync;
