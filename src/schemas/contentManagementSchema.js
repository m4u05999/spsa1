// src/schemas/contentManagementSchema.js
/**
 * Unified Content Management Schema for SPSA
 * مخطط إدارة المحتوى الموحد للجمعية السعودية للعلوم السياسية
 * 
 * This schema defines the unified data structure for all content types
 * يحدد هذا المخطط هيكل البيانات الموحد لجميع أنواع المحتوى
 */

/**
 * Content Types Enumeration
 * تعداد أنواع المحتوى
 */
export const CONTENT_TYPES = {
  // News and Articles
  NEWS: 'news',
  ARTICLE: 'article',
  ANNOUNCEMENT: 'announcement',
  
  // Events and Activities
  EVENT: 'event',
  CONFERENCE: 'conference',
  WORKSHOP: 'workshop',
  LECTURE: 'lecture',
  
  // Publications
  RESEARCH: 'research',
  PUBLICATION: 'publication',
  JOURNAL: 'journal',
  
  // Static Pages
  PAGE: 'page',
  ABOUT: 'about',
  SERVICE: 'service'
};

/**
 * Content Status Enumeration
 * تعداد حالات المحتوى
 */
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  SCHEDULED: 'scheduled',
  DELETED: 'deleted'
};

/**
 * Event Status Enumeration
 * تعداد حالات الفعاليات
 */
export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed'
};

/**
 * Unified Content Schema
 * مخطط المحتوى الموحد
 */
export const ContentSchema = {
  // Basic Information
  id: 'string', // UUID
  title: 'string', // العنوان
  titleAr: 'string', // العنوان بالعربية
  slug: 'string', // الرابط المختصر
  
  // Content Details
  excerpt: 'string', // المقتطف
  excerptAr: 'string', // المقتطف بالعربية
  content: 'text', // المحتوى الكامل
  contentAr: 'text', // المحتوى بالعربية
  
  // Classification
  contentType: 'enum', // نوع المحتوى (من CONTENT_TYPES)
  category: 'string', // التصنيف
  tags: 'array', // الكلمات المفتاحية
  
  // Status and Publishing
  status: 'enum', // الحالة (من CONTENT_STATUS)
  publishedAt: 'datetime', // تاريخ النشر
  scheduledAt: 'datetime', // تاريخ النشر المجدول
  
  // Media
  featuredImage: 'string', // الصورة المميزة
  gallery: 'array', // معرض الصور
  attachments: 'array', // المرفقات
  
  // Event-specific fields (for events)
  eventDate: 'datetime', // تاريخ الفعالية
  eventTime: 'string', // وقت الفعالية
  location: 'string', // المكان
  locationAr: 'string', // المكان بالعربية
  eventStatus: 'enum', // حالة الفعالية (من EVENT_STATUS)
  maxAttendees: 'number', // العدد الأقصى للحضور
  currentAttendees: 'number', // العدد الحالي للحضور
  registrationRequired: 'boolean', // يتطلب تسجيل
  registrationDeadline: 'datetime', // آخر موعد للتسجيل
  speaker: 'string', // المتحدث
  speakerBio: 'text', // نبذة عن المتحدث
  
  // SEO and Analytics
  metaTitle: 'string', // عنوان SEO
  metaDescription: 'string', // وصف SEO
  viewsCount: 'number', // عدد المشاهدات
  likesCount: 'number', // عدد الإعجابات
  sharesCount: 'number', // عدد المشاركات
  
  // Author and Management
  authorId: 'string', // معرف المؤلف
  authorName: 'string', // اسم المؤلف
  editorId: 'string', // معرف المحرر
  
  // Flags and Settings
  isFeatured: 'boolean', // مميز
  isPinned: 'boolean', // مثبت
  allowComments: 'boolean', // السماح بالتعليقات
  isPublic: 'boolean', // عام أم خاص
  
  // Timestamps
  createdAt: 'datetime', // تاريخ الإنشاء
  updatedAt: 'datetime', // تاريخ آخر تحديث
  deletedAt: 'datetime', // تاريخ الحذف (soft delete)
  
  // PDPL Compliance
  dataRetentionDate: 'datetime', // تاريخ انتهاء الاحتفاظ بالبيانات
  consentRequired: 'boolean', // يتطلب موافقة
  personalDataIncluded: 'boolean' // يحتوي على بيانات شخصية
};

