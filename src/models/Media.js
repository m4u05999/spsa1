// src/models/Media.js
/**
 * @fileoverview نموذج الوسائط - يحدد بنية عناصر الوسائط المتعددة وميتاداتا الملفات
 */

/**
 * أصناف الملفات المدعومة في مكتبة الوسائط
 * @readonly
 * @enum {string}
 */
export const MEDIA_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio',
  OTHER: 'other'
};

/**
 * امتدادات الملفات المدعومة مصنفة حسب نوع الوسائط
 * @readonly
 * @type {Object}
 */
export const FILE_EXTENSIONS = {
  [MEDIA_TYPES.IMAGE]: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
  [MEDIA_TYPES.DOCUMENT]: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  [MEDIA_TYPES.VIDEO]: ['mp4', 'webm', 'avi', 'mov', 'wmv'],
  [MEDIA_TYPES.AUDIO]: ['mp3', 'wav', 'ogg', 'aac'],
};

/**
 * الحد الأقصى المسموح لحجم الملف بالبايت (10 ميجابايت)
 * @readonly
 * @type {number}
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * صنف يمثل ملف وسائط متعددة في النظام
 */
class Media {
  /**
   * إنشاء كائن وسائط جديد
   * @param {Object} data - بيانات الوسائط
   * @param {string} data.id - معرف فريد للملف
   * @param {string} data.name - اسم الملف
   * @param {string} data.filename - اسم الملف بالامتداد
   * @param {string} data.path - مسار الملف في النظام
   * @param {string} data.type - نوع الملف (صورة، مستند، فيديو، صوت، أخرى)
   * @param {number} data.size - حجم الملف بالبايت
   * @param {string} data.mimeType - نوع MIME للملف
   * @param {Date} data.createdAt - تاريخ إنشاء الملف
   * @param {string} data.createdBy - معرف المستخدم الذي قام برفع الملف
   * @param {Array<string>} [data.tags=[]] - وسوم لتصنيف الملف
   * @param {string} [data.category='uncategorized'] - تصنيف الملف
   * @param {string} [data.description=''] - وصف الملف
   * @param {number} [data.width] - عرض الصورة أو الفيديو (إن وجد)
   * @param {number} [data.height] - ارتفاع الصورة أو الفيديو (إن وجد)
   * @param {number} [data.duration] - مدة الفيديو أو الصوت بالثواني (إن وجد)
   * @param {string} [data.thumbnailPath] - مسار الصورة المصغرة (للفيديو)
   * @param {string} [data.alt=''] - النص البديل للصورة
   */
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name || '';
    this.filename = data.filename || '';
    this.path = data.path || '';
    this.type = this.detectType(data.type, data.filename);
    this.size = data.size || 0;
    this.mimeType = data.mimeType || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.createdBy = data.createdBy || '';
    this.tags = data.tags || [];
    this.category = data.category || 'uncategorized';
    this.description = data.description || '';
    this.width = data.width || null;
    this.height = data.height || null;
    this.duration = data.duration || null;
    this.thumbnailPath = data.thumbnailPath || '';
    this.alt = data.alt || '';
  }

  /**
   * تحديد نوع الملف بناءً على الامتداد أو النوع المحدد
   * @param {string} type - نوع الملف المدخل
   * @param {string} filename - اسم الملف بالامتداد
   * @returns {string} نوع الملف المكتشف
   */
  detectType(type, filename) {
    if (type && Object.values(MEDIA_TYPES).includes(type)) {
      return type;
    }

    if (filename) {
      const extension = filename.split('.').pop().toLowerCase();
      
      for (const [mediaType, extensions] of Object.entries(FILE_EXTENSIONS)) {
        if (extensions.includes(extension)) {
          return mediaType;
        }
      }
    }
    
    return MEDIA_TYPES.OTHER;
  }

  /**
   * التحقق من صحة بيانات الوسائط
   * @returns {Object} نتيجة التحقق { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.name) {
      errors.push('اسم الملف مطلوب');
    }

    if (!this.path) {
      errors.push('مسار الملف مطلوب');
    }

    if (this.size > MAX_FILE_SIZE) {
      errors.push(`حجم الملف يتجاوز الحد المسموح به (${MAX_FILE_SIZE / (1024 * 1024)} ميجابايت)`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * تحويل كائن الوسائط إلى نص JSON
   * @returns {string} تمثيل JSON للكائن
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      filename: this.filename,
      path: this.path,
      type: this.type,
      size: this.size,
      mimeType: this.mimeType,
      createdAt: this.createdAt.toISOString(),
      createdBy: this.createdBy,
      tags: this.tags,
      category: this.category,
      description: this.description,
      width: this.width,
      height: this.height,
      duration: this.duration,
      thumbnailPath: this.thumbnailPath,
      alt: this.alt
    };
  }

  /**
   * إنشاء كائن وسائط من بيانات JSON
   * @param {Object} json - بيانات JSON
   * @returns {Media} كائن وسائط جديد
   */
  static fromJSON(json) {
    return new Media(json);
  }

  /**
   * الحصول على URL كامل للملف
   * @param {string} baseUrl - عنوان URL الأساسي للتطبيق
   * @returns {string} عنوان URL كامل للملف
   */
  getUrl(baseUrl = '') {
    if (this.path.startsWith('http')) {
      return this.path;
    }
    return `${baseUrl}${this.path}`;
  }

  /**
   * الحصول على حجم الملف بتنسيق قابل للقراءة
   * @returns {string} حجم الملف بتنسيق قابل للقراءة
   */
  getFormattedSize() {
    if (this.size < 1024) {
      return `${this.size} بايت`;
    } else if (this.size < 1024 * 1024) {
      return `${(this.size / 1024).toFixed(2)} كيلوبايت`;
    } else {
      return `${(this.size / (1024 * 1024)).toFixed(2)} ميجابايت`;
    }
  }
}

export default Media;