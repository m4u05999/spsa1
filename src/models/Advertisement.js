// src/models/Advertisement.js
/**
 * @fileoverview نموذج الإعلانات - يحدد بنية إعلانات الموقع وجدولة ظهورها
 */

/**
 * أماكن ظهور الإعلانات في الموقع
 * @readonly
 * @enum {string}
 */
export const AD_PLACEMENT_LOCATIONS = {
  HOME_TOP: 'home_top',                 // أعلى الصفحة الرئيسية
  HOME_MIDDLE: 'home_middle',           // منتصف الصفحة الرئيسية
  HOME_BOTTOM: 'home_bottom',           // أسفل الصفحة الرئيسية
  ARTICLE_TOP: 'article_top',           // أعلى صفحة المقال
  ARTICLE_MIDDLE: 'article_middle',     // منتصف صفحة المقال
  ARTICLE_BOTTOM: 'article_bottom',     // أسفل صفحة المقال
  ARTICLE_SIDEBAR: 'article_sidebar',   // الشريط الجانبي للمقال
  CATEGORY_TOP: 'category_top',         // أعلى صفحة التصنيف
  SEARCH_TOP: 'search_top',             // أعلى نتائج البحث
  GLOBAL_HEADER: 'global_header',       // أعلى جميع الصفحات
  GLOBAL_FOOTER: 'global_footer',       // أسفل جميع الصفحات
  POPUP: 'popup',                       // إعلان منبثق
};

/**
 * حالات الإعلان
 * @readonly
 * @enum {string}
 */
export const AD_STATUS = {
  DRAFT: 'draft',           // مسودة (غير منشور)
  ACTIVE: 'active',         // نشط (منشور)
  INACTIVE: 'inactive',     // غير نشط (متوقف)
  SCHEDULED: 'scheduled',   // مجدول للنشر
  EXPIRED: 'expired'        // منتهي الصلاحية
};

/**
 * صنف يمثل إعلان في النظام
 */
class Advertisement {
  /**
   * إنشاء كائن إعلان جديد
   * @param {Object} data - بيانات الإعلان
   * @param {string} data.id - معرف فريد للإعلان
   * @param {string} data.name - اسم الإعلان (للاستخدام الإداري)
   * @param {string} data.bannerId - معرف البانر المرتبط بالإعلان
   * @param {string} data.location - موقع ظهور الإعلان في الصفحة
   * @param {string} data.status - حالة الإعلان (draft, active, inactive, scheduled, expired)
   * @param {Date} data.startDate - تاريخ بدء عرض الإعلان
   * @param {Date} [data.endDate] - تاريخ انتهاء عرض الإعلان
   * @param {Array<string>} [data.pages=[]] - الصفحات المحددة لعرض الإعلان (إذا كان فارغًا، يظهر في جميع الصفحات المناسبة)
   * @param {Object} [data.targeting={}] - استهداف المستخدمين
   * @param {Array<string>} [data.targeting.roles=[]] - أدوار المستخدمين المستهدفة
   * @param {Array<string>} [data.targeting.countries=[]] - الدول المستهدفة
   * @param {Array<string>} [data.targeting.languages=[]] - اللغات المستهدفة
   * @param {Array<string>} [data.targeting.devices=[]] - الأجهزة المستهدفة (desktop, mobile, tablet)
   * @param {number} [data.priority=0] - أولوية الإعلان (الأعلى يظهر أولاً)
   * @param {Date} data.createdAt - تاريخ إنشاء الإعلان
   * @param {string} data.createdBy - معرف المستخدم الذي قام بإنشاء الإعلان
   * @param {Date} [data.updatedAt] - تاريخ آخر تحديث للإعلان
   * @param {string} [data.updatedBy] - معرف المستخدم الذي قام بآخر تحديث للإعلان
   * @param {boolean} [data.isSponsored=false] - هل الإعلان مدفوع أم لا
   * @param {number} [data.maxImpressions] - الحد الأقصى لعدد مرات الظهور
   * @param {number} [data.maxClicks] - الحد الأقصى لعدد النقرات
   * @param {number} [data.impressions=0] - عدد مرات الظهور الفعلي
   * @param {number} [data.clicks=0] - عدد النقرات الفعلي
   */
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name || '';
    this.bannerId = data.bannerId || '';
    this.location = this.validateLocation(data.location);
    this.status = this.validateStatus(data.status) || AD_STATUS.DRAFT;
    
