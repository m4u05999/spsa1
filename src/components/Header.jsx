// src/components/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { to: '/', text: 'الرئيسية' },
    { to: '/about', text: 'من نحن' },
    { to: '/membership', text: 'العضوية' },
    { to: '/news', text: 'الأخبار' },
    { to: '/events', text: 'المناسبات والفعاليات' },
    { to: '/publications', text: 'المطبوعات' },
    { to: '/programs', text: 'البرامج والدورات' },
    { to: '/committees', text: 'لجان الجمعية' },
    { to: '/library', text: 'المكتبة التفاعلية' },
    { to: '/research', text: 'البحوث والدراسات' },
    { to: '/expert-opinions', text: 'آراء الخبراء' },
    { to: '/conference', text: 'المؤتمر السنوي' },
  ];

  return (
    <header className="bg-white text-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-center">
        <nav className="relative w-full max-w-7xl">
          {/* Desktop and Mobile Header */}
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <img
                src="/assets/images/new-logo.png"
                alt="الجمعية السعودية للعلوم السياسية"
                className="h-14 w-14 object-contain"
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
            <div className="hidden lg:flex lg:items-center lg:flex-wrap lg:justify-end lg:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="hover:text-primary-600 text-sm font-medium whitespace-nowrap transition-colors duration-300 px-3 py-2 tracking-normal rounded-md hover:bg-gray-100"
                >
                  {link.text}
                </Link>
              ))}
              {user ? (
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
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
                    className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300 text-sm text-white"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4 rtl:space-x-reverse">
                  <Link to="/login" className="bg-primary-500 px-4 py-2 rounded-md hover:bg-primary-600 transition-colors duration-300 text-sm text-white">
                    تسجيل الدخول
                  </Link>
                  <Link to="/register" className="bg-green-500 px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300 text-sm text-white">
                    تسجيل جديد
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`${
              isMobileMenuOpen ? 'block' : 'hidden'
            } lg:hidden absolute top-full left-0 right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-lg z-50 overflow-hidden border border-gray-100`}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block py-2 px-3 hover:bg-gray-100 rounded-md text-right transition-colors duration-300 text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.text}
                </Link>
              ))}
              {user ? (
                <div className="border-t border-gray-200 pt-3 space-y-2">
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
                <div className="border-t border-gray-200 pt-3 space-y-2">
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