/**
 * Category Schema
 * مخطط التصنيفات
 */
export const CategorySchema = {
  id: 'string',
  name: 'string',
  nameAr: 'string',
  slug: 'string',
  description: 'text',
  descriptionAr: 'text',
  parentId: 'string', // للتصنيفات الفرعية
  color: 'string', // لون التصنيف
  icon: 'string', // أيقونة التصنيف
  sortOrder: 'number',
  isActive: 'boolean',
  createdAt: 'datetime',
  updatedAt: 'datetime'
};

/**
 * Tag Schema
 * مخطط الكلمات المفتاحية
 */
export const TagSchema = {
  id: 'string',
  name: 'string',
  nameAr: 'string',
  slug: 'string',
  usageCount: 'number', // عدد مرات الاستخدام
  color: 'string',
  createdAt: 'datetime'
};

/**
 * Media Schema
 * مخطط الوسائط
 */
export const MediaSchema = {
  id: 'string',
  filename: 'string',
  originalName: 'string',
  mimeType: 'string',
  size: 'number', // بالبايت
  url: 'string',
  thumbnailUrl: 'string',
  altText: 'string',
  altTextAr: 'string',
  caption: 'string',
  captionAr: 'string',
  uploadedBy: 'string', // معرف المستخدم
  isPublic: 'boolean',
  createdAt: 'datetime'
};

/**
 * Content-Media Relationship Schema
 * مخطط علاقة المحتوى بالوسائط
 */
export const ContentMediaSchema = {
  contentId: 'string',
  mediaId: 'string',
  mediaType: 'enum', // featured, gallery, attachment
  sortOrder: 'number',
  createdAt: 'datetime'
};

/**
 * Default Content Templates
 * قوالب المحتوى الافتراضية
 */
export const DEFAULT_TEMPLATES = {
  NEWS: {
    contentType: CONTENT_TYPES.NEWS,
    status: CONTENT_STATUS.DRAFT,
    allowComments: true,
    isPublic: true,
    category: 'أخبار عامة'
  },
  
  EVENT: {
    contentType: CONTENT_TYPES.EVENT,
    status: CONTENT_STATUS.DRAFT,
    eventStatus: EVENT_STATUS.UPCOMING,
    registrationRequired: false,
    allowComments: true,
    isPublic: true,
    category: 'فعاليات'
  },
  
  ARTICLE: {
    contentType: CONTENT_TYPES.ARTICLE,
    status: CONTENT_STATUS.DRAFT,
    allowComments: true,
    isPublic: true,
    category: 'مقالات'
  },
  
  PAGE: {
    contentType: CONTENT_TYPES.PAGE,
    status: CONTENT_STATUS.PUBLISHED,
    allowComments: false,
    isPublic: true,
    category: 'صفحات'
  }
};

/**
 * Validation Rules
 * قواعد التحقق
 */
export const VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 5,
    maxLength: 200
  },
  
  content: {
    required: true,
    minLength: 50
  },
  
  slug: {
    required: true,
    pattern: /^[a-z0-9-]+$/,
    maxLength: 100
  },
  
  eventDate: {
    requiredFor: ['event', 'conference', 'workshop', 'lecture'],
    futureDate: true
  },
  
  location: {
    requiredFor: ['event', 'conference', 'workshop', 'lecture'],
    minLength: 3
  }
};

export default {
  CONTENT_TYPES,
  CONTENT_STATUS,
  EVENT_STATUS,
  ContentSchema,
  CategorySchema,
  TagSchema,
  MediaSchema,
  ContentMediaSchema,
  DEFAULT_TEMPLATES,
  VALIDATION_RULES
};
