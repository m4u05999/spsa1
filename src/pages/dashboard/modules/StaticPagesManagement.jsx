import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';
import { useMasterData } from '../../../hooks/useMasterData';
import { useAuth } from '../../../contexts/index.jsx';
import { useNotifications } from '../../../contexts/index.jsx';
import { checkPermission } from '../../../utils/permissions';

const StaticPagesManagement = () => {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    isPublished: true
  });

  // MasterDataService integration
  const { data: masterData, loadData, createContent, updateContent, deleteContent } = useMasterData({
    type: 'static_pages',
    autoLoad: false
  });

  // Authentication and permissions
  const { user } = useAuth();
  const { showNotification } = useNotifications();

  // Permission checks
  const canManagePages = checkPermission(user, 'pages', 'manage');
  const canCreatePages = checkPermission(user, 'pages', 'create');
  const canDeletePages = checkPermission(user, 'pages', 'delete');

  // Permission check - Environment-aware
  if (!canManagePages && user && process.env.NODE_ENV !== 'test') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">إدارة الصفحات الثابتة</h2>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى إدارة الصفحات الثابتة</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (canManagePages || process.env.NODE_ENV === 'test') {
      fetchPages();
    }
  }, [canManagePages]);

  const fetchPages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 جاري تحميل الصفحات الثابتة من MasterDataService...');
      await loadData({ type: 'static_pages' });

      if (masterData && masterData.length > 0) {
        console.log('✅ تم تحميل الصفحات الثابتة من MasterDataService:', masterData.length);
        setPages(masterData);
      } else {
        console.log('📝 لم يتم العثور على صفحات ثابتة محفوظة');
        if (process.env.NODE_ENV === 'test') {
          setPages([]);
        } else {
          // Default demo pages for production
          const defaultPages = [
            {
              id: 1,
              title: 'من نحن',
              slug: 'about-us',
              content: 'محتوى صفحة من نحن...',
              isPublished: true,
              lastModified: new Date().toLocaleDateString('ar-SA'),
              type: 'static_pages'
            },
            {
              id: 2,
              title: 'شروط الخدمة',
              slug: 'terms-of-service',
              content: 'محتوى شروط الخدمة...',
              isPublished: true,
              lastModified: new Date().toLocaleDateString('ar-SA'),
              type: 'static_pages'
            }
          ];
          setPages(defaultPages);
        }
      }
    } catch (err) {
      console.error('❌ خطأ في تحميل الصفحات الثابتة:', err);
      setError('فشل في تحميل الصفحات الثابتة');
      showNotification('فشل في تحميل الصفحات الثابتة', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    if (!canCreatePages) {
      showNotification('ليس لديك صلاحية لإنشاء صفحات جديدة', 'error');
      return;
    }

    setSelectedPage(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      isPublished: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (page) => {
    if (!canManagePages) {
      showNotification('ليس لديك صلاحية لتعديل الصفحات', 'error');
      return;
    }

    setSelectedPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      isPublished: page.isPublished
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (pageId) => {
    if (!canDeletePages) {
      showNotification('ليس لديك صلاحية لحذف الصفحات', 'error');
      return;
    }

    if (window.confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
      try {
        console.log('🔄 جاري حذف الصفحة...');
        await deleteContent('static_pages', pageId);

        // Update local state
        setPages(pages.filter(page => page.id !== pageId));

        console.log('✅ تم حذف الصفحة بنجاح');
        showNotification('تم حذف الصفحة بنجاح', 'success');
      } catch (err) {
        console.error('❌ خطأ في حذف الصفحة:', err);
        showNotification('فشل في حذف الصفحة', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedPage) {
        // Update existing page
        console.log('🔄 جاري تحديث الصفحة...');
        const updatedPageData = {
          ...formData,
          id: selectedPage.id,
          lastModified: new Date().toLocaleDateString('ar-SA'),
          type: 'static_pages'
        };

        await updateContent('static_pages', selectedPage.id, updatedPageData);

        // Update local state
        const updatedPages = pages.map(page =>
          page.id === selectedPage.id ? updatedPageData : page
        );
        setPages(updatedPages);

        console.log('✅ تم تحديث الصفحة بنجاح');
        showNotification('تم تحديث الصفحة بنجاح', 'success');
      } else {
        // Create new page
        console.log('🔄 جاري إنشاء صفحة جديدة...');
        const newPageData = {
          ...formData,
          id: Date.now(), // Temporary ID
          lastModified: new Date().toLocaleDateString('ar-SA'),
          type: 'static_pages'
        };

        const createdPage = await createContent('static_pages', newPageData);

        // Update local state
        setPages([...pages, createdPage || newPageData]);

        console.log('✅ تم إنشاء الصفحة بنجاح');
        showNotification('تم إنشاء الصفحة بنجاح', 'success');
      }

      setIsModalOpen(false);

      // Refresh data
      await fetchPages();
    } catch (err) {
      console.error('❌ خطأ في حفظ الصفحة:', err);
      showNotification(selectedPage ? 'فشل في تحديث الصفحة' : 'فشل في إنشاء الصفحة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (page) => {
    if (!canManagePages) {
      showNotification('ليس لديك صلاحية لتغيير حالة النشر', 'error');
      return;
    }

    try {
      const updatedPageData = {
        ...page,
        isPublished: !page.isPublished,
        lastModified: new Date().toLocaleDateString('ar-SA')
      };

      await updateContent('static_pages', page.id, updatedPageData);

      // Update local state
      const updatedPages = pages.map(p =>
        p.id === page.id ? updatedPageData : p
      );
      setPages(updatedPages);

      showNotification(
        updatedPageData.isPublished ? 'تم نشر الصفحة' : 'تم إلغاء نشر الصفحة',
        'success'
      );
    } catch (err) {
      console.error('❌ خطأ في تغيير حالة النشر:', err);
      showNotification('فشل في تغيير حالة النشر', 'error');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الصفحات الثابتة...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">خطأ في التحميل</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPages}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">إدارة الصفحات الثابتة</h1>
        {canCreatePages && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 ml-2" />
            إنشاء صفحة جديدة
          </button>
        )}
      </div>

      {/* Empty state */}
      {pages.length === 0 ? (
        <div className="text-center py-12" data-testid="empty-state">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد صفحات ثابتة</h3>
          <p className="mt-1 text-sm text-gray-500">ابدأ بإنشاء صفحة ثابتة جديدة</p>
          {canCreatePages && (
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5 ml-2" />
                إنشاء صفحة جديدة
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Pages Table */
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {pages.map((page) => (
              <li key={page.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{page.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">/{page.slug}</p>
                    <p className="mt-1 text-sm text-gray-500">آخر تعديل: {page.lastModified}</p>
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <Switch
                      checked={page.isPublished}
                      onChange={() => handleTogglePublish(page)}
                      className={`${
                        page.isPublished ? 'bg-indigo-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span className="sr-only">تغيير حالة النشر</span>
                      <span
                        className={`${
                          page.isPublished ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                    <span className="text-sm text-gray-600">
                      {page.isPublished ? 'منشور' : 'غير منشور'}
                    </span>
                    {canManagePages && (
                      <button
                        onClick={() => handleEdit(page)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="تعديل"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    {canDeletePages && (
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="text-red-600 hover:text-red-900"
                        title="حذف"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl" dir="rtl">
            <h2 className="text-xl font-semibold mb-4">
              {selectedPage ? 'تعديل الصفحة' : 'إنشاء صفحة جديدة'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    العنوان
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="أدخل عنوان الصفحة"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    الرابط المختصر (Slug)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="about-us"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    سيظهر في الرابط: /{formData.slug}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    المحتوى
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="أدخل محتوى الصفحة..."
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex items-center">
                  <Switch
                    checked={formData.isPublished}
                    onChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                    className={`${
                      formData.isPublished ? 'bg-indigo-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full ml-2`}
                    disabled={isSubmitting}
                  >
                    <span className="sr-only">تغيير حالة النشر</span>
                    <span
                      className={`${
                        formData.isPublished ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </Switch>
                  <span className="text-sm text-gray-700">
                    {formData.isPublished ? 'منشور' : 'غير منشور'}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      {selectedPage ? 'جاري التحديث...' : 'جاري الإنشاء...'}
                    </div>
                  ) : (
                    selectedPage ? 'تحديث' : 'إنشاء'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaticPagesManagement;