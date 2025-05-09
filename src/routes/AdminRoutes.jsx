// src/routes/AdminRoutes.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboardLayout from '../layout/AdminDashboardLayout';
import PageLoader from '../components/loaders/PageLoader';

// Lazy load admin dashboard modules
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard'));
const UserManagement = lazy(() => import('../pages/dashboard/modules/UserManagement'));
const ContentManagement = lazy(() => import('../pages/dashboard/modules/ContentManagementV2'));
const EventsManagement = lazy(() => import('../pages/dashboard/modules/EventsManagement'));
const Statistics = lazy(() => import('../pages/dashboard/modules/Statistics'));
const InquiryManagement = lazy(() => import('../pages/dashboard/modules/InquiryManagement'));
const SystemSettings = lazy(() => import('../pages/dashboard/modules/SystemSettings'));
const StaticPagesManagement = lazy(() => import('../pages/dashboard/modules/StaticPagesManagement'));
const MediaManagement = lazy(() => import('../pages/dashboard/modules/MediaManagement'));
const AdsManagement = lazy(() => import('../pages/dashboard/modules/AdsManagement'));

const AdminRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
          {/* Main dashboard */}
          <Route index element={<AdminDashboard />} />
          
          {/* User Management */}
          <Route path="users/*" element={<UserManagement />} />
          
          {/* Content Management */}
          <Route path="content/*" element={<ContentManagement />} />
          
          {/* Events Management */}
          <Route path="events/*" element={<EventsManagement />} />
          
          {/* Statistics */}
          <Route path="statistics/*" element={<Statistics />} />
          
          {/* Inquiries */}
          <Route path="inquiries/*" element={<InquiryManagement />} />
          
          {/* Settings */}
          <Route path="settings/*" element={<SystemSettings />} />
          
          {/* Static Pages Management */}
          <Route path="pages/*" element={<StaticPagesManagement />} />
          
          {/* Media Management */}
          <Route path="media/*" element={<MediaManagement />} />
          
          {/* Banner & Advertisement Management */}
          <Route path="banners/*" element={<AdsManagement />} />
          
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
    </Suspense>
  );
};

export default AdminRoutes;