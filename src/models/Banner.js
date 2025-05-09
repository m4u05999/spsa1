// src/models/Banner.js
/**
 * @fileoverview نموذج البانر - يحدد بنية عناصر البانر وخصائص التصميم
 */

/**
 * أنواع البانر المدعومة
 * @readonly
 * @enum {string}
 */
export const BANNER_TYPES = {
  HERO: 'hero',           // بانر رئيسي كبير
  SIDEBAR: 'sidebar',     // بانر جانبي
  INLINE: 'inline',       // بانر داخل المحتوى
  POPUP: 'popup',         // بانر منبثق
  SLIDER: 'slider',       // بانر متحرك
  RIBBON: 'ribbon'        // شريط إعلاني
};

/**
 * مقاسات البانر القياسية
 * @readonly
 * @enum {Object}
 */
export const BANNER_SIZES = {
  [BANNER_TYPES.HERO]: { width: 1200, height: 400 },
  [BANNER_TYPES.SIDEBAR]: { width: 300, height: 250 },
  [BANNER_TYPES.INLINE]: { width: 728, height: 90 },
  [BANNER_TYPES.POPUP]: { width: 600, height: 400 },
  [BANNER_TYPES.SLIDER]: { width: 800, height: 300 },
  [BANNER_TYPES.RIBBON]: { width: 970, height: 50 }
};

/**
 * حالات البانر
 * @readonly
 * @enum {string}
 */
export const BANNER_STATUS = {
  DRAFT: 'draft',         // مسودة (غير منشور)
  ACTIVE: 'active',       // نشط (منشور)
  INACTIVE: 'inactive',   // غير نشط (متوقف)
  SCHEDULED: 'scheduled'  // مجدول للنشر
};

/**
 * صنف يمثل بانر في النظام
 */
class Banner {
  /**
   * إنشاء كائن بانر جديد
   * @param {Object} data - بيانات البانر
   * @param {string} data.id - معرف فريد للبانر
   * @param {string} data.title - عنوان البانر
   * @param {string} data.type - نوع البانر (hero, sidebar, inline, popup, slider, ribbon)
   * @param {Object} data.mediaId - معرف الوسائط المستخدمة في البانر
   * @param {string} data.link - الرابط الذي سيتم التوجيه إليه عند النقر
   * @param {string} data.status - حالة البانر (draft, active, inactive, scheduled)
   * @param {Date} data.createdAt - تاريخ إنشاء البانر
   * @param {string} data.createdBy - معرف المستخدم الذي قام بإنشاء البانر
   * @param {Date} [data.updatedAt] - تاريخ آخر تحديث للبانر
   * @param {string} [data.updatedBy] - معرف المستخدم الذي قام بآخر تحديث للبانر
   * @param {Object} [data.design={}] - خصائص تصميم البانر
   * @param {number} [data.design.width] - عرض البانر بالبيكسل
   * @param {number} [data.design.height] - ارتفاع البانر بالبيكسل
   * @param {string} [data.design.backgroundColor] - لون خلفية البانر
   * @param {string} [data.design.textColor] - لون النص في البانر
   * @param {string} [data.design.alignment] - محاذاة محتوى البانر
   * @param {string} [data.design.animation] - نوع الحركة المستخدمة للبانر
   * @param {boolean} [data.design.responsive] - هل البانر متجاوب مع أحجام الشاشة
   * @param {string} [data.description=''] - وصف البانر
   * @param {Array<string>} [data.tags=[]] - وسوم لتصنيف البانر
   * @param {string} [data.category='uncategorized'] - تصنيف البانر
   */
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.title = data.title || '';
    this.type = this.validateType(data.type) || BANNER_TYPES.INLINE;
    this.mediaId = data.mediaId || null;
    this.link = data.link || '#';
    this.status = this.validateStatus(data.status) || BANNER_STATUS.DRAFT;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.createdBy = data.createdBy || '';
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
    this.updatedBy = data.updatedBy || null;
    this.description = data.description || '';
    this.tags = data.tags || [];
    this.category = data.category || 'uncategorized';

