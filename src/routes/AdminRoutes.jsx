// src/routes/AdminRoutes.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboardLayout from '../layout/AdminDashboardLayout';
import PageLoader from '../components/loaders/PageLoader';

// Lazy load admin dashboard modules
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard'));
const UserManagement = lazy(() => import('../pages/dashboard/modules/UserManagement'));
const ContentManagement = lazy(() => import('../pages/dashboard/modules/ContentManagement'));
const EventsManagement = lazy(() => import('../pages/dashboard/modules/EventsManagement'));
const Statistics = lazy(() => import('../pages/dashboard/modules/Statistics'));
const InquiryManagement = lazy(() => import('../pages/dashboard/modules/InquiryManagement'));
const SystemSettings = lazy(() => import('../pages/dashboard/modules/SystemSettings'));

const AdminRoutes = () => {
  return (
    <AdminDashboardLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Main dashboard */}
          <Route index element={<AdminDashboard />} />
          
          {/* User Management */}
          <Route path="users" element={<UserManagement />} />
          
          {/* Content Management */}
          <Route path="content" element={<ContentManagement />} />
          
          {/* Events Management */}
          <Route path="events" element={<EventsManagement />} />
          
          {/* Statistics */}
          <Route path="statistics" element={<Statistics />} />
          
          {/* Inquiries */}
          <Route path="inquiries" element={<InquiryManagement />} />
          
          {/* Settings */}
          <Route path="settings" element={<SystemSettings />} />
          
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/dashboard/admin" replace />} />
        </Routes>
      </Suspense>
    </AdminDashboardLayout>
  );
};

export default AdminRoutes;