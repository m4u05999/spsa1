// src/layout/MainLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingCTA from '../components/FloatingCTA';

const MainLayout = () => {
  const location = useLocation();
  
  // لا نعرض زر CTA في صفحات العضوية أو تسجيل الدخول
  const hideFloatingCTA = location.pathname.includes('/membership') || 
                         location.pathname.includes('/login') || 
                         location.pathname.includes('/register');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      {!hideFloatingCTA && <FloatingCTA />}
      <Footer />
    </div>
  );
};

export default MainLayout;