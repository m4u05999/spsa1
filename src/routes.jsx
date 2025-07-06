// src/routes.jsx
// نظام توجيه موحد للتطبيق
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Providers (not lazy loaded)
import AuthProvider from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import { PaymentProvider } from './context/PaymentContext';
import { NotificationProvider } from './context/NotificationContext';
import { SecurityProvider } from './components/security/SecurityProvider';
import { RealtimeProvider } from './contexts/RealtimeContext';

// Layouts & Core Components (not lazy loaded)
import MainLayout from './layout/MainLayout';
import DashboardLayout from './layout/DashboardLayout';
import AdminDashboardLayout from './layout/AdminDashboardLayout';
import NotificationSystem from './components/notifications/NotificationSystem';
import SessionWarning from './components/security/SessionWarning';

// Lazy load all pages with optimized chunking
const Home = lazy(() => import(/* webpackChunkName: "page-home" */ './pages/Home'));
const LoginPage = lazy(() => import(/* webpackChunkName: "page-auth" */ './pages/auth/LoginPage'));
const RegisterPage = lazy(() => import(/* webpackChunkName: "page-auth" */ './pages/auth/RegisterPage'));
const RegistrationTest = lazy(() => import(/* webpackChunkName: "page-test" */ './pages/RegistrationTest'));
const SimpleRegistrationTest = lazy(() => import(/* webpackChunkName: "page-test" */ './pages/SimpleRegistrationTest'));
const UserStorageTest = lazy(() => import(/* webpackChunkName: "page-test" */ './pages/UserStorageTest'));
const ProfilePage = lazy(() => import(/* webpackChunkName: "page-profile" */ './pages/profile/ProfilePage'));

// Main Pages
const NewsPage = lazy(() => import(/* webpackChunkName: "news" */ './pages/news/NewsPage'));
const NewsDetailsPage = lazy(() => import(/* webpackChunkName: "news-details" */ './pages/news/NewsDetailsPage'));
const AboutPage = lazy(() => import(/* webpackChunkName: "about" */ './pages/about/AboutPage'));
const EventsPage = lazy(() => import(/* webpackChunkName: "events" */ './pages/events/EventsPage'));
const PrinceTurkiLecture = lazy(() => import(/* webpackChunkName: "events" */ './pages/events/lectures/PrinceTurkiLecture'));
const PublicationsPage = lazy(() => import(/* webpackChunkName: "publications" */ './pages/publications/PublicationsPage'));
const PublicationDetails = lazy(() => import(/* webpackChunkName: "publications" */ './pages/publications/PublicationDetails'));
const ProgramsPage = lazy(() => import(/* webpackChunkName: "programs" */ './pages/programs/ProgramsPage'));
const ConferencePage = lazy(() => import(/* webpackChunkName: "conference" */ './pages/conference/ConferencePage'));
const LibraryPage = lazy(() => import(/* webpackChunkName: "library" */ './pages/library/LibraryPage'));
const ExpertOpinionsPage = lazy(() => import(/* webpackChunkName: "opinions" */ './pages/opinions/ExpertOpinionsPage'));
const ResourceDetailsPage = lazy(() => import(/* webpackChunkName: "resources" */ './pages/resources/ResourceDetailsPage'));
const OpinionDetailsPage = lazy(() => import(/* webpackChunkName: "opinions" */ './pages/opinions/OpinionDetailsPage'));
const ContactPage = lazy(() => import(/* webpackChunkName: "contact" */ './pages/contact/ContactPage'));

// Research Pages
const ResearchPage = lazy(() => import(/* webpackChunkName: "research" */ './pages/research/ResearchPage'));
const RegionalStudies = lazy(() => import(/* webpackChunkName: "research-units" */ './pages/research/units/RegionalStudies'));
const InternationalRelations = lazy(() => import(/* webpackChunkName: "research-units" */ './pages/research/units/InternationalRelations'));
const ComparativePolitics = lazy(() => import(/* webpackChunkName: "research-units" */ './pages/research/units/ComparativePolitics'));
const PoliticalThought = lazy(() => import(/* webpackChunkName: "research-units" */ './pages/research/units/PoliticalThought'));

