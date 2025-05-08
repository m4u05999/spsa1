// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function - will be replaced with API integration later
  const login = useCallback(async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      // This is a mock login - will be replaced with actual API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock users for testing different roles
      const users = {
        'admin@saudips.org': {
          id: '1',
          name: 'مدير النظام',
          email: 'admin@saudips.org',
          role: 'admin',
          permissions: ['users.manage', 'content.manage', 'events.manage', 'settings.manage'],
          avatar: '/assets/images/avatar-admin.png',
        },
        'staff@sapsa.org': {
          id: '2',
          name: 'موظف الجمعية',
          email: 'staff@sapsa.org',
          role: 'staff',
          permissions: ['content.view', 'events.manage', 'content.create'],
          avatar: '/assets/images/avatar-staff.png',
        },
        'member@example.com': {
          id: '3',
          name: 'عضو الجمعية',
          email: 'member@example.com',
          role: 'member',
          permissions: ['content.view'],
          avatar: '/assets/images/avatar-member.png',
        }
      };

      // Check if the credentials match any of our mock users
      const foundUser = users[credentials.email];
      
      if (foundUser && credentials.password === 'Admin@123') {
        // Store user data in localStorage and state
        localStorage.setItem('user', JSON.stringify(foundUser));
        setUser(foundUser);

        // Navigate based on role
        if (foundUser.role === 'admin') {
          navigate('/dashboard/admin');
        } else if (foundUser.role === 'staff') {
          navigate('/dashboard/staff');
        } else {
          navigate('/dashboard/member');
        }
        
        return { success: true, user: foundUser };
      } else {
        throw new Error('بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    if (!user || !user.role) return false;
    return user.role === role;
  }, [user]);

  // Update user profile
  const updateProfile = useCallback((newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-b-2 border-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};