    // تواريخ العرض
    this.startDate = data.startDate ? new Date(data.startDate) : new Date();
    this.endDate = data.endDate ? new Date(data.endDate) : null;
    
    // إعدادات الاستهداف
    this.pages = data.pages || [];
    this.targeting = {
      roles: data.targeting?.roles || [],
      countries: data.targeting?.countries || [],
      languages: data.targeting?.languages || [],
      devices: data.targeting?.devices || []
    };
    
    // أولوية الإعلان
    this.priority = data.priority || 0;
    
    // بيانات الإنشاء والتعديل
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.createdBy = data.createdBy || '';
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
    this.updatedBy = data.updatedBy || null;
    
    // بيانات إحصائية
    this.isSponsored = data.isSponsored || false;
    this.maxImpressions = data.maxImpressions || null;
    this.maxClicks = data.maxClicks || null;
    this.impressions = data.impressions || 0;
    this.clicks = data.clicks || 0;
  }

  /**
   * التحقق من صحة موقع الإعلان
   * @param {string} location - موقع الإعلان
   * @returns {string} موقع الإعلان الصحيح أو القيمة الافتراضية
   */
  validateLocation(location) {
    if (location && Object.values(AD_PLACEMENT_LOCATIONS).includes(location)) {
      return location;
    }
    return AD_PLACEMENT_LOCATIONS.HOME_TOP;  // القيمة الافتراضية
  }

  /**
   * التحقق من صحة حالة الإعلان
   * @param {string} status - حالة الإعلان
   * @returns {string|null} حالة الإعلان الصحيحة أو null
   */
  validateStatus(status) {
    if (status && Object.values(AD_STATUS).includes(status)) {
      return status;
    }
    return null;
  }

  /**
   * التحقق من صحة بيانات الإعلان
   * @returns {Object} نتيجة التحقق { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.name) {
      errors.push('اسم الإعلان مطلوب');
    }

    if (!this.bannerId) {
      errors.push('يجب تحديد البانر المرتبط بالإعلان');
    }

    if (!this.location) {
      errors.push('يجب تحديد موقع ظهور الإعلان');
    }

    if (!this.startDate) {
      errors.push('تاريخ بدء الإعلان مطلوب');
    }

    // التحقق من أن تاريخ الانتهاء بعد تاريخ البدء
    if (this.endDate && this.startDate && this.endDate <= this.startDate) {
      errors.push('يجب أن يكون تاريخ انتهاء الإعلان بعد تاريخ البدء');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * تحويل كائن الإعلان إلى كائن JSON
   * @returns {Object} تمثيل JSON للكائن
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      bannerId: this.bannerId,
      location: this.location,
      status: this.status,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate ? this.endDate.toISOString() : null,
      pages: this.pages,
      targeting: { ...this.targeting },
      priority: this.priority,
      createdAt: this.createdAt.toISOString(),
      createdBy: this.createdBy,
      updatedAt: this.updatedAt ? this.updatedAt.toISOString() : null,
      updatedBy: this.updatedBy,
      isSponsored: this.isSponsored,
      maxImpressions: this.maxImpressions,
      maxClicks: this.maxClicks,
      impressions: this.impressions,
      clicks: this.clicks
    };
  }

  /**
   * إنشاء كائن إعلان من بيانات JSON
   * @param {Object} json - بيانات JSON
   * @returns {Advertisement} كائن إعلان جديد
   */
  static fromJSON(json) {
    return new Advertisement(json);
  }

  /**
   * تحديث حالة الإعلان بناءً على تواريخ البدء والانتهاء
   * @returns {string} الحالة المحدثة للإعلان
   */
  updateStatus() {
    const now = new Date();
    
    // إذا كان الإعلان بحالة مسودة، نحتفظ بالحالة كما هي
    if (this.status === AD_STATUS.DRAFT || this.status === AD_STATUS.INACTIVE) {
      return this.status;
    }
    
    // إذا كان تاريخ البدء في المستقبل
    if (this.startDate > now) {
      this.status = AD_STATUS.SCHEDULED;
    } 
    // إذا كان تاريخ الانتهاء موجودًا وتم تجاوزه
    else if (this.endDate && this.endDate < now) {
      this.status = AD_STATUS.EXPIRED;
    } 
    // إذا تم تجاوز الحد الأقصى للظهور
    else if (this.maxImpressions && this.impressions >= this.maxImpressions) {
      this.status = AD_STATUS.EXPIRED;
    } 
    // إذا تم تجاوز الحد الأقصى للنقرات
    else if (this.maxClicks && this.clicks >= this.maxClicks) {
      this.status = AD_STATUS.EXPIRED;
    } 
    // الحالة النشطة الافتراضية
    else {
      this.status = AD_STATUS.ACTIVE;
    }

    return this.status;
  }

  /**
   * تسجيل ظهور للإعلان
   */
  recordImpression() {
    this.impressions++;
    if (this.maxImpressions && this.impressions >= this.maxImpressions) {
      this.status = AD_STATUS.EXPIRED;
    }
  }

  /**
   * تسجيل نقرة على الإعلان
   */
  recordClick() {
    this.clicks++;
    if (this.maxClicks && this.clicks >= this.maxClicks) {
      this.status = AD_STATUS.EXPIRED;
    }
  }

  /**
   * حساب معدل النقر إلى الظهور (CTR)
   * @returns {number} معدل النقر إلى الظهور كنسبة مئوية
   */
  calculateCTR() {
    if (this.impressions === 0) return 0;
    return (this.clicks / this.impressions) * 100;
  }

  /**
   * التحقق مما إذا كان الإعلان مستحق الظهور في الوقت الحالي
   * @returns {boolean} هل الإعلان مستحق الظهور
   */
  isEligibleToDisplay() {
    this.updateStatus();
    return this.status === AD_STATUS.ACTIVE;
  }

  /**
   * تحديث بيانات الإعلان
   * @param {Object} updates - البيانات المراد تحديثها
   * @param {string} [userId] - معرف المستخدم الذي يقوم بالتحديث
   * @returns {Advertisement} الإعلان بعد التحديث
   */
  update(updates, userId = '') {
    // تحديث البيانات الأساسية
    if (updates.name !== undefined) this.name = updates.name;
    if (updates.bannerId !== undefined) this.bannerId = updates.bannerId;
    if (updates.location !== undefined) {
      this.location = this.validateLocation(updates.location);
    }
    if (updates.status !== undefined) {
      this.status = this.validateStatus(updates.status) || this.status;
    }
    if (updates.startDate !== undefined) {
      this.startDate = new Date(updates.startDate);
    }
    if (updates.endDate !== undefined) {
      this.endDate = updates.endDate ? new Date(updates.endDate) : null;
    }
    if (updates.pages !== undefined) this.pages = updates.pages;
    if (updates.priority !== undefined) this.priority = updates.priority;
    if (updates.isSponsored !== undefined) this.isSponsored = updates.isSponsored;
    if (updates.maxImpressions !== undefined) this.maxImpressions = updates.maxImpressions;
    if (updates.maxClicks !== undefined) this.maxClicks = updates.maxClicks;
    
    // تحديث بيانات الاستهداف
    if (updates.targeting) {
      this.targeting = {
        ...this.targeting,
        ...updates.targeting
      };
    }
    
    // تحديث بيانات التعديل
    this.updatedAt = new Date();
    this.updatedBy = userId;
    
    return this;
  }
}

export default Advertisement;