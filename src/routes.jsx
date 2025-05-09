import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Providers (not lazy loaded)
import { AuthProvider } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import { PaymentProvider } from './context/PaymentContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts & Core Components (not lazy loaded)
import MainLayout from './layout/MainLayout';
import DashboardLayout from './layout/DashboardLayout';
import AdminDashboardLayout from './layout/AdminDashboardLayout';
import NotificationSystem from './components/notifications/NotificationSystem';
import AdminRoutes from './routes/AdminRoutes';

// Lazy load all pages with relative paths to fix build issues
const Home = lazy(() => import(/* webpackChunkName: "home" */ './pages/Home'));
const LoginPage = lazy(() => import(/* webpackChunkName: "auth" */ './pages/auth/LoginPage'));
const RegisterPage = lazy(() => import(/* webpackChunkName: "auth" */ './pages/auth/RegisterPage'));
const ProfilePage = lazy(() => import(/* webpackChunkName: "profile" */ './pages/profile/ProfilePage'));

// Main Pages
const NewsPage = lazy(() => import(/* webpackChunkName: "news" */ './pages/news/NewsPage'));
const AboutPage = lazy(() => import(/* webpackChunkName: "about" */ './pages/about/AboutPage'));
const EventsPage = lazy(() => import(/* webpackChunkName: "events" */ './pages/events/EventsPage'));
const PublicationsPage = lazy(() => import(/* webpackChunkName: "publications" */ './pages/publications/PublicationsPage'));
const PublicationDetails = lazy(() => import(/* webpackChunkName: "publications" */ './pages/publications/PublicationDetails'));
const ProgramsPage = lazy(() => import(/* webpackChunkName: "programs" */ './pages/programs/ProgramsPage'));
const ConferencePage = lazy(() => import(/* webpackChunkName: "conference" */ './pages/conference/ConferencePage'));
const LibraryPage = lazy(() => import(/* webpackChunkName: "library" */ './pages/library/LibraryPage'));
const ExpertOpinionsPage = lazy(() => import(/* webpackChunkName: "opinions" */ './pages/opinions/ExpertOpinionsPage'));
const ResourceDetailsPage = lazy(() => import(/* webpackChunkName: "resources" */ './pages/resources/ResourceDetailsPage'));
const OpinionDetailsPage = lazy(() => import(/* webpackChunkName: "opinions" */ './pages/opinions/OpinionDetailsPage'));

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
const UserManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/UserManagement'));
const ContentManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/ContentManagementV2'));
const EventsManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/EventsManagement'));
const Statistics = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/Statistics'));
const InquiryManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/InquiryManagement'));
const SystemSettings = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/SystemSettings'));
const MediaManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/MediaManagement'));
const StaticPagesManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/StaticPagesManagement'));
const AdsManagement = lazy(() => import(/* webpackChunkName: "admin-module" */ './pages/dashboard/modules/AdsManagement'));

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
  <AuthProvider>
    <DashboardProvider>
      <PaymentProvider>
        <NotificationProvider>
          {children}
          <NotificationSystem />
        </NotificationProvider>
      </PaymentProvider>
    </DashboardProvider>
  </AuthProvider>
);

// Configure routes with prefetching
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
        element: <Suspense fallback={<PageLoader />}><NewsPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "news" */ './pages/news/NewsPage')).preload()
      },
      {
        path: "events",
        element: <Suspense fallback={<PageLoader />}><EventsPage /></Suspense>,
        loader: () => prefetchComponent(() => import(/* webpackChunkName: "events" */ './pages/events/EventsPage')).preload()
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

export default router;