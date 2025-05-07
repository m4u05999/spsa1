// src/pages/Profile.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserData, updateUserProfile } from '../services/userService';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    title: '',
    bio: '',
    profileImage: '',
    committees: [],
    researchUnits: []
  });
  
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // استرجاع بيانات المستخدم عند تحميل الصفحة
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUserData();
        if (data) {
          setUserData(data);
          setFormData(data);
        }
      } catch (error) {
        console.error('خطأ في استرجاع بيانات المستخدم:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // تغيير وضع التحرير
  const handleEditToggle = () => {
    if (editing) {
      setFormData(userData);
      setErrors({});
    }
    setEditing(!editing);
    setUpdateSuccess(false);
    setUpdateError('');
  };

  // معالج تغيير المدخلات
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // إزالة أخطاء الحقل عند التعديل
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // التحقق من صحة المدخلات
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'الاسم مطلوب';
    }
    
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }
    
    if (formData.phone && !/^(05)[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح، يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // معالج حفظ البيانات
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      await updateUserProfile(formData);
      setUserData(formData);
      setUpdateSuccess(true);
    } catch (error) {
      console.error('خطأ في تحديث البيانات:', error);
      setUpdateError('حدث خطأ أثناء محاولة تحديث البيانات، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData.name) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
              {!editing ? (
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <i className="fas fa-edit ml-2"></i>
                  تعديل الملف الشخصي
                </button>
              ) : (
                <div className="mt-3 md:mt-0 flex space-x-3 space-x-reverse">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </button>
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>

            {updateSuccess && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-check-circle text-green-400"></i>
                  </div>
                  <div className="mr-3">
                    <p className="text-sm text-green-700">
                      تم تحديث بياناتك بنجاح
                    </p>
                  </div>
                </div>
              </div>
            )}

            {updateError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-circle text-red-400"></i>
                  </div>
                  <div className="mr-3">
                    <p className="text-sm text-red-700">{updateError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-b border-gray-200 pb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="flex-shrink-0">
                  {userData.profileImage ? (
                    <img
                      className="h-24 w-24 rounded-full object-cover border border-gray-300"
                      src={userData.profileImage}
                      alt={userData.name}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold border border-gray-300">
                      {userData.name ? userData.name[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="mr-0 md:mr-6 mt-4 md:mt-0">
                  <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
                  <p className="text-sm text-gray-600">
                    {userData.title || 'عضو في جمعية العلوم السياسية'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    التخصص: {userData.specialization || 'غير محدد'}
                  </p>
                </div>
              </div>
            </div>

            {editing ? (
              <form className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      الاسم الكامل*
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      البريد الإلكتروني*
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      رقم الهاتف
                    </label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="05xxxxxxxx"
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      المسمى الوظيفي
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                      التخصص
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      id="specialization"
                      value={formData.specialization || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
                      رابط صورة الملف الشخصي
                    </label>
                    <input
                      type="text"
                      name="profileImage"
                      id="profileImage"
                      value={formData.profileImage || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    نبذة مختصرة
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">الاسم الكامل</dt>
                    <dd className="mt-1 text-gray-900">{userData.name || 'غير محدد'}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">البريد الإلكتروني</dt>
                    <dd className="mt-1 text-gray-900">{userData.email || 'غير محدد'}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">رقم الهاتف</dt>
                    <dd className="mt-1 text-gray-900">{userData.phone || 'غير محدد'}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">المسمى الوظيفي</dt>
                    <dd className="mt-1 text-gray-900">{userData.title || 'غير محدد'}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">التخصص</dt>
                    <dd className="mt-1 text-gray-900">{userData.specialization || 'غير محدد'}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">تاريخ الانضمام</dt>
                    <dd className="mt-1 text-gray-900">
                      {userData.joinDate 
                        ? new Date(userData.joinDate).toLocaleDateString('ar-SA') 
                        : new Date().toLocaleDateString('ar-SA')}
                    </dd>
                  </div>
                </dl>

                {userData.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">نبذة مختصرة</h3>
                    <p className="mt-1 text-gray-900">{userData.bio}</p>
                  </div>
                )}

                {userData.committees && userData.committees.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">اللجان</h3>
                    <div className="flex flex-wrap gap-2">
                      {userData.committees.map((committee, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                          {committee.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {userData.researchUnits && userData.researchUnits.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">الوحدات البحثية</h3>
                    <div className="flex flex-wrap gap-2">
                      {userData.researchUnits.map((unit, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800">
                          {unit.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <i className="fas fa-arrow-right ml-2"></i>
            العودة للوحة التحكم
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;