// Dashboard Pages
const AdminDashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './pages/dashboard/AdminDashboard'));
const StaffDashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './pages/dashboard/StaffDashboard'));
const MemberDashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './pages/dashboard/MemberDashboard'));

// Admin Dashboard Modules
const UserManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/UserManagementFixed.jsx'));
const ContentManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/ContentManagementV2.jsx'));
const EventsManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/EventsManagement.jsx'));
const Statistics = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/Statistics.jsx'));
const InquiryManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/InquiryManagement.jsx'));
const SystemSettings = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/SystemSettings.jsx'));
const MediaManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/MediaManagement.jsx'));
const StaticPagesManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/StaticPagesManagement.jsx'));
const AdsManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/AdsManagement.jsx'));
const MigrationPage = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/admin/MigrationPage.jsx'));
const LayoutTest = lazy(() => import(/* webpackChunkName: "admin-module" */ './components/dashboard/LayoutTest.jsx'));

// Membership Pages
const MembershipPage = lazy(() => import(/* webpackChunkName: "membership" */ './pages/membership/MembershipPage'));
const MembershipRegistration = lazy(() => import(/* webpackChunkName: "membership" */ './pages/membership/MembershipRegistration'));

// Committee Pages
const CommitteesPage = lazy(() => import(/* webpackChunkName: "committees" */ './pages/committees/CommitteesPage'));
const ScientificCommittee = lazy(() => import(/* webpackChunkName: "committees" */ './pages/committees/ScientificCommittee'));
const MediaCommittee = lazy(() => import(/* webpackChunkName: "committees" */ './pages/committees/MediaCommittee'));
const LegalCommittee = lazy(() => import(/* webpackChunkName: "committees" */ './pages/committees/LegalCommittee'));
const CorporateCommittee = lazy(() => import(/* webpackChunkName: "committees" */ './pages/committees/CorporateCommittee'));
const FinanceCommittee = lazy(() => import(/* webpackChunkName: "committees" */ './pages/committees/FinanceCommittee'));

// Committee Units Pages
const CurriculumUnit = lazy(() => import(/* webpackChunkName: "committee-units" */ './pages/committees/units/CurriculumUnit'));
const PoliticalEconomyUnit = lazy(() => import(/* webpackChunkName: "committee-units" */ './pages/committees/units/PoliticalEconomyUnit'));
const PoliticalMediaUnit = lazy(() => import(/* webpackChunkName: "committee-units" */ './pages/committees/units/PoliticalMediaUnit'));
const PoliticalPsychologyUnit = lazy(() => import(/* webpackChunkName: "committee-units" */ './pages/committees/units/PoliticalPsychologyUnit'));
const WomenEmpowermentUnit = lazy(() => import(/* webpackChunkName: "committee-units" */ './pages/committees/units/WomenEmpowermentUnit'));

// Notification Management Page
const NotificationManagementPage = lazy(() => import(/* webpackChunkName: "notifications" */ './pages/notifications/NotificationManagementPage'));

// Phase 3 - Advanced Features
const FileUploadPage = lazy(() => import(/* webpackChunkName: "file-upload" */ './pages/FileUploadPage.jsx'));
const RealtimeFeaturesDemo = lazy(() => import(/* webpackChunkName: "realtime" */ './pages/RealtimeFeaturesDemo.jsx'));

// API Testing Page
const ApiTestingPage = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/ApiTestingPage.jsx'));

