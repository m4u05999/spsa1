// src/components/common/AuthWrapper.jsx
import React from 'react';
import { AuthProvider, DashboardProvider, PaymentProvider } from '../../contexts/index.jsx';
import { NotificationProvider } from '../../contexts/index.jsx';
import NotificationSystem from '../notifications/NotificationSystem';

const AuthWrapper = ({ children }) => {
  return (
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
};

export default AuthWrapper;