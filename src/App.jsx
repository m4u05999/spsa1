// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { UnifiedAppProvider, AuthProvider, DashboardProvider, PaymentProvider, ContentProvider } from './contexts/index.jsx';
import { UnifiedDashboardProvider } from './contexts/UnifiedDashboardContext.jsx';
import { SecurityProvider } from './components/security/SecurityProvider';
// import NotificationSystem from './components/notifications/NotificationSystem';
import SessionWarning from './components/security/SessionWarning';
import { autoRunDiagnostics } from './utils/diagnostics';
import AppRoutes from './routes-new';

const App = () => {
  // تشغيل التشخيص التلقائي في بيئة التطوير
  useEffect(() => {
    autoRunDiagnostics();
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <SecurityProvider>
            <UnifiedAppProvider>
              <UnifiedDashboardProvider>
                <DashboardProvider>
                  <PaymentProvider>
                    {/* <NotificationSystem /> */}
                    <ContentProvider>
                      <AppRoutes />
                      <SessionWarning />
                    </ContentProvider>
                </PaymentProvider>
              </DashboardProvider>
            </UnifiedDashboardProvider>
          </UnifiedAppProvider>
          </SecurityProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;