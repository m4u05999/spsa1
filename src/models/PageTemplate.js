/**
 * Page Template Model - Defines the structure for page templates
 * src/models/PageTemplate.js
 */

// Page Template Types Definition
export const PAGE_TEMPLATE_TYPES = {
  STANDARD: 'standard',
  LANDING: 'landing',
  CONTACT: 'contact',
  ABOUT: 'about',
  CUSTOM: 'custom',
};

// Page Section Types
export const PAGE_SECTION_TYPES = {
  HEADER: 'header',
  HERO: 'hero',
  TEXT: 'text',
  IMAGE: 'image',
  IMAGE_TEXT: 'image_text',
  GALLERY: 'gallery',
  CONTACT_FORM: 'contact_form',
  CTA: 'cta',
  LIST: 'list',
  TABLE: 'table',
  CUSTOM: 'custom',
};

// Section Layout Types
export const SECTION_LAYOUTS = {
  FULL_WIDTH: 'full-width',
  CONTAINED: 'contained',
  TWO_COLUMN: 'two-column',
  THREE_COLUMN: 'three-column',
  SIDE_BY_SIDE: 'side-by-side',
};

// Translation functions for UI display
export const translateTemplateType = (type) => {
  const translations = {
    [PAGE_TEMPLATE_TYPES.STANDARD]: 'قالب قياسي',
    [PAGE_TEMPLATE_TYPES.LANDING]: 'صفحة هبوط',
    [PAGE_TEMPLATE_TYPES.CONTACT]: 'صفحة تواصل',
    [PAGE_TEMPLATE_TYPES.ABOUT]: 'صفحة تعريفية',
    [PAGE_TEMPLATE_TYPES.CUSTOM]: 'قالب مخصص',
  };
  return translations[type] || type;
};

export const translateSectionType = (type) => {
  const translations = {
    [PAGE_SECTION_TYPES.HEADER]: 'رأس الصفحة',
    [PAGE_SECTION_TYPES.HERO]: 'قسم رئيسي',
    [PAGE_SECTION_TYPES.TEXT]: 'نص',
    [PAGE_SECTION_TYPES.IMAGE]: 'صورة',
    [PAGE_SECTION_TYPES.IMAGE_TEXT]: 'صورة ونص',
    [PAGE_SECTION_TYPES.GALLERY]: 'معرض صور',
    [PAGE_SECTION_TYPES.CONTACT_FORM]: 'نموذج اتصال',
    [PAGE_SECTION_TYPES.CTA]: 'دعوة للعمل',
    [PAGE_SECTION_TYPES.LIST]: 'قائمة',
    [PAGE_SECTION_TYPES.TABLE]: 'جدول',
    [PAGE_SECTION_TYPES.CUSTOM]: 'قسم مخصص',
  };
  return translations[type] || type;
};

export const translateSectionLayout = (layout) => {
  const translations = {
    [SECTION_LAYOUTS.FULL_WIDTH]: 'عرض كامل',
    [SECTION_LAYOUTS.CONTAINED]: 'محتوى محدود',
    [SECTION_LAYOUTS.TWO_COLUMN]: 'عمودان',
    [SECTION_LAYOUTS.THREE_COLUMN]: 'ثلاثة أعمدة',
    [SECTION_LAYOUTS.SIDE_BY_SIDE]: 'جنبا إلى جنب',
  };
  return translations[layout] || layout;
};

// PageSection class
export class PageSection {
  constructor(id, type, title, content, layout = SECTION_LAYOUTS.CONTAINED, props = {}) {
    this.id = id || Math.random().toString(36).substr(2, 9);
    this.type = type;
    this.title = title || '';
    this.content = content || '';
    this.layout = layout;
    this.props = props; // Additional section-specific properties
  }

  static createEmpty(type = PAGE_SECTION_TYPES.TEXT) {
    const id = Math.random().toString(36).substr(2, 9);
    return new PageSection(
      id,
      type,
      '',
      '',
      type === PAGE_SECTION_TYPES.HERO ? SECTION_LAYOUTS.FULL_WIDTH : SECTION_LAYOUTS.CONTAINED
    );
  }
}

// PageTemplate class
export class PageTemplate {
  constructor(id, name, description, type, sections = [], thumbnail = null) {
    this.id = id || Math.random().toString(36).substr(2, 9);
    this.name = name || '';
    this.description = description || '';
    this.type = type || PAGE_TEMPLATE_TYPES.STANDARD;
    this.sections = sections;
    this.thumbnail = thumbnail;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static createEmpty() {
    const id = Math.random().toString(36).substr(2, 9);
    const heroSection = PageSection.createEmpty(PAGE_SECTION_TYPES.HERO);
    const contentSection = PageSection.createEmpty(PAGE_SECTION_TYPES.TEXT);
    
    return new PageTemplate(
      id,
      'قالب جديد',
      'وصف القالب',
      PAGE_TEMPLATE_TYPES.STANDARD,
      [heroSection, contentSection]
    );
  }

  addSection(type) {
    const newSection = PageSection.createEmpty(type);
    this.sections.push(newSection);
    this.updatedAt = new Date().toISOString();
    return newSection;
  }

  removeSection(sectionId) {
    this.sections = this.sections.filter(section => section.id !== sectionId);
    this.updatedAt = new Date().toISOString();
  }

  moveSection(sectionId, direction) {
    const index = this.sections.findIndex(section => section.id === sectionId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = this.sections[index - 1];
      this.sections[index - 1] = this.sections[index];
      this.sections[index] = temp;
    } else if (direction === 'down' && index < this.sections.length - 1) {
      const temp = this.sections[index + 1];
      this.sections[index + 1] = this.sections[index];
      this.sections[index] = temp;
    }
    
    this.updatedAt = new Date().toISOString();
  }

  updateSection(sectionId, updatedData) {
    const index = this.sections.findIndex(section => section.id === sectionId);
    if (index !== -1) {
      this.sections[index] = { ...this.sections[index], ...updatedData };
      this.updatedAt = new Date().toISOString();
    }
  }
}

// Validation function for templates
export const validateTemplate = (template) => {
  const errors = {};
  
  if (!template.name || template.name.trim() === '') {
    errors.name = 'اسم القالب مطلوب';
  }
  
  if (!template.type || !Object.values(PAGE_TEMPLATE_TYPES).includes(template.type)) {
    errors.type = 'نوع القالب غير صالح';
  }
  
  if (!template.sections || template.sections.length === 0) {
    errors.sections = 'يجب أن يحتوي القالب على قسم واحد على الأقل';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};