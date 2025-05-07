// src/routes/AppRoutes.jsx
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// استيراد المكونات
import Header from '../components/Header';
import Footer from '../components/Footer';

// استيراد الصفحات
import HomePage from '../pages/HomePage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import PaymentPage from '../pages/PaymentPage';
import ContributorsPage from '../pages/ContributorsPage';
import DonationPage from '../pages/DonationPage';

// مكون للتحقق من المصادقة وتوجيه المستخدمين غير المصرح لهم
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  // عرض شاشة تحميل أثناء التحقق من المصادقة
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // إعادة توجيه المستخدم غير المصرح له إلى صفحة تسجيل الدخول
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// مكون الصفحة الرئيسية العامة مع الهيدر والفوتر
const PublicLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  );
};

// الصفحة الرئيسية المخصصة
const HomePageWithLayout = () => {
  return (
    <PublicLayout>
      <HomePage />
    </PublicLayout>
  );
};

// مسارات التطبيق
const AppRoutes = () => {
  return (
    <Routes>
      {/* الصفحات العامة */}
      <Route path="/" element={<HomePageWithLayout />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contributors" element={<ContributorsPage />} />

      {/* الصفحات المحمية التي تتطلب تسجيل الدخول */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/payment" element={
        <ProtectedRoute>
          <PaymentPage />
        </ProtectedRoute>
      } />
      <Route path="/donate" element={
        <ProtectedRoute>
          <DonationPage />
        </ProtectedRoute>
      } />

      {/* مسار لجميع الصفحات غير المعرفة - توجيه للصفحة الرئيسية */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;