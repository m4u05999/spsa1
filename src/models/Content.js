/**
 * Content Model - Defines the structure for content items
 * src/models/Content.js
 */

// Content Types Definition
export const CONTENT_TYPES = {
  ARTICLE: 'article',
  RESEARCH: 'research',
  NEWS: 'news',
  ANALYSIS: 'analysis',
  PAGE: 'page',
  EVENT: 'event',
};

// Category and Tag structure
export class Category {
  constructor(id, name, slug, description = '') {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.count = 0;
  }

  static createFromName(name) {
    const id = Math.random().toString(36).substr(2, 9);
    const slug = name
      .toLowerCase()
      .replace(/[^\w\u0621-\u064A\s]/g, '') // Keep Arabic and English letters
      .replace(/\s+/g, '-');
    
    return new Category(id, name, slug);
  }
}

export class Tag {
  constructor(id, name, slug) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.count = 0;
  }

  static createFromName(name) {
    const id = Math.random().toString(36).substr(2, 9);
    const slug = name
      .toLowerCase()
      .replace(/[^\w\u0621-\u064A\s]/g, '') // Keep Arabic and English letters
      .replace(/\s+/g, '-');
    
    return new Tag(id, name, slug);
  }
}

// Content Status Definition
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  REVIEW: 'review',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
};

// Translation functions for UI display
export const translateContentType = (type) => {
  const translations = {
    [CONTENT_TYPES.ARTICLE]: 'مقال',
    [CONTENT_TYPES.RESEARCH]: 'بحث',
    [CONTENT_TYPES.NEWS]: 'خبر',
    [CONTENT_TYPES.ANALYSIS]: 'تحليل',
    [CONTENT_TYPES.PAGE]: 'صفحة ثابتة',
    [CONTENT_TYPES.EVENT]: 'فعالية',
  };
  return translations[type] || type;
};

export const translateContentStatus = (status) => {
  const translations = {
    [CONTENT_STATUS.DRAFT]: 'مسودة',
    [CONTENT_STATUS.REVIEW]: 'قيد المراجعة',
    [CONTENT_STATUS.PUBLISHED]: 'منشور',
    [CONTENT_STATUS.REJECTED]: 'مرفوض',
    [CONTENT_STATUS.ARCHIVED]: 'مؤرشف',
  };
  return translations[status] || status;
};

// Badge color helpers
export const getContentTypeBadgeColor = (type) => {
  const colors = {
    [CONTENT_TYPES.ARTICLE]: 'bg-blue-100 text-blue-800',
    [CONTENT_TYPES.RESEARCH]: 'bg-purple-100 text-purple-800',
    [CONTENT_TYPES.NEWS]: 'bg-green-100 text-green-800',
    [CONTENT_TYPES.ANALYSIS]: 'bg-amber-100 text-amber-800',
    [CONTENT_TYPES.PAGE]: 'bg-gray-100 text-gray-800',
    [CONTENT_TYPES.EVENT]: 'bg-pink-100 text-pink-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export const getContentStatusBadgeColor = (status) => {
  const colors = {
    [CONTENT_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
    [CONTENT_STATUS.REVIEW]: 'bg-amber-100 text-amber-800',
    [CONTENT_STATUS.PUBLISHED]: 'bg-green-100 text-green-800',
    [CONTENT_STATUS.REJECTED]: 'bg-red-100 text-red-800',
    [CONTENT_STATUS.ARCHIVED]: 'bg-slate-100 text-slate-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Content validation
export const validateContent = (content) => {
  const errors = {};
  
  if (!content.title || content.title.trim() === '') {
    errors.title = 'العنوان مطلوب';
  }
  
  if (!content.type || !Object.values(CONTENT_TYPES).includes(content.type)) {
    errors.type = 'نوع المحتوى غير صالح';
  }
  
  if (!content.status || !Object.values(CONTENT_STATUS).includes(content.status)) {
    errors.status = 'حالة المحتوى غير صالحة';
  }
  
  if (!content.author || content.author.trim() === '') {
    errors.author = 'اسم الكاتب مطلوب';
  }
  
  if (!content.content || content.content.trim() === '') {
    errors.content = 'المحتوى مطلوب';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Default content template
export const createDefaultContent = (type = CONTENT_TYPES.ARTICLE) => {
  return {
    title: '',
    type: type,
    author: '',
    status: CONTENT_STATUS.DRAFT,
    content: '',
    excerpt: '',
    categories: [],
    tags: [],
    featured: false,
    image: null
  };
};