import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/index.jsx';
import { buttonStyles, inputStyles } from '../../utils/theme';

const MemberDashboard = () => {
  // سياق الإشعارات
  const { success } = useNotification();
  
  // حالات البيانات
  const [memberInfo, setMemberInfo] = useState({
    firstName: 'محمد',
    lastName: 'الأحمدي',
    email: 'mohammad@example.com',
    phone: '0555123456',
    academic: 'دكتوراه',
    specialty: 'العلاقات الدولية',
    institution: 'جامعة الملك سعود',
    bio: 'أستاذ مساعد في العلاقات الدولية، مهتم بدراسة السياسات الإقليمية والعلاقات الدولية في الشرق الأوسط.',
    membershipPlan: 'standard',
    membershipStatus: 'active',
    memberSince: '2023-06-15',
    renewalDate: '2024-06-15',
    avatar: '/assets/images/avatar-placeholder.png'
  });

  // حالة تحرير الملف الشخصي
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({...memberInfo});
  
  // الفواتير والمدفوعات
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-20230615-001',
      date: '15 يونيو، 2023',
      amount: '1,990 ريال',
      status: 'مدفوعة',
      description: 'الاشتراك السنوي - العضوية المحترفة',
      receiptUrl: '#'
    },
    {
      id: 'INV-20230901-002',
      date: '1 سبتمبر، 2023',
      amount: '500 ريال',
      status: 'مدفوعة',
      description: 'رسوم المؤتمر السنوي للعلوم السياسية',
      receiptUrl: '#'
    }
  ]);
  
  // الأنشطة الأخيرة
  const [activities, setActivities] = useState([
    {
      id: 1,
      date: '12 نوفمبر، 2023',
      description: 'حضور ندوة "التحولات الجيوسياسية في الشرق الأوسط"',
      type: 'event'
    },
    {
      id: 2,
      date: '5 أكتوبر، 2023',
      description: 'تحميل دراسة "التغيرات في السياسات الخارجية للدول العربية"',
      type: 'download'
    },
    {
      id: 3,
      date: '28 سبتمبر، 2023',
      description: 'التسجيل في ورشة العمل "تحليل النزاعات الدولية"',
      type: 'registration'
    },
  ]);
  
  // التنبيهات والإشعارات
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      date: '15 نوفمبر، 2023',
      title: 'مؤتمر قادم',
      message: 'تم فتح التسجيل للمؤتمر السنوي للعلوم السياسية المقرر في 10 ديسمبر 2023',
      read: false
    },
    {
      id: 2,
      date: '3 نوفمبر، 2023',
      title: 'دعوة للمشاركة',
      message: 'دعوة للمشاركة في الإصدار القادم من المجلة العلمية، الموعد النهائي لتقديم الأبحاث هو 15 يناير 2024',
      read: true
    }
  ]);
  
  // المواد المحفوظة
  const [savedItems, setSavedItems] = useState([
    {
      id: 1,
      title: 'أثر التغيرات المناخية على العلاقات الدولية',
      type: 'paper',
      date: '10 أكتوبر، 2023',
      url: '#'
    },
    {
      id: 2,
      title: 'تقرير الحالة السياسية في دول مجلس التعاون 2023',
      type: 'report',
      date: '5 سبتمبر، 2023',
      url: '#'
    }
  ]);
  
  // قائمة الأطروحات الخاصة بالعضو
  const [publications, setPublications] = useState([
    {
      id: 1,
      title: 'العلاقات الدولية في ظل المتغيرات الإقليمية الراهنة',
      journal: 'المجلة السعودية للعلوم السياسية',
      date: 'مارس 2023',
      status: 'منشور',
      url: '#'
    }
  ]);

  // تحديث البيانات الشخصية
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // حفظ التغييرات
  const handleSave = () => {
    setMemberInfo(editedInfo);
    setIsEditing(false);
    success('تم تحديث معلوماتك الشخصية بنجاح');
  };

  // إلغاء التغييرات
  const handleCancel = () => {
    setEditedInfo({...memberInfo});
    setIsEditing(false);
  };

  // تبديل حالة قراءة التنبيه
  const toggleNotificationRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? {...notification, read: !notification.read} 
          : notification
      )
    );
  };

  // حذف مادة محفوظة
  const removeSavedItem = (id) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
    success('تم إزالة المادة من قائمة المواد المحفوظة');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">لوحة تحكم العضوية</h1>
      
      {/* قسم نظرة عامة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 col-span-1">
          <div className="flex flex-col items-center">
            <img 
              src={memberInfo.avatar} 
              alt="صورة العضو" 
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            <h2 className="text-xl font-bold">{memberInfo.firstName} {memberInfo.lastName}</h2>
            <p className="text-gray-600 mb-4">{memberInfo.academic} في {memberInfo.specialty}</p>
            <div className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
              {memberInfo.membershipPlan === 'basic' ? 'العضوية الأساسية' : 
               memberInfo.membershipPlan === 'standard' ? 'العضوية المحترفة' : 'العضوية المتميزة'}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 col-span-3">
          <h2 className="text-lg font-bold mb-4">تفاصيل العضوية</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm text-gray-600">حالة العضوية</h3>
              <p className="font-medium">
                {memberInfo.membershipStatus === 'active' ? (
                  <span className="text-green-600">نشطة</span>
                ) : (
                  <span className="text-red-600">غير نشطة</span>
                )}
              </p>
            </div>
            <div>
              <h3 className="text-sm text-gray-600">عضو منذ</h3>
              <p className="font-medium">{memberInfo.memberSince}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-600">تاريخ التجديد</h3>
              <p className="font-medium">{memberInfo.renewalDate}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-600">البريد الإلكتروني</h3>
              <p className="font-medium">{memberInfo.email}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-600">رقم الهاتف</h3>
              <p className="font-medium">{memberInfo.phone}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-600">المؤسسة</h3>
              <p className="font-medium">{memberInfo.institution}</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm text-gray-600">نبذة تعريفية</h3>
            <p className="text-sm mt-1">{memberInfo.bio}</p>
          </div>
          <div className="mt-4">
            <button 
              className={buttonStyles.outline} 
              onClick={() => setIsEditing(true)}
            >
              تعديل المعلومات الشخصية
            </button>
          </div>
        </div>
      </div>

      {/* نموذج تحرير الملف الشخصي */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">تعديل المعلومات الشخصية</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الأول</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={editedInfo.firstName} 
                  onChange={handleChange} 
                  className={inputStyles.default}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم العائلة</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={editedInfo.lastName} 
                  onChange={handleChange} 
                  className={inputStyles.default}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  name="email" 
                  value={editedInfo.email} 
                  onChange={handleChange} 
                  className={inputStyles.default}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={editedInfo.phone} 
                  onChange={handleChange} 
                  className={inputStyles.default}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المؤهل الأكاديمي</label>
                <select 
                  name="academic" 
                  value={editedInfo.academic} 
                  onChange={handleChange} 
                  className={inputStyles.default}
                >
                  <option value="بكالوريوس">بكالوريوس</option>
                  <option value="ماجستير">ماجستير</option>
                  <option value="دكتوراه">دكتوراه</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التخصص</label>
                <input 
                  type="text" 
                  name="specialty" 
                  value={editedInfo.specialty} 
                  onChange={handleChange} 
                  className={inputStyles.default}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المؤسسة / الجامعة</label>
                <input 
                  type="text" 
                  name="institution" 
                  value={editedInfo.institution} 
                  onChange={handleChange} 
                  className={inputStyles.default}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">نبذة تعريفية</label>
                <textarea 
                  name="bio" 
                  value={editedInfo.bio} 
                  onChange={handleChange} 
                  className={inputStyles.textarea}
                  rows={4}
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                className={buttonStyles.secondary} 
                onClick={handleCancel}
              >
                إلغاء
              </button>
              <button 
                className={buttonStyles.primary} 
                onClick={handleSave}
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* الأقسام الرئيسية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الفواتير والمدفوعات */}
        <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-2">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-bold">الفواتير والمدفوعات</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الفاتورة
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الوصف
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === 'مدفوعة' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a href={invoice.receiptUrl} className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                          عرض الإيصال
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* التنبيهات والإشعارات */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-bold">التنبيهات والإشعارات</h2>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li key={notification.id} className="py-3">
                  <div className={`flex items-start ${notification.read ? '' : 'bg-blue-50 -mx-4 px-4 py-2 rounded'}`}>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-gray-900">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <span className="text-xs text-gray-500 mt-1 block">{notification.date}</span>
                    </div>
                    <button 
                      onClick={() => toggleNotificationRead(notification.id)}
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        notification.read 
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {notification.read ? 'تمييز كغير مقروء' : 'تمييز كمقروء'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* الأنشطة والمشاركات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* الأنشطة الأخيرة */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-bold">الأنشطة الأخيرة</h2>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <li key={activity.id} className="py-3 flex">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                    activity.type === 'event' ? 'bg-purple-100 text-purple-600' : 
                    activity.type === 'download' ? 'bg-green-100 text-green-600' : 
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'event' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    ) : activity.type === 'download' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm">{activity.description}</p>
                    <span className="text-xs text-gray-500">{activity.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* المواد المحفوظة */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold">المواد المحفوظة</h2>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {savedItems.length} عناصر
            </span>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-200">
              {savedItems.map((item) => (
                <li key={item.id} className="py-3">
                  <div className="flex items-start">
                    <div className="mr-3">
                      {item.type === 'paper' ? (
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                            <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                      <a 
                        href={item.url} 
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        عرض
                      </a>
                      <button 
                        onClick={() => removeSavedItem(item.id)} 
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        إزالة
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* المنشورات والأبحاث */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-bold">المنشورات والأبحاث</h2>
          </div>
          <div className="p-6">
            {publications.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {publications.map((pub) => (
                  <li key={pub.id} className="py-3">
                    <h3 className="text-sm font-medium">{pub.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{pub.journal}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-600">{pub.date}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        pub.status === 'منشور' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pub.status}
                      </span>
                    </div>
                    {pub.url && (
                      <a 
                        href={pub.url} 
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        عرض المنشور
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">لا توجد منشورات بعد</p>
                <button className={`${buttonStyles.outline} mt-3`}>
                  تقديم بحث للنشر
                </button>
              </div>
            )}
            <div className="mt-4">
              <button className={buttonStyles.outline}>
                إضافة منشور جديد
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;