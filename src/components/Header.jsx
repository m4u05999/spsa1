// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/index.jsx';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = (category) => {
    setActiveDropdown(activeDropdown === category ? null : category);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Organized menu structure
  const menuStructure = [
    { id: 'home', text: 'الرئيسية', to: '/', type: 'link' },
    {
      id: 'about', 
      text: 'من نحن', 
      type: 'dropdown',
      children: [
        { to: '/about', text: 'عن الجمعية' },
        { to: '/about/board', text: 'مجلس الإدارة' },
        { to: '/about/graduates', text: 'خريجو قسم العلوم السياسية' },
      ]
    },
    {
      id: 'academic', 
      text: 'المعرفة والأبحاث', 
      type: 'dropdown',
      children: [
        { to: '/publications', text: 'مطبوعات الجمعية' },
        { to: '/library', text: 'المكتبة التفاعلية' },
        { to: '/expert-opinions', text: 'آراء الخبراء' },
        { to: '/research', text: 'البحوث والدراسات' },
        { to: '/news', text: 'الأخبار' },
      ]
    },
    {
      id: 'activities', 
      text: 'الفعاليات والبرامج', 
      type: 'dropdown',
      children: [
        { to: '/events', text: 'المناسبات والفعاليات' },
        { to: '/programs', text: 'البرامج والدورات' },
        { to: '/conference', text: 'المؤتمر السنوي' },
      ]
    },
    {
      id: 'organization', 
      text: 'الهيكل التنظيمي', 
      type: 'dropdown',
      children: [
        { to: '/committees', text: 'لجان الجمعية' },
        { to: '/committees/scientific', text: 'اللجنة العلمية والاستشارية' },
        { to: '/committees/media', text: 'اللجنة الإعلامية' },
        { to: '/committees/legal', text: 'اللجنة القانونية' },
        { to: '/committees/corporate', text: 'الاتصال المؤسسي' },
        { to: '/committees/finance', text: 'اللجنة المالية' }
      ]
    },
    {
      id: 'services',
      text: 'الخدمات الرقمية',
      type: 'dropdown',
      children: [
        { to: '/file-upload', text: 'رفع الملفات' },
        { to: '/notifications', text: 'إدارة الإشعارات' },
      ]
    },
    { id: 'membership', text: 'العضوية', to: '/membership', type: 'link' },
    { id: 'contact', text: 'التواصل', to: '/contact', type: 'link' },
  ];

  // Mobile menu items - all available links for mobile view
  const allMobileLinks = [
    { to: '/', text: 'الرئيسية' },
    { to: '/about', text: 'من نحن' },
    { to: '/about/board', text: 'مجلس الإدارة' },
    { to: '/about/graduates', text: 'خريجو قسم العلوم السياسية' },
    { to: '/membership', text: 'العضوية' },
    { to: '/news', text: 'الأخبار' },
    { to: '/events', text: 'المناسبات والفعاليات' },
    { to: '/publications', text: 'مطبوعات الجمعية' },
    { to: '/programs', text: 'البرامج والدورات' },
    { to: '/committees', text: 'لجان الجمعية' },
    { to: '/committees/scientific', text: 'اللجنة العلمية والاستشارية' },
    { to: '/committees/media', text: 'اللجنة الإعلامية' },
    { to: '/committees/legal', text: 'اللجنة القانونية' },
    { to: '/committees/corporate', text: 'الاتصال المؤسسي' },
    { to: '/committees/finance', text: 'اللجنة المالية' },
    { to: '/library', text: 'المكتبة التفاعلية' },
    { to: '/research', text: 'البحوث والدراسات' },
    { to: '/expert-opinions', text: 'آراء الخبراء' },
    { to: '/conference', text: 'المؤتمر السنوي' },
    { to: '/file-upload', text: 'رفع الملفات' },
    { to: '/notifications', text: 'إدارة الإشعارات' },
    { to: '/contact', text: 'التواصل' },
  ];

  return (
    <header className="bg-white text-gray-800 shadow-md" dir="rtl">
      {/* Top Bar with Auth and Social Links */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button className="text-sm hover:text-primary-600 text-gray-600">English</button>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-gray-600 hover:text-primary-600"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-gray-600 hover:text-primary-600"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
          {user ? (
            <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs">
              <Link to="/profile" className="hover:text-primary-600 transition-colors duration-300 text-gray-700">{user.name}</Link>
              {user.role === 'admin' && (
                <Link to="/dashboard/admin" className="hover:text-primary-600 transition-colors duration-300 text-gray-700">لوحة تحكم الإدارة</Link>
              )}
              {user.role === 'staff' && (
                <Link to="/dashboard/staff" className="hover:text-primary-600 transition-colors duration-300 text-gray-700">لوحة تحكم الموظفين</Link>
              )}
              {user.role === 'member' && (
                <Link to="/dashboard/member" className="hover:text-primary-600 transition-colors duration-300 text-gray-700">لوحة تحكم الأعضاء</Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 px-2 py-1 rounded hover:bg-red-600 transition-colors duration-300 text-xs text-white"
              >
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Link to="/login" className="text-xs bg-primary-500 px-3 py-1 rounded hover:bg-primary-600 transition-colors duration-300 text-white">
                تسجيل الدخول
              </Link>
              <Link to="/register" className="text-xs bg-green-500 px-3 py-1 rounded hover:bg-green-600 transition-colors duration-300 text-white">
                تسجيل جديد
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 flex justify-center">
        <nav className="relative w-full max-w-7xl" ref={dropdownRef}>
          {/* Desktop and Mobile Header */}
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <img
                src="/assets/images/spsa-logo.PNG"
                alt="الجمعية السعودية للعلوم السياسية"
                className="h-24 w-24 object-contain md:h-28 md:w-28 drop-shadow-sm"
                loading="eager"
              />
              <span className="text-xl font-bold hidden sm:inline">الجمعية السعودية للعلوم السياسية</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-600"
              aria-label="القائمة"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:flex-wrap lg:justify-end lg:gap-1">
              {menuStructure.map((item) => (
                <div key={item.id} className="relative">
                  {item.type === 'link' ? (
                    <Link
                      to={item.to}
                      className="hover:text-primary-600 text-sm font-medium whitespace-nowrap transition-colors duration-300 px-3 py-2 tracking-normal rounded-md hover:bg-gray-100"
                    >
                      {item.text}
                    </Link>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(item.id)}
                        className={`flex items-center text-sm font-medium whitespace-nowrap transition-colors duration-300 px-3 py-2 tracking-normal rounded-md hover:bg-gray-100 ${activeDropdown === item.id ? 'text-primary-600 bg-gray-100' : ''}`}
                      >
                        {item.text}
                        <svg
                          className={`w-4 h-4 mr-1 transition-transform duration-200 ${activeDropdown === item.id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {activeDropdown === item.id && (
                        <div className="absolute right-0 mt-2 py-2 w-56 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                          {item.children.map((child, childIndex) => (
                            <Link
                              key={childIndex}
                              to={child.to}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 text-right"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {child.text}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`${
              isMobileMenuOpen ? 'block' : 'hidden'
            } lg:hidden absolute top-full left-0 right-0 mt-1 bg-white text-gray-800 rounded-lg shadow-lg z-50 overflow-hidden border border-gray-100 max-h-[80vh] overflow-y-auto`}
          >
            <div className="px-4 py-3 space-y-1">
              {allMobileLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="block py-2 px-3 hover:bg-gray-100 rounded-md text-right transition-colors duration-300 text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.text}
                </Link>
              ))}
              
              {/* Authentication Links for Mobile */}
              {user ? (
                <div className="border-t border-gray-200 mt-3 pt-3 space-y-2">
                  <Link
                    to="/profile"
                    className="block py-2 px-3 hover:bg-gray-100 rounded-md text-right transition-colors duration-300 text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {user.name}
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/dashboard/admin"
                      className="block py-2 px-3 hover:bg-gray-100 rounded-md text-right transition-colors duration-300 text-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      لوحة تحكم الإدارة
                    </Link>
                  )}
                  {user.role === 'staff' && (
                    <Link
                      to="/dashboard/staff"
                      className="block py-2 px-3 hover:bg-gray-100 rounded-md text-right transition-colors duration-300 text-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      لوحة تحكم الموظفين
                    </Link>
                  )}
                  {user.role === 'member' && (
                    <Link
                      to="/dashboard/member"
                      className="block py-2 px-3 hover:bg-gray-100 rounded-md text-right transition-colors duration-300 text-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      لوحة تحكم الأعضاء
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-right bg-red-500 py-2 px-3 rounded-md hover:bg-red-600 transition-colors duration-300 text-white"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 mt-3 pt-3 space-y-2">
                  <Link
                    to="/login"
                    className="block text-center bg-primary-500 py-2 px-3 rounded-md hover:bg-primary-600 transition-colors duration-300 text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center bg-green-500 py-2 px-3 rounded-md hover:bg-green-600 transition-colors duration-300 text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    تسجيل جديد
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;