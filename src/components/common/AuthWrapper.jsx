// src/components/common/AuthWrapper.jsx
import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { DashboardProvider } from '../../context/DashboardContext';
import { PaymentProvider } from '../../context/PaymentContext';
import { NotificationProvider } from '../../context/NotificationContext';
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