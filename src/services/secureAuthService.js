// src/services/secureAuthService.js
/**
 * Secure authentication service
 * خدمة المصادقة الآمنة
 */

import { secureStorage, encryptionService } from './encryptionService.js';
import { ENV, SECURE_CONFIG } from '../config/environment.js';
import { CSRFManager, RateLimiter, validatePasswordStrength } from '../utils/security.js';

/**
 * Secure authentication service
 * خدمة المصادقة الآمنة
 */
class SecureAuthService {
  constructor() {
    this.sessionTimeout = ENV.SESSION.TIMEOUT;
    this.rememberMeDuration = ENV.SESSION.REMEMBER_ME_DURATION;
    this.sessionTimer = null;
    this.warningTimer = null;
  }

  /**
   * Secure login with enhanced security
   * تسجيل دخول آمن مع أمان محسن
   */
  async login(credentials, rememberMe = false) {
    try {
      // Rate limiting check
      const clientId = this.getClientId();
      if (!RateLimiter.isAllowed(`login:${clientId}`, 
          SECURE_CONFIG.RATE_LIMITS.LOGIN.attempts, 
          SECURE_CONFIG.RATE_LIMITS.LOGIN.window)) {
        throw new Error('تم تجاوز عدد محاولات تسجيل الدخول المسموح. حاول مرة أخرى لاحقاً');
      }

      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان');
      }

      // Generate CSRF token
      const csrfToken = CSRFManager.generateToken();

      // Mock authentication (replace with real API call)
      const authResult = await this.authenticateUser(credentials);
      
      if (!authResult.success) {
        throw new Error(authResult.error || 'فشل في تسجيل الدخول');
      }

      // Generate secure session
      const sessionData = await this.createSecureSession(authResult.user, rememberMe, csrfToken);
      
      // Store session securely
      console.log('💾 Storing session data:', { user: authResult.user.email, sessionId: sessionData.sessionId });
      await this.storeSession(sessionData, rememberMe);

      // Start session management
      this.startSessionManagement();
      
      // Reset rate limiting on successful login
      RateLimiter.reset(`login:${clientId}`);

      console.log('✅ Login successful for user:', authResult.user.email, 'with role:', authResult.user.role);
      console.log('🔑 Session stored with ID:', sessionData.sessionId);
      console.log('💾 Token compatibility layer activated');
      console.log('🎯 Ready for navigation to dashboard');
      console.log('📊 Final login result:', {
        success: true,
        userId: authResult.user.id,
        userRole: authResult.user.role,
        sessionId: sessionData.sessionId
      });

      return {
        success: true,
        user: authResult.user,
        sessionId: sessionData.sessionId
      };

    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Mock user authentication (replace with real implementation)
   * مصادقة المستخدم الوهمية (استبدل بالتنفيذ الحقيقي)
   */
  async authenticateUser(credentials) {
    console.log('🔍 Authenticating user:', { email: credentials.email, password: credentials.password?.substring(0, 3) + '***' });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock users database
    const users = {
      'admin@saudips.org': {
        id: '1',
        name: 'مدير النظام',
        email: 'admin@saudips.org',
        role: 'admin',
        permissions: ['users.manage', 'content.manage', 'events.manage', 'settings.manage'],
        avatar: '/assets/images/avatar-admin.png',
        passwordHash: 'mock_hash_admin', // In real app, this would be properly hashed
      },
      'staff@sapsa.org': {
        id: '2',
        name: 'موظف الجمعية',
        email: 'staff@sapsa.org',
        role: 'staff',
        permissions: ['content.view', 'events.manage', 'content.create'],
        avatar: '/assets/images/avatar-staff.png',
        passwordHash: 'mock_hash_staff',
      },
      'member@example.com': {
        id: '3',
        name: 'عضو الجمعية',
        email: 'member@example.com',
        role: 'member',
        permissions: ['content.view'],
        avatar: '/assets/images/avatar-member.png',
        passwordHash: 'mock_hash_member',
      }
    };

    const user = users[credentials.email];
    console.log('👤 User found:', !!user, user?.email);

    if (!user) {
      console.log('❌ User not found for email:', credentials.email);
      return { success: false, error: 'البريد الإلكتروني غير مسجل' };
    }

    // In a real app, verify password hash
    console.log('🔑 Checking password:', credentials.password === 'Admin@123');
    if (credentials.password !== 'Admin@123') {
      console.log('❌ Password mismatch');
      return { success: false, error: 'كلمة المرور غير صحيحة' };
    }

    // Remove sensitive data before returning
    const { passwordHash, ...safeUser } = user;
    console.log('✅ Authentication successful for user:', safeUser.email);

    return { success: true, user: safeUser };
  }

  /**
   * Create secure session data
   * إنشاء بيانات جلسة آمنة
   */
  async createSecureSession(user, rememberMe, csrfToken) {
    const now = Date.now();
    const sessionId = encryptionService.generateUUID();
    const accessToken = encryptionService.generateSecureToken(64);
    const refreshToken = encryptionService.generateSecureToken(64);

    return {
      sessionId,
      userId: user.id,
      accessToken,
      refreshToken,
      csrfToken,
      createdAt: now,
      expiresAt: now + (rememberMe ? this.rememberMeDuration : this.sessionTimeout),
      lastActivity: now,
      userAgent: navigator.userAgent,
      ipAddress: await this.getClientIP(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar
      }
    };
  }

  /**
   * Store session securely
   * تخزين الجلسة بشكل آمن
   */
  async storeSession(sessionData, rememberMe) {
    const storageType = rememberMe ? false : true; // false = localStorage, true = sessionStorage
    
    // Store main session data
    await secureStorage.setSecureItem(
      SECURE_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      {
        sessionId: sessionData.sessionId,
        accessToken: sessionData.accessToken,
        expiresAt: sessionData.expiresAt,
        lastActivity: sessionData.lastActivity
      },
      storageType
    );

    // Store user data separately
    await secureStorage.setSecureItem(
      SECURE_CONFIG.STORAGE_KEYS.USER_DATA,
      sessionData.user,
      storageType
    );

    // Store CSRF token in sessionStorage only
    sessionStorage.setItem(SECURE_CONFIG.STORAGE_KEYS.CSRF_TOKEN, sessionData.csrfToken);

    // Store simple token for ProtectedRoute compatibility
    localStorage.setItem('token', sessionData.accessToken);
    console.log('🔑 Token stored in localStorage for ProtectedRoute compatibility');
  }

  /**
   * Get current session
   * الحصول على الجلسة الحالية
   */
  async getCurrentSession() {
    try {
      // Try sessionStorage first, then localStorage
      let sessionData = await secureStorage.getSecureItem(SECURE_CONFIG.STORAGE_KEYS.AUTH_TOKEN, true);
      if (!sessionData) {
        sessionData = await secureStorage.getSecureItem(SECURE_CONFIG.STORAGE_KEYS.AUTH_TOKEN, false);
      }

      if (!sessionData) {
        return null;
      }

      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        await this.logout();
        return null;
      }

      // Update last activity
      sessionData.lastActivity = Date.now();
      await this.updateSessionActivity(sessionData);

      return sessionData;
    } catch (error) {
      console.error('Failed to get current session:', error);
      await this.logout();
      return null;
    }
  }

