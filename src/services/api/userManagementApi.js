/**
 * User Management API Service
 * خدمة APIs إدارة المستخدمين
 * 
 * Comprehensive user management with roles, permissions, and PDPL compliance
 */

import unifiedApiService from '../unifiedApiService.js';
import { getFeatureFlag } from '../../config/featureFlags.js';
import { logError, logInfo } from '../../utils/monitoring.js';
import localStorageService from '../localStorageService.js';

/**
 * User Roles
 * أدوار المستخدمين
 */
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member',
  GUEST: 'guest'
};

/**
 * User Status
 * حالات المستخدم
 */
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  BANNED: 'banned'
};

/**
 * Membership Types
 * أنواع العضوية
 */
export const MEMBERSHIP_TYPES = {
  REGULAR: 'regular',
  STUDENT: 'student',
  ACADEMIC: 'academic',
  HONORARY: 'honorary',
  CORPORATE: 'corporate'
};

/**
 * User Management API Class
 * فئة APIs إدارة المستخدمين
 */
class UserManagementApi {
  constructor() {
    this.baseEndpoint = '/api/users';
    this.isInitialized = false;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.storageKey = 'spsa_users_data';
    this.usersStorageKey = 'spsa_users_list';

    this.initialize();
  }

  /**
   * Initialize API service
   * تهيئة خدمة API
   */
  async initialize() {
    try {
      if (!getFeatureFlag('ENABLE_USER_MANAGEMENT_API')) {
        logInfo('User Management API is disabled');
        return;
      }

      // Initialize with some default users if storage is empty
      this.initializeDefaultUsers();

      this.isInitialized = true;
      logInfo('User Management API initialized');

    } catch (error) {
      logError('Failed to initialize User Management API', error);
      throw error;
    }
  }

  /**
   * Initialize default users if storage is empty
   * تهيئة المستخدمين الافتراضيين إذا كان التخزين فارغاً
   */
  initializeDefaultUsers() {
    const existingUsers = this.getUsersFromStorage();

    if (existingUsers.length === 0) {
      const defaultUsers = [
        {
          id: 'user_admin_1',
          email: 'admin@saudips.org',
          firstName: 'مدير',
          lastName: 'النظام',
          role: USER_ROLES.ADMIN,
          status: USER_STATUS.ACTIVE,
          membershipType: MEMBERSHIP_TYPES.ACADEMIC,
          phone: '+966501234567',
          specialization: 'إدارة النظام',
          workplace: 'الجمعية السعودية للعلوم السياسية',
          academicDegree: 'دكتوراه',
          permissions: ['users.manage', 'content.manage', 'events.manage', 'settings.manage'],
          isActive: true,
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          profilePicture: null
        },
        {
          id: 'user_staff_1',
          email: 'staff@saudips.org',
          firstName: 'موظف',
          lastName: 'النظام',
          role: USER_ROLES.MODERATOR,
          status: USER_STATUS.ACTIVE,
          membershipType: MEMBERSHIP_TYPES.ACADEMIC,
          phone: '+966507654321',
          specialization: 'العلوم السياسية',
          workplace: 'الجمعية السعودية للعلوم السياسية',
          academicDegree: 'ماجستير',
          permissions: ['users.view', 'content.create', 'content.edit', 'events.view'],
          isActive: true,
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: null,
          profilePicture: null
        },
        {
          id: 'user_member_1',
          email: 'member@saudips.org',
          firstName: 'عضو',
          lastName: 'تجريبي',
          role: USER_ROLES.MEMBER,
          status: USER_STATUS.ACTIVE,
          membershipType: MEMBERSHIP_TYPES.REGULAR,
          phone: '+966509876543',
          specialization: 'السياسة المقارنة',
          workplace: 'جامعة الملك سعود',
          academicDegree: 'بكالوريوس',
          permissions: ['content.view', 'events.view'],
          isActive: true,
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: null,
          profilePicture: null
        },
        {
          id: 'user_student_1',
          email: 'student@saudips.org',
          firstName: 'طالب',
          lastName: 'دراسات عليا',
          role: USER_ROLES.MEMBER,
          status: USER_STATUS.ACTIVE,
          membershipType: MEMBERSHIP_TYPES.STUDENT,
          phone: '+966502468135',
          specialization: 'النظرية السياسية',
          workplace: 'جامعة الأميرة نورة',
          academicDegree: 'ماجستير',
          permissions: ['content.view', 'events.view'],
          isActive: true,
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: null,
          profilePicture: null
        },
        {
          id: 'user_guest_1',
          email: 'guest@saudips.org',
          firstName: 'ضيف',
          lastName: 'النظام',
          role: USER_ROLES.GUEST,
          status: USER_STATUS.PENDING,
          membershipType: MEMBERSHIP_TYPES.HONORARY,
          phone: '+966503691472',
          specialization: 'الإدارة العامة',
          workplace: 'معهد الإدارة العامة',
          academicDegree: 'دكتوراه',
          permissions: [],
          isActive: false,
          isVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: null,
          profilePicture: null
        }
      ];

      this.saveUsersToStorage(defaultUsers);

      // Initialize additional system data
      this.initializeFeatureFlags();
      this.initializeAuthToken(defaultUsers[0]); // Admin user

      logInfo('Default users and system data initialized', { count: defaultUsers.length });
    }
  }