// مكونات الحماية والتحميل
// مكون الحماية للمسارات التي تتطلب تسجيل الدخول
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('🛡️ ProtectedRoute check:', { isAuthenticated, isLoading, user: user?.email });

  // Additional fallback check for localStorage token
  const hasToken = localStorage.getItem('token');
  console.log('🔑 localStorage token check:', !!hasToken);

  if (isLoading) {
    console.log('⏳ ProtectedRoute: Still loading...');
    return <PageLoader />;
  }

  // Check both AuthContext and localStorage token
  if (!isAuthenticated && !hasToken) {
    console.log('❌ ProtectedRoute: Not authenticated (no user and no token), redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If we have a token but no user context, try to restore session
  if (!isAuthenticated && hasToken) {
    console.log('⚠️ ProtectedRoute: Token exists but no user context, attempting session restore');
    console.log('🔄 Waiting for AuthContext to restore session...');
    console.log('🕐 Current state - isAuthenticated:', isAuthenticated, 'hasToken:', hasToken, 'user:', user);

    // Give AuthContext a moment to restore session
    setTimeout(() => {
      if (!user) {
        console.log('⚠️ Session restore failed after 3 seconds, clearing invalid token');
        localStorage.removeItem('token');
        console.log('🔄 Forcing page reload to restart authentication flow');
        // Force page reload to restart authentication flow
        window.location.reload();
      } else {
        console.log('✅ Session restored successfully');
      }
    }, 3000); // Increased timeout for better reliability

    return <PageLoader />;
  }

  console.log('✅ ProtectedRoute: Authenticated, rendering children');
  return children;
};

// Import optimized loader
import { PageLoader } from './components/common/OptimizedLoader';

// مكون التحميل مع الهيكل العظمي
const SuspenseWrapper = ({ children }) => {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
};

// Prefetch component
const prefetchComponent = (importFn) => {
  const prefetchTimeoutMs = 2000;
  let timeoutId;

  return {
    preload() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        importFn().catch(() => {
          // Silent catch for prefetch failures
        });
      }, prefetchTimeoutMs);
    }
  };
};

// Route wrapper with providers
const RouteWrapper = ({ children }) => (
  <SecurityProvider>
    <AuthProvider>
      <DashboardProvider>
        <PaymentProvider>
          <NotificationProvider>
            <RealtimeProvider>
              {children}
              <NotificationSystem />
              <SessionWarning />
            </RealtimeProvider>
          </NotificationProvider>
        </PaymentProvider>
      </DashboardProvider>
    </AuthProvider>
  </SecurityProvider>
);

