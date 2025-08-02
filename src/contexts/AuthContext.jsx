// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { secureAuthService } from '../services/secureAuthService.js';
import { CSRFManager, validatePasswordStrength } from '../utils/security.js';
import { ENV } from '../config/environment.js';
import unifiedApiService from '../services/unifiedApiService.js';
import { getFeatureFlag, updateUserContext } from '../config/featureFlags.js';
import { monitoringService } from '../utils/monitoring.js';

// Create the context
const AuthContext = createContext(null);

/**
 * JWT Token Management
 */
class TokenManager {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.refreshTimer = null;
  }

  setTokens(accessToken, refreshToken, expiresIn = '24h') {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    // Calculate expiry time
    const expiryMs = this.parseExpiryTime(expiresIn);
    this.tokenExpiry = Date.now() + expiryMs;

    // Store in localStorage
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('token_expiry', this.tokenExpiry.toString());

    // Schedule refresh
    this.scheduleTokenRefresh();
  }

  parseExpiryTime(expiresIn) {
    if (typeof expiresIn === 'number') return expiresIn;

    const timeUnits = {
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (match) {
      const [, value, unit] = match;
      return parseInt(value) * timeUnits[unit];
    }

    return 24 * 60 * 60 * 1000; // Default 24 hours
  }

  scheduleTokenRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.tokenExpiry || !this.refreshToken) return;

    // Refresh 5 minutes before expiry
    const refreshTime = this.tokenExpiry - Date.now() - (5 * 60 * 1000);

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshAccessToken();
      }, refreshTime);
    }
  }

  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await unifiedApiService.request('/auth/refresh', {
        method: 'POST',
        data: { refreshToken: this.refreshToken },
        requestType: 'AUTH'
      });

      if (response && response.success && response.data && response.data.accessToken) {
        this.setTokens(
          response.data.accessToken,
          this.refreshToken,
          response.data.expiresIn || '24h'
        );

        console.log('🔄 Token refreshed successfully');
        return true;
      }

      throw new Error('Token refresh failed');

    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  loadTokensFromStorage() {
    try {
      this.accessToken = localStorage.getItem('auth_token');
      this.refreshToken = localStorage.getItem('refresh_token');
      const expiry = localStorage.getItem('token_expiry');

      if (expiry) {
        this.tokenExpiry = parseInt(expiry);

        // Check if token is expired
        if (Date.now() >= this.tokenExpiry) {
          this.clearTokens();
          return false;
        }

        this.scheduleTokenRefresh();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
      this.clearTokens();
      return false;
    }
  }

  clearTokens() {
    console.log('🧹 TokenManager: Starting clearTokens...');
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;

    if (this.refreshTimer) {
      console.log('⏰ TokenManager: Clearing refresh timer');
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    console.log('🗑️ TokenManager: Removing tokens from localStorage');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    console.log('✅ TokenManager: All tokens cleared');
  }

  getAccessToken() {
    return this.accessToken;
  }

  isTokenValid() {
    return this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry;
  }
}

export const AuthProvider = ({ children }) => {
  // console.log('🚀 AuthProvider initializing...'); // تم تعطيل السجل لتقليل الضوضاء

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [tokenManager] = useState(() => new TokenManager());
  const navigate = useNavigate();
  const location = useLocation();

  // Load user data securely on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Check if we should use new backend
        const useNewAuth = getFeatureFlag('USE_NEW_AUTH');

        if (useNewAuth) {
          // Try to load tokens from storage
          const hasValidTokens = tokenManager.loadTokensFromStorage();

          if (hasValidTokens) {
            // Verify token with backend and get user info
            const response = await unifiedApiService.request('/auth/me', {
              requestType: 'AUTH'
            });

            if (response && response?.success && response.data?.user) {
              const userData = response.data.user;
              setUser(userData);
              updateUserContext(userData);
            } else {
              tokenManager.clearTokens();
            }
          }
        } else {
          // Fallback to secure auth service - simplified
          try {
            const currentUser = await secureAuthService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
              secureAuthService.startSessionManagement();
            }
          } catch (error) {
            console.log('No user session found:', error);
            // This is normal for users not logged in
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        // Don't block the app if auth fails
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for session events
  useEffect(() => {
    const handleSessionWarning = () => {
      setSessionWarning(true);
    };

    const handleSessionTimeout = () => {
      setUser(null);
      setSessionWarning(false);
      navigate('/login');
    };

    window.addEventListener('sessionWarning', handleSessionWarning);
    window.addEventListener('sessionTimeout', handleSessionTimeout);

    return () => {
      window.removeEventListener('sessionWarning', handleSessionWarning);
      window.removeEventListener('sessionTimeout', handleSessionTimeout);
    };
  }, [navigate]);

  // Secure login function with unified API support
  const login = useCallback(async (credentials, rememberMe = false) => {
    try {
      setError(null);
      setLoading(true);

      // Validate password strength if not using mock auth
      if (!ENV.FEATURES.MOCK_AUTH) {
        const passwordValidation = validatePasswordStrength(credentials.password);
        if (!passwordValidation.isValid) {
          throw new Error('كلمة المرور لا تلبي متطلبات الأمان');
        }
      }

      const useNewAuth = getFeatureFlag('USE_NEW_AUTH');
      console.log('🔧 USE_NEW_AUTH flag:', useNewAuth);
      let result;

      if (useNewAuth) {
        console.log('🆕 Using new backend authentication');
      } else {
        console.log('🔒 Using secureAuthService (fallback)');
      }

      if (useNewAuth) {
        // Use new backend authentication
        const response = await unifiedApiService.request('/auth/login', {
          method: 'POST',
          data: {
            email: credentials.email,
            password: credentials.password,
            rememberMe
          },
          requestType: 'AUTH'
        });

        if (response && response.success && response.data) {
          const { user, tokens } = response.data;

          // Store tokens
          tokenManager.setTokens(
            tokens.accessToken,
            tokens.refreshToken,
            tokens.expiresIn
          );

          // Update user context
          setUser(user);
          updateUserContext(user);

          // Track login
          monitoringService.trackUserSession(user.id, {
            loginMethod: 'password',
            rememberMe
            // ❌ REMOVED: userAgent - انتهاك قانون PDPL بدون موافقة
          });

          result = { success: true, user };
        } else {
          throw new Error(response?.data?.error || 'فشل في تسجيل الدخول');
        }
      } else {
        // Fallback to secure authentication service
        console.log('🔐 Calling secureAuthService.login with:', { email: credentials.email, rememberMe });
        result = await secureAuthService.login(credentials, rememberMe);
        console.log('🔐 secureAuthService.login result:', result);
      }

      if (result && result.success) {
        // Extract user data from the correct location
        const userData = result.data?.user || result.user;
        console.log('🔐 Login successful, setting user:', userData);
        setUser(userData);
        setSessionWarning(false);

        // Ensure token is stored for ProtectedRoute compatibility
        if (!localStorage.getItem('token')) {
          console.log('⚠️ Token not found in localStorage, setting fallback token');
          localStorage.setItem('token', 'authenticated');
        }

        // Reset circuit breaker for admin users to ensure dashboard access
        if (userData?.role === 'admin') {
          try {
            // Reset circuit breaker to ensure admin dashboard access
            if (window.unifiedApiService && typeof window.unifiedApiService.resetCircuitBreaker === 'function') {
              window.unifiedApiService.resetCircuitBreaker('newBackend');
              console.log('🔄 Circuit breaker reset for admin access');
            }
          } catch (error) {
            console.warn('⚠️ Could not reset circuit breaker:', error);
          }
        }

        // Navigate based on role with delay to ensure state update
        console.log('🚀 Navigating based on role:', userData?.role);
        setTimeout(() => {
          if (userData?.role === 'admin') {
            console.log('🎯 Navigating to admin dashboard');
            navigate('/dashboard/admin');
          } else if (userData?.role === 'staff') {
            navigate('/dashboard/staff');
          } else {
            navigate('/dashboard/member');
          }
        }, 100); // Small delay to ensure state is updated

        return { success: true, user: userData };
      } else {
        throw new Error(result?.error || 'فشل في تسجيل الدخول');
      }
    } catch (err) {
      console.error('❌ Login error:', err);

      // Clear any partial authentication state
      setUser(null);
      localStorage.removeItem('token');

      // Clear any stored session data
      try {
        secureAuthService.clearSession();
        console.log('🧹 Session data cleared after login failure');
      } catch (clearError) {
        console.warn('⚠️ Error clearing session:', clearError);
      }

      const errorMessage = err.message || 'حدث خطأ أثناء تسجيل الدخول';
      setError(errorMessage);
      console.log('🚨 Login failed with error:', errorMessage);
      console.log('🔄 Authentication state reset completed');

      // Ensure UI is in clean state
      setLoading(false);

      // Track login failure
      monitoringService.trackError({
        type: 'login_failure',
        message: err.message,
        email: credentials.email
      });

      return { success: false, error: err.message };
    } finally {
      setLoading(false);
      console.log('🏁 Login process completed');
    }
  }, [navigate]);

  // Secure logout function with unified API support
  const logout = useCallback(async () => {
    console.log('🚪 AuthContext: Starting logout process...');
    try {
      const useNewAuth = getFeatureFlag('USE_NEW_AUTH');
      console.log('🔧 AuthContext: USE_NEW_AUTH flag:', useNewAuth);

      if (useNewAuth && tokenManager.getAccessToken()) {
        console.log('🔄 AuthContext: Using new backend logout...');
        // Logout from new backend
        try {
          await unifiedApiService.request('/auth/logout', {
            method: 'POST',
            requestType: 'AUTH'
          });
          console.log('✅ AuthContext: Backend logout successful');
        } catch (error) {
          console.warn('⚠️ AuthContext: Backend logout failed:', error);
        }

        // Clear tokens
        console.log('🧹 AuthContext: Clearing tokens...');
        tokenManager.clearTokens();
      } else {
        console.log('🔄 AuthContext: Using secureAuthService logout...');
        // Fallback to secure auth service
        const logoutResult = await secureAuthService.logout();
        console.log('🔐 AuthContext: secureAuthService logout result:', logoutResult);
      }

      // Clear user state
      console.log('🧹 AuthContext: Clearing user state...');
      setUser(null);
      setSessionWarning(false);
      updateUserContext(null);

      // Track logout
      console.log('📊 AuthContext: Tracking logout activity...');
      monitoringService.updateUserActivity({
        action: 'logout',
        timestamp: Date.now()
      });

      console.log('🎯 AuthContext: Navigating to login page...');
      navigate('/login');
      console.log('✅ AuthContext: Logout process completed successfully');
    } catch (err) {
      console.error('❌ AuthContext: Logout error:', err);
      // Force logout even if service fails
      console.log('🚨 AuthContext: Force logout - clearing all data...');
      tokenManager.clearTokens();
      setUser(null);
      setSessionWarning(false);
      updateUserContext(null);
      navigate('/login');
      console.log('🔄 AuthContext: Force logout completed');
    }
  }, [navigate, tokenManager]);

  // Register new user
  const register = useCallback(async (userData) => {
    try {
      console.log('🚀 AuthContext: Starting registration process...');
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('جميع الحقول المطلوبة يجب أن تكون مملوءة');
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(`كلمة المرور ضعيفة: ${passwordValidation.errors.join(', ')}`);
      }

      // Check if using new auth system
      const useNewAuth = getFeatureFlag('USE_NEW_AUTH');
      console.log('🔧 AuthContext: Using new auth system:', useNewAuth);

      let result;
      if (useNewAuth) {
        console.log('🔄 AuthContext: Using unifiedApiService for registration...');
        result = await unifiedApiService.auth.register(userData);
      } else {
        console.log('🔄 AuthContext: Using secureAuthService for registration...');
        result = await secureAuthService.register(userData);
      }

      console.log('📝 AuthContext: Registration result:', result);

      if (result && result.success) {
        console.log('✅ AuthContext: Registration successful');

        // Set user data
        setUser(result.user);
        updateUserContext(result.user);

        // Set tokens if provided
        if (result.tokens) {
          tokenManager.setTokens(
            result.tokens.accessToken,
            result.tokens.refreshToken,
            result.tokens.expiresIn
          );
        }

        // Track registration
        monitoringService.updateUserActivity({
          action: 'register',
          timestamp: Date.now(),
          userId: result.user?.id
        });

        console.log('🎯 AuthContext: Registration completed successfully');
        return {
          success: true,
          user: result.user,
          message: result?.message || 'تم إنشاء الحساب بنجاح'
        };
      } else {
        throw new Error(result?.error || 'فشل في إنشاء الحساب');
      }
    } catch (err) {
      console.error('❌ AuthContext: Registration error:', err);
      const errorMessage = err.message || 'حدث خطأ أثناء إنشاء الحساب';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tokenManager]);

  // Extend session
  const extendSession = useCallback(async () => {
    try {
      const session = await secureAuthService.getCurrentSession();
      if (session) {
        setSessionWarning(false);
        secureAuthService.startSessionManagement();
      }
    } catch (err) {
      console.error('Failed to extend session:', err);
      await logout();
    }
  }, [logout]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check specific permissions
    if (!user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    if (!user || !user.role) return false;
    return user.role === role;
  }, [user]);

  // Update user profile securely
  const updateProfile = useCallback(async (newData) => {
    try {
      const updatedUser = { ...user, ...newData };
      setUser(updatedUser);

      // Update secure storage
      await secureAuthService.updateUserData(updatedUser);

      return updatedUser;
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw new Error('فشل في تحديث الملف الشخصي');
    }
  }, [user]);

  // Get CSRF token
  const getCSRFToken = useCallback(() => {
    return CSRFManager.getToken();
  }, []);

  // Don't block rendering with loading screen - let the context provide loading state
  // This allows components to handle loading themselves

  // Context value
  const value = {
    user,
    loading,
    error,
    sessionWarning,
    login,
    register,
    logout,
    extendSession,
    hasPermission,
    hasRole,
    updateProfile,
    getCSRFToken,
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

// Export both AuthContext and AuthProvider
export { AuthContext };
export default AuthProvider;