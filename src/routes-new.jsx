// src/routes-new.jsx
// نظام توجيه مبسط للتطبيق
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/index.jsx';

// Layouts
import MainLayout from './layout/MainLayout';
import UnifiedDashboardLayout from './layout/UnifiedDashboardLayout';

// Removed providers - now in App.jsx

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const NewsPage = lazy(() => import('./pages/news/NewsPage'));
const NewsDetailsPage = lazy(() => import('./pages/news/NewsDetailsPage'));
const AboutPage = lazy(() => import('./pages/about/AboutPage'));
const EventsPage = lazy(() => import('./pages/events/EventsPage'));
const ContactPage = lazy(() => import('./pages/contact/ContactPage'));

// Additional pages for navigation
const BoardPage = lazy(() => import('./pages/about/BoardPage'));
const GraduatesPage = lazy(() => import('./pages/about/GraduatesPage'));
const PublicationsPage = lazy(() => import('./pages/publications/PublicationsPage'));
const LibraryPage = lazy(() => import('./pages/library/LibraryPage'));
const ExpertOpinionsPage = lazy(() => import('./pages/opinions/ExpertOpinionsPage'));
const ResearchPage = lazy(() => import('./pages/research/ResearchPage'));
const ProgramsPage = lazy(() => import('./pages/programs/ProgramsPage'));
const ConferencePage = lazy(() => import('./pages/conference/ConferencePage'));
const CommitteesPage = lazy(() => import('./pages/committees/CommitteesPage'));
const MembershipPage = lazy(() => import('./pages/membership/MembershipPage'));

// Dashboard pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const SimpleLogin = lazy(() => import('./pages/SimpleLogin'));
const TestPage = lazy(() => import('./pages/TestPage'));
const BasicLogin = lazy(() => import('./pages/BasicLogin'));

// Admin Dashboard Modules
const UserManagement = lazy(() => import('./pages/dashboard/modules/UserManagementFixed'));
const ContentManagementV2 = lazy(() => import('./pages/dashboard/modules/ContentManagementV2'));
const EventsManagement = lazy(() => import('./pages/dashboard/modules/EventsManagement'));
const MediaManagement = lazy(() => import('./pages/dashboard/modules/MediaManagement'));
const AdsManagement = lazy(() => import('./pages/dashboard/modules/AdsManagement'));
const StaticPagesManagement = lazy(() => import('./pages/dashboard/modules/StaticPagesManagement'));
const Statistics = lazy(() => import('./pages/dashboard/modules/Statistics'));
const InquiryManagement = lazy(() => import('./pages/dashboard/modules/InquiryManagement'));
const SystemSettings = lazy(() => import('./pages/dashboard/modules/SystemSettings'));
const SystemSettingsAdmin = lazy(() => import('./pages/dashboard/modules/SystemSettingsAdmin'));
const Analytics = lazy(() => import('./pages/dashboard/modules/Analytics'));
const Notifications = lazy(() => import('./pages/dashboard/modules/Notifications'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));
const MigrationPage = lazy(() => import('./pages/admin/MigrationPage'));

// Privacy System Pages
const PrivacyPolicyPage = lazy(() => import('./pages/privacy/PrivacyPolicyPage'));
const ConsentManager = lazy(() => import('./components/consent/ConsentManager'));
const DataDeletionRequest = lazy(() => import('./components/privacy/DataDeletionRequest'));

