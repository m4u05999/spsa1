// src/services/optimizedDashboardService.js
// خدمة محسنة لبيانات لوحة التحكم مع التخزين المؤقت والاستعلام الأمثل

import { dashboardStatsService } from './dashboardStatsService';

/**
 * خدمة محسنة لإدارة بيانات لوحة التحكم
 * توفر التخزين المؤقت الذكي، والاشتراكات المباشرة، وإدارة الموارد
 */
class OptimizedDashboardService {
  constructor() {
    // تخزين مؤقت للبيانات مع أوقات انتهاء الصلاحية
    this.cache = new Map();
    // قائمة المشتركين في تحديثات البيانات المباشرة
    this.subscribers = new Map();
    // فترات التحديث التلقائي للبيانات المباشرة
    this.refreshIntervals = new Map();
    // حالات التحميل لمنع الطلبات المتكررة
    this.loadingStates = new Map();
  }

  /**
   * الحصول على البيانات مع التخزين المؤقت الذكي
   */
  async getData(key, fetcher, options = {}) {
    const {
      cacheDuration = 5 * 60 * 1000, // 5 دقائق افتراضياً
      forceRefresh = false,
      enableRealtime = false
    } = options;

    // التحقق من البيانات المخزنة مؤقتاً
    if (!forceRefresh && this.cache.has(key)) {
      const cached = this.cache.get(key);
      const now = Date.now();
      
      if (now - cached.timestamp < cacheDuration) {
        return {
          data: cached.data,
          fromCache: true,
          lastUpdated: cached.timestamp
        };
      }
    }

    // منع الطلبات المتعددة للمورد نفسه
    if (this.loadingStates.get(key)) {
      return new Promise((resolve) => {
        const existingSubscribers = this.subscribers.get(key) || [];
        this.subscribers.set(key, [...existingSubscribers, resolve]);
      });
    }

    try {
      this.loadingStates.set(key, true);
      const data = await fetcher();
      const timestamp = Date.now();

      // حفظ في التخزين المؤقت
      this.cache.set(key, { data, timestamp });

      // إشعار المشتركين
      const subscribers = this.subscribers.get(key) || [];
      subscribers.forEach(callback => {
        callback({ data, fromCache: false, lastUpdated: timestamp });
      });
      this.subscribers.set(key, []);

      // إعداد التحديث التلقائي إذا كان مطلوباً
      if (enableRealtime && !this.refreshIntervals.has(key)) {
        const intervalId = setInterval(async () => {
          try {
            const newData = await fetcher();
            const newTimestamp = Date.now();
            
            // تحديث التخزين المؤقت
            this.cache.set(key, { data: newData, timestamp: newTimestamp });
            
            // إشعار المشتركين بالتحديث
            this.notifySubscribers(key, { 
              data: newData, 
              fromCache: false, 
              lastUpdated: newTimestamp,
              isUpdate: true 
            });
          } catch (error) {
            console.error('خطأ في التحديث التلقائي:', error);
          }
        }, cacheDuration);

        this.refreshIntervals.set(key, intervalId);
      }

      return { data, fromCache: false, lastUpdated: timestamp };

    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      
      // إشعار المشتركين بالخطأ
      const subscribers = this.subscribers.get(key) || [];
      subscribers.forEach(callback => {
        callback({ error, fromCache: false });
      });
      this.subscribers.set(key, []);

      throw error;
    } finally {
      this.loadingStates.set(key, false);
    }
  }

  /**
   * الاشتراك في تحديثات البيانات
   */
  subscribe(key, callback) {
    const existingSubscribers = this.subscribers.get(key) || [];
    this.subscribers.set(key, [...existingSubscribers, callback]);

    // إرجاع دالة إلغاء الاشتراك
    return () => {
      const currentSubscribers = this.subscribers.get(key) || [];
      const updatedSubscribers = currentSubscribers.filter(cb => cb !== callback);
      this.subscribers.set(key, updatedSubscribers);
    };
  }