  /**
   * Initialize feature flags
   * تهيئة إعدادات الميزات
   */
  initializeFeatureFlags() {
    try {
      const featureFlags = {
        ENABLE_USER_MANAGEMENT_API: true,
        USE_NEW_AUTH: false,
        ENABLE_REAL_TIME_FEATURES: true,
        ENABLE_NOTIFICATIONS: true,
        ENABLE_FILE_UPLOAD: true,
        ENABLE_CONTENT_MANAGEMENT: true,
        ENABLE_ANALYTICS: true,
        PDPL_COMPLIANCE_MODE: true,
        DEBUG_MODE: process.env.NODE_ENV === 'development'
      };

      localStorageService.setItem('spsa_feature_flags', featureFlags);
      logInfo('Feature flags initialized');
      return featureFlags;
    } catch (error) {
      logError('Failed to initialize feature flags', error);
    }
  }

  /**
   * Initialize auth token for a user
   * تهيئة رمز المصادقة للمستخدم
   */
  initializeAuthToken(user) {
    try {
      const authToken = {
        token: 'spsa_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        user: user,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        createdAt: new Date().toISOString(),
        type: 'bearer'
      };

      localStorageService.setItem('spsa_auth_token', authToken);
      logInfo('Auth token initialized for user:', user.email);
      return authToken;
    } catch (error) {
      logError('Failed to initialize auth token', error);
    }
  }