// Loading component
import { PageLoader } from './components/common/OptimizedLoader';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required - Admin has access to everything
  if (requiredRole && user?.role !== requiredRole) {
    // Admin should have access to all routes
    if (user?.role === 'admin') {
      // Allow admin to access all routes
      return children;
    }
    
    // Redirect based on user role for non-admin users
    if (user?.role === 'staff') {
      return <Navigate to="/dashboard/staff" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Removed RouteWrapper - providers now in App.jsx

// Main App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Main Layout Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
        <Route path="login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
        <Route path="simple-login" element={<Suspense fallback={<PageLoader />}><SimpleLogin /></Suspense>} />
        <Route path="test" element={<Suspense fallback={<PageLoader />}><TestPage /></Suspense>} />
        <Route path="basic-login" element={<Suspense fallback={<PageLoader />}><BasicLogin /></Suspense>} />
        <Route path="register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
        <Route path="news" element={<Suspense fallback={<PageLoader />}><NewsPage /></Suspense>} />
        <Route path="news/:id" element={<Suspense fallback={<PageLoader />}><NewsDetailsPage /></Suspense>} />
        <Route path="about/*" element={<Suspense fallback={<PageLoader />}><AboutPage /></Suspense>} />
        <Route path="about/board" element={<Suspense fallback={<PageLoader />}><BoardPage /></Suspense>} />
        <Route path="about/graduates" element={<Suspense fallback={<PageLoader />}><GraduatesPage /></Suspense>} />
        <Route path="events" element={<Suspense fallback={<PageLoader />}><EventsPage /></Suspense>} />
        <Route path="contact" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
        <Route path="publications" element={<Suspense fallback={<PageLoader />}><PublicationsPage /></Suspense>} />
        <Route path="library" element={<Suspense fallback={<PageLoader />}><LibraryPage /></Suspense>} />
        <Route path="expert-opinions" element={<Suspense fallback={<PageLoader />}><ExpertOpinionsPage /></Suspense>} />
        <Route path="research" element={<Suspense fallback={<PageLoader />}><ResearchPage /></Suspense>} />
        <Route path="programs" element={<Suspense fallback={<PageLoader />}><ProgramsPage /></Suspense>} />
        <Route path="conference" element={<Suspense fallback={<PageLoader />}><ConferencePage /></Suspense>} />
        <Route path="committees" element={<Suspense fallback={<PageLoader />}><CommitteesPage /></Suspense>} />
        <Route path="committees/scientific" element={<Suspense fallback={<PageLoader />}><CommitteesPage /></Suspense>} />
        <Route path="committees/media" element={<Suspense fallback={<PageLoader />}><CommitteesPage /></Suspense>} />
        <Route path="committees/legal" element={<Suspense fallback={<PageLoader />}><CommitteesPage /></Suspense>} />
        <Route path="committees/corporate" element={<Suspense fallback={<PageLoader />}><CommitteesPage /></Suspense>} />
        <Route path="committees/finance" element={<Suspense fallback={<PageLoader />}><CommitteesPage /></Suspense>} />
        <Route path="membership" element={<Suspense fallback={<PageLoader />}><MembershipPage /></Suspense>} />
        
        {/* Privacy System Routes */}
        <Route path="privacy-policy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicyPage /></Suspense>} />
        <Route path="data-deletion" element={<Suspense fallback={<PageLoader />}><DataDeletionRequest /></Suspense>} />
        <Route path="privacy-contact" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
      </Route>

      {/* Protected Member Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <UnifiedDashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
        <Route path="privacy" element={<Suspense fallback={<PageLoader />}><ConsentManager /></Suspense>} />
        <Route path="data-export" element={<Suspense fallback={<PageLoader />}><ConsentManager /></Suspense>} />
        <Route path="data-deletion" element={<Suspense fallback={<PageLoader />}><DataDeletionRequest /></Suspense>} />
      </Route>

      {/* Protected Staff Dashboard Routes */}
      <Route path="/dashboard/staff" element={
        <ProtectedRoute requiredRole="staff">
          <UnifiedDashboardLayout requiredRole="staff" />
        </ProtectedRoute>
      }>
        <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
        <Route path="tasks" element={<Suspense fallback={<PageLoader />}><EventsManagement /></Suspense>} />
        <Route path="events" element={<Suspense fallback={<PageLoader />}><EventsManagement /></Suspense>} />
      </Route>

      {/* Protected Admin Dashboard Routes */}
      <Route path="/dashboard/admin" element={
        <ProtectedRoute requiredRole="admin">
          <UnifiedDashboardLayout requiredRole="admin" />
        </ProtectedRoute>
      }>
        <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<PageLoader />}><UserManagement /></Suspense>} />
        <Route path="content" element={<Suspense fallback={<PageLoader />}><ContentManagementV2 /></Suspense>} />
        <Route path="events" element={<Suspense fallback={<PageLoader />}><EventsManagement /></Suspense>} />
        <Route path="media" element={<Suspense fallback={<PageLoader />}><MediaManagement /></Suspense>} />
        <Route path="banners" element={<Suspense fallback={<PageLoader />}><AdsManagement /></Suspense>} />
        <Route path="pages" element={<Suspense fallback={<PageLoader />}><StaticPagesManagement /></Suspense>} />
        <Route path="static-pages" element={<Suspense fallback={<PageLoader />}><StaticPagesManagement /></Suspense>} />
        <Route path="statistics" element={<Suspense fallback={<PageLoader />}><Statistics /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
        <Route path="inquiries" element={<Suspense fallback={<PageLoader />}><InquiryManagement /></Suspense>} />
        <Route path="notifications" element={<Suspense fallback={<PageLoader />}><Notifications /></Suspense>} />
        <Route path="migration" element={<Suspense fallback={<PageLoader />}><MigrationPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<PageLoader />}><SystemSettings /></Suspense>} />
        <Route path="system-settings" element={<Suspense fallback={<PageLoader />}><SystemSettingsAdmin /></Suspense>} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
