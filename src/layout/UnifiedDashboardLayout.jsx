// src/layout/UnifiedDashboardLayout.jsx
// تخطيط موحد للوحة التحكم يدعم جميع الأدوار
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/index.jsx';
import SmartSidebar from '../components/dashboard/SmartSidebar.jsx';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const UnifiedDashboardLayout = ({ requiredRole = null }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // التحقق من التفويض - مع التحقق من صحة البيانات
  const isAuthorized = () => {
    // التحقق من وجود المستخدم وصحة البيانات
    if (!user || !user.id || !user.role) return false;
    
    // التحقق من صحة الدور
    const validRoles = ['admin', 'staff', 'member'];
    if (!validRoles.includes(user.role)) return false;
    
    // إذا لم يكن هناك متطلب دور معين، السماح للمستخدمين المصادق عليهم فقط
    if (!requiredRole) return true;
    
    // التحقق من الأدوار المتعددة
    if (Array.isArray(requiredRole)) {
      return requiredRole.every(role => validRoles.includes(role)) && 
             requiredRole.includes(user.role);
    }
    
    // التحقق من الدور المفرد
    return validRoles.includes(requiredRole) && user.role === requiredRole;
  };

  // تحديد نوع لوحة التحكم بناءً على المسار
  const getDashboardType = () => {
    if (location.pathname.startsWith('/dashboard/admin')) return 'admin';
    if (location.pathname.startsWith('/dashboard/staff')) return 'staff';
    return 'member';
  };

  const dashboardType = getDashboardType();

  // معالجة تغيير حجم النافذة
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // إعداد الوضع المظلم
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // وظائف التحكم
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // حالة التحميل
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // التحقق من المصادقة
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // التحقق من التفويض
  if (!isAuthorized()) {
    // إعادة توجيه بناءً على دور المستخدم
    if (user?.role === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (user?.role === 'staff') {
      return <Navigate to="/dashboard/staff" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // تنسيق الوقت والتاريخ
  const currentTime = new Date();
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" dir="rtl">
      {/* Header */}
      <DashboardHeader
        onToggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onToggleCollapse={toggleCollapse}
        isCollapsed={isCollapsed}
        currentTime={formatTime(currentTime)}
        currentDate={formatDate(currentTime)}
        isMobile={isMobile}
        dashboardType={dashboardType}
      />

      {/* محتوى رئيسي مع الشريط الجانبي - مع padding للشريط العلوي */}
      <div className="flex flex-1 relative pt-16">
        {/* طبقة تراكب للموبايل */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 backdrop-blur-sm transition-all duration-300"
            onClick={closeSidebar}
          />
        )}

        {/* الشريط الجانبي المحسن */}
        <SmartSidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          userRole={user?.role || 'member'}
          notifications={{
            total: 0,
            pendingUsers: 0,
            pendingContent: 0,
            upcomingEvents: 0,
            unreadInquiries: 0
          }}
          onLogout={() => {
            // Handle logout properly
            if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
              localStorage.clear();
              window.location.href = '/login';
            }
          }}
        />

        {/* المحتوى الرئيسي */}
        <main className={`
          flex-1
          ${isMobile ? 'mr-0' : isCollapsed ? 'mr-[80px]' : 'mr-[280px]'}
          transition-all duration-300
          p-6
          pt-4
          min-h-screen
          ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}
          ${isMobile && isSidebarOpen ? 'overflow-hidden' : ''}
        `}>
          <div className="container mx-auto">
            {/* لوحة الإحصائيات السريعة للإدارة */}
            {dashboardType === 'admin' && location.pathname === '/dashboard/admin' && (
              <AdminQuickStats isDarkMode={isDarkMode} />
            )}

            {/* روابط الوصول السريع للإدارة */}
            {dashboardType === 'admin' && location.pathname === '/dashboard/admin' && (
              <AdminQuickLinks isDarkMode={isDarkMode} />
            )}

            {/* عرض المحتوى */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-all duration-300`}>
              <Outlet />
            </div>
          </div>

          {/* شريط المعلومات السفلي */}
          <Footer isDarkMode={isDarkMode} currentTime={currentTime} formatTime={formatTime} formatDate={formatDate} />
        </main>
      </div>
    </div>
  );
};

// مكون الإحصائيات السريعة للإدارة
const AdminQuickStats = ({ isDarkMode }) => (
  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard
      isDarkMode={isDarkMode}
      icon="👥"
      title="إجمالي الأعضاء"
      value="256"
      color="blue"
    />
    <StatCard
      isDarkMode={isDarkMode}
      icon="📄"
      title="المحتوى المنشور"
      value="47"
      color="green"
    />
    <StatCard
      isDarkMode={isDarkMode}
      icon="🎫"
      title="الفعاليات القادمة"
      value="3"
      color="yellow"
    />
    <StatCard
      isDarkMode={isDarkMode}
      icon="👁️"
      title="الزيارات اليوم"
      value="1,290"
      color="red"
    />
  </div>
);

// مكون بطاقة الإحصائية
const StatCard = ({ isDarkMode, icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-md flex items-center`}>
      <div className={`mr-4 p-3 rounded-full ${colorClasses[color]}`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
};

// روابط الوصول السريع للإدارة
const AdminQuickLinks = ({ isDarkMode }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold mb-4">الوصول السريع</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {quickLinks.map((link, index) => (
        <QuickLinkCard key={index} {...link} isDarkMode={isDarkMode} />
      ))}
    </div>
  </div>
);

// بيانات الروابط السريعة
const quickLinks = [
  { to: '/dashboard/admin/content', icon: '📝', label: 'إدارة المحتوى' },
  { to: '/dashboard/admin/events', icon: '📅', label: 'إدارة الفعاليات' },
  { to: '/dashboard/admin/users', icon: '👥', label: 'إدارة المستخدمين' },
  { to: '/dashboard/admin/media', icon: '🖼️', label: 'إدارة الوسائط' },
  { to: '/dashboard/admin/migration', icon: '📤', label: 'ترحيل البيانات' },
  { to: '/dashboard/admin/statistics', icon: '📊', label: 'الإحصائيات' }
];

// مكون بطاقة الرابط السريع
const QuickLinkCard = ({ to, icon, label, isDarkMode }) => (
  <a
    href={to}
    className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} 
      p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center 
      transition-all duration-200 transform hover:-translate-y-1`}
  >
    <span className="text-3xl mb-2">{icon}</span>
    <span className="text-sm">{label}</span>
  </a>
);

// مكون التذييل
const Footer = ({ isDarkMode, currentTime, formatTime, formatDate }) => (
  <div className={`mt-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 flex justify-between items-center text-sm`}>
    <div className="flex items-center">
      <span className="ml-1">الجمعية السعودية للعلوم السياسية</span>
      <span className="text-gray-500 dark:text-gray-400">© {new Date().getFullYear()}</span>
    </div>
    <div className="flex items-center space-x-4 space-x-reverse">
      <div className="flex items-center text-gray-500 dark:text-gray-400">
        <span>📅</span>
        <span className="mr-1">{formatDate(currentTime)}</span>
      </div>
      <div className="flex items-center text-gray-500 dark:text-gray-400">
        <span>🕐</span>
        <span className="mr-1">{formatTime(currentTime)}</span>
      </div>
    </div>
  </div>
);

export default UnifiedDashboardLayout;