  /**
   * Get all users with pagination and filters
   * الحصول على جميع المستخدمين مع التصفح والفلاتر
   */
  async getUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        role = '',
        status = '',
        membershipType = '',
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      const params = {
        page,
        limit,
        search,
        role,
        status,
        membership_type: membershipType,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      // Try to get from API first
      const response = await unifiedApiService.request(`${this.baseEndpoint}`, {
        method: 'GET',
        params
      });

      if (response.success) {
        // Cache the result
        this.saveUsersToStorage(response.data.users || []);

        return {
          success: true,
          data: response.data.users || [],
          pagination: response.data.pagination || {},
          total: response.data.total || 0
        };
      }

      // Fallback to local storage
      const localUsers = this.getUsersFromStorage();
      if (localUsers.length > 0) {
        return this.filterAndPaginateUsers(localUsers, options);
      }

      // Final fallback with mock data
      return this.getMockUsers(options);

    } catch (error) {
      logError('Failed to get users', error);

      // Try local storage first
      const localUsers = this.getUsersFromStorage();
      if (localUsers.length > 0) {
        return this.filterAndPaginateUsers(localUsers, options);
      }

      return this.getMockUsers(options);
    }
  }

  /**
   * Get user by ID
   * الحصول على مستخدم بالمعرف
   */
  async getUserById(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Check cache first
      const cacheKey = `user_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const response = await unifiedApiService.request(`${this.baseEndpoint}/${userId}`, {
        method: 'GET'
      });

      if (response.success) {
        // Cache the result
        this.setCache(cacheKey, response.data);
        
        return {
          success: true,
          data: response.data
        };
      }

      // Fallback with mock data
      return this.getMockUserById(userId);

    } catch (error) {
      logError('Failed to get user by ID', error);
      return this.getMockUserById(userId);
    }
  }

  /**
   * Create new user
   * إنشاء مستخدم جديد
   */
  async createUser(userData) {
    try {
      // Validate user data
      const validatedData = this.validateUserData(userData);

      // Try API first
      const response = await unifiedApiService.request(`${this.baseEndpoint}`, {
        method: 'POST',
        data: validatedData
      });

      if (response.success) {
        // Clear cache and update local storage
        this.clearUserCache();
        this.addUserToStorage(response.data);

        logInfo('User created successfully', { userId: response.data.id });

        return {
          success: true,
          data: response.data,
          message: 'تم إنشاء المستخدم بنجاح'
        };
      }

      // Fallback to local storage creation
      const newUser = this.createUserInStorage(validatedData);

      return {
        success: true,
        data: newUser,
        message: 'تم إنشاء المستخدم بنجاح (محلياً)'
      };

    } catch (error) {
      logError('Failed to create user', error);

      // Try local storage as final fallback
      try {
        const newUser = this.createUserInStorage(userData);
        return {
          success: true,
          data: newUser,
          message: 'تم إنشاء المستخدم بنجاح (محلياً)'
        };
      } catch (localError) {
        return {
          success: false,
          error: error.message || 'فشل في إنشاء المستخدم'
        };
      }
    }
  }

  /**
   * Update user
   * تحديث المستخدم
   */
  async updateUser(userId, userData) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Validate user data
      const validatedData = this.validateUserData(userData, true);

      const response = await unifiedApiService.request(`${this.baseEndpoint}/${userId}`, {
        method: 'PUT',
        data: validatedData
      });

      if (response.success) {
        // Clear cache
        this.clearUserCache();
        
        logInfo('User updated successfully', { userId });
        
        return {
          success: true,
          data: response.data,
          message: 'تم تحديث المستخدم بنجاح'
        };
      }

      // Fallback to local storage update
      const updatedUser = this.updateUserInStorage(userId, validatedData);

      return {
        success: true,
        data: updatedUser,
        message: 'تم تحديث المستخدم بنجاح (محلياً)'
      };

    } catch (error) {
      logError('Failed to update user', error);

      // Try local storage as final fallback
      try {
        const updatedUser = this.updateUserInStorage(userId, userData);
        return {
          success: true,
          data: updatedUser,
          message: 'تم تحديث المستخدم بنجاح (محلياً)'
        };
      } catch (localError) {
        return {
          success: false,
          error: error.message || 'فشل في تحديث المستخدم'
        };
      }
    }
  }

  /**
   * Delete user
   * حذف المستخدم
   */
  async deleteUser(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Try API first
      const response = await unifiedApiService.request(`${this.baseEndpoint}/${userId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        // Clear cache and remove from local storage
        this.clearUserCache();
        this.deleteUserFromStorage(userId);

        logInfo('User deleted successfully', { userId });

        return {
          success: true,
          message: 'تم حذف المستخدم بنجاح'
        };
      }

      // Fallback to local storage deletion
      this.deleteUserFromStorage(userId);

      return {
        success: true,
        message: 'تم حذف المستخدم بنجاح (محلياً)'
      };

    } catch (error) {
      logError('Failed to delete user', error);

      // Try local storage as final fallback
      try {
        this.deleteUserFromStorage(userId);
        return {
          success: true,
          message: 'تم حذف المستخدم بنجاح (محلياً)'
        };
      } catch (localError) {
        return {
          success: false,
          error: error.message || 'فشل في حذف المستخدم'
        };
      }
    }
  }

  /**
   * Update user role
   * تحديث دور المستخدم
   */
  async updateUserRole(userId, role) {
    try {
      if (!userId || !role) {
        throw new Error('User ID and role are required');
      }

      if (!Object.values(USER_ROLES).includes(role)) {
        throw new Error('Invalid user role');
      }

      const response = await unifiedApiService.request(`${this.baseEndpoint}/${userId}/role`, {
        method: 'PATCH',
        data: { role }
      });

      if (response.success) {
        // Clear cache
        this.clearUserCache();
        
        logInfo('User role updated successfully', { userId, role });
        
        return {
          success: true,
          data: response.data,
          message: 'تم تحديث دور المستخدم بنجاح'
        };
      }

      // Fallback with mock update
      return {
        success: true,
        data: { id: userId, role },
        message: 'تم تحديث دور المستخدم بنجاح (محاكاة)'
      };

    } catch (error) {
      logError('Failed to update user role', error);
      return {
        success: false,
        error: error.message || 'فشل في تحديث دور المستخدم'
      };
    }
  }

  /**
   * Update user status
   * تحديث حالة المستخدم
   */
  async updateUserStatus(userId, status) {
    try {
      if (!userId || !status) {
        throw new Error('User ID and status are required');
      }

      if (!Object.values(USER_STATUS).includes(status)) {
        throw new Error('Invalid user status');
      }

      const response = await unifiedApiService.request(`${this.baseEndpoint}/${userId}/status`, {
        method: 'PATCH',
        data: { status }
      });

      if (response.success) {
        // Clear cache
        this.clearUserCache();
        
        logInfo('User status updated successfully', { userId, status });
        
        return {
          success: true,
          data: response.data,
          message: 'تم تحديث حالة المستخدم بنجاح'
        };
      }

      // Fallback with mock update
      return {
        success: true,
        data: { id: userId, status },
        message: 'تم تحديث حالة المستخدم بنجاح (محاكاة)'
      };

    } catch (error) {
      logError('Failed to update user status', error);
      return {
        success: false,
        error: error.message || 'فشل في تحديث حالة المستخدم'
      };
    }
  }

  /**
   * Search users
   * البحث في المستخدمين
   */
  async searchUsers(query, options = {}) {
    try {
      if (!query || query.trim().length < 2) {
        return {
          success: true,
          data: [],
          total: 0
        };
      }

      const {
        limit = 10,
        role = '',
        status = 'active'
      } = options;

      const params = {
        q: query.trim(),
        limit,
        role,
        status
      };

      const response = await unifiedApiService.request(`${this.baseEndpoint}/search`, {
        method: 'GET',
        params
      });

      if (response.success) {
        return {
          success: true,
          data: response.data.users || [],
          total: response.data.total || 0
        };
      }

      // Fallback with mock search
      return this.searchMockUsers(query, options);

    } catch (error) {
      logError('Failed to search users', error);
      return this.searchMockUsers(query, options);
    }
  }

  /**
   * Get user statistics
   * الحصول على إحصائيات المستخدمين
   */
  async getUserStatistics() {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/statistics`, {
        method: 'GET'
      });

      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      }

      // Fallback with mock statistics
      return this.getMockUserStatistics();

    } catch (error) {
      logError('Failed to get user statistics', error);
      return this.getMockUserStatistics();
    }
  }

  /**
   * Validate user data
   * التحقق من صحة بيانات المستخدم
   */
  validateUserData(userData, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      // Required fields for creation
      if (!userData.email) {
        errors.push('البريد الإلكتروني مطلوب');
      }
      if (!userData.firstName) {
        errors.push('الاسم الأول مطلوب');
      }
      if (!userData.lastName) {
        errors.push('الاسم الأخير مطلوب');
      }
    }

    // Email validation
    if (userData.email && !this.isValidEmail(userData.email)) {
      errors.push('البريد الإلكتروني غير صحيح');
    }

    // Phone validation
    if (userData.phone && !this.isValidSaudiPhone(userData.phone)) {
      errors.push('رقم الهاتف غير صحيح');
    }

    // Role validation
    if (userData.role && !Object.values(USER_ROLES).includes(userData.role)) {
      errors.push('دور المستخدم غير صحيح');
    }

    // Status validation
    if (userData.status && !Object.values(USER_STATUS).includes(userData.status)) {
      errors.push('حالة المستخدم غير صحيحة');
    }

    // Membership type validation
    if (userData.membershipType && !Object.values(MEMBERSHIP_TYPES).includes(userData.membershipType)) {
      errors.push('نوع العضوية غير صحيح');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Return sanitized data
    return {
      email: userData.email?.toLowerCase().trim(),
      firstName: userData.firstName?.trim(),
      lastName: userData.lastName?.trim(),
      phone: userData.phone?.trim(),
      role: userData.role || USER_ROLES.MEMBER,
      status: userData.status || USER_STATUS.ACTIVE,
      membershipType: userData.membershipType || MEMBERSHIP_TYPES.REGULAR,
      bio: userData.bio?.trim(),
      organization: userData.organization?.trim(),
      position: userData.position?.trim(),
      interests: userData.interests || [],
      socialLinks: userData.socialLinks || {},
      preferences: userData.preferences || {},
      metadata: userData.metadata || {}
    };
  }

  /**
   * Validate email
   * التحقق من صحة البريد الإلكتروني
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Saudi phone number
   * التحقق من صحة رقم الهاتف السعودي
   */
  isValidSaudiPhone(phone) {
    const saudiPhoneRegex = /^(\+966|966|0)?5[0-9]{8}$/;
    return saudiPhoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Cache management
   * إدارة التخزين المؤقت
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearUserCache() {
    for (const key of this.cache.keys()) {
      if (key.startsWith('user_')) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Mock data methods for fallback
   * طرق البيانات الوهمية للاحتياط
   */
  getMockUsers(options = {}) {
    const { page = 1, limit = 20 } = options;
    
    const mockUsers = [
      {
        id: '1',
        email: 'admin@spsa.org.sa',
        firstName: 'أحمد',
        lastName: 'المحمد',
        role: USER_ROLES.ADMIN,
        status: USER_STATUS.ACTIVE,
        membershipType: MEMBERSHIP_TYPES.REGULAR,
        createdAt: '2024-01-15T10:00:00Z',
        lastLoginAt: '2024-12-29T14:30:00Z'
      },
      {
        id: '2',
        email: 'member@spsa.org.sa',
        firstName: 'فاطمة',
        lastName: 'العلي',
        role: USER_ROLES.MEMBER,
        status: USER_STATUS.ACTIVE,
        membershipType: MEMBERSHIP_TYPES.ACADEMIC,
        createdAt: '2024-02-20T09:15:00Z',
        lastLoginAt: '2024-12-28T16:45:00Z'
      }
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = mockUsers.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: mockUsers.length,
        totalPages: Math.ceil(mockUsers.length / limit)
      },
      total: mockUsers.length
    };
  }

  getMockUserById(userId) {
    const mockUser = {
      id: userId,
      email: 'user@spsa.org.sa',
      firstName: 'مستخدم',
      lastName: 'تجريبي',
      role: USER_ROLES.MEMBER,
      status: USER_STATUS.ACTIVE,
      membershipType: MEMBERSHIP_TYPES.REGULAR,
      bio: 'عضو في الجمعية السعودية للعلوم السياسية',
      organization: 'جامعة الملك سعود',
      position: 'أستاذ مساعد',
      interests: ['السياسة', 'العلاقات الدولية'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-12-29T12:00:00Z'
    };

    return {
      success: true,
      data: mockUser
    };
  }

  createMockUser(userData) {
    const mockUser = {
      id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: mockUser,
      message: 'تم إنشاء المستخدم بنجاح (محاكاة)'
    };
  }

  updateMockUser(userId, userData) {
    const mockUser = {
      id: userId,
      ...userData,
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: mockUser,
      message: 'تم تحديث المستخدم بنجاح (محاكاة)'
    };
  }

  deleteMockUser(userId) {
    return {
      success: true,
      message: 'تم حذف المستخدم بنجاح (محاكاة)'
    };
  }

  searchMockUsers(query, options = {}) {
    const mockResults = [
      {
        id: '1',
        email: 'search@spsa.org.sa',
        firstName: 'نتيجة',
        lastName: 'البحث',
        role: USER_ROLES.MEMBER,
        status: USER_STATUS.ACTIVE
      }
    ];

    return {
      success: true,
      data: mockResults,
      total: mockResults.length
    };
  }

  getMockUserStatistics() {
    return {
      success: true,
      data: {
        total: 150,
        active: 120,
        inactive: 20,
        suspended: 5,
        pending: 5,
        byRole: {
          [USER_ROLES.ADMIN]: 5,
          [USER_ROLES.MODERATOR]: 10,
          [USER_ROLES.MEMBER]: 130,
          [USER_ROLES.GUEST]: 5
        },
        byMembershipType: {
          [MEMBERSHIP_TYPES.REGULAR]: 80,
          [MEMBERSHIP_TYPES.STUDENT]: 40,
          [MEMBERSHIP_TYPES.ACADEMIC]: 25,
          [MEMBERSHIP_TYPES.HONORARY]: 3,
          [MEMBERSHIP_TYPES.CORPORATE]: 2
        },
        recentRegistrations: 15,
        activeToday: 45
      }
    };
  }

  /**
   * Get service status
   * الحصول على حالة الخدمة
   */
  getServiceStatus() {
    return {
      isInitialized: this.isInitialized,
      baseEndpoint: this.baseEndpoint,
      cacheSize: this.cache.size,
      isEnabled: getFeatureFlag('ENABLE_USER_MANAGEMENT_API')
    };
  }

  /**
   * Local Storage Methods
   * طرق التخزين المحلي
   */

  /**
   * Save users to local storage
   * حفظ المستخدمين في التخزين المحلي
   */
  saveUsersToStorage(users) {
    try {
      localStorageService.setItem(this.usersStorageKey, users);
      // إنشاء نسخة احتياطية تلقائية
      localStorageService.autoBackupUsers();
      logInfo('Users saved to local storage', { count: users.length });
    } catch (error) {
      logError('Failed to save users to storage', error);
    }
  }

  /**
   * Get users from local storage
   * الحصول على المستخدمين من التخزين المحلي
   */
  getUsersFromStorage() {
    try {
      let users = localStorageService.getItem(this.usersStorageKey) || [];
      users = Array.isArray(users) ? users : [];

      // إذا لم توجد بيانات، حاول الاستعادة من النسخة الاحتياطية
      if (users.length === 0) {
        const restored = localStorageService.restoreUsersFromAutoBackup();
        if (restored) {
          users = localStorageService.getItem(this.usersStorageKey) || [];
          users = Array.isArray(users) ? users : [];
          logInfo('Users restored from automatic backup', { count: users.length });
        }
      }

      return users;
    } catch (error) {
      logError('Failed to get users from storage', error);
      return [];
    }
  }

  /**
   * Add user to local storage
   * إضافة مستخدم إلى التخزين المحلي
   */
  addUserToStorage(user) {
    try {
      const users = this.getUsersFromStorage();
      const existingIndex = users.findIndex(u => u.id === user.id);

      if (existingIndex >= 0) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }

      this.saveUsersToStorage(users);
      logInfo('User added to local storage', { userId: user.id });
    } catch (error) {
      logError('Failed to add user to storage', error);
    }
  }

  /**
   * Create user in local storage
   * إنشاء مستخدم في التخزين المحلي
   */
  createUserInStorage(userData) {
    const newUser = {
      id: this.generateUserId(),
      email: userData.email,
      firstName: userData.firstName || userData.name?.split(' ')[0] || '',
      lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
      role: userData.role || USER_ROLES.MEMBER,
      status: userData.status || USER_STATUS.ACTIVE,
      membershipType: userData.membershipType || MEMBERSHIP_TYPES.REGULAR,
      phone: userData.phone || '',
      specialization: userData.specialization || '',
      workplace: userData.workplace || '',
      academicDegree: userData.academicDegree || '',
      isActive: true,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
      profilePicture: null
    };

    this.addUserToStorage(newUser);
    return newUser;
  }

  /**
   * Update user in local storage
   * تحديث مستخدم في التخزين المحلي
   */
  updateUserInStorage(userId, userData) {
    try {
      const users = this.getUsersFromStorage();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex >= 0) {
        users[userIndex] = {
          ...users[userIndex],
          ...userData,
          updatedAt: new Date().toISOString()
        };

        this.saveUsersToStorage(users);
        logInfo('User updated in local storage', { userId });
        return users[userIndex];
      }

      throw new Error('User not found');
    } catch (error) {
      logError('Failed to update user in storage', error);
      throw error;
    }
  }

  /**
   * Delete user from local storage
   * حذف مستخدم من التخزين المحلي
   */
  deleteUserFromStorage(userId) {
    try {
      const users = this.getUsersFromStorage();
      const filteredUsers = users.filter(u => u.id !== userId);

      this.saveUsersToStorage(filteredUsers);
      logInfo('User deleted from local storage', { userId });
    } catch (error) {
      logError('Failed to delete user from storage', error);
      throw error;
    }
  }

  /**
   * Filter and paginate users
   * فلترة وتصفح المستخدمين
   */
  filterAndPaginateUsers(users, options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      status = '',
      membershipType = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    let filteredUsers = [...users];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    // Apply status filter
    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    // Apply membership type filter
    if (membershipType && membershipType !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.membershipType === membershipType);
    }

    // Apply sorting
    filteredUsers.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';

      if (sortOrder === 'desc') {
        return bValue.localeCompare(aValue);
      } else {
        return aValue.localeCompare(bValue);
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit)
      },
      total: filteredUsers.length
    };
  }

  /**
   * Generate unique user ID
   * إنشاء معرف فريد للمستخدم
   */
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Create and export singleton instance
const userManagementApi = new UserManagementApi();

export default userManagementApi;