    // تعيين خصائص التصميم مع توفير القيم الافتراضية استنادًا إلى نوع البانر
    const defaultSize = BANNER_SIZES[this.type] || { width: 300, height: 250 };
    this.design = {
      width: data.design?.width || defaultSize.width,
      height: data.design?.height || defaultSize.height,
      backgroundColor: data.design?.backgroundColor || '#ffffff',
      textColor: data.design?.textColor || '#000000',
      alignment: data.design?.alignment || 'center',
      animation: data.design?.animation || 'none',
      responsive: data.design?.responsive !== undefined ? data.design.responsive : true,
      borderRadius: data.design?.borderRadius || 0,
      padding: data.design?.padding || 0,
      overlay: data.design?.overlay || false,
      overlayColor: data.design?.overlayColor || 'rgba(0,0,0,0.5)',
      buttonText: data.design?.buttonText || '',
      buttonColor: data.design?.buttonColor || '#3366cc',
      buttonTextColor: data.design?.buttonTextColor || '#ffffff',
      buttonBorderRadius: data.design?.buttonBorderRadius || 4,
      headline: data.design?.headline || '',
      headlineSize: data.design?.headlineSize || 24,
      subtext: data.design?.subtext || '',
      subtextSize: data.design?.subtextSize || 16,
    };
  }

  /**
   * التحقق من صحة نوع البانر
   * @param {string} type - نوع البانر
   * @returns {string|null} نوع البانر الصحيح أو null
   */
  validateType(type) {
    if (type && Object.values(BANNER_TYPES).includes(type)) {
      return type;
    }
    return null;
  }

  /**
   * التحقق من صحة حالة البانر
   * @param {string} status - حالة البانر
   * @returns {string|null} حالة البانر الصحيحة أو null
   */
  validateStatus(status) {
    if (status && Object.values(BANNER_STATUS).includes(status)) {
      return status;
    }
    return null;
  }

  /**
   * التحقق من صحة بيانات البانر
   * @returns {Object} نتيجة التحقق { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.title) {
      errors.push('عنوان البانر مطلوب');
    }

    if (!this.mediaId) {
      errors.push('صورة البانر مطلوبة');
    }

    if (!this.type) {
      errors.push('نوع البانر مطلوب');
    }

    if (!this.design.width || !this.design.height) {
      errors.push('يجب تحديد أبعاد البانر');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * تحويل كائن البانر إلى كائن JSON
   * @returns {Object} تمثيل JSON للكائن
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      mediaId: this.mediaId,
      link: this.link,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      createdBy: this.createdBy,
      updatedAt: this.updatedAt ? this.updatedAt.toISOString() : null,
      updatedBy: this.updatedBy,
      design: { ...this.design },
      description: this.description,
      tags: this.tags,
      category: this.category
    };
  }

  /**
   * إنشاء كائن بانر من بيانات JSON
   * @param {Object} json - بيانات JSON
   * @returns {Banner} كائن بانر جديد
   */
  static fromJSON(json) {
    return new Banner(json);
  }

  /**
   * تحديث بيانات البانر
   * @param {Object} updates - البيانات المراد تحديثها
   * @param {string} [userId] - معرف المستخدم الذي يقوم بالتحديث
   * @returns {Banner} البانر بعد التحديث
   */
  update(updates, userId = '') {
    // تحديث البيانات الرئيسية
    if (updates.title !== undefined) this.title = updates.title;
    if (updates.type !== undefined) this.type = this.validateType(updates.type) || this.type;
    if (updates.mediaId !== undefined) this.mediaId = updates.mediaId;
    if (updates.link !== undefined) this.link = updates.link;
    if (updates.status !== undefined) this.status = this.validateStatus(updates.status) || this.status;
    if (updates.description !== undefined) this.description = updates.description;
    if (updates.tags !== undefined) this.tags = updates.tags;
    if (updates.category !== undefined) this.category = updates.category;

    // تحديث بيانات التصميم
    if (updates.design) {
      this.design = {
        ...this.design,
        ...updates.design
      };
    }

    // تحديث بيانات التعديل
    this.updatedAt = new Date();
    this.updatedBy = userId;

    return this;
  }
}

export default Banner;