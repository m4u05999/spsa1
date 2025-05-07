// src/routes/index.jsx
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import DashboardLayout from '../layout/DashboardLayout';
import AuthWrapper from '../components/common/AuthWrapper';

// Lazy load all pages
const Home = lazy(() => import('../pages/Home'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const AboutPage = lazy(() => import('../pages/about/AboutPage'));
const NewsPage = lazy(() => import('../pages/news/NewsPage'));
const EventsPage = lazy(() => import('../pages/events/EventsPage'));
const PublicationsPage = lazy(() => import('../pages/publications/PublicationsPage'));
const PublicationDetails = lazy(() => import('../pages/publications/PublicationDetails'));
const ProgramsPage = lazy(() => import('../pages/programs/ProgramsPage'));
const ConferencePage = lazy(() => import('../pages/conference/ConferencePage'));
const MembershipPage = lazy(() => import('../pages/membership/MembershipPage'));
const MembershipRegistration = lazy(() => import('../pages/membership/MembershipRegistration'));

// Dashboard Pages
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard'));
const StaffDashboard = lazy(() => import('../pages/dashboard/StaffDashboard'));
const MemberDashboard = lazy(() => import('../pages/dashboard/MemberDashboard'));

// Loading component with skeleton
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-7xl mx-auto">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  </div>
);

// Route protection wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // Or use your auth context
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthWrapper>
        <MainLayout />
      </AuthWrapper>
    ),
    children: [
      {
        index: true,
        element: <Suspense fallback={<PageLoader />}><Home /></Suspense>
      },
      {
        path: 'login',
        element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>
      },
      {
        path: 'register',
        element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: 'about/*',
        element: <Suspense fallback={<PageLoader />}><AboutPage /></Suspense>
      },
      {
        path: 'news',
        element: <Suspense fallback={<PageLoader />}><NewsPage /></Suspense>
      },
      {
        path: 'events',
        element: <Suspense fallback={<PageLoader />}><EventsPage /></Suspense>
      },
      {
        path: 'publications',
        children: [
          {
            index: true,
            element: <Suspense fallback={<PageLoader />}><PublicationsPage /></Suspense>
          },
          {
            path: ':id',
            element: <Suspense fallback={<PageLoader />}><PublicationDetails /></Suspense>
          }
        ]
      },
      {
        path: 'programs',
        element: <Suspense fallback={<PageLoader />}><ProgramsPage /></Suspense>
      },
      {
        path: 'conference',
        element: <Suspense fallback={<PageLoader />}><ConferencePage /></Suspense>
      },
      {
        path: 'membership',
        children: [
          {
            index: true,
            element: <Suspense fallback={<PageLoader />}><MembershipPage /></Suspense>
          },
          {
            path: 'register',
            element: <Suspense fallback={<PageLoader />}><MembershipRegistration /></Suspense>
          }
        ]
      }
    ]
  },
  {
    path: 'dashboard',
    element: (
      <ProtectedRoute>
        <AuthWrapper>
          <DashboardLayout />
        </AuthWrapper>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'admin',
        element: <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
      },
      {
        path: 'staff',
        element: <Suspense fallback={<PageLoader />}><StaffDashboard /></Suspense>
      },
      {
        path: 'member',
        element: <Suspense fallback={<PageLoader />}><MemberDashboard /></Suspense>
      }
    ]
  }
]);

export default router;