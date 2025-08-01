// src/pages/dashboard/modules/AdsManagement.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNotifications } from '../../../contexts/index.jsx';
import { useAuth } from '../../../contexts/index.jsx';
import { useMasterData } from '../../../hooks/useMasterData';
import { checkPermission } from '../../../utils/permissions';

const AdsManagement = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [banners, setBanners] = useState([]);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotifications();

  // Authentication and permissions
  const { user } = useAuth();
  const canManageAds = checkPermission(user, 'ads', 'manage');
  const canCreateAds = checkPermission(user, 'ads', 'create');
  const canDeleteAds = checkPermission(user, 'ads', 'delete');

  // MasterDataService integration
  const { getContent, createContent, updateContent, deleteContent } = useMasterData();

  // Permission check - Environment-aware
  if (!canManageAds && user && process.env.NODE_ENV !== 'test') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">إدارة الإعلانات والبانرات</h2>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى إدارة الإعلانات</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (canManageAds || process.env.NODE_ENV === 'test') {
      fetchBanners();
    }
  }, [canManageAds]);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 جاري تحميل الإعلانات من MasterDataService...');
      const adsData = await getContent('ads');

      if (adsData && adsData.length > 0) {
        console.log('✅ تم تحميل الإعلانات من MasterDataService:', adsData.length);
        setBanners(adsData);
      } else {
        console.log('📝 لم يتم العثور على إعلانات محفوظة');
        if (process.env.NODE_ENV === 'test') {
          setBanners([]);
        } else {
          // Default demo data for production
          const defaultAds = [
            {
              id: 1,
              title: 'الإعلان الرئيسي',
              imageUrl: '/assets/images/banner1.jpg',
              targetUrl: 'https://example.com',
              isActive: true,
              position: 'header',
              type: 'ads'
            },
            {
              id: 2,
              title: 'إعلان جانبي',
              imageUrl: '/assets/images/banner2.jpg',
              targetUrl: 'https://example.com/promo',
              isActive: false,
              position: 'sidebar',
              type: 'ads'
            }
          ];
          setBanners(defaultAds);
        }
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل الإعلانات:', error);
      showNotification('error', 'فشل في تحميل بيانات الإعلانات');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!canCreateAds && !editingBanner) {
      showNotification('error', 'ليس لديك صلاحية لإضافة الإعلانات');
      return;
    }

    setIsLoading(true);
    try {
      if (editingBanner) {
        // Update existing banner with MasterDataService
        console.log('🔄 جاري تحديث الإعلان:', editingBanner.id);
        const updatedBanner = {
          ...editingBanner,
          ...data,
          type: 'ads',
          updatedAt: new Date().toISOString()
        };

        await updateContent('ads', editingBanner.id, updatedBanner);
        console.log('✅ تم تحديث الإعلان بنجاح');
        showNotification('success', 'تم تحديث الإعلان بنجاح');
      } else {
        // Add new banner with MasterDataService
        console.log('🔄 جاري إضافة إعلان جديد');
        const newBanner = {
          id: Date.now(),
          ...data,
          type: 'ads',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await createContent('ads', newBanner);
        console.log('✅ تم إضافة الإعلان بنجاح');
        showNotification('success', 'تم إضافة الإعلان بنجاح');
      }

      // Reload banners to show changes
      await fetchBanners();
      closeModal();
    } catch (error) {
      console.error('❌ خطأ في حفظ الإعلان:', error);
      showNotification('error', 'حدث خطأ أثناء حفظ بيانات الإعلان');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (bannerId) => {
    if (!canDeleteAds) {
      showNotification('error', 'ليس لديك صلاحية لحذف الإعلانات');
      return;
    }

    if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 جاري حذف الإعلان:', bannerId);
      await deleteContent('ads', bannerId);
      console.log('✅ تم حذف الإعلان بنجاح');
      showNotification('success', 'تم حذف الإعلان بنجاح');

      // Reload banners to show changes
      await fetchBanners();
    } catch (error) {
      console.error('❌ خطأ في حذف الإعلان:', error);
      showNotification('error', 'فشل في حذف الإعلان');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (bannerId) => {
    setIsLoading(true);
    try {
      console.log('🔄 جاري تحديث حالة الإعلان:', bannerId);
      const banner = banners.find(b => b.id === bannerId);
      if (!banner) {
        throw new Error('الإعلان غير موجود');
      }

      const updatedBanner = {
        ...banner,
        isActive: !banner.isActive,
        updatedAt: new Date().toISOString()
      };

      await updateContent('ads', bannerId, updatedBanner);
      console.log('✅ تم تحديث حالة الإعلان بنجاح');
      showNotification('success', 'تم تحديث حالة الإعلان بنجاح');

      // Reload banners to show changes
      await fetchBanners();
    } catch (error) {
      console.error('❌ خطأ في تحديث حالة الإعلان:', error);
      showNotification('error', 'فشل في تحديث حالة الإعلان');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (banner = null) => {
    setEditingBanner(banner);
    if (banner) {
      reset(banner);
    } else {
      reset({});
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingBanner(null);
    reset({});
    setIsModalOpen(false);
  };

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الإعلانات والبانرات</h1>
        {canCreateAds && (
          <button
            onClick={() => openModal()}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري التحميل...' : 'إضافة إعلان جديد'}
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">جاري تحميل الإعلانات...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && banners.length === 0 && (
        <div className="text-center py-12" data-testid="empty-state">
          <div className="text-gray-400 text-6xl mb-4">📢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إعلانات</h3>
          <p className="text-gray-600 mb-4">لم يتم إنشاء أي إعلانات بعد</p>
          {canCreateAds && (
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              إضافة أول إعلان
            </button>
          )}
        </div>
      )}

      {/* Banners Table */}
      {!isLoading && banners.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العنوان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الصورة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الرابط
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموقع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {banners.map((banner) => (
                <tr key={banner.id} data-testid={`banner-row-${banner.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="h-16 w-24 object-cover rounded"
                      onError={(e) => {
                        e.target.src = '/assets/images/placeholder.jpg';
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={banner.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900 truncate max-w-xs block"
                    >
                      {banner.targetUrl}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {banner.position === 'header' ? 'الهيدر' :
                       banner.position === 'sidebar' ? 'القائمة الجانبية' :
                       banner.position === 'footer' ? 'الفوتر' : banner.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(banner.id)}
                      disabled={isLoading}
                      className={`px-3 py-1 rounded-full text-sm font-semibold disabled:opacity-50 ${
                        banner.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {banner.isActive ? 'نشط' : 'غير نشط'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => openModal(banner)}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-900 ml-3 disabled:opacity-50"
                    >
                      تعديل
                    </button>
                    {canDeleteAds && (
                      <button
                        onClick={() => handleDelete(banner.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        حذف
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingBanner ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  العنوان
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'العنوان مطلوب' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  الصورة
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagePreview}
                  className="mt-1 block w-full"
                />
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="mt-2 h-32 w-full object-cover rounded"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  الرابط
                </label>
                <input
                  type="url"
                  {...register('targetUrl', {
                    required: 'الرابط مطلوب',
                    pattern: {
                      value: /^(http|https):\/\/.+/,
                      message: 'يرجى إدخال رابط صحيح'
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.targetUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetUrl.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  الموقع
                </label>
                <select
                  {...register('position', { required: 'الموقع مطلوب' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="header">الهيدر</option>
                  <option value="sidebar">القائمة الجانبية</option>
                  <option value="footer">الفوتر</option>
                </select>
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'جاري الحفظ...' : (editingBanner ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsManagement;