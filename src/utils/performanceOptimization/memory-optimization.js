// memory-optimization.js - نظام تحسين إدارة الذاكرة المتقدم
// تطوير: اختصاصي تحسين الأداء والذكاء الاصطناعي

export class MemoryOptimizer {
  constructor() {
    this.cleanupTasks = new Set();
    this.memoryCache = new Map();
    this.weakReferences = new WeakMap();
    this.intervals = new Set();
    this.observers = new Set();
    this.eventListeners = new Map();
    this.memoryStats = {
      allocations: 0,
      deallocations: 0,
      peakUsage: 0,
      currentUsage: 0
    };
  }

  // بدء نظام تحسين الذاكرة
  initialize() {
    console.log('🧠 تهيئة نظام تحسين الذاكرة');
    
    // مراقبة استخدام الذاكرة
    this.startMemoryMonitoring();
    
    // تنظيف دوري
    this.schedulePeriodicCleanup();
    
    // معالجة تسريبات الذاكرة الشائعة
    this.setupMemoryLeakPrevention();
    
    // تحسين garbage collection
    this.optimizeGarbageCollection();
  }

  // مراقبة استخدام الذاكرة
  startMemoryMonitoring() {
    if (!performance.memory) {
      console.warn('Memory API غير مدعوم في هذا المتصفح');
      return;
    }

    const monitorInterval = setInterval(() => {
      const memInfo = performance.memory;
      const currentUsage = memInfo.usedJSHeapSize / (1024 * 1024); // MB
      
      this.memoryStats.currentUsage = currentUsage;
      if (currentUsage > this.memoryStats.peakUsage) {
        this.memoryStats.peakUsage = currentUsage;
      }

      // تنبيه عند الاستخدام المرتفع
      if (currentUsage > 100) { // أكثر من 100MB
        this.handleHighMemoryUsage(currentUsage);
      }

      // تنظيف تلقائي عند الحاجة
      if (currentUsage > 150) { // أكثر من 150MB
        this.performAggressiveCleanup();
      }

    }, 10000); // كل 10 ثوانٍ

    this.intervals.add(monitorInterval);
  }

  // جدولة التنظيف الدوري
  schedulePeriodicCleanup() {
    const cleanupInterval = setInterval(() => {
      this.performRoutineCleanup();
    }, 60000); // كل دقيقة

    this.intervals.add(cleanupInterval);
  }

