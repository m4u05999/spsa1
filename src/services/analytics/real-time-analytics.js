// real-time-analytics.js - نظام التحليلات الفورية المتقدم
// تطوير: اختصاصي تحسين الأداء والذكاء الاصطناعي

export class RealTimeAnalytics {
  constructor() {
    this.events = new Map();
    this.metrics = new Map();
    this.subscribers = new Map();
    this.aggregators = new Map();
    this.alerts = [];
    this.buffers = new Map();
    this.thresholds = new Map();
    this.predictions = new Map();
    
    this.isActive = false;
    this.batchSize = 100;
    this.flushInterval = 5000; // 5 ثوانٍ
    
    this.initialize();
  }

  // تهيئة نظام التحليلات الفورية
  async initialize() {
    console.log('📊 تهيئة نظام التحليلات الفورية المتقدم');
    
    try {
      // تهيئة المجمعات
      this.initializeAggregators();
      
      // تهيئة العتبات التلقائية
      this.initializeThresholds();
      
      // تهيئة المخازن المؤقتة
      this.initializeBuffers();
      
      // بدء معالجة البيانات
      this.startProcessing();
      
      // تهيئة التنبؤات
      this.initializePredictions();
      
      console.log('✅ تم تهيئة نظام التحليلات الفورية بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تهيئة التحليلات الفورية:', error);
    }
  }

  // تهيئة المجمعات
  initializeAggregators() {
    // مجمع الأحداث العامة
    this.aggregators.set('events', {
      count: 0,
      types: new Map(),
      timeline: [],
      rate: 0,
      peakRate: 0
    });

    // مجمع المستخدمين
    this.aggregators.set('users', {
      active: new Set(),
      sessions: new Map(),
      pageViews: 0,
      interactions: 0,
      avgSessionDuration: 0
    });

    // مجمع الأداء
    this.aggregators.set('performance', {
      pageLoadTimes: [],
      apiResponseTimes: [],
      errorRate: 0,
      memoryUsage: [],
      cacheHitRate: 0
    });

    // مجمع المحتوى
    this.aggregators.set('content', {
      views: new Map(),
      interactions: new Map(),
      popularity: new Map(),
      engagementScore: 0
    });

    // مجمع التنبيهات
    this.aggregators.set('alerts', {
      total: 0,
      byLevel: { low: 0, medium: 0, high: 0, critical: 0 },
      active: [],
      resolved: []
    });
  }

  // تهيئة العتبات
  initializeThresholds() {
    this.thresholds.set('performance', {
      pageLoadTime: { warning: 2000, critical: 5000 },
      apiResponseTime: { warning: 500, critical: 2000 },
      errorRate: { warning: 0.01, critical: 0.05 },
      memoryUsage: { warning: 100, critical: 200 }, // MB
      cacheHitRate: { warning: 0.7, critical: 0.5 }
    });

    this.thresholds.set('users', {
      sessionDuration: { warning: 60, critical: 30 }, // ثواني
      pageViews: { warning: 1, critical: 0 },
      bounceRate: { warning: 0.7, critical: 0.9 }
    });

    this.thresholds.set('system', {
      eventRate: { warning: 1000, critical: 5000 }, // أحداث/دقيقة
      concurrentUsers: { warning: 500, critical: 1000 },
      diskSpace: { warning: 0.8, critical: 0.95 } // نسبة مئوية
    });
  }

  // تهيئة المخازن المؤقتة
  initializeBuffers() {
    const bufferConfig = {
      maxSize: this.batchSize,
      flushInterval: this.flushInterval,
      autoFlush: true
    };

    this.buffers.set('events', { data: [], ...bufferConfig });
    this.buffers.set('metrics', { data: [], ...bufferConfig });
    this.buffers.set('alerts', { data: [], ...bufferConfig });
    this.buffers.set('performance', { data: [], ...bufferConfig });
  }

  // بدء معالجة البيانات
  startProcessing() {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // معالجة دورية للبيانات
    this.processingInterval = setInterval(() => {
      this.processBuffers();
      this.updateMetrics();
      this.checkThresholds();
      this.generatePredictions();
    }, 1000); // كل ثانية

    // إفراغ المخازن المؤقتة
    this.flushInterval = setInterval(() => {
      this.flushAllBuffers();
    }, this.flushInterval);

    console.log('▶️ بدء معالجة التحليلات الفورية');
  }

