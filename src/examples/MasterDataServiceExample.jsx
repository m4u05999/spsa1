/**
 * MasterDataService Usage Example
 * مثال على استخدام خدمة البيانات الرئيسية
 * 
 * @description
 * مثال شامل يوضح كيفية استخدام MasterDataService و useMasterData hook
 * في مكونات React مختلفة
 * 
 * @author SPSA Development Team
 * @version 1.0.0
 * @since 2024-12-29
 */

import React, { useState, useEffect } from 'react';
import { useMasterData, useNews, useEvents } from '../hooks/useMasterData.js';
import MasterDataService from '../services/MasterDataService.js';
import { CONTENT_TYPES, CONTENT_STATUS } from '../schemas/contentManagementSchema.js';

/**
 * Example 1: Basic Content Display
 * مثال 1: عرض المحتوى الأساسي
 */
const ContentList = () => {
  const {
    data: content,
    loading,
    error,
    refresh,
    clearError
  } = useMasterData({
    type: 'content',
    filters: { status: CONTENT_STATUS.PUBLISHED },
    autoLoad: true,
    realtime: true
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-red-800 font-medium">حدث خطأ</h3>
            <p className="text-red-600 text-sm">{error.message}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              إخفاء
            </button>
            <button
              onClick={refresh}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">المحتوى ({content.length})</h2>
        <button
          onClick={refresh}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          تحديث
        </button>
      </div>

      <div className="grid gap-4">
        {content.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.excerpt}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>النوع: {item.contentType}</span>
                  <span>الحالة: {item.status}</span>
                  <span>المؤلف: {item.authorName}</span>
                </div>
              </div>
              {item.isFeatured && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                  مميز
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {content.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          لا يوجد محتوى متاح حالياً
        </div>
      )}
    </div>
  );
};

/**
 * Example 2: News Component with Specialized Hook
 * مثال 2: مكون الأخبار مع hook متخصص
 */
const NewsSection = () => {
  const {
    data: news,
    loading,
    error,
    searchContent
  } = useNews({
    filters: { limit: 5 },
    autoLoad: true,
    realtime: true
  });

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchContent(searchQuery);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">آخر الأخبار</h2>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث في الأخبار..."
            className="border rounded px-3 py-1 text-sm"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            بحث
          </button>
        </form>
      </div>

      {loading && (
        <div className="text-center py-4">
          <span className="text-gray-500">جاري تحميل الأخبار...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-600 text-sm">
          خطأ في تحميل الأخبار: {error.message}
        </div>
      )}

      <div className="grid gap-3">
        {news.map((item) => (
          <div key={item.id} className="bg-gray-50 rounded-lg p-3">
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{item.excerpt}</p>
            <div className="text-xs text-gray-500 mt-2">
              {new Date(item.publishedAt).toLocaleDateString('ar-SA')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Example 3: Content Management with CRUD Operations
 * مثال 3: إدارة المحتوى مع عمليات CRUD
 */
const ContentManager = () => {
  const {
    data: content,
    loading,
    createContent,
    updateContent,
    deleteContent,
    refresh
  } = useMasterData({
    type: 'content',
    autoLoad: true,
    realtime: true
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    contentType: CONTENT_TYPES.ARTICLE,
    status: CONTENT_STATUS.DRAFT
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateContent(editingId, formData);
        setEditingId(null);
      } else {
        await createContent(formData);
      }
      
      setFormData({
        title: '',
        excerpt: '',
        contentType: CONTENT_TYPES.ARTICLE,
        status: CONTENT_STATUS.DRAFT
      });
      setIsCreating(false);
      
    } catch (error) {
      alert('حدث خطأ: ' + error.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      excerpt: item.excerpt,
      contentType: item.contentType,
      status: item.status
    });
    setEditingId(item.id);
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
      try {
        await deleteContent(id);
      } catch (error) {
        alert('حدث خطأ في الحذف: ' + error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">إدارة المحتوى</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isCreating ? 'إلغاء' : 'إضافة محتوى جديد'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">العنوان</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">المقتطف</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              className="w-full border rounded px-3 py-2 h-20"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">النوع</label>
              <select
                value={formData.contentType}
                onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              >
                <option value={CONTENT_TYPES.ARTICLE}>مقال</option>
                <option value={CONTENT_TYPES.NEWS}>خبر</option>
                <option value={CONTENT_TYPES.EVENT}>فعالية</option>
                <option value={CONTENT_TYPES.PAGE}>صفحة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              >
                <option value={CONTENT_STATUS.DRAFT}>مسودة</option>
                <option value={CONTENT_STATUS.PUBLISHED}>منشور</option>
                <option value={CONTENT_STATUS.ARCHIVED}>مؤرشف</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {editingId ? 'تحديث' : 'إنشاء'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
                setFormData({
                  title: '',
                  excerpt: '',
                  contentType: CONTENT_TYPES.ARTICLE,
                  status: CONTENT_STATUS.DRAFT
                });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {content.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{item.excerpt}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>النوع: {item.contentType}</span>
                <span>الحالة: {item.status}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(item)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                تعديل
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-4">
          <span className="text-gray-500">جاري التحميل...</span>
        </div>
      )}
    </div>
  );
};

/**
 * Example 4: Service Status Monitor
 * مثال 4: مراقب حالة الخدمة
 */
const ServiceStatusMonitor = () => {
  const [status, setStatus] = useState(MasterDataService.getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(MasterDataService.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <h3 className="font-semibold mb-3">حالة الخدمة</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span>مُهيأة:</span>
          <span className={status.isInitialized ? 'text-green-600' : 'text-red-600'}>
            {status.isInitialized ? '✅' : '❌'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>متصلة:</span>
          <span className={status.isOnline ? 'text-green-600' : 'text-red-600'}>
            {status.isOnline ? '🌐' : '📴'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Supabase:</span>
          <span className={status.hasSupabase ? 'text-green-600' : 'text-yellow-600'}>
            {status.hasSupabase ? '✅' : '⚠️'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>التخزين المؤقت:</span>
          <span className="text-blue-600">{status.cacheSize}</span>
        </div>
        <div className="flex justify-between">
          <span>المشتركون:</span>
          <span className="text-purple-600">{status.subscribersCount}</span>
        </div>
        <div className="flex justify-between">
          <span>تغييرات غير متصلة:</span>
          <span className={status.hasOfflineChanges ? 'text-orange-600' : 'text-gray-600'}>
            {status.hasOfflineChanges ? '📝' : '✅'}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Example Component
 * المكون الرئيسي للمثال
 */
const MasterDataServiceExample = () => {
  const [activeTab, setActiveTab] = useState('content');

  const tabs = [
    { id: 'content', label: 'عرض المحتوى', component: ContentList },
    { id: 'news', label: 'الأخبار', component: NewsSection },
    { id: 'manager', label: 'إدارة المحتوى', component: ContentManager },
    { id: 'status', label: 'حالة الخدمة', component: ServiceStatusMonitor }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ContentList;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">مثال على استخدام MasterDataService</h1>
        <p className="text-gray-600">
          هذا المثال يوضح كيفية استخدام خدمة البيانات الرئيسية الموحدة في مكونات React مختلفة
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Component */}
      <ActiveComponent />
    </div>
  );
};

export default MasterDataServiceExample;