  // منع تسريبات الذاكرة الشائعة
  setupMemoryLeakPrevention() {
    // مراقبة DOM mutations لتنظيف المراجع
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.cleanupElementReferences(node);
            }
          });
        }
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.add(mutationObserver);
  }

  // تحسين garbage collection
  optimizeGarbageCollection() {
    // تشغيل GC يدوياً في أوقات الخمول
    if ('requestIdleCallback' in window) {
      const scheduleGC = () => {
        window.requestIdleCallback((deadline) => {
          if (window.gc && deadline.timeRemaining() > 50) {
            try {
              window.gc();
              this.memoryStats.deallocations++;
            } catch (e) {
              // GC غير متوفر
            }
          }
          
          // جدولة التالية
          setTimeout(scheduleGC, 30000); // كل 30 ثانية
        });
      };
      
      scheduleGC();
    }
  }

  // إنشاء مرجع ضعيف آمن
  createWeakReference(target, metadata = {}) {
    const ref = {
      target,
      metadata,
      created: Date.now()
    };
    
    this.weakReferences.set(target, ref);
    return ref;
  }

  // تسجيل مهمة تنظيف
  registerCleanupTask(task, priority = 'normal') {
    const cleanupTask = {
      id: Date.now() + Math.random(),
      task,
      priority,
      registered: Date.now()
    };
    
    this.cleanupTasks.add(cleanupTask);
    return cleanupTask.id;
  }

  // إلغاء تسجيل مهمة تنظيف
  unregisterCleanupTask(taskId) {
    this.cleanupTasks.forEach(task => {
      if (task.id === taskId) {
        this.cleanupTasks.delete(task);
      }
    });
  }

  // تسجيل event listener مع تنظيف تلقائي
  addManagedEventListener(element, event, handler, options = {}) {
    const key = `${element.tagName}_${event}_${Date.now()}`;
    
    // إضافة wrapper للتنظيف التلقائي
    const wrappedHandler = (e) => {
      try {
        handler(e);
      } catch (error) {
        console.error('خطأ في معالج الحدث:', error);
        this.removeManagedEventListener(key);
      }
    };
    
    element.addEventListener(event, wrappedHandler, options);
    
    this.eventListeners.set(key, {
      element,
      event,
      handler: wrappedHandler,
      originalHandler: handler,
      options,
      created: Date.now()
    });
    
    return key;
  }

  // إزالة event listener مُدار
  removeManagedEventListener(key) {
    const listener = this.eventListeners.get(key);
    if (listener) {
      listener.element.removeEventListener(
        listener.event, 
        listener.handler, 
        listener.options
      );
      this.eventListeners.delete(key);
    }
  }

  // تحسين cache مع إدارة ذكية للذاكرة
  setCache(key, value, options = {}) {
    const {
      maxAge = 300000, // 5 دقائق افتراضياً
      maxSize = 100,   // حد أقصى 100 عنصر
      priority = 'normal'
    } = options;

    // تنظيف العناصر القديمة إذا امتلأ الcache
    if (this.memoryCache.size >= maxSize) {
      this.cleanupExpiredCacheEntries();
      
      // إذا لا يزال ممتلئاً، احذف الأقدم
      if (this.memoryCache.size >= maxSize) {
        this.evictLeastRecentlyUsed();
      }
    }

    const cacheEntry = {
      value,
      created: Date.now(),
      accessed: Date.now(),
      maxAge,
      priority,
      size: this.estimateObjectSize(value)
    };

    this.memoryCache.set(key, cacheEntry);
    this.memoryStats.allocations++;
  }

  // الحصول من الcache
  getCache(key) {
    const entry = this.memoryCache.get(key);
    
    if (!entry) return null;
    
    // فحص انتهاء الصلاحية
    if (Date.now() - entry.created > entry.maxAge) {
      this.memoryCache.delete(key);
      return null;
    }
    
    // تحديث وقت الوصول
    entry.accessed = Date.now();
    
    return entry.value;
  }

  // تقدير حجم الكائن في الذاكرة
  estimateObjectSize(obj) {
    if (obj === null || obj === undefined) return 0;
    
    if (typeof obj === 'string') return obj.length * 2; // UTF-16
    if (typeof obj === 'number') return 8; // 64-bit
    if (typeof obj === 'boolean') return 1;
    
    if (Array.isArray(obj)) {
      return obj.reduce((total, item) => total + this.estimateObjectSize(item), 0);
    }
    
    if (typeof obj === 'object') {
      return Object.keys(obj).reduce((total, key) => {
        return total + key.length * 2 + this.estimateObjectSize(obj[key]);
      }, 0);
    }
    
    return 0;
  }

  // تنظيف دوري روتيني
  performRoutineCleanup() {
    console.log('🧹 تنفيذ التنظيف الدوري');
    
    // تنظيف cache منتهي الصلاحية
    this.cleanupExpiredCacheEntries();
    
    // تنظيف event listeners القديمة
    this.cleanupStaleEventListeners();
    
    // تنفيذ مهام التنظيف المسجلة
    this.executeCleanupTasks('normal');
    
    // تنظيف DOM references
    this.cleanupDOMReferences();
  }

  // تنظيف قوي للذاكرة
  performAggressiveCleanup() {
    console.log('🚨 تنفيذ تنظيف قوي للذاكرة');
    
    // تنظيف فوري لجميع مهام التنظيف
    this.executeCleanupTasks('all');
    
    // مسح cache غير الحرج
    this.clearNonCriticalCache();
    
    // تنظيف observers غير المستخدمة
    this.cleanupUnusedObservers();
    
    // إجبار garbage collection إذا أمكن
    this.forceGarbageCollection();
  }

  // تنظيف عناصر cache منتهية الصلاحية
  cleanupExpiredCacheEntries() {
    const now = Date.now();
    const toDelete = [];
    
    this.memoryCache.forEach((entry, key) => {
      if (now - entry.created > entry.maxAge) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => {
      this.memoryCache.delete(key);
      this.memoryStats.deallocations++;
    });
    
    if (toDelete.length > 0) {
      console.log(`🗑️ تم حذف ${toDelete.length} عنصر منتهي الصلاحية من cache`);
    }
  }

  // طرد العناصر الأقل استخداماً
  evictLeastRecentlyUsed() {
    const entries = Array.from(this.memoryCache.entries());
    
    // ترتيب حسب آخر وصول وأولوية
    entries.sort(([, a], [, b]) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { 'low': 0, 'normal': 1, 'high': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.accessed - b.accessed;
    });
    
    // حذف أقدم 20%
    const toDelete = entries.slice(0, Math.ceil(entries.length * 0.2));
    toDelete.forEach(([key]) => {
      this.memoryCache.delete(key);
      this.memoryStats.deallocations++;
    });
  }

  // تنظيف event listeners القديمة
  cleanupStaleEventListeners() {
    const now = Date.now();
    const staleAge = 3600000; // ساعة واحدة
    const toRemove = [];
    
    this.eventListeners.forEach((listener, key) => {
      // فحص إذا كان العنصر لا يزال في DOM
      if (!document.contains(listener.element) || 
          now - listener.created > staleAge) {
        toRemove.push(key);
      }
    });
    
    toRemove.forEach(key => this.removeManagedEventListener(key));
  }

  // تنفيذ مهام التنظيف
  executeCleanupTasks(mode = 'normal') {
    const tasksToExecute = Array.from(this.cleanupTasks);
    
    if (mode === 'normal') {
      // تنفيذ المهام العادية والعالية الأولوية فقط
      tasksToExecute.filter(task => 
        task.priority === 'normal' || task.priority === 'high'
      );
    }
    
    tasksToExecute.forEach(cleanupTask => {
      try {
        cleanupTask.task();
        this.cleanupTasks.delete(cleanupTask);
      } catch (error) {
        console.error('خطأ في تنفيذ مهمة التنظيف:', error);
      }
    });
  }

  // تنظيف مراجع DOM
  cleanupDOMReferences() {
    // تنظيف weak references للعناصر المحذوفة
    const toDelete = [];
    
    this.weakReferences.forEach((ref, target) => {
      if (target.nodeType === Node.ELEMENT_NODE && 
          !document.contains(target)) {
        toDelete.push(target);
      }
    });
    
    toDelete.forEach(target => {
      this.weakReferences.delete(target);
    });
  }

  // تنظيف مراجع عنصر محدد
  cleanupElementReferences(element) {
    // تنظيف event listeners خاصة بالعنصر
    this.eventListeners.forEach((listener, key) => {
      if (listener.element === element || 
          element.contains(listener.element)) {
        this.removeManagedEventListener(key);
      }
    });
    
    // تنظيف weak references
    this.weakReferences.delete(element);
  }

  // مسح cache غير الحرج
  clearNonCriticalCache() {
    const criticalKeys = new Set(['userAuth', 'dashboardStats', 'criticalConfig']);
    const toDelete = [];
    
    this.memoryCache.forEach((entry, key) => {
      if (!criticalKeys.has(key) && entry.priority !== 'high') {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => this.memoryCache.delete(key));
  }

  // تنظيف observers غير المستخدمة
  cleanupUnusedObservers() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('خطأ في إيقاف observer:', error);
      }
    });
    
    this.observers.clear();
  }

  // إجبار garbage collection
  forceGarbageCollection() {
    if (window.gc) {
      try {
        window.gc();
        console.log('✅ تم تشغيل garbage collection يدوياً');
      } catch (error) {
        console.warn('فشل في تشغيل garbage collection:', error);
      }
    }
  }

  // معالجة الاستخدام المرتفع للذاكرة
  handleHighMemoryUsage(currentUsage) {
    console.warn(`⚠️ استخدام ذاكرة مرتفع: ${Math.round(currentUsage)}MB`);
    
    // إرسال تنبيه
    if (window.performanceMonitor) {
      window.performanceMonitor.createAlert(
        'High Memory Usage',
        currentUsage,
        100,
        'high'
      );
    }
    
    // تنظيف تدريجي
    setTimeout(() => this.performRoutineCleanup(), 1000);
  }

  // الحصول على إحصائيات الذاكرة
  getMemoryStats() {
    const memInfo = performance.memory;
    
    return {
      current: memInfo ? Math.round(memInfo.usedJSHeapSize / (1024 * 1024)) : 0,
      total: memInfo ? Math.round(memInfo.totalJSHeapSize / (1024 * 1024)) : 0,
      limit: memInfo ? Math.round(memInfo.jsHeapSizeLimit / (1024 * 1024)) : 0,
      peak: Math.round(this.memoryStats.peakUsage),
      allocations: this.memoryStats.allocations,
      deallocations: this.memoryStats.deallocations,
      cacheSize: this.memoryCache.size,
      eventListeners: this.eventListeners.size,
      cleanupTasks: this.cleanupTasks.size,
      observers: this.observers.size
    };
  }

  // إنشاء تقرير تحسين الذاكرة
  generateOptimizationReport() {
    const stats = this.getMemoryStats();
    const recommendations = [];
    
    // توصيات بناءً على الاستخدام
    if (stats.current > 100) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'استخدام ذاكرة مرتفع - يُنصح بتحسين إدارة البيانات',
        actions: [
          'تقليل حجم cache',
          'تحسين إدارة DOM',
          'مراجعة تسريبات الذاكرة المحتملة'
        ]
      });
    }
    
    if (this.eventListeners.size > 100) {
      recommendations.push({
        type: 'eventListeners',
        priority: 'medium',
        message: 'عدد كبير من event listeners',
        actions: [
          'استخدام event delegation',
          'تنظيف listeners غير المستخدمة',
          'استخدام managed listeners'
        ]
      });
    }
    
    return {
      timestamp: Date.now(),
      stats,
      recommendations,
      performance: this.calculatePerformanceScore()
    };
  }

  // حساب نقاط الأداء
  calculatePerformanceScore() {
    const stats = this.getMemoryStats();
    let score = 100;
    
    // خصم نقاط للاستخدام المرتفع
    if (stats.current > 100) score -= 20;
    if (stats.current > 150) score -= 30;
    
    // خصم نقاط للتسريبات المحتملة
    if (this.eventListeners.size > 100) score -= 10;
    if (this.cleanupTasks.size > 50) score -= 10;
    
    return Math.max(0, score);
  }

  // تنظيف شامل عند إنهاء التطبيق
  cleanup() {
    console.log('🧹 تنظيف شامل لمحسن الذاكرة');
    
    // إيقاف جميع الintervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    
    // إيقاف observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // تنظيف event listeners
    this.eventListeners.forEach((_, key) => {
      this.removeManagedEventListener(key);
    });
    
    // مسح caches
    this.memoryCache.clear();
    this.cleanupTasks.clear();
    this.weakReferences = new WeakMap();
    
    // تشغيل GC أخير
    this.forceGarbageCollection();
  }
}

// React Hook لاستخدام محسن الذاكرة
export function useMemoryOptimization() {
  const [memoryStats, setMemoryStats] = React.useState(null);
  
  React.useEffect(() => {
    const optimizer = new MemoryOptimizer();
    optimizer.initialize();
    
    // تحديث الإحصائيات كل 30 ثانية
    const updateStats = () => {
      setMemoryStats(optimizer.getMemoryStats());
    };
    
    updateStats();
    const interval = setInterval(updateStats, 30000);
    
    return () => {
      clearInterval(interval);
      optimizer.cleanup();
    };
  }, []);
  
  return { memoryStats };
}

// تصدير singleton instance
export const memoryOptimizer = new MemoryOptimizer();

// تهيئة تلقائية
if (typeof window !== 'undefined') {
  memoryOptimizer.initialize();
  
  // تنظيف عند إغلاق الصفحة
  window.addEventListener('beforeunload', () => {
    memoryOptimizer.cleanup();
  });
  
  // جعل المحسن متاحاً عالمياً للتطوير
  if (process.env.NODE_ENV === 'development') {
    window.memoryOptimizer = memoryOptimizer;
  }
}