// تعريف الراوتر الرئيسي الموحد
const router = createBrowserRouter([
  {
    path: "/",
    element: <RouteWrapper><MainLayout /></RouteWrapper>,
    children: [
      {
        index: true,
        element: <Suspense fallback={<PageLoader />}><Home /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "home" */ './pages/Home')).preload()
      },
      {
        path: "login",
        element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "auth" */ './pages/auth/LoginPage')).preload()
      },
      {
        path: "register",
        element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "auth" */ './pages/auth/RegisterPage')).preload()
      },
      {
        path: "test-registration",
        element: <Suspense fallback={<PageLoader />}><RegistrationTest /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "test" */ './pages/RegistrationTest')).preload()
      },
      {
        path: "simple-test",
        element: <Suspense fallback={<PageLoader />}><SimpleRegistrationTest /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "test" */ './pages/SimpleRegistrationTest')).preload()
      },
      {
        path: "storage-test",
        element: <Suspense fallback={<PageLoader />}><UserStorageTest /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "test" */ './pages/UserStorageTest')).preload()
      },
      {
        path: "profile",
        element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "profile" */ './pages/profile/ProfilePage')).preload()
      },
      {
        path: "about/*",
        element: <Suspense fallback={<PageLoader />}><AboutPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "about" */ './pages/about/AboutPage')).preload()
      },
      {
        path: "news",
        children: [
          {
            index: true,
            element: <Suspense fallback={<PageLoader />}><NewsPage /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "news" */ './pages/news/NewsPage')).preload()
          },
          {
            path: ":id",
            element: <Suspense fallback={<PageLoader />}><NewsDetailsPage /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "news-details" */ './pages/news/NewsDetailsPage')).preload()
          }
        ]
      },
      {
        path: "events",
        element: <Suspense fallback={<PageLoader />}><EventsPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "events" */ './pages/events/EventsPage')).preload()
      },
      {
        path: "events/lecture/prince-turki",
        element: <Suspense fallback={<PageLoader />}><PrinceTurkiLecture /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "events" */ './pages/events/lectures/PrinceTurkiLecture')).preload()
      },
      {
        path: "publications",
        children: [
          {
            index: true,
            element: <Suspense fallback={<PageLoader />}><PublicationsPage /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "publications" */ './pages/publications/PublicationsPage')).preload()
          },
          {
            path: ":id",
            element: <Suspense fallback={<PageLoader />}><PublicationDetails /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "publications" */ './pages/publications/PublicationDetails')).preload()
          }
        ]
      },
      {
        path: "programs",
        element: <Suspense fallback={<PageLoader />}><ProgramsPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "programs" */ './pages/programs/ProgramsPage')).preload()
      },
      {
        path: "conference",
        element: <Suspense fallback={<PageLoader />}><ConferencePage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "conference" */ './pages/conference/ConferencePage')).preload()
      },
      {
        path: "library",
        element: <Suspense fallback={<PageLoader />}><LibraryPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "library" */ './pages/library/LibraryPage')).preload()
      },
      {
        path: "expert-opinions",
        element: <Suspense fallback={<PageLoader />}><ExpertOpinionsPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "opinions" */ './pages/opinions/ExpertOpinionsPage')).preload()
      },
      {
        path: "resources/:id",
        element: <Suspense fallback={<PageLoader />}><ResourceDetailsPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "resources" */ './pages/resources/ResourceDetailsPage')).preload()
      },
      {
        path: "opinions/:id",
        element: <Suspense fallback={<PageLoader />}><OpinionDetailsPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "opinions" */ './pages/opinions/OpinionDetailsPage')).preload()
      },
      {
        path: "contact",
        element: <Suspense fallback={<PageLoader />}><ContactPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "contact" */ './pages/contact/ContactPage')).preload()
      },
      {
        path: "research/*",
        children: [
          {
            index: true,
            element: <Suspense fallback={<PageLoader />}><ResearchPage /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "research" */ './pages/research/ResearchPage')).preload()
          },
          {
            path: "regional",
            element: <Suspense fallback={<PageLoader />}><RegionalStudies /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "research-units" */ './pages/research/units/RegionalStudies')).preload()
          },
          {
            path: "international",
            element: <Suspense fallback={<PageLoader />}><InternationalRelations /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "research-units" */ './pages/research/units/InternationalRelations')).preload()
          },
          {
            path: "comparative",
            element: <Suspense fallback={<PageLoader />}><ComparativePolitics /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "research-units" */ './pages/research/units/ComparativePolitics')).preload()
          },
          {
            path: "thought",
            element: <Suspense fallback={<PageLoader />}><PoliticalThought /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "research-units" */ './pages/research/units/PoliticalThought')).preload()
          }
        ]
      },
      {
        path: "committees",
        children: [
          {
            index: true,
            element: <Suspense fallback={<PageLoader />}><CommitteesPage /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "committees" */ './pages/committees/CommitteesPage')).preload()
          },
          {
            path: "scientific",
            element: <Suspense fallback={<PageLoader />}><ScientificCommittee /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "committees" */ './pages/committees/ScientificCommittee')).preload()
          },
          {
            path: "scientific/curriculum",
            element: <Suspense fallback={<PageLoader />}><CurriculumUnit /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "committee-units" */ './pages/committees/units/CurriculumUnit')).preload()
          },
          {
            path: "scientific/political-economy",
            element: <Suspense fallback={<PageLoader />}><PoliticalEconomyUnit /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "committee-units" */ './pages/committees/units/PoliticalEconomyUnit')).preload()
          },
          {
            path: "scientific/political-media",
            element: <Suspense fallback={<PageLoader />}><PoliticalMediaUnit /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "committee-units" */ './pages/committees/units/PoliticalMediaUnit')).preload()
          },
          {
            path: "scientific/political-psychology",
            element: <Suspense fallback={<PageLoader />}><PoliticalPsychologyUnit /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "committee-units" */ './pages/committees/units/PoliticalPsychologyUnit')).preload()
          },
          {
            path: "scientific/women-empowerment",
            element: <Suspense fallback={<PageLoader />}><WomenEmpowermentUnit /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "committee-units" */ './pages/committees/units/WomenEmpowermentUnit')).preload()
          },
          {
            path: "media",
            element: <Suspense fallback={<PageLoader />}><MediaCommittee /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "committees" */ './pages/committees/MediaCommittee')).preload()
          },
          {
            path: "legal",
            element: <Suspense fallback={<PageLoader />}><LegalCommittee /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "committees" */ './pages/committees/LegalCommittee')).preload()
          },
          {
            path: "corporate",
            element: <Suspense fallback={<PageLoader />}><CorporateCommittee /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "committees" */ './pages/committees/CorporateCommittee')).preload()
          },
          {
            path: "finance",
            element: <Suspense fallback={<PageLoader />}><FinanceCommittee /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "committees" */ './pages/committees/FinanceCommittee')).preload()
          }
        ]
      },
      {
        path: "membership",
        children: [
          {
            index: true,
            element: <Suspense fallback={<PageLoader />}><MembershipPage /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "membership" */ './pages/membership/MembershipPage')).preload()
          },
          {
            path: "register",
            element: <Suspense fallback={<PageLoader />}><MembershipRegistration /></Suspense>,
            loader: () => prefetchComponent(() => import(/* webpackChunkName: "membership" */ './pages/membership/MembershipRegistration')).preload()
          }
        ]
      },
      {
        path: "notifications",
        element: <Suspense fallback={<PageLoader />}><NotificationManagementPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "notifications" */ './pages/notifications/NotificationManagementPage')).preload()
      },
      // Phase 3 - Advanced Features Routes
      {
        path: "file-upload",
        element: <Suspense fallback={<PageLoader />}><FileUploadPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "file-upload" */ './pages/FileUploadPage')).preload()
      },
      {
        path: "realtime-demo",
        element: <Suspense fallback={<PageLoader />}><RealtimeFeaturesDemo /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "realtime" */ './pages/RealtimeFeaturesDemo')).preload()
      },
      {
        path: "admin/api-testing",
        element: <Suspense fallback={<PageLoader />}><ApiTestingPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "admin" */ './pages/admin/ApiTestingPage')).preload()
      }
    ]
  },
  // Admin Dashboard with nested routes
  {
    path: "dashboard/admin",
    element: <RouteWrapper><AdminDashboardLayout /></RouteWrapper>,
    children: [
      {
        path: "",
        element: <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
      },
      {
        path: "users/*",
        element: <Suspense fallback={<PageLoader />}><UserManagement /></Suspense>
      },
      {
        path: "content/*",
        element: <Suspense fallback={<PageLoader />}><ContentManagement /></Suspense>
      },
      {
        path: "events/*",
        element: <Suspense fallback={<PageLoader />}><EventsManagement /></Suspense>
      },
      {
        path: "statistics/*",
        element: <Suspense fallback={<PageLoader />}><Statistics /></Suspense>
      },
      {
        path: "inquiries/*",
        element: <Suspense fallback={<PageLoader />}><InquiryManagement /></Suspense>
      },
      {
        path: "settings/*",
        element: <Suspense fallback={<PageLoader />}><SystemSettings /></Suspense>
      },
      {
        path: "media/*",
        element: <Suspense fallback={<PageLoader />}><MediaManagement /></Suspense>
      },
      {
        path: "pages/*",
        element: <Suspense fallback={<PageLoader />}><StaticPagesManagement /></Suspense>
      },
      {
        path: "banners/*",
        element: <Suspense fallback={<PageLoader />}><AdsManagement /></Suspense>
      },
      {
        path: "migration/*",
        element: <Suspense fallback={<PageLoader />}><MigrationPage /></Suspense>
      },
      {
        path: "layout-test",
        element: <Suspense fallback={<PageLoader />}><LayoutTest /></Suspense>
      },
      {
        path: "*",
        element: <Navigate to="/dashboard/admin" replace />
      }
    ]
  },
  // Other dashboards
  {
    path: "dashboard",
    element: <RouteWrapper><DashboardLayout /></RouteWrapper>,
    children: [
      {
        path: "staff",
        element: <Suspense fallback={<PageLoader />}><StaffDashboard /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "dashboard" */ './pages/dashboard/StaffDashboard')).preload()
      },
      {
        path: "member",
        element: <Suspense fallback={<PageLoader />}><MemberDashboard /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "dashboard" */ './pages/dashboard/MemberDashboard')).preload()
      }
    ]
  }
]);

// Export default for better compatibility
export default router;