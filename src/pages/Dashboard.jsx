// src/pages/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/index.jsx';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import UserInfo from '../components/dashboard/UserInfo';
import MembershipStatus from '../components/dashboard/MembershipStatus';
import { getUserMembership, getUserData } from '../services/userService';
import { getUserPayments } from '../services/paymentService';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('الملف الشخصي');
  const [userData, setUserData] = useState(null);
  const [userMembership, setUserMembership] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // استرجاع بيانات المستخدم
        const data = await getUserData();
        setUserData(data);
        
        if (data && data.id) {
          // استرجاع بيانات العضوية
          const membership = await getUserMembership(data.id);
          setUserMembership(membership);
          
          // استرجاع بيانات المدفوعات
          const paymentsData = await getUserPayments(data.id);
          setPayments(paymentsData);
        }
      } catch (error) {
        console.error('خطأ في استرجاع البيانات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  // تنسيق المبلغ
  const formatAmount = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // معالج تغيير قسم لوحة التحكم
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // عرض حالة التحميل
  if (loading) {
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50" dir="rtl">
      {/* الشريط الجانبي */}
      <DashboardSidebar activeSection={activeSection} setActiveSection={handleSectionChange} />
      
      {/* المحتوى الرئيسي */}
      <div className="flex-1">
        <header className="bg-white shadow-sm py-4 px-6 md:hidden">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">لوحة التحكم</h2>
            <button className="text-gray-600">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </header>
        
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{activeSection}</h1>
          
          {/* محتوى الأقسام المختلفة */}
          {activeSection === 'الملف الشخصي' && (
            <div className="grid grid-cols-1 gap-6">
              <UserInfo user={userData || {}} />
            </div>
          )}
          
          {activeSection === 'العضوية' && (
            <div className="grid grid-cols-1 gap-6">
              <MembershipStatus membership={userMembership} />
              
              {userMembership && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">مميزات العضوية</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-green-500 ml-2"></i>
                      حضور الفعاليات والمؤتمرات المقامة بالجمعية
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-green-500 ml-2"></i>
                      المشاركة في اللجان العلمية والبحثية
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-green-500 ml-2"></i>
                      خصم على إصدارات ومطبوعات الجمعية
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-green-500 ml-2"></i>
                      المشاركة في الورش والدورات التدريبية
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check-circle text-green-500 ml-2"></i>
                      التواصل مع شبكة من المختصين في العلوم السياسية
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {activeSection === 'الفعاليات' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">الفعاليات القادمة</h3>
                <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">عرض جميع الفعاليات</Link>
              </div>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">المؤتمر السنوي للعلوم السياسية</h4>
                      <p className="text-sm text-gray-600 mt-1">مناقشة أحدث الأبحاث والدراسات في مجال العلوم السياسية</p>
                    </div>
                    <div className="text-left">
                      <div className="bg-blue-100 text-blue-800 text-sm py-1 px-2 rounded-md">15 ديسمبر 2023</div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">ندوة العلاقات الدولية</h4>
                      <p className="text-sm text-gray-600 mt-1">تحليل التطورات الجيوسياسية في الشرق الأوسط</p>
                    </div>
                    <div className="text-left">
                      <div className="bg-blue-100 text-blue-800 text-sm py-1 px-2 rounded-md">10 نوفمبر 2023</div>
                    </div>
                  </div>
                </div>
                
                <p className="text-center text-gray-500 text-sm mt-4">لم يتم العثور على فعاليات أخرى قريبة.</p>
              </div>
            </div>
          )}
          
          {activeSection === 'المنشورات' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">أحدث المنشورات</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium">المجلة العلمية للعلوم السياسية - العدد 42</h4>
                  <p className="text-sm text-gray-600 mt-1">سبتمبر 2023</p>
                  <div className="mt-3 flex justify-end">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">تحميل PDF</button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium">تقرير: تحليل السياسات الخارجية للدول العربية</h4>
                  <p className="text-sm text-gray-600 mt-1">يوليو 2023</p>
                  <div className="mt-3 flex justify-end">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">تحميل PDF</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'الدفع' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">سجل المدفوعات</h3>
                
                {payments && payments.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(payment.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.type === 'donation' ? 'تبرع' : `اشتراك - ${payment.membershipId ? payment.membershipId : 'عضوية'}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatAmount(payment.amount)} ريال
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {payment.status === 'completed' ? 'مكتمل' : payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">لم يتم العثور على مدفوعات سابقة.</p>
                )}
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">تجديد العضوية</h3>
                <div className="flex flex-col sm:flex-row sm:justify-between items-center space-y-4 sm:space-y-0">
                  <div>
                    <p className="text-gray-700">
                      جدد عضويتك الآن للاستمتاع بمميزات الجمعية واستكمال المشاركة في الأنشطة والفعاليات.
                    </p>
                  </div>
                  <Link
                    to="/payment"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    تجديد العضوية
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'التبرعات' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">مساهمتك تصنع الفرق</h3>
                    <p className="text-gray-600">ساهم في دعم أنشطة جمعية العلوم السياسية</p>
                  </div>
                  <Link
                    to="/donate"
                    className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    تبرع الآن
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                    <h4 className="font-semibold text-amber-800">المساهم الذهبي</h4>
                    <p className="text-gray-700 mb-2">10,000 ريال أو أكثر</p>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li className="flex items-center">
                        <i className="fas fa-check text-amber-600 ml-1"></i>
                        عرض الشعار في الصفحة الرئيسية
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-amber-600 ml-1"></i>
                        دعوات لجميع فعاليات الجمعية
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h4 className="font-semibold text-gray-800">المساهم الفضي</h4>
                    <p className="text-gray-700 mb-2">5,000 - 9,999 ريال</p>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li className="flex items-center">
                        <i className="fas fa-check text-gray-600 ml-1"></i>
                        عرض الاسم في صفحة المساهمين
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-gray-600 ml-1"></i>
                        دعوات للفعاليات الرئيسية
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                    <h4 className="font-semibold text-orange-800">المساهم البرونزي</h4>
                    <p className="text-gray-700 mb-2">حتى 4,999 ريال</p>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li className="flex items-center">
                        <i className="fas fa-check text-orange-600 ml-1"></i>
                        عرض الاسم في صفحة المساهمين
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-orange-600 ml-1"></i>
                        رسالة شكر إلكترونية
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Link
                to="/contributors"
                className="block w-full text-center py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                عرض قائمة المساهمين
              </Link>
            </div>
          )}
          
          {activeSection === 'المساهمون' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">المساهمون المتميزون</h3>
                <Link to="/contributors" className="text-blue-600 hover:text-blue-800 text-sm">عرض جميع المساهمين</Link>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  نشكر جميع المساهمين والداعمين للجمعية على تبرعاتهم الكريمة التي تساعدنا في تحقيق أهدافنا.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4">
                    <div className="font-medium text-gray-900 mb-1">مؤسسة الأبحاث المتقدمة</div>
                    <div className="text-sm text-gray-500">
                      <span className="text-yellow-700 font-medium">مساهم ذهبي</span>
                    </div>
                  </div>
                  
                  <div className="border border-gray-300 bg-gray-50 rounded-lg p-4">
                    <div className="font-medium text-gray-900 mb-1">شركة التطوير الدولية</div>
                    <div className="text-sm text-gray-500">
                      <span className="text-gray-700 font-medium">مساهم فضي</span>
                    </div>
                  </div>
                  
                  <div className="border border-orange-300 bg-orange-50 rounded-lg p-4">
                    <div className="font-medium text-gray-900 mb-1">مركز الدراسات الاستراتيجية</div>
                    <div className="text-sm text-gray-500">
                      <span className="text-orange-700 font-medium">مساهم برونزي</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;