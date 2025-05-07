import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { buttonStyles, inputStyles } from '../../utils/theme';

const AdminDashboard = () => {
  // سياق الإشعارات
  const { success, error } = useNotification();
  
  // حالات البيانات
  const [activeTab, setActiveTab] = useState('members');
  
  // إحصائيات المنصة
  const stats = {
    totalMembers: 245,
    activeMembers: 198,
    pendingApprovals: 12,
    expiringMemberships: 15,
    revenueThisMonth: '15,750 ريال',
    revenueLastMonth: '12,200 ريال',
    averageMemberAge: 37
  };
  
  // بيانات الأعضاء
  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'محمد الأحمدي',
      email: 'mohammad@example.com',
      membershipType: 'standard',
      status: 'active',
      joinDate: '15/06/2023',
      renewalDate: '15/06/2024',
      lastLogin: '10/11/2023',
    },
    {
      id: 2,
      name: 'فاطمة العمري',
      email: 'fatima@example.com',
      membershipType: 'premium',
      status: 'active',
      joinDate: '03/04/2023',
      renewalDate: '03/04/2024',
      lastLogin: '12/11/2023',
    },
    {
      id: 3,
      name: 'أحمد الزهراني',
      email: 'ahmad@example.com',
      membershipType: 'basic',
      status: 'expired',
      joinDate: '22/01/2023',
      renewalDate: '22/01/2024',
      lastLogin: '15/10/2023',
    }
  ]);
  
  // بيانات طلبات العضوية الجديدة
  const [applications, setApplications] = useState([
    {
      id: 101,
      name: 'سارة الدوسري',
      email: 'sarah@example.com',
      membershipType: 'standard',
      academic: 'ماجستير',
      specialty: 'العلاقات الدولية',
      institution: 'جامعة الملك سعود',
      applicationDate: '05/11/2023',
      status: 'pending'
    },
    {
      id: 102,
      name: 'يوسف العتيبي',
      email: 'yousef@example.com',
      membershipType: 'premium',
      academic: 'دكتوراه',
      specialty: 'النظم السياسية المقارنة',
      institution: 'جامعة الإمام',
      applicationDate: '07/11/2023',
      status: 'pending'
    }
  ]);

  
  // الفواتير والمدفوعات
  const [payments, setPayments] = useState([
    {
      id: 'INV-20230615-001',
      memberName: 'محمد الأحمدي',
      memberEmail: 'mohammad@example.com',
      date: '15/06/2023',
      amount: '1,990 ريال',
      type: 'عضوية محترفة',
      status: 'مدفوعة',
      paymentMethod: 'بطاقة ائتمانية'
    },
    {
      id: 'INV-20230403-002',
      memberName: 'فاطمة العمري',
      memberEmail: 'fatima@example.com',
      date: '03/04/2023',
      amount: '3,990 ريال',
      type: 'عضوية متميزة',
      status: 'مدفوعة',
      paymentMethod: 'بطاقة مدى'
    }
  ]);
  
  // فلترة الأعضاء
  const [memberFilter, setMemberFilter] = useState('');
  const filteredMembers = members.filter(member => 
    member.name.includes(memberFilter) || 
    member.email.includes(memberFilter)
  );
  
  // الموافقة على طلب العضوية
  const approveApplication = (id) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? {...app, status: 'approved'} : app
    ));
    success('تمت الموافقة على طلب العضوية بنجاح');
    
    // في التطبيق الحقيقي، هنا سيتم إرسال إشعار للمستخدم وإضافته كعضو جديد
  };
  
  // رفض طلب العضوية
  const rejectApplication = (id) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? {...app, status: 'rejected'} : app
    ));
    error('تم رفض طلب العضوية');
    
    // في التطبيق الحقيقي، هنا سيتم إرسال إشعار للمستخدم
  };
  
  // تعطيل/تفعيل عضوية
  const toggleMemberStatus = (id) => {
    setMembers(prev => prev.map(member => 
      member.id === id ? 
        {...member, status: member.status === 'active' ? 'suspended' : 'active'} : 
        member
    ));
    success('تم تغيير حالة العضوية بنجاح');
  };

  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">لوحة تحكم المسؤول</h1>
      
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">إجمالي الأعضاء</p>
              <h3 className="text-3xl font-bold">{stats.totalMembers}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-green-500 flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              8%
            </span>
            <span className="text-gray-500 text-sm mr-2">منذ الشهر الماضي</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">طلبات قيد الانتظار</p>
              <h3 className="text-3xl font-bold">{stats.pendingApprovals}</h3>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <button 
              className={buttonStyles.outline.replace('border-blue-600 text-blue-600', 'border-amber-600 text-amber-600')}
              onClick={() => setActiveTab('applications')}
            >
              عرض الطلبات
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">إيرادات هذا الشهر</p>
              <h3 className="text-3xl font-bold">{stats.revenueThisMonth}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-green-500 flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              29%
            </span>
            <span className="text-gray-500 text-sm mr-2">مقارنة بالشهر الماضي</span>
          </div>
        </div>
      </div>
      
      {/* أزرار التبديل بين الأقسام */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          className={`px-4 py-2 rounded-md ${activeTab === 'members' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setActiveTab('members')}
        >
          إدارة الأعضاء
        </button>
        <button 
          className={`px-4 py-2 rounded-md ${activeTab === 'applications' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setActiveTab('applications')}
        >
          طلبات العضوية
          {stats.pendingApprovals > 0 && (
            <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {stats.pendingApprovals}
            </span>
          )}
        </button>
        <button 
          className={`px-4 py-2 rounded-md ${activeTab === 'payments' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setActiveTab('payments')}
        >
          المدفوعات والفواتير
        </button>
      </div>

      
      {/* محتوى التبويبات */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* إدارة الأعضاء */}
        {activeTab === 'members' && (
          <div>
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">إدارة الأعضاء</h2>
              <div className="mt-4">
                <input 
                  type="text" 
                  placeholder="البحث عن عضو بالاسم أو البريد الإلكتروني" 
                  className={inputStyles.search}
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الاسم
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      البريد الإلكتروني
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      نوع العضوية
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الانضمام
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ التجديد
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
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          member.membershipType === 'premium' ? 'bg-purple-100 text-purple-800' : 
                          member.membershipType === 'standard' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {member.membershipType === 'premium' ? 'متميزة' : 
                           member.membershipType === 'standard' ? 'محترفة' : 'أساسية'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.joinDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.renewalDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.status === 'active' ? 'bg-green-100 text-green-800' : 
                          member.status === 'suspended' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.status === 'active' ? 'نشط' : 
                           member.status === 'suspended' ? 'معلق' : 'منتهي'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => {/* عرض التفاصيل */}}
                          >
                            عرض
                          </button>
                          <button 
                            className={member.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                            onClick={() => toggleMemberStatus(member.id)}
                          >
                            {member.status === 'active' ? 'تعليق' : 'تفعيل'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* طلبات العضوية */}
        {activeTab === 'applications' && (
          <div>
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">طلبات العضوية الجديدة</h2>
              <p className="text-gray-600 mt-1">عدد الطلبات المعلقة: {applications.filter(app => app.status === 'pending').length}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الاسم
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      البريد الإلكتروني
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      نوع العضوية
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المؤهل الأكاديمي
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التخصص
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الطلب
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
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{application.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{application.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          application.membershipType === 'premium' ? 'bg-purple-100 text-purple-800' : 
                          application.membershipType === 'standard' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {application.membershipType === 'premium' ? 'متميزة' : 
                           application.membershipType === 'standard' ? 'محترفة' : 'أساسية'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.academic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.specialty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.applicationDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          application.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.status === 'pending' ? 'قيد الانتظار' : 
                           application.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {application.status === 'pending' ? (
                          <div className="flex space-x-2 space-x-reverse">
                            <button 
                              className="text-green-600 hover:text-green-900"
                              onClick={() => approveApplication(application.id)}
                            >
                              قبول
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => rejectApplication(application.id)}
                            >
                              رفض
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* المدفوعات والفواتير */}
        {activeTab === 'payments' && (
          <div>
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">المدفوعات والفواتير</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الفاتورة
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العضو
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النوع
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      طريقة الدفع
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.memberName}</div>
                        <div className="text-xs text-gray-500">{payment.memberEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === 'مدفوعة' ? 'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