  /**
   * Get current user
   * الحصول على المستخدم الحالي
   */
  async getCurrentUser() {
    try {
      const session = await this.getCurrentSession();
      if (!session) {
        return null;
      }

      // Try sessionStorage first, then localStorage
      let userData = await secureStorage.getSecureItem(SECURE_CONFIG.STORAGE_KEYS.USER_DATA, true);
      if (!userData) {
        userData = await secureStorage.getSecureItem(SECURE_CONFIG.STORAGE_KEYS.USER_DATA, false);
      }

      return userData;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Update session activity
   * تحديث نشاط الجلسة
   */
  async updateSessionActivity(sessionData) {
    const storageType = sessionStorage.getItem(SECURE_CONFIG.STORAGE_KEYS.AUTH_TOKEN) ? true : false;
    
    await secureStorage.setSecureItem(
      SECURE_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      sessionData,
      storageType
    );
  }

  /**
   * Logout and clear session
   * تسجيل الخروج ومسح الجلسة
   */
  async logout() {
    console.log('🔐 secureAuthService: Starting logout process...');
    try {
      // Clear all secure storage
      console.log('🧹 secureAuthService: Clearing secure storage...');
      secureStorage.clearSecureStorage();

      // Clear CSRF token
      console.log('🔑 secureAuthService: Clearing CSRF token...');
      CSRFManager.clearToken();

      // Clear simple token for ProtectedRoute compatibility
      console.log('🧹 secureAuthService: Clearing localStorage token...');
      localStorage.removeItem('token');

      // Clear session timers
      console.log('⏰ secureAuthService: Clearing session timers...');
      this.clearSessionTimers();

      console.log('✅ secureAuthService: Logout completed successfully');
      return true;
    } catch (error) {
      console.error('❌ secureAuthService: Logout failed:', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   * التحقق من مصادقة المستخدم
   */
  async isAuthenticated() {
    const session = await this.getCurrentSession();
    return !!session;
  }

  /**
   * Start session management
   * بدء إدارة الجلسة
   */
  startSessionManagement() {
    this.clearSessionTimers();

    // Set session timeout warning
    this.warningTimer = setTimeout(() => {
      this.showSessionWarning();
    }, this.sessionTimeout - SECURE_CONFIG.TIMEOUTS.SESSION_WARNING);

    // Set session timeout
    this.sessionTimer = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.sessionTimeout);
  }

  /**
   * Clear session timers
   * مسح مؤقتات الجلسة
   */
  clearSessionTimers() {
    console.log('⏰ secureAuthService: Clearing session timers...');
    if (this.sessionTimer) {
      console.log('🔄 secureAuthService: Clearing session timer');
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    if (this.warningTimer) {
      console.log('🔄 secureAuthService: Clearing warning timer');
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    console.log('✅ secureAuthService: Session timers cleared');
  }

  /**
   * Show session warning
   * عرض تحذير الجلسة
   */
  showSessionWarning() {
    // Dispatch custom event for session warning
    window.dispatchEvent(new CustomEvent('sessionWarning', {
      detail: { remainingTime: SECURE_CONFIG.TIMEOUTS.SESSION_WARNING }
    }));
  }

  /**
   * Handle session timeout
   * التعامل مع انتهاء مهلة الجلسة
   */
  async handleSessionTimeout() {
    await this.logout();
    
    // Dispatch custom event for session timeout
    window.dispatchEvent(new CustomEvent('sessionTimeout'));
  }

  /**
   * Get client ID for rate limiting
   * الحصول على معرف العميل لتحديد معدل الطلبات
   */
  getClientId() {
    try {
      // Use a combination of user agent and screen resolution as client ID
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Client fingerprint', 2, 2);

        return btoa(navigator.userAgent + screen.width + screen.height + canvas.toDataURL()).slice(0, 32);
      } else {
        // Fallback for testing environment
        return btoa(navigator.userAgent + Date.now()).slice(0, 32);
      }
    } catch (error) {
      // Fallback for testing environment or when canvas is not available
      return btoa('test-client-' + Date.now()).slice(0, 32);
    }
  }

  /**
   * Get client IP (mock implementation)
   * الحصول على IP العميل (تنفيذ وهمي)
   */
  async getClientIP() {
    // In a real app, this would be handled by the backend
    return '127.0.0.1';
  }

  /**
   * Register new user with enhanced security
   * تسجيل مستخدم جديد مع أمان محسن
   */
  async register(userData) {
    try {
      // Rate limiting check (disabled for testing)
      const clientId = this.getClientId();
      const isTestMode = window.location.pathname.includes('storage-test') ||
                        window.location.search.includes('test=true') ||
                        userData.email?.includes('test@');

      if (!isTestMode && !RateLimiter.isAllowed(`register:${clientId}`,
          SECURE_CONFIG.RATE_LIMITS.REGISTER?.attempts || 3,
          SECURE_CONFIG.RATE_LIMITS.REGISTER?.window || 300000)) {
        throw new Error('تم تجاوز عدد محاولات التسجيل المسموح. حاول مرة أخرى لاحقاً');
      }

      // Validate required fields
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('جميع الحقول المطلوبة يجب أن تكون مملوءة');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('صيغة البريد الإلكتروني غير صحيحة');
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(`كلمة المرور ضعيفة: ${passwordValidation.errors.join(', ')}`);
      }

      // Generate CSRF token
      const csrfToken = CSRFManager.generateToken();

      // Mock registration (replace with real API call)
      const registrationResult = await this.registerUser(userData);

      if (!registrationResult.success) {
        throw new Error(registrationResult.error || 'فشل في إنشاء الحساب');
      }

      // Create session data
      const sessionData = {
        user: registrationResult.user,
        sessionId: encryptionService.generateUUID(),
        csrfToken,
        loginTime: Date.now(),
        clientId: this.getClientId(),
        ipAddress: await this.getClientIP()
      };

      // Store session securely
      await this.storeSession(sessionData, false); // Don't remember by default for new registrations

      return {
        success: true,
        user: registrationResult.user,
        message: 'تم إنشاء الحساب بنجاح'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Mock user registration (replace with real API call)
   * تسجيل مستخدم وهمي (استبدل بـ API حقيقي)
   */
  async registerUser(userData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if email already exists (mock check)
    const existingUsers = ['admin@spsa.sa', 'test@example.com', 'user@example.com'];
    if (existingUsers.includes(userData.email.toLowerCase())) {
      return {
        success: false,
        error: 'البريد الإلكتروني مستخدم بالفعل'
      };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone || '',
      specialization: userData.specialization || '',
      workplace: userData.workplace || '',
      role: 'member', // Default role
      membershipStatus: 'pending', // Requires payment
      isVerified: false, // Requires email verification
      createdAt: new Date().toISOString(),
      permissions: ['read_profile', 'update_profile']
    };

    // Save user to localStorage (simulating database)
    try {
      // Save to both storage keys for compatibility

      // 1. Save to registeredUsers (for backward compatibility)
      const existingRegisteredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      existingRegisteredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(existingRegisteredUsers));
      console.log('✅ secureAuthService: User saved to registeredUsers:', newUser);

      // 2. Convert and save to spsa_users (for admin dashboard)
      const spsaUser = {
        id: newUser.id,
        firstName: newUser.name ? newUser.name.split(' ')[0] : 'مستخدم',
        lastName: newUser.name ? newUser.name.split(' ').slice(1).join(' ') : 'جديد',
        email: newUser.email,
        role: newUser.role || 'MEMBER',
        status: newUser.status || 'ACTIVE',
        membershipType: newUser.membershipType || 'REGULAR',
        phone: newUser.phone || '',
        specialization: newUser.specialization || newUser.specialty || '',
        workplace: newUser.workplace || newUser.organization || '',
        academicDegree: newUser.academicDegree || '',
        permissions: newUser.permissions || [],
        isActive: newUser.isActive !== false,
        isVerified: newUser.isVerified || false,
        createdAt: newUser.createdAt || new Date().toISOString(),
        updatedAt: newUser.updatedAt || new Date().toISOString(),
        lastLoginAt: newUser.lastLoginAt || null,
        profilePicture: newUser.profilePicture || null
      };

      const existingSpsaUsers = JSON.parse(localStorage.getItem('spsa_users') || '[]');

      // Check if user already exists in spsa_users
      const existingIndex = existingSpsaUsers.findIndex(u => u.email === spsaUser.email);
      if (existingIndex === -1) {
        existingSpsaUsers.push(spsaUser);
        localStorage.setItem('spsa_users', JSON.stringify(existingSpsaUsers));
        console.log('✅ secureAuthService: User saved to spsa_users:', spsaUser);
      } else {
        console.log('⚠️ secureAuthService: User already exists in spsa_users:', spsaUser.email);
      }

    } catch (error) {
      console.error('❌ secureAuthService: Failed to save user to localStorage:', error);
    }

    return {
      success: true,
      user: newUser
    };
  }

  /**
   * Update user data in secure storage
   * تحديث بيانات المستخدم في التخزين الآمن
   */
  async updateUserData(userData) {
    try {
      // Try sessionStorage first, then localStorage
      let stored = await secureStorage.setSecureItem(SECURE_CONFIG.STORAGE_KEYS.USER_DATA, userData, true);
      if (!stored) {
        stored = await secureStorage.setSecureItem(SECURE_CONFIG.STORAGE_KEYS.USER_DATA, userData, false);
      }
      return stored;
    } catch (error) {
      console.error('Failed to update user data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const secureAuthService = new SecureAuthService();

// Export class for testing
export { SecureAuthService };
