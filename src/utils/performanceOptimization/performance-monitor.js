// performance-monitor.js - نظام مراقبة الأداء المتقدم
// تطوير: اختصاصي تحسين الأداء والذكاء الاصطناعي

export class AdvancedPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.alerts = [];
    this.thresholds = {
      lcp: 2500,      // Largest Contentful Paint
      fid: 100,       // First Input Delay  
      cls: 0.1,       // Cumulative Layout Shift
      fcp: 1800,      // First Contentful Paint
      ttfb: 600,      // Time to First Byte
      memoryUsage: 100 // MB
    };
    this.isMonitoring = false;
    this.observers = new Map();
  }

  // بدء مراقبة الأداء الشاملة
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🚀 بدء مراقبة الأداء المتقدمة');

    // مراقبة Core Web Vitals
    this.monitorCoreWebVitals();
    
    // مراقبة استخدام الذاكرة
    this.monitorMemoryUsage();
    
    // مراقبة تحميل الموارد
    this.monitorResourceLoading();
    
    // مراقبة تفاعلات المستخدم
    this.monitorUserInteractions();
    
    // مراقبة أداء الشبكة
    this.monitorNetworkPerformance();

    // تقرير دوري كل 30 ثانية
    this.schedulePeriodicReporting();
  }

  // إيقاف المراقبة
  stopMonitoring() {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    console.log('⏹️ تم إيقاف مراقبة الأداء');
  }

  // مراقبة Core Web Vitals
  monitorCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // First Input Delay (FID)  
    this.observeFID();
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS();
    
    // First Contentful Paint (FCP)
    this.observeFCP();
  }

  // مراقبة LCP
  observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        const lcp = lastEntry.startTime;
        this.recordMetric('lcp', lcp);
        
        if (lcp > this.thresholds.lcp) {
          this.createAlert('LCP', lcp, this.thresholds.lcp, 'high');
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', observer);
    } catch (error) {
      console.warn('LCP monitoring not supported:', error);
    }
  }

  // مراقبة FID
  observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fid = entry.processingStart - entry.startTime;
          this.recordMetric('fid', fid);
          
          if (fid > this.thresholds.fid) {
            this.createAlert('FID', fid, this.thresholds.fid, 'high');
          }
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', observer);
    } catch (error) {
      console.warn('FID monitoring not supported:', error);
    }
  }

  // مراقبة CLS
  observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.recordMetric('cls', clsValue);
        
        if (clsValue > this.thresholds.cls) {
          this.createAlert('CLS', clsValue, this.thresholds.cls, 'medium');
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', observer);
    } catch (error) {
      console.warn('CLS monitoring not supported:', error);
    }
  }

  // مراقبة FCP
  observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime;
            this.recordMetric('fcp', fcp);
            
            if (fcp > this.thresholds.fcp) {
              this.createAlert('FCP', fcp, this.thresholds.fcp, 'medium');
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('fcp', observer);
    } catch (error) {
      console.warn('FCP monitoring not supported:', error);
    }
  }

  // مراقبة استخدام الذاكرة
  monitorMemoryUsage() {
    if (!performance.memory) {
      console.warn('Memory monitoring not supported');
      return;
    }

    const checkMemory = () => {
      const memoryInfo = performance.memory;
      const usedMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
      const totalMB = memoryInfo.totalJSHeapSize / (1024 * 1024);
      
      this.recordMetric('memoryUsed', usedMB);
      this.recordMetric('memoryTotal', totalMB);
      
      if (usedMB > this.thresholds.memoryUsage) {
        this.createAlert('Memory', usedMB, this.thresholds.memoryUsage, 'high');
      }
    };

    // فحص كل 10 ثوانٍ
    const memoryInterval = setInterval(checkMemory, 10000);
    
    // حفظ المرجع للتنظيف
    this.memoryInterval = memoryInterval;
  }

  // مراقبة تحميل الموارد
  monitorResourceLoading() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        const duration = entry.responseEnd - entry.startTime;
        const size = entry.transferSize || 0;
        
        this.recordMetric(`resource_${entry.initiatorType}`, {
          name: entry.name,
          duration,
          size,
          type: entry.initiatorType
        });

        // تنبيه للموارد البطيئة
        if (duration > 3000) { // أكثر من 3 ثوانٍ
          this.createAlert('Slow Resource', duration, 3000, 'medium', {
            resource: entry.name,
            type: entry.initiatorType
          });
        }

        // تنبيه للموارد الكبيرة
        if (size > 1024 * 1024) { // أكبر من 1MB
          this.createAlert('Large Resource', size, 1024 * 1024, 'low', {
            resource: entry.name,
            type: entry.initiatorType
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', observer);
  }

  // مراقبة تفاعلات المستخدم
  monitorUserInteractions() {
    const interactionTypes = ['click', 'keydown', 'scroll', 'mousemove'];
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        const startTime = performance.now();
        
        // قياس زمن الاستجابة
        requestAnimationFrame(() => {
          const responseTime = performance.now() - startTime;
          this.recordMetric(`interaction_${type}`, responseTime);
          
          if (responseTime > 16.67) { // أكثر من frame واحد (60fps)
            this.createAlert('Slow Interaction', responseTime, 16.67, 'medium', {
              type,
              target: event.target.tagName
            });
          }
        });
      }, { passive: true });
    });
  }

  // مراقبة أداء الشبكة
  monitorNetworkPerformance() {
    // مراقبة Connection API إذا كان متوفراً
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      this.recordMetric('networkType', connection.effectiveType);
      this.recordMetric('networkSpeed', connection.downlink);
      
      connection.addEventListener('change', () => {
        this.recordMetric('networkType', connection.effectiveType);
        this.recordMetric('networkSpeed', connection.downlink);
        
        // تنبيه للاتصال البطيء
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          this.createAlert('Slow Network', connection.effectiveType, '3g', 'high');
        }
      });
    }

    // مراقبة Navigation Timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
          this.recordMetric('ttfb', navTiming.responseStart - navTiming.requestStart);
          this.recordMetric('domLoad', navTiming.domContentLoadedEventEnd - navTiming.navigationStart);
          this.recordMetric('pageLoad', navTiming.loadEventEnd - navTiming.navigationStart);
        }
      }, 0);
    });
  }

  // تسجيل مؤشر أداء
  recordMetric(name, value) {
    const timestamp = Date.now();
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metricHistory = this.metrics.get(name);
    metricHistory.push({ value, timestamp });
    
    // الاحتفاظ بآخر 100 قياس فقط
    if (metricHistory.length > 100) {
      metricHistory.shift();
    }
  }

  // إنشاء تنبيه
  createAlert(type, currentValue, threshold, severity, metadata = {}) {
    const alert = {
      id: Date.now() + Math.random(),
      type,
      currentValue,
      threshold,
      severity,
      metadata,
      timestamp: Date.now(),
      message: this.generateAlertMessage(type, currentValue, threshold)
    };
    
    this.alerts.push(alert);
    
    // إشعار المطورين في وضع التطوير
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ ${alert.message}`, alert);
    }
    
    // إرسال للتحليل
    this.reportAlert(alert);
  }

  // إنشاء رسالة تنبيه
  generateAlertMessage(type, current, threshold) {
    const messages = {
      'LCP': `LCP بطيء: ${Math.round(current)}ms (الحد الأقصى: ${threshold}ms)`,
      'FID': `FID مرتفع: ${Math.round(current)}ms (الحد الأقصى: ${threshold}ms)`,
      'CLS': `CLS مرتفع: ${current.toFixed(3)} (الحد الأقصى: ${threshold})`,
      'FCP': `FCP بطيء: ${Math.round(current)}ms (الحد الأقصى: ${threshold}ms)`,
      'Memory': `استخدام ذاكرة مرتفع: ${Math.round(current)}MB (الحد الأقصى: ${threshold}MB)`,
      'Slow Resource': `مورد بطيء: ${Math.round(current)}ms (الحد الأقصى: ${threshold}ms)`,
      'Large Resource': `مورد كبير: ${Math.round(current / 1024)}KB (الحد الأقصى: ${Math.round(threshold / 1024)}KB)`,
      'Slow Interaction': `تفاعل بطيء: ${Math.round(current)}ms (الحد الأقصى: ${threshold}ms)`,
      'Slow Network': `شبكة بطيئة: ${current} (الموصى به: ${threshold})`
    };
    
    return messages[type] || `تنبيه ${type}: ${current} (الحد: ${threshold})`;
  }

  // الحصول على تقرير الأداء
  getPerformanceReport() {
    const report = {
      timestamp: Date.now(),
      summary: this.calculateSummary(),
      metrics: Object.fromEntries(this.metrics),
      alerts: this.alerts.slice(-20), // آخر 20 تنبيه
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  // حساب ملخص الأداء
  calculateSummary() {
    const summary = {};
    
    this.metrics.forEach((values, metricName) => {
      if (values.length > 0) {
        const latest = values[values.length - 1].value;
        const average = values.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0) / values.length;
        
        summary[metricName] = {
          current: latest,
          average: Math.round(average * 100) / 100,
          trend: this.calculateTrend(values)
        };
      }
    });
    
    return summary;
  }

  // حساب الاتجاه
  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(-5); // آخر 5 قيم
    const older = values.slice(-10, -5); // 5 قيم قبلها
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  // إنشاء توصيات التحسين
  generateRecommendations() {
    const recommendations = [];
    const summary = this.calculateSummary();
    
    // توصيات LCP
    if (summary.lcp && summary.lcp.current > this.thresholds.lcp) {
      recommendations.push({
        type: 'LCP',
        priority: 'high',
        message: 'قم بتحسين تحميل أكبر عنصر مرئي',
        actions: [
          'تحسين الصور وضغطها',
          'استخدام lazy loading للصور',
          'تحسين الخطوط وتحميلها بشكل أسرع',
          'تقليل حجم CSS و JavaScript'
        ]
      });
    }
    
    // توصيات الذاكرة
    if (summary.memoryUsed && summary.memoryUsed.current > this.thresholds.memoryUsage) {
      recommendations.push({
        type: 'Memory',
        priority: 'high',
        message: 'تحسين استخدام الذاكرة',
        actions: [
          'تنظيف event listeners غير المستخدمة',
          'إزالة المراجع الدائرية',
          'استخدام WeakMap و WeakSet',
          'تحسين إدارة DOM'
        ]
      });
    }
    
    // توصيات الشبكة
    if (this.alerts.some(alert => alert.type === 'Slow Network')) {
      recommendations.push({
        type: 'Network',
        priority: 'medium',
        message: 'تحسين الأداء للشبكات البطيئة',
        actions: [
          'تفعيل ضغط gzip',
          'استخدام Service Workers للتخزين المؤقت',
          'تقليل عدد طلبات HTTP',
          'استخدام CDN للموارد الثابتة'
        ]
      });
    }
    
    return recommendations;
  }

  // تقرير دوري
  schedulePeriodicReporting() {
    setInterval(() => {
      if (this.isMonitoring) {
        const report = this.getPerformanceReport();
        this.saveReportLocally(report);
        
        // إرسال للخادم إذا لزم الأمر
        if (this.shouldSendReport(report)) {
          this.sendReportToServer(report);
        }
      }
    }, 30000); // كل 30 ثانية
  }

  // حفظ التقرير محلياً
  saveReportLocally(report) {
    try {
      const reports = JSON.parse(localStorage.getItem('performance_reports') || '[]');
      reports.push(report);
      
      // الاحتفاظ بآخر 50 تقرير فقط
      if (reports.length > 50) {
        reports.splice(0, reports.length - 50);
      }
      
      localStorage.setItem('performance_reports', JSON.stringify(reports));
    } catch (error) {
      console.error('خطأ في حفظ تقرير الأداء:', error);
    }
  }

  // تحديد ما إذا كان يجب إرسال التقرير
  shouldSendReport(report) {
    // إرسال التقرير إذا كان هناك تنبيهات عالية الخطورة
    return report.alerts.some(alert => alert.severity === 'high');
  }

  // إرسال التقرير للخادم
  async sendReportToServer(report) {
    try {
      // في المستقبل، يمكن إرسال التقرير لنظام مراقبة مركزي
      console.log('📊 تقرير الأداء:', report);
    } catch (error) {
      console.error('خطأ في إرسال تقرير الأداء:', error);
    }
  }

  // إرسال تنبيه للخادم
  async reportAlert(alert) {
    try {
      // حفظ محلي للتنبيهات
      const alerts = JSON.parse(localStorage.getItem('performance_alerts') || '[]');
      alerts.push(alert);
      
      if (alerts.length > 100) {
        alerts.splice(0, alerts.length - 100);
      }
      
      localStorage.setItem('performance_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('خطأ في حفظ التنبيه:', error);
    }
  }

  // تنظيف الموارد
  cleanup() {
    this.stopMonitoring();
    
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
    
    this.metrics.clear();
    this.alerts.length = 0;
  }
}

// تصدير singleton instance
export const performanceMonitor = new AdvancedPerformanceMonitor();

// بدء المراقبة التلقائية
if (typeof window !== 'undefined') {
  // بدء المراقبة بعد تحميل الصفحة
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceMonitor.startMonitoring();
    });
  } else {
    performanceMonitor.startMonitoring();
  }
  
  // تنظيف عند إغلاق الصفحة
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup();
  });
}