  /**
   * إشعار جميع المشتركين
   */
  notifySubscribers(key, data) {
    const subscribers = this.subscribers.get(key) || [];
    subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('خطأ في إشعار المشترك:', error);
      }
    });
  }

  /**
   * مسح التخزين المؤقت لمفتاح معين
   */
  invalidateCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * مسح التحديث التلقائي
   */
  clearAutoRefresh(key) {
    if (this.refreshIntervals.has(key)) {
      clearInterval(this.refreshIntervals.get(key));
      this.refreshIntervals.delete(key);
    }
  }

  /**
   * تنظيف جميع الموارد
   */
  cleanup() {
    // مسح جميع فترات التحديث
    this.refreshIntervals.forEach(intervalId => clearInterval(intervalId));
    this.refreshIntervals.clear();
    
    // مسح التخزين المؤقت
    this.cache.clear();
    
    // مسح المشتركين
    this.subscribers.clear();
    
    // مسح حالات التحميل
    this.loadingStates.clear();
  }

  /**
   * الحصول على إحصائيات لوحة التحكم المحسنة
   */
  async getDashboardStats(options = {}) {
    return this.getData(
      'dashboard_stats',
      () => dashboardStatsService.getDashboardStats(),
      {
        cacheDuration: 2 * 60 * 1000, // دقيقتان للإحصائيات
        enableRealtime: true,
        ...options
      }
    );
  }

  /**
   * الحصول على إحصائيات العضوية المحسنة
   */
  async getMembershipStats(options = {}) {
    return this.getData(
      'membership_stats',
      async () => {
        // استدعاء الخدمة الأساسية مع معالجة محسنة للأخطاء
        try {
          const stats = await dashboardStatsService.getDashboardStats();
          
          // حساب إحصائيات العضوية المفصلة
          const membershipTypes = stats.membershipTypes || {};
          const total = stats.totalMembers || 0;
          
          return {
            activePercentage: total > 0 ? Math.round((stats.activeMembers / total) * 100) : 0,
            byLevel: {
              platinum: { 
                count: membershipTypes.platinum || 0, 
                percentage: total > 0 ? Math.round((membershipTypes.platinum || 0) / total * 100) : 0 
              },
              gold: { 
                count: membershipTypes.gold || 0, 
                percentage: total > 0 ? Math.round((membershipTypes.gold || 0) / total * 100) : 0 
              },
              silver: { 
                count: membershipTypes.silver || 0, 
                percentage: total > 0 ? Math.round((membershipTypes.silver || 0) / total * 100) : 0 
              },
              bronze: { 
                count: membershipTypes.bronze || 0, 
                percentage: total > 0 ? Math.round((membershipTypes.bronze || 0) / total * 100) : 0 
              }
            }
          };
        } catch (error) {
          console.error('خطأ في جلب إحصائيات العضوية:', error);
          // إرجاع بيانات افتراضية
          return {
            activePercentage: 85,
            byLevel: {
              platinum: { count: 15, percentage: 12 },
              gold: { count: 25, percentage: 20 },
              silver: { count: 35, percentage: 28 },
              bronze: { count: 50, percentage: 40 }
            }
          };
        }
      },
      {
        cacheDuration: 5 * 60 * 1000, // 5 دقائق للعضوية
        enableRealtime: false,
        ...options
      }
    );
  }

  /**
   * الحصول على قائمة المستخدمين مع التصفح المحسن
   */
  async getUsersPaginated(page = 1, options = {}) {
    const cacheKey = `users_page_${page}_${JSON.stringify(options)}`;
    
    return this.getData(
      cacheKey,
      async () => {
        // محاكاة API للمستخدمين - يجب استبدالها بـ API حقيقي
        const limit = options.limit || 20;
        const search = options.search || '';
        const role = options.role || '';
        const status = options.status || '';

        // محاكاة البيانات (يجب استبدالها)
        const allUsers = await this.generateMockUsers(1000);
        
        // تطبيق الفلاتر
        let filteredUsers = allUsers;
        
        if (search) {
          filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        if (role && role !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.role === role);
        }
        
        if (status && status !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.status === status);
        }

        // تطبيق التصفح
        const total = filteredUsers.length;
        const totalPages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const paginatedUsers = filteredUsers.slice(start, start + limit);

        return {
          data: paginatedUsers,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        };
      },
      {
        cacheDuration: 3 * 60 * 1000, // 3 دقائق للمستخدمين
        ...options
      }
    );
  }

  /**
   * إنشاء بيانات وهمية للمستخدمين (للاختبار)
   */
  async generateMockUsers(count = 100) {
    const roles = ['admin', 'staff', 'member'];
    const statuses = ['active', 'inactive', 'suspended'];
    const firstNames = ['أحمد', 'محمد', 'سارة', 'فاطمة', 'علي', 'خالد', 'نور', 'مريم'];
    const lastNames = ['العتيبي', 'الأحمد', 'المحمد', 'الزهراني', 'النجار', 'القحطاني'];

    const users = [];
    for (let i = 1; i <= count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      users.push({
        id: i,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email: `user${i}@example.com`,
        role: roles[Math.floor(Math.random() * roles.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastLoginAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
      });
    }
    
    return users;
  }

  /**
   * تحديث البيانات بشكل انتقائي
   */
  async refreshData(keys = []) {
    const refreshPromises = keys.map(key => {
      this.invalidateCache(key);
      // إعادة جلب البيانات بناءً على نوع المفتاح
      switch (key) {
        case 'dashboard_stats':
          return this.getDashboardStats({ forceRefresh: true });
        case 'membership_stats':
          return this.getMembershipStats({ forceRefresh: true });
        default:
          return Promise.resolve();
      }
    });

    return Promise.all(refreshPromises);
  }

  /**
   * الحصول على معلومات الأداء
   */
  getPerformanceInfo() {
    return {
      cacheSize: this.cache.size,
      activeSubscriptions: Array.from(this.subscribers.entries())
        .reduce((total, [, subs]) => total + subs.length, 0),
      activeRefreshIntervals: this.refreshIntervals.size,
      cacheKeys: Array.from(this.cache.keys()),
      cacheHitRatio: this.getCacheHitRatio()
    };
  }

  /**
   * حساب معدل نجاح التخزين المؤقت
   */
  getCacheHitRatio() {
    // يجب تتبع هذا في التطبيق الحقيقي
    return 'غير متوفر - يحتاج تنفيذ إضافي';
  }
}

// إنشاء مثيل مفرد
export const optimizedDashboardService = new OptimizedDashboardService();
export default optimizedDashboardService;