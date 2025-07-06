// src/App.jsx
import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import { ContentProvider } from './contexts/ContentContext.jsx';
import AuthProvider from './context/AuthContext.jsx';
import { autoRunDiagnostics } from './utils/diagnostics';
import router from './routes';

const App = () => {
  // تشغيل التشخيص التلقائي في بيئة التطوير
  useEffect(() => {
    autoRunDiagnostics();
  }, []);

  return (
    <RouterProvider router={router} />
  );
};

export default App;