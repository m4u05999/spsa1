// src/pages/dashboard/modules/AdsManagement.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';

const AdsManagement = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [banners, setBanners] = useState([]);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const { showNotification } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      // TODO: Replace with actual API call
      const mockBanners = [
        {
          id: 1,
          title: 'الإعلان الرئيسي',
          imageUrl: '/assets/images/banner1.jpg',
          targetUrl: 'https://example.com',
          isActive: true,
          position: 'header',
        },
        {
          id: 2,
          title: 'إعلان جانبي',
          imageUrl: '/assets/images/banner2.jpg',
          targetUrl: 'https://example.com/promo',
          isActive: false,
          position: 'sidebar',
        }
      ];
      setBanners(mockBanners);
    } catch (error) {
      showNotification('error', 'فشل في تحميل البيانات');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingBanner) {
        // Update existing banner
        const updatedBanners = banners.map(banner =>
          banner.id === editingBanner.id ? { ...banner, ...data } : banner
        );
        setBanners(updatedBanners);
        showNotification('success', 'تم تحديث الإعلان بنجاح');
      } else {
        // Add new banner
        const newBanner = {
          id: Date.now(),
          ...data,
          isActive: true
        };
        setBanners([...banners, newBanner]);
        showNotification('success', 'تم إضافة الإعلان بنجاح');
      }
      closeModal();
    } catch (error) {
      showNotification('error', 'حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      try {
        setBanners(banners.filter(banner => banner.id !== bannerId));
        showNotification('success', 'تم حذف الإعلان بنجاح');
      } catch (error) {
        showNotification('error', 'فشل في حذف الإعلان');
      }
    }
  };

  const toggleStatus = async (bannerId) => {
    try {
      const updatedBanners = banners.map(banner =>
        banner.id === bannerId ? { ...banner, isActive: !banner.isActive } : banner
      );
      setBanners(updatedBanners);
      showNotification('success', 'تم تحديث حالة الإعلان بنجاح');
    } catch (error) {
      showNotification('error', 'فشل في تحديث حالة الإعلان');
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
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          إضافة إعلان جديد
        </button>
      </div>

      {/* Banners Table */}
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
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {banners.map((banner) => (
              <tr key={banner.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="h-16 w-24 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={banner.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {banner.targetUrl}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleStatus(banner.id)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
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
                    className="text-blue-600 hover:text-blue-900 ml-3"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingBanner ? 'تحديث' : 'إضافة'}
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