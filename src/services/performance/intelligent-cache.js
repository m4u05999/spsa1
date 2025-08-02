// intelligent-cache.js - نظام التخزين المؤقت الذكي المتقدم
// تطوير: اختصاصي تحسين الأداء والذكاء الاصطناعي

export class IntelligentCacheSystem {
  constructor() {
    this.caches = new Map();
    this.strategies = new Map();
    this.analytics = new Map();
    this.predictor = new CachePredictor();
    this.hitRates = new Map();
    this.accessPatterns = new Map();
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageLatency: 0,
      memoryUsage: 0
    };
    
    this.initialize();
  }

  // تهيئة النظام
  async initialize() {
    console.log('🧠 تهيئة نظام التخزين المؤقت الذكي');
    
    try {
      // تهيئة استراتيجيات التخزين
      this.initializeCacheStrategies();
      
      // تهيئة متنبئ التخزين المؤقت
      await this.predictor.initialize();
      
      // بدء مراقبة الأداء
      this.startPerformanceMonitoring();
      
      // بدء التنظيف التلقائي
      this.scheduleAutomaticCleanup();
      
      console.log('✅ تم تهيئة نظام التخزين المؤقت الذكي بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تهيئة نظام التخزين المؤقت:', error);
    }
  }

  // تهيئة استراتيجيات التخزين
  initializeCacheStrategies() {
    // استراتيجية LRU (Least Recently Used)
    this.strategies.set('lru', {
      name: 'LRU',
      description: 'إزالة الأقل استخداماً حديثاً',
      implement: this.implementLRU.bind(this),
      priority: 'medium'
    });

    // استراتيجية LFU (Least Frequently Used)
    this.strategies.set('lfu', {
      name: 'LFU',
      description: 'إزالة الأقل استخداماً تكراراً',
      implement: this.implementLFU.bind(this),
      priority: 'high'
    });

    // استراتيجية TTL (Time To Live)
    this.strategies.set('ttl', {
      name: 'TTL',
      description: 'انتهاء صلاحية بناءً على الوقت',
      implement: this.implementTTL.bind(this),
      priority: 'high'
    });

    // استراتيجية ذكية هجينة
    this.strategies.set('intelligent', {
      name: 'Intelligent',
      description: 'استراتيجية ذكية تتعلم من الاستخدام',
      implement: this.implementIntelligentStrategy.bind(this),
      priority: 'highest'
    });

    // استراتيجية تنبؤية
    this.strategies.set('predictive', {
      name: 'Predictive',
      description: 'تحميل مسبق بناءً على التوقعات',
      implement: this.implementPredictiveStrategy.bind(this),
      priority: 'high'
    });
  }

  // إنشاء cache جديد مع استراتيجية محددة
  createCache(name, options = {}) {
    const {
      maxSize = 100,
      maxMemory = 50 * 1024 * 1024, // 50MB
      strategy = 'intelligent',
      ttl = 300000, // 5 دقائق
      persistent = false,
      compression = false,
      encryption = false
    } = options;

    const cache = {
      name,
      data: new Map(),
      metadata: new Map(),
      options: {
        maxSize,
        maxMemory,
        strategy,
        ttl,
        persistent,
        compression,
        encryption
      },
      stats: {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        memoryUsage: 0,
        created: Date.now(),
        lastAccess: Date.now()
      },
      accessLog: []
    };

    this.caches.set(name, cache);
    this.analytics.set(name, new CacheAnalytics(name));
    
    // تحميل البيانات المحفوظة إذا كان persistent
    if (persistent) {
      this.loadPersistentData(cache);
    }

    console.log(`📦 تم إنشاء cache: ${name} بالاستراتيجية: ${strategy}`);
    return cache;
  }

  // حفظ قيمة في الcache
  async set(cacheName, key, value, options = {}) {
    const startTime = performance.now();
    
    try {
      const cache = this.caches.get(cacheName);
      if (!cache) {
        throw new Error(`Cache غير موجود: ${cacheName}`);
      }

      const {
        ttl = cache.options.ttl,
        priority = 'normal',
        tags = [],
        compress = cache.options.compression,
        encrypt = cache.options.encryption
      } = options;

      // معالجة القيمة (ضغط/تشفير)
      let processedValue = value;
      if (compress) {
        processedValue = await this.compressValue(processedValue);
      }
      if (encrypt) {
        processedValue = await this.encryptValue(processedValue);
      }

      // إنشاء metadata
      const metadata = {
        key,
        size: this.estimateSize(processedValue),
        created: Date.now(),
        accessed: Date.now(),
        accessCount: 0,
        ttl,
        priority,
        tags,
        compressed: compress,
        encrypted: encrypt,
        originalSize: this.estimateSize(value)
      };

      // فحص السعة وتطبيق استراتيجية الإزالة
      await this.ensureCapacity(cache, metadata.size);

      // حفظ القيمة والmetadata
      cache.data.set(key, processedValue);
      cache.metadata.set(key, metadata);
      
      // تحديث الإحصائيات
      cache.stats.sets++;
      cache.stats.memoryUsage += metadata.size;
      cache.stats.lastAccess = Date.now();
      
      // تسجيل النشاط
      this.logAccess(cache, 'set', key, metadata);
      
      // تعلم الأنماط
      this.learnAccessPattern(cacheName, key, 'set');
      
      // حفظ دائم إذا لزم الأمر
      if (cache.options.persistent) {
        await this.persistData(cache, key, processedValue, metadata);
      }

      const duration = performance.now() - startTime;
      this.updatePerformanceMetrics('set', duration, true);
      
      return true;
      
    } catch (error) {
      const duration = performance.now() - startTime;
      this.updatePerformanceMetrics('set', duration, false);
      console.error(`خطأ في حفظ ${key} في ${cacheName}:`, error);
      return false;
    }
  }

  // استرجاع قيمة من الcache
  async get(cacheName, key, options = {}) {
    const startTime = performance.now();
    
    try {
      const cache = this.caches.get(cacheName);
      if (!cache) {
        this.updatePerformanceMetrics('get', performance.now() - startTime, false);
        return null;
      }

      const metadata = cache.metadata.get(key);
      if (!metadata) {
        // Cache miss
        cache.stats.misses++;
        this.performanceMetrics.cacheMisses++;
        this.updatePerformanceMetrics('get', performance.now() - startTime, false);
        
        // تسجيل النشاط
        this.logAccess(cache, 'miss', key);
        
        // تعلم الأنماط
        this.learnAccessPattern(cacheName, key, 'miss');
        
        // محاولة التنبؤ والتحميل المسبق
        await this.attemptPredictiveLoad(cacheName, key);
        
        return null;
      }

      // فحص انتهاء الصلاحية
      if (this.isExpired(metadata)) {
        // منتهي الصلاحية
        await this.delete(cacheName, key);
        cache.stats.misses++;
        this.performanceMetrics.cacheMisses++;
        this.updatePerformanceMetrics('get', performance.now() - startTime, false);
        return null;
      }

      // Cache hit
      let value = cache.data.get(key);
      
      // معالجة القيمة (فك تشفير/ضغط)
      if (metadata.encrypted) {
        value = await this.decryptValue(value);
      }
      if (metadata.compressed) {
        value = await this.decompressValue(value);
      }

      // تحديث metadata
      metadata.accessed = Date.now();
      metadata.accessCount++;
      
      // تحديث الإحصائيات
      cache.stats.hits++;
      cache.stats.lastAccess = Date.now();
      this.performanceMetrics.cacheHits++;
      
      // تسجيل النشاط
      this.logAccess(cache, 'hit', key, metadata);
      
      // تعلم الأنماط
      this.learnAccessPattern(cacheName, key, 'hit');
      
      const duration = performance.now() - startTime;
      this.updatePerformanceMetrics('get', duration, true);
      
      return value;
      
    } catch (error) {
      const duration = performance.now() - startTime;
      this.updatePerformanceMetrics('get', duration, false);
      console.error(`خطأ في استرجاع ${key} من ${cacheName}:`, error);
      return null;
    }
  }

  // حذف قيمة من الcache
  async delete(cacheName, key) {
    try {
      const cache = this.caches.get(cacheName);
      if (!cache) return false;

      const metadata = cache.metadata.get(key);
      if (!metadata) return false;

      // حذف من الذاكرة
      cache.data.delete(key);
      cache.metadata.delete(key);
      
      // تحديث الإحصائيات
      cache.stats.deletes++;
      cache.stats.memoryUsage -= metadata.size;
      
      // حذف من التخزين الدائم
      if (cache.options.persistent) {
        await this.deletePersistentData(cache, key);
      }
      
      // تسجيل النشاط
      this.logAccess(cache, 'delete', key, metadata);
      
      return true;
      
    } catch (error) {
      console.error(`خطأ في حذف ${key} من ${cacheName}:`, error);
      return false;
    }
  }

  // مسح cache بالكامل
  async clear(cacheName) {
    try {
      const cache = this.caches.get(cacheName);
      if (!cache) return false;

      const keysCount = cache.data.size;
      
      cache.data.clear();
      cache.metadata.clear();
      cache.stats.memoryUsage = 0;
      cache.accessLog = [];
      
      if (cache.options.persistent) {
        await this.clearPersistentData(cache);
      }
      
      console.log(`🗑️ تم مسح ${keysCount} عنصر من cache: ${cacheName}`);
      return true;
      
    } catch (error) {
      console.error(`خطأ في مسح cache ${cacheName}:`, error);
      return false;
    }
  }

  // ضمان السعة الكافية
  async ensureCapacity(cache, requiredSize) {
    const { maxSize, maxMemory, strategy } = cache.options;
    
    // فحص عدد العناصر
    while (cache.data.size >= maxSize) {
      await this.evictItem(cache, strategy);
    }
    
    // فحص استخدام الذاكرة
    while (cache.stats.memoryUsage + requiredSize > maxMemory) {
      const evicted = await this.evictItem(cache, strategy);
      if (!evicted) break; // لا توجد عناصر لإزالتها
    }
  }

  // إزالة عنصر حسب الاستراتيجية
  async evictItem(cache, strategyName) {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      strategyName = 'lru'; // fallback
    }
    
    return await strategy.implement(cache);
  }

  // تنفيذ استراتيجية LRU
  async implementLRU(cache) {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    cache.metadata.forEach((metadata, key) => {
      if (metadata.accessed < oldestTime) {
        oldestTime = metadata.accessed;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      await this.delete(cache.name, oldestKey);
      return true;
    }
    
    return false;
  }

  // تنفيذ استراتيجية LFU
  async implementLFU(cache) {
    let leastUsedKey = null;
    let leastUsedCount = Infinity;
    
    cache.metadata.forEach((metadata, key) => {
      if (metadata.accessCount < leastUsedCount) {
        leastUsedCount = metadata.accessCount;
        leastUsedKey = key;
      }
    });
    
    if (leastUsedKey) {
      await this.delete(cache.name, leastUsedKey);
      return true;
    }
    
    return false;
  }

  // تنفيذ استراتيجية TTL
  async implementTTL(cache) {
    const now = Date.now();
    const expiredKeys = [];
    
    cache.metadata.forEach((metadata, key) => {
      if (this.isExpired(metadata)) {
        expiredKeys.push(key);
      }
    });
    
    for (const key of expiredKeys) {
      await this.delete(cache.name, key);
    }
    
    return expiredKeys.length > 0;
  }

  // تنفيذ الاستراتيجية الذكية
  async implementIntelligentStrategy(cache) {
    const analytics = this.analytics.get(cache.name);
    if (!analytics) return await this.implementLRU(cache);
    
    // حساب نقاط الأولوية لكل عنصر
    const priorities = new Map();
    
    cache.metadata.forEach((metadata, key) => {
      let score = 0;
      
      // تكرار الاستخدام (30%)
      score += (metadata.accessCount / 100) * 0.3;
      
      // حداثة الاستخدام (25%)
      const ageScore = 1 - ((Date.now() - metadata.accessed) / (24 * 60 * 60 * 1000));
      score += Math.max(0, ageScore) * 0.25;
      
      // أولوية محددة (20%)
      const priorityScores = { low: 0.1, normal: 0.5, high: 0.9, critical: 1.0 };
      score += priorityScores[metadata.priority] * 0.2;
      
      // حجم البيانات (15%) - الأصغر أفضل
      const sizeScore = 1 - Math.min(metadata.size / (1024 * 1024), 1);
      score += sizeScore * 0.15;
      
      // التنبؤ بالاستخدام المستقبلي (10%)
      const predictionScore = this.predictor.predictUsage(cache.name, key);
      score += predictionScore * 0.1;
      
      priorities.set(key, score);
    });
    
    // إزالة العنصر ذو أقل نقاط
    let lowestKey = null;
    let lowestScore = Infinity;
    
    priorities.forEach((score, key) => {
      if (score < lowestScore) {
        lowestScore = score;
        lowestKey = key;
      }
    });
    
    if (lowestKey) {
      await this.delete(cache.name, lowestKey);
      return true;
    }
    
    return false;
  }

  // تنفيذ الاستراتيجية التنبؤية
  async implementPredictiveStrategy(cache) {
    // التحميل المسبق للبيانات المتوقعة
    const predictions = await this.predictor.getPredictions(cache.name);
    
    for (const prediction of predictions.slice(0, 5)) { // أفضل 5 توقعات
      if (!cache.data.has(prediction.key)) {
        await this.preloadData(cache, prediction.key, prediction.confidence);
      }
    }
    
    // إزالة العناصر الأقل احتمالاً للاستخدام
    return await this.implementIntelligentStrategy(cache);
  }

  // فحص انتهاء الصلاحية
  isExpired(metadata) {
    if (!metadata.ttl) return false;
    return Date.now() - metadata.created > metadata.ttl;
  }

  // تسجيل النشاط
  logAccess(cache, action, key, metadata = null) {
    const logEntry = {
      timestamp: Date.now(),
      action,
      key,
      metadata: metadata ? {
        size: metadata.size,
        accessCount: metadata.accessCount,
        priority: metadata.priority
      } : null
    };
    
    cache.accessLog.push(logEntry);
    
    // الاحتفاظ بآخر 1000 عملية فقط
    if (cache.accessLog.length > 1000) {
      cache.accessLog.shift();
    }
  }

  // تعلم أنماط الوصول
  learnAccessPattern(cacheName, key, action) {
    if (!this.accessPatterns.has(cacheName)) {
      this.accessPatterns.set(cacheName, new Map());
    }
    
    const cachePatterns = this.accessPatterns.get(cacheName);
    
    if (!cachePatterns.has(key)) {
      cachePatterns.set(key, {
        hits: 0,
        misses: 0,
        sets: 0,
        frequency: 0,
        lastAccess: Date.now(),
        pattern: []
      });
    }
    
    const pattern = cachePatterns.get(key);
    pattern[action === 'hit' ? 'hits' : action === 'miss' ? 'misses' : 'sets']++;
    pattern.frequency = pattern.hits / (pattern.hits + pattern.misses + pattern.sets);
    pattern.lastAccess = Date.now();
    pattern.pattern.push({ action, timestamp: Date.now() });
    
    // الاحتفاظ بآخر 50 نمط
    if (pattern.pattern.length > 50) {
      pattern.pattern.shift();
    }
    
    // تحديث المتنبئ
    this.predictor.updatePattern(cacheName, key, pattern);
  }

  // تحديث مؤشرات الأداء
  updatePerformanceMetrics(operation, duration, success) {
    this.performanceMetrics.totalRequests++;
    
    // تحديث المتوسط المتحرك للزمن
    const currentAvg = this.performanceMetrics.averageLatency;
    const totalRequests = this.performanceMetrics.totalRequests;
    this.performanceMetrics.averageLatency = 
      (currentAvg * (totalRequests - 1) + duration) / totalRequests;
    
    // تحديث استخدام الذاكرة
    let totalMemory = 0;
    this.caches.forEach(cache => {
      totalMemory += cache.stats.memoryUsage;
    });
    this.performanceMetrics.memoryUsage = totalMemory;
  }

  // بدء مراقبة الأداء
  startPerformanceMonitoring() {
    setInterval(() => {
      this.generatePerformanceReport();
    }, 60000); // كل دقيقة
  }

  // جدولة التنظيف التلقائي
  scheduleAutomaticCleanup() {
    setInterval(() => {
      this.performAutomaticCleanup();
    }, 300000); // كل 5 دقائق
  }

  // تنظيف تلقائي
  async performAutomaticCleanup() {
    console.log('🧹 تنفيذ التنظيف التلقائي للcaches');
    
    for (const [name, cache] of this.caches) {
      // إزالة العناصر منتهية الصلاحية
      await this.implementTTL(cache);
      
      // تحسين الاستراتيجية بناءً على الأداء
      await this.optimizeCacheStrategy(cache);
    }
  }

  // تحسين استراتيجية الcache
  async optimizeCacheStrategy(cache) {
    const analytics = this.analytics.get(cache.name);
    if (!analytics) return;
    
    const hitRate = cache.stats.hits / (cache.stats.hits + cache.stats.misses);
    const memoryEfficiency = cache.data.size / cache.options.maxSize;
    
    // تحسين الاستراتيجية بناءً على الأداء
    if (hitRate < 0.5 && memoryEfficiency > 0.8) {
      // معدل إصابة منخفض واستخدام ذاكرة عالي
      cache.options.strategy = 'intelligent';
      console.log(`📈 تم تحسين استراتيجية cache ${cache.name} إلى intelligent`);
    } else if (hitRate > 0.8) {
      // معدل إصابة عالي
      cache.options.strategy = 'predictive';
      console.log(`🔮 تم تحسين استراتيجية cache ${cache.name} إلى predictive`);
    }
  }

  // توليد تقرير الأداء
  generatePerformanceReport() {
    const report = {
      timestamp: Date.now(),
      overall: { ...this.performanceMetrics },
      caches: {},
      recommendations: []
    };
    
    this.caches.forEach((cache, name) => {
      const hitRate = cache.stats.hits / (cache.stats.hits + cache.stats.misses) || 0;
      const memoryUsage = (cache.stats.memoryUsage / cache.options.maxMemory) * 100;
      
      report.caches[name] = {
        hitRate: Math.round(hitRate * 100),
        memoryUsage: Math.round(memoryUsage),
        totalItems: cache.data.size,
        totalRequests: cache.stats.hits + cache.stats.misses,
        averageItemSize: cache.stats.memoryUsage / cache.data.size || 0,
        strategy: cache.options.strategy
      };
      
      // توصيات التحسين
      if (hitRate < 0.6) {
        report.recommendations.push({
          cache: name,
          type: 'hitRate',
          message: `معدل إصابة منخفض في ${name} (${Math.round(hitRate * 100)}%)`,
          suggestion: 'اعتبر تحسين استراتيجية التخزين أو زيادة حجم الcache'
        });
      }
      
      if (memoryUsage > 90) {
        report.recommendations.push({
          cache: name,
          type: 'memory',
          message: `استخدام ذاكرة عالي في ${name} (${Math.round(memoryUsage)}%)`,
          suggestion: 'قم بزيادة حجم الcache أو تحسين استراتيجية الإزالة'
        });
      }
    });
    
    // حفظ التقرير
    this.savePerformanceReport(report);
    
    return report;
  }

  // دوال مساعدة للضغط والتشفير
  async compressValue(value) {
    // تنفيذ مبسط للضغط
    return JSON.stringify(value);
  }

  async decompressValue(value) {
    return JSON.parse(value);
  }

  async encryptValue(value) {
    // تنفيذ مبسط للتشفير
    return btoa(JSON.stringify(value));
  }

  async decryptValue(value) {
    return JSON.parse(atob(value));
  }

  // تقدير حجم البيانات
  estimateSize(value) {
    return JSON.stringify(value).length * 2; // تقدير تقريبي
  }

  // الحصول على إحصائيات شاملة
  getStatistics() {
    const stats = {
      global: { ...this.performanceMetrics },
      caches: {},
      totalMemoryUsage: 0,
      totalItems: 0,
      averageHitRate: 0
    };
    
    let totalHitRate = 0;
    
    this.caches.forEach((cache, name) => {
      const hitRate = cache.stats.hits / (cache.stats.hits + cache.stats.misses) || 0;
      
      stats.caches[name] = {
        hits: cache.stats.hits,
        misses: cache.stats.misses,
        hitRate: Math.round(hitRate * 100),
        items: cache.data.size,
        memoryUsage: cache.stats.memoryUsage,
        strategy: cache.options.strategy,
        created: cache.stats.created,
        lastAccess: cache.stats.lastAccess
      };
      
      stats.totalMemoryUsage += cache.stats.memoryUsage;
      stats.totalItems += cache.data.size;
      totalHitRate += hitRate;
    });
    
    stats.averageHitRate = Math.round((totalHitRate / this.caches.size) * 100) || 0;
    
    return stats;
  }

  // تنظيف الموارد
  cleanup() {
    console.log('🧹 تنظيف نظام التخزين المؤقت الذكي');
    
    this.caches.clear();
    this.strategies.clear();
    this.analytics.clear();
    this.accessPatterns.clear();
    this.predictor?.cleanup();
  }
}

// فئة تحليل الcache
class CacheAnalytics {
  constructor(cacheName) {
    this.cacheName = cacheName;
    this.patterns = new Map();
    this.trends = [];
  }

  analyzePattern(key, accessHistory) {
    // تحليل أنماط الوصول
    const pattern = {
      frequency: accessHistory.length,
      intervals: this.calculateIntervals(accessHistory),
      peakTimes: this.identifyPeakTimes(accessHistory),
      trend: this.calculateTrend(accessHistory)
    };
    
    this.patterns.set(key, pattern);
    return pattern;
  }

  calculateIntervals(history) {
    if (history.length < 2) return [];
    
    const intervals = [];
    for (let i = 1; i < history.length; i++) {
      intervals.push(history[i].timestamp - history[i-1].timestamp);
    }
    
    return intervals;
  }

  identifyPeakTimes(history) {
    const hourCounts = Array(24).fill(0);
    
    history.forEach(access => {
      const hour = new Date(access.timestamp).getHours();
      hourCounts[hour]++;
    });
    
    const max = Math.max(...hourCounts);
    return hourCounts.map((count, hour) => ({ hour, count, isPeak: count === max }));
  }

  calculateTrend(history) {
    if (history.length < 10) return 'insufficient_data';
    
    const recent = history.slice(-5);
    const older = history.slice(-10, -5);
    
    const recentAvg = recent.length / 5;
    const olderAvg = older.length / 5;
    
    if (recentAvg > olderAvg * 1.2) return 'increasing';
    if (recentAvg < olderAvg * 0.8) return 'decreasing';
    return 'stable';
  }
}

// فئة متنبئ الcache
class CachePredictor {
  constructor() {
    this.patterns = new Map();
    this.predictions = new Map();
  }

  async initialize() {
    console.log('🔮 تهيئة متنبئ التخزين المؤقت');
  }

  updatePattern(cacheName, key, pattern) {
    if (!this.patterns.has(cacheName)) {
      this.patterns.set(cacheName, new Map());
    }
    
    this.patterns.get(cacheName).set(key, pattern);
    
    // تحديث التوقعات
    this.updatePredictions(cacheName, key, pattern);
  }

  updatePredictions(cacheName, key, pattern) {
    const prediction = this.calculatePrediction(pattern);
    
    if (!this.predictions.has(cacheName)) {
      this.predictions.set(cacheName, new Map());
    }
    
    this.predictions.get(cacheName).set(key, prediction);
  }

  calculatePrediction(pattern) {
    let score = 0.5; // نقطة البداية
    
    // تكرار الاستخدام
    if (pattern.frequency > 0.7) score += 0.2;
    if (pattern.frequency < 0.3) score -= 0.2;
    
    // حداثة الاستخدام
    const timeSinceLastAccess = Date.now() - pattern.lastAccess;
    if (timeSinceLastAccess < 3600000) score += 0.15; // أقل من ساعة
    if (timeSinceLastAccess > 86400000) score -= 0.15; // أكثر من يوم
    
    // اتجاه الاستخدام
    const recentPattern = pattern.pattern.slice(-10);
    const hits = recentPattern.filter(p => p.action === 'hit').length;
    if (hits > 7) score += 0.1;
    if (hits < 3) score -= 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  predictUsage(cacheName, key) {
    const cachePatterns = this.patterns.get(cacheName);
    if (!cachePatterns) return 0.5;
    
    const pattern = cachePatterns.get(key);
    if (!pattern) return 0.5;
    
    return this.calculatePrediction(pattern);
  }

  getPredictions(cacheName) {
    const predictions = this.predictions.get(cacheName);
    if (!predictions) return [];
    
    return Array.from(predictions.entries())
      .map(([key, score]) => ({ key, confidence: score }))
      .sort((a, b) => b.confidence - a.confidence);
  }

  cleanup() {
    this.patterns.clear();
    this.predictions.clear();
  }
}

// React Hook لاستخدام التخزين المؤقت الذكي
export function useIntelligentCache(cacheName, options = {}) {
  const [cache, setCache] = React.useState(null);
  const [stats, setStats] = React.useState(null);
  
  React.useEffect(() => {
    const cacheInstance = intelligentCache.createCache(cacheName, options);
    setCache(cacheInstance);
    
    // تحديث الإحصائيات كل 30 ثانية
    const interval = setInterval(() => {
      const currentStats = intelligentCache.getStatistics();
      setStats(currentStats.caches[cacheName]);
    }, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, [cacheName]);
  
  const set = React.useCallback(async (key, value, options = {}) => {
    return await intelligentCache.set(cacheName, key, value, options);
  }, [cacheName]);
  
  const get = React.useCallback(async (key, options = {}) => {
    return await intelligentCache.get(cacheName, key, options);
  }, [cacheName]);
  
  const remove = React.useCallback(async (key) => {
    return await intelligentCache.delete(cacheName, key);
  }, [cacheName]);
  
  const clear = React.useCallback(async () => {
    return await intelligentCache.clear(cacheName);
  }, [cacheName]);
  
  return {
    cache,
    stats,
    set,
    get,
    remove,
    clear
  };
}

// تصدير singleton instance
export const intelligentCache = new IntelligentCacheSystem();

// تهيئة تلقائية
if (typeof window !== 'undefined') {
  // جعل النظام متاحاً عالمياً للتطوير
  if (process.env.NODE_ENV === 'development') {
    window.intelligentCache = intelligentCache;
  }
  
  // تنظيف عند إغلاق الصفحة
  window.addEventListener('beforeunload', () => {
    intelligentCache.cleanup();
  });
}