  // إيقاف المعالجة
  stopProcessing() {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    console.log('⏹️ تم إيقاف معالجة التحليلات الفورية');
  }

  // تسجيل حدث جديد
  track(eventType, eventData = {}, options = {}) {
    const {
      userId = null,
      sessionId = null,
      immediate = false,
      metadata = {}
    } = options;

    const event = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type: eventType,
      data: eventData,
      userId,
      sessionId,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        userAgent: navigator?.userAgent,
        url: window?.location?.href,
        referrer: document?.referrer
      }
    };

    // معالجة فورية إذا مطلوبة
    if (immediate) {
      this.processEvent(event);
    } else {
      // إضافة للمخزن المؤقت
      this.addToBuffer('events', event);
    }

    // تحديث المقاييس الفورية
    this.updateRealTimeMetrics(event);

    return event.id;
  }

  // تسجيل مقياس أداء
  recordMetric(metricName, value, options = {}) {
    const {
      unit = 'count',
      tags = {},
      immediate = false
    } = options;

    const metric = {
      name: metricName,
      value,
      unit,
      tags,
      timestamp: Date.now()
    };

    if (immediate) {
      this.processMetric(metric);
    } else {
      this.addToBuffer('metrics', metric);
    }

    // تحديث التجميعات الفورية
    this.updateMetricAggregations(metric);
  }

  // إنشاء تنبيه
  createAlert(level, message, data = {}, options = {}) {
    const {
      category = 'general',
      threshold = null,
      actions = [],
      persistent = false
    } = options;

    const alert = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      level, // low, medium, high, critical
      message,
      category,
      data,
      threshold,
      actions,
      persistent,
      timestamp: Date.now(),
      resolved: false,
      resolvedAt: null
    };

    this.alerts.push(alert);
    this.addToBuffer('alerts', alert);

    // إشعار المشتركين
    this.notifySubscribers('alert', alert);

    // معالجة فورية للتنبيهات الحرجة
    if (level === 'critical') {
      this.handleCriticalAlert(alert);
    }

    return alert.id;
  }

  // الاشتراك في التحديثات
  subscribe(eventType, callback, options = {}) {
    const {
      filter = null,
      throttle = 0,
      batch = false
    } = options;

    const subscription = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      eventType,
      callback,
      filter,
      throttle,
      batch,
      lastCalled: 0,
      active: true
    };

    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }

    this.subscribers.get(eventType).push(subscription);

    return {
      id: subscription.id,
      unsubscribe: () => this.unsubscribe(eventType, subscription.id)
    };
  }

  // إلغاء الاشتراك
  unsubscribe(eventType, subscriptionId) {
    const subscribers = this.subscribers.get(eventType);
    if (!subscribers) return false;

    const index = subscribers.findIndex(sub => sub.id === subscriptionId);
    if (index !== -1) {
      subscribers.splice(index, 1);
      return true;
    }

    return false;
  }

  // معالجة الأحداث
  processEvent(event) {
    // تحديث تجميعات الأحداث
    const eventsAgg = this.aggregators.get('events');
    eventsAgg.count++;
    
    const eventType = event.type;
    eventsAgg.types.set(eventType, (eventsAgg.types.get(eventType) || 0) + 1);
    
    eventsAgg.timeline.push({
      timestamp: event.timestamp,
      type: eventType,
      count: 1
    });

    // تحديث معدل الأحداث
    this.updateEventRate();

    // معالجة خاصة لأنواع الأحداث المختلفة
    switch (event.type) {
      case 'page_view':
        this.processPageView(event);
        break;
      case 'user_interaction':
        this.processUserInteraction(event);
        break;
      case 'error':
        this.processError(event);
        break;
      case 'performance':
        this.processPerformance(event);
        break;
      default:
        this.processGenericEvent(event);
    }

    // إشعار المشتركين
    this.notifySubscribers(event.type, event);
    this.notifySubscribers('*', event); // مشتركين في جميع الأحداث
  }

  // معالجة المقاييس
  processMetric(metric) {
    const { name, value, timestamp } = metric;
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        values: [],
        current: value,
        min: value,
        max: value,
        avg: value,
        sum: value,
        count: 1,
        lastUpdate: timestamp
      });
    } else {
      const metricData = this.metrics.get(name);
      metricData.values.push({ value, timestamp });
      metricData.current = value;
      metricData.min = Math.min(metricData.min, value);
      metricData.max = Math.max(metricData.max, value);
      metricData.sum += value;
      metricData.count++;
      metricData.avg = metricData.sum / metricData.count;
      metricData.lastUpdate = timestamp;

      // الاحتفاظ بآخر 1000 قيمة فقط
      if (metricData.values.length > 1000) {
        metricData.values.shift();
      }
    }

    // إشعار المشتركين
    this.notifySubscribers('metric', metric);
  }

  // معالجة عرض الصفحة
  processPageView(event) {
    const usersAgg = this.aggregators.get('users');
    usersAgg.pageViews++;
    
    if (event.userId) {
      usersAgg.active.add(event.userId);
    }

    // تحديث إحصائيات المحتوى
    const contentAgg = this.aggregators.get('content');
    const page = event.data.page || window.location.pathname;
    contentAgg.views.set(page, (contentAgg.views.get(page) || 0) + 1);

    // فحص وقت تحميل الصفحة
    if (event.data.loadTime) {
      this.recordMetric('page_load_time', event.data.loadTime, { unit: 'ms' });
      
      // تنبيه إذا كان البطء شديداً
      const thresholds = this.thresholds.get('performance').pageLoadTime;
      if (event.data.loadTime > thresholds.critical) {
        this.createAlert('critical', `وقت تحميل بطيء جداً: ${event.data.loadTime}ms`, {
          page,
          loadTime: event.data.loadTime
        });
      }
    }
  }

  // معالجة تفاعل المستخدم
  processUserInteraction(event) {
    const usersAgg = this.aggregators.get('users');
    usersAgg.interactions++;

    if (event.userId) {
      usersAgg.active.add(event.userId);
    }

    // تحديث تفاعلات المحتوى
    const contentAgg = this.aggregators.get('content');
    const element = event.data.element || 'unknown';
    contentAgg.interactions.set(element, (contentAgg.interactions.get(element) || 0) + 1);
  }

  // معالجة الأخطاء
  processError(event) {
    const perfAgg = this.aggregators.get('performance');
    
    // حساب معدل الأخطاء
    const totalEvents = this.aggregators.get('events').count;
    const errorEvents = this.aggregators.get('events').types.get('error') || 0;
    perfAgg.errorRate = totalEvents > 0 ? errorEvents / totalEvents : 0;

    // إنشاء تنبيه للأخطاء الحرجة
    if (event.data.level === 'error' || event.data.level === 'critical') {
      this.createAlert('high', `خطأ في التطبيق: ${event.data.message}`, event.data);
    }

    // فحص معدل الأخطاء
    const thresholds = this.thresholds.get('performance').errorRate;
    if (perfAgg.errorRate > thresholds.critical) {
      this.createAlert('critical', `معدل أخطاء عالي: ${(perfAgg.errorRate * 100).toFixed(2)}%`);
    }
  }

  // معالجة أحداث الأداء
  processPerformance(event) {
    const perfAgg = this.aggregators.get('performance');
    
    if (event.data.type === 'api_response') {
      perfAgg.apiResponseTimes.push(event.data.responseTime);
      
      // الاحتفاظ بآخر 100 قيمة
      if (perfAgg.apiResponseTimes.length > 100) {
        perfAgg.apiResponseTimes.shift();
      }
      
      // تنبيه للاستجابة البطيئة
      const thresholds = this.thresholds.get('performance').apiResponseTime;
      if (event.data.responseTime > thresholds.critical) {
        this.createAlert('high', `استجابة API بطيئة: ${event.data.responseTime}ms`, {
          endpoint: event.data.endpoint
        });
      }
    }
    
    if (event.data.type === 'memory_usage') {
      perfAgg.memoryUsage.push(event.data.usage);
      
      if (perfAgg.memoryUsage.length > 100) {
        perfAgg.memoryUsage.shift();
      }
    }
  }

  // تحديث المقاييس الفورية
  updateRealTimeMetrics(event) {
    // تحديث عدد المستخدمين النشطين
    if (event.userId) {
      const usersAgg = this.aggregators.get('users');
      usersAgg.active.add(event.userId);
      
      // تنظيف المستخدمين غير النشطين (آخر 30 دقيقة)
      const cutoffTime = Date.now() - (30 * 60 * 1000);
      // يمكن تحسين هذا بمراقبة آخر نشاط للمستخدمين
    }

    // تحديث معدل الأحداث
    this.updateEventRate();
  }

  // تحديث معدل الأحداث
  updateEventRate() {
    const eventsAgg = this.aggregators.get('events');
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // عد الأحداث في آخر دقيقة
    const recentEvents = eventsAgg.timeline.filter(
      event => event.timestamp > oneMinuteAgo
    ).length;
    
    eventsAgg.rate = recentEvents;
    eventsAgg.peakRate = Math.max(eventsAgg.peakRate, recentEvents);
    
    // تنظيف timeline القديم
    eventsAgg.timeline = eventsAgg.timeline.filter(
      event => event.timestamp > oneMinuteAgo
    );
  }

  // تحديث تجميعات المقاييس
  updateMetricAggregations(metric) {
    // تحديث بناءً على نوع المقياس
    switch (metric.name) {
      case 'cache_hit_rate':
        const perfAgg = this.aggregators.get('performance');
        perfAgg.cacheHitRate = metric.value;
        break;
      
      case 'session_duration':
        this.updateSessionDuration(metric.value);
        break;
        
      default:
        // تحديث عام
        break;
    }
  }

  // إضافة إلى المخزن المؤقت
  addToBuffer(bufferName, data) {
    const buffer = this.buffers.get(bufferName);
    if (!buffer) return;

    buffer.data.push(data);

    // إفراغ تلقائي عند امتلاء المخزن
    if (buffer.data.length >= buffer.maxSize) {
      this.flushBuffer(bufferName);
    }
  }

  // معالجة المخازن المؤقتة
  processBuffers() {
    this.buffers.forEach((buffer, name) => {
      if (buffer.data.length > 0) {
        // معالجة البيانات في المخزن
        this.processBatchData(name, [...buffer.data]);
      }
    });
  }

  // معالجة البيانات المجمعة
  processBatchData(bufferName, data) {
    switch (bufferName) {
      case 'events':
        data.forEach(event => this.processEvent(event));
        break;
      
      case 'metrics':
        data.forEach(metric => this.processMetric(metric));
        break;
        
      case 'alerts':
        // التنبيهات تُعالج فور إنشائها
        break;
        
      default:
        console.warn(`مخزن غير معروف: ${bufferName}`);
    }
  }

  // إفراغ مخزن مؤقت محدد
  flushBuffer(bufferName) {
    const buffer = this.buffers.get(bufferName);
    if (!buffer || buffer.data.length === 0) return;

    const data = [...buffer.data];
    buffer.data = [];

    // معالجة البيانات
    this.processBatchData(bufferName, data);

    console.log(`📤 تم إفراغ ${data.length} عنصر من ${bufferName}`);
  }

  // إفراغ جميع المخازن المؤقتة
  flushAllBuffers() {
    this.buffers.forEach((buffer, name) => {
      if (buffer.autoFlush && buffer.data.length > 0) {
        this.flushBuffer(name);
      }
    });
  }

  // فحص العتبات
  checkThresholds() {
    this.thresholds.forEach((categoryThresholds, category) => {
      Object.entries(categoryThresholds).forEach(([metric, thresholds]) => {
        const currentValue = this.getCurrentMetricValue(category, metric);
        if (currentValue !== null) {
          this.checkThreshold(category, metric, currentValue, thresholds);
        }
      });
    });
  }

  // فحص عتبة محددة
  checkThreshold(category, metric, value, thresholds) {
    const alertKey = `${category}_${metric}`;
    
    if (value > thresholds.critical) {
      this.createAlert('critical', 
        `تجاوز عتبة حرجة: ${metric} = ${value}`, 
        { category, metric, value, threshold: thresholds.critical }
      );
    } else if (value > thresholds.warning) {
      this.createAlert('medium',
        `تجاوز عتبة تحذيرية: ${metric} = ${value}`,
        { category, metric, value, threshold: thresholds.warning }
      );
    }
  }

  // الحصول على قيمة مقياس حالية
  getCurrentMetricValue(category, metric) {
    switch (category) {
      case 'performance':
        const perfAgg = this.aggregators.get('performance');
        switch (metric) {
          case 'errorRate': return perfAgg.errorRate;
          case 'cacheHitRate': return perfAgg.cacheHitRate;
          case 'memoryUsage': 
            return perfAgg.memoryUsage.length > 0 ? 
              perfAgg.memoryUsage[perfAgg.memoryUsage.length - 1] : null;
          default: return null;
        }
      
      case 'users':
        const usersAgg = this.aggregators.get('users');
        switch (metric) {
          case 'sessionDuration': return usersAgg.avgSessionDuration;
          default: return null;
        }
        
      default: return null;
    }
  }

  // إشعار المشتركين
  notifySubscribers(eventType, data) {
    const subscribers = this.subscribers.get(eventType) || [];
    const allSubscribers = this.subscribers.get('*') || [];
    
    [...subscribers, ...allSubscribers].forEach(subscription => {
      if (!subscription.active) return;
      
      // فحص التصفية
      if (subscription.filter && !subscription.filter(data)) return;
      
      // فحص التحكم في معدل الاستدعاء
      const now = Date.now();
      if (subscription.throttle > 0 && 
          now - subscription.lastCalled < subscription.throttle) {
        return;
      }
      
      try {
        subscription.callback(data, eventType);
        subscription.lastCalled = now;
      } catch (error) {
        console.error('خطأ في callback المشترك:', error);
      }
    });
  }

  // معالجة التنبيه الحرج
  handleCriticalAlert(alert) {
    console.error('🚨 تنبيه حرج:', alert.message, alert.data);
    
    // إجراءات تلقائية للتنبيهات الحرجة
    alert.actions.forEach(action => {
      try {
        this.executeAlertAction(action, alert);
      } catch (error) {
        console.error('خطأ في تنفيذ إجراء التنبيه:', error);
      }
    });
  }

  // تنفيذ إجراء تنبيه
  executeAlertAction(action, alert) {
    switch (action.type) {
      case 'notify_admin':
        // إرسال إشعار للمدير
        this.notifyAdmin(alert);
        break;
        
      case 'scale_resources':
        // توسيع الموارد تلقائياً
        this.scaleResources(action.params);
        break;
        
      case 'restart_service':
        // إعادة تشغيل خدمة
        this.restartService(action.params.service);
        break;
        
      default:
        console.warn(`إجراء غير معروف: ${action.type}`);
    }
  }

  // توليد التنبؤات
  generatePredictions() {
    // توقع معدل الأحداث
    this.predictEventRate();
    
    // توقع استخدام الذاكرة
    this.predictMemoryUsage();
    
    // توقع عدد المستخدمين النشطين
    this.predictActiveUsers();
  }

  // توقع معدل الأحداث
  predictEventRate() {
    const eventsAgg = this.aggregators.get('events');
    const currentRate = eventsAgg.rate;
    const timeline = eventsAgg.timeline;
    
    if (timeline.length < 10) return; // بيانات غير كافية
    
    // حساب الاتجاه
    const recent = timeline.slice(-5);
    const older = timeline.slice(-10, -5);
    
    const recentAvg = recent.length;
    const olderAvg = older.length;
    
    let prediction = currentRate;
    if (recentAvg > olderAvg * 1.2) {
      prediction = currentRate * 1.3; // اتجاه صاعد
    } else if (recentAvg < olderAvg * 0.8) {
      prediction = currentRate * 0.7; // اتجاه نازل
    }
    
    this.predictions.set('event_rate', {
      current: currentRate,
      predicted: prediction,
      confidence: 0.7,
      timeHorizon: 300000, // 5 دقائق
      timestamp: Date.now()
    });
  }

  // الحصول على تقرير شامل
  getAnalyticsReport(timeRange = 3600000) { // ساعة واحدة افتراضياً
    const now = Date.now();
    const startTime = now - timeRange;
    
    return {
      timestamp: now,
      timeRange: { start: startTime, end: now, duration: timeRange },
      
      // الإحصائيات العامة
      overview: {
        totalEvents: this.aggregators.get('events').count,
        eventRate: this.aggregators.get('events').rate,
        activeUsers: this.aggregators.get('users').active.size,
        pageViews: this.aggregators.get('users').pageViews,
        interactions: this.aggregators.get('users').interactions
      },
      
      // مقاييس الأداء
      performance: {
        errorRate: this.aggregators.get('performance').errorRate,
        cacheHitRate: this.aggregators.get('performance').cacheHitRate,
        averageApiResponseTime: this.calculateAverage(
          this.aggregators.get('performance').apiResponseTimes
        ),
        memoryUsage: this.aggregators.get('performance').memoryUsage.slice(-1)[0] || 0
      },
      
      // التنبيهات
      alerts: {
        total: this.alerts.length,
        active: this.alerts.filter(a => !a.resolved).length,
        byLevel: this.aggregators.get('alerts').byLevel,
        recent: this.alerts.slice(-10)
      },
      
      // التنبؤات
      predictions: Object.fromEntries(this.predictions),
      
      // أشهر المحتوى
      topContent: Array.from(this.aggregators.get('content').views.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
        
      // أشهر التفاعلات
      topInteractions: Array.from(this.aggregators.get('content').interactions.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    };
  }

  // حساب المتوسط
  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  // تهيئة التنبؤات
  initializePredictions() {
    // تهيئة المتنبئات المختلفة
    setInterval(() => {
      this.generatePredictions();
    }, 60000); // كل دقيقة
  }

  // تحديث مدة الجلسة
  updateSessionDuration(duration) {
    const usersAgg = this.aggregators.get('users');
    // حساب متوسط متحرك بسيط
    if (usersAgg.avgSessionDuration === 0) {
      usersAgg.avgSessionDuration = duration;
    } else {
      usersAgg.avgSessionDuration = (usersAgg.avgSessionDuration * 0.9) + (duration * 0.1);
    }
  }

  // إعادة تعيين الإحصائيات
  reset() {
    this.events.clear();
    this.metrics.clear();
    this.alerts.length = 0;
    this.predictions.clear();
    
    // إعادة تهيئة المجمعات
    this.initializeAggregators();
    
    // إفراغ المخازن المؤقتة
    this.buffers.forEach(buffer => {
      buffer.data = [];
    });
    
    console.log('🔄 تم إعادة تعيين جميع البيانات');
  }

  // تنظيف الموارد
  cleanup() {
    console.log('🧹 تنظيف نظام التحليلات الفورية');
    
    this.stopProcessing();
    this.reset();
    this.subscribers.clear();
  }
}

// React Hook لاستخدام التحليلات الفورية
export function useRealTimeAnalytics() {
  const [analytics, setAnalytics] = React.useState(null);
  const [isConnected, setIsConnected] = React.useState(false);
  
  React.useEffect(() => {
    // الاتصال بنظام التحليلات
    setIsConnected(true);
    
    // تحديث البيانات كل 5 ثوانٍ
    const interval = setInterval(() => {
      const report = realTimeAnalytics.getAnalyticsReport();
      setAnalytics(report);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, []);
  
  const track = React.useCallback((eventType, eventData, options) => {
    return realTimeAnalytics.track(eventType, eventData, options);
  }, []);
  
  const recordMetric = React.useCallback((name, value, options) => {
    return realTimeAnalytics.recordMetric(name, value, options);
  }, []);
  
  const subscribe = React.useCallback((eventType, callback, options) => {
    return realTimeAnalytics.subscribe(eventType, callback, options);
  }, []);
  
  return {
    analytics,
    isConnected,
    track,
    recordMetric,
    subscribe
  };
}

// تصدير singleton instance
export const realTimeAnalytics = new RealTimeAnalytics();

// تهيئة تلقائية
if (typeof window !== 'undefined') {
  // جعل النظام متاحاً عالمياً للتطوير
  if (process.env.NODE_ENV === 'development') {
    window.realTimeAnalytics = realTimeAnalytics;
  }
  
  // تتبع أحداث أساسية تلقائياً
  window.addEventListener('load', () => {
    realTimeAnalytics.track('page_load', {
      url: window.location.href,
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart
    });
  });
  
  window.addEventListener('beforeunload', () => {
    realTimeAnalytics.cleanup();
  });
  
  // تتبع تفاعلات المستخدم
  document.addEventListener('click', (event) => {
    realTimeAnalytics.track('user_interaction', {
      element: event.target.tagName,
      text: event.target.textContent?.slice(0, 50)
    });
  });
}