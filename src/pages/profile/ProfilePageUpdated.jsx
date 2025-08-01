// src/pages/profile/ProfilePageUpdated.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/index.jsx';
import { getUserData, updateUserProfile } from '../../services/userService';
import useErrorMessages from '../../hooks/useErrorMessages';
import EnhancedMessage, { FieldErrorMessage } from '../../components/ui/EnhancedMessage';
import PrivacySettings from '../../components/profile/PrivacySettings';
import { VALIDATION_MESSAGES } from '../../utils/errorMessages';
import './ProfilePageUpdated.css';

const ProfilePageUpdated = () => {
  const { currentUser } = useContext(AuthContext);
  const {
    errors,
    globalError,
    successMessage,
    clearAllMessages,
    setFieldError,
    setFieldErrors,
    handleApiError,
    showSuccess,
    getFieldError,
    hasFieldError
  } = useErrorMessages();

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
  const [activeTab, setActiveTab] = useState('profile'); // profile, privacy, settings

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
      clearAllMessages();
    }
    setEditing(!editing);
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
      setFieldError(name, '');
    }
  };

  // التحقق من صحة المدخلات
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = VALIDATION_MESSAGES.REQUIRED.name;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = VALIDATION_MESSAGES.LENGTH.nameMin;
    } else if (formData.name.trim().length > 100) {
      newErrors.name = VALIDATION_MESSAGES.LENGTH.nameMax;
    }

    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = VALIDATION_MESSAGES.REQUIRED.email;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = VALIDATION_MESSAGES.FORMAT.email;
    }

    if (formData.phone && !/^(05)[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = VALIDATION_MESSAGES.FORMAT.phone;
    }

    if (formData.bio && formData.bio.length > 2000) {
      newErrors.bio = VALIDATION_MESSAGES.LENGTH.descriptionMax;
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // معالج حفظ البيانات
  const handleSave = async (e) => {
    e.preventDefault();

    // مسح الرسائل السابقة
    clearAllMessages();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile(formData);
      setUserData(formData);
      setEditing(false);
      showSuccess('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث البيانات:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData.name) {
    return (
      <div className="profile-page-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-updated" dir="rtl">
      <div className="profile-container">
        
        {/* Header */}
        <div className="profile-header">
          <div className="profile-hero">
            <div className="profile-avatar">
              {userData.profileImage ? (
                <img
                  src={userData.profileImage}
                  alt={userData.name}
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  {userData.name ? userData.name[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{userData.name}</h1>
              <p className="profile-title">
                {userData.title || 'عضو في جمعية العلوم السياسية'}
              </p>
              <p className="profile-specialization">
                التخصص: {userData.specialization || 'غير محدد'}
              </p>
            </div>
            <div className="profile-actions">
              {!editing && activeTab === 'profile' ? (
                <button
                  onClick={handleEditToggle}
                  className="btn btn-primary"
                >
                  <i className="fas fa-edit"></i>
                  تعديل الملف الشخصي
                </button>
              ) : editing && activeTab === 'profile' ? (
                <div className="edit-actions">
                  <button
                    onClick={handleSave}
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="btn btn-secondary"
                  >
                    إلغاء
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user"></i>
              المعلومات الشخصية
            </button>
            <button
              className={`tab-button ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <i className="fas fa-shield-alt"></i>
              الخصوصية والموافقات
            </button>
            <button
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="fas fa-cog"></i>
              الإعدادات
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="profile-content">
          
          {/* Messages */}
          {successMessage && (
            <EnhancedMessage
              type="success"
              message={successMessage}
              onClose={() => showSuccess('')}
              className="message-enhanced"
            />
          )}

          {globalError && (
            <EnhancedMessage
              type="error"
              message={globalError}
              onClose={() => clearAllMessages()}
              className="message-enhanced"
            />
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              {editing ? (
                <form className="profile-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">الاسم الكامل*</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className={hasFieldError('name') ? 'error' : ''}
                      />
                      <FieldErrorMessage error={getFieldError('name')} />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">البريد الإلكتروني*</label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className={hasFieldError('email') ? 'error' : ''}
                      />
                      <FieldErrorMessage error={getFieldError('email')} />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">رقم الهاتف</label>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className={hasFieldError('phone') ? 'error' : ''}
                        placeholder="05xxxxxxxx"
                      />
                      <FieldErrorMessage error={getFieldError('phone')} />
                    </div>

                    <div className="form-group">
                      <label htmlFor="title">المسمى الوظيفي</label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="specialization">التخصص</label>
                      <input
                        type="text"
                        name="specialization"
                        id="specialization"
                        value={formData.specialization || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="profileImage">رابط صورة الملف الشخصي</label>
                      <input
                        type="text"
                        name="profileImage"
                        id="profileImage"
                        value={formData.profileImage || ''}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="bio">نبذة مختصرة</label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio || ''}
                      onChange={handleInputChange}
                      className={hasFieldError('bio') ? 'error' : ''}
                    />
                    <FieldErrorMessage error={getFieldError('bio')} />
                  </div>
                </form>
              ) : (
                <div className="profile-display">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>الاسم الكامل</label>
                      <span>{userData.name || 'غير محدد'}</span>
                    </div>

                    <div className="info-item">
                      <label>البريد الإلكتروني</label>
                      <span>{userData.email || 'غير محدد'}</span>
                    </div>

                    <div className="info-item">
                      <label>رقم الهاتف</label>
                      <span>{userData.phone || 'غير محدد'}</span>
                    </div>

                    <div className="info-item">
                      <label>المسمى الوظيفي</label>
                      <span>{userData.title || 'غير محدد'}</span>
                    </div>

                    <div className="info-item">
                      <label>التخصص</label>
                      <span>{userData.specialization || 'غير محدد'}</span>
                    </div>

                    <div className="info-item">
                      <label>تاريخ الانضمام</label>
                      <span>
                        {userData.joinDate 
                          ? new Date(userData.joinDate).toLocaleDateString('ar-SA') 
                          : new Date().toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>

                  {userData.bio && (
                    <div className="bio-section">
                      <h3>نبذة مختصرة</h3>
                      <p>{userData.bio}</p>
                    </div>
                  )}

                  {userData.committees && userData.committees.length > 0 && (
                    <div className="badges-section">
                      <h3>اللجان</h3>
                      <div className="badges-container">
                        {userData.committees.map((committee, index) => (
                          <span key={index} className="badge committee-badge">
                            {committee.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {userData.researchUnits && userData.researchUnits.length > 0 && (
                    <div className="badges-section">
                      <h3>الوحدات البحثية</h3>
                      <div className="badges-container">
                        {userData.researchUnits.map((unit, index) => (
                          <span key={index} className="badge research-badge">
                            {unit.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="tab-content">
              <PrivacySettings />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="tab-content">
              <div className="settings-content">
                <h3>إعدادات الحساب</h3>
                
                <div className="settings-section">
                  <h4>الأمان</h4>
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <h5>تغيير كلمة المرور</h5>
                        <p>تحديث كلمة المرور للحصول على أمان أفضل</p>
                      </div>
                      <button className="btn btn-outline">تغيير</button>
                    </div>
                    
                    <div className="setting-item">
                      <div className="setting-info">
                        <h5>المصادقة الثنائية</h5>
                        <p>تفعيل طبقة حماية إضافية لحسابك</p>
                      </div>
                      <button className="btn btn-outline">إعداد</button>
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h4>الإشعارات</h4>
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <h5>إشعارات البريد الإلكتروني</h5>
                        <p>استلام الإشعارات عبر البريد الإلكتروني</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    
                    <div className="setting-item">
                      <div className="setting-info">
                        <h5>الإشعارات الفورية</h5>
                        <p>استلام إشعارات فورية للأنشطة المهمة</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-section dangerous">
                  <h4>منطقة الخطر</h4>
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <h5>حذف الحساب</h5>
                        <p>حذف حسابك وجميع البيانات المرتبطة به نهائياً</p>
                      </div>
                      <Link to="/data-deletion" className="btn btn-danger">
                        حذف الحساب
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="profile-footer">
          <Link to="/dashboard" className="btn btn-secondary">
            <i className="fas fa-arrow-right"></i>
            العودة للوحة التحكم
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ProfilePageUpdated;