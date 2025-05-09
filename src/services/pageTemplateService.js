/**
 * Page Template Service - Handles operations for page templates
 * src/services/pageTemplateService.js
 */
import localStorageService from './localStorageService';
import { 
  PageTemplate, 
  PageSection,
  PAGE_TEMPLATE_TYPES, 
  PAGE_SECTION_TYPES,
  SECTION_LAYOUTS
} from '../models/PageTemplate';

// Storage keys
const PAGE_TEMPLATES_STORAGE_KEY = 'cms_page_templates';

// Initial templates
const initialTemplates = [
  new PageTemplate(
    '1',
    'قالب صفحة قياسية',
    'قالب أساسي للصفحات العامة',
    PAGE_TEMPLATE_TYPES.STANDARD,
    [
      new PageSection(
        '1-1',
        PAGE_SECTION_TYPES.HERO,
        'العنوان الرئيسي',
        '<h1>العنوان الرئيسي للصفحة</h1><p>وصف مختصر للصفحة أو محتواها</p>',
        SECTION_LAYOUTS.FULL_WIDTH,
        { 
          backgroundImage: null,
          showButton: true,
          buttonText: 'المزيد',
          buttonLink: '#'
        }
      ),
      new PageSection(
        '1-2',
        PAGE_SECTION_TYPES.TEXT,
        'عن الجمعية',
        '<h2>عن الجمعية</h2><p>هنا يأتي وصف تفصيلي عن الجمعية السعودية للعلوم السياسية ودورها وأهدافها.</p><p>يمكن إضافة المزيد من التفاصيل حول الأنشطة والفعاليات والرؤية المستقبلية.</p>',
        SECTION_LAYOUTS.CONTAINED
      ),
      new PageSection(
        '1-3',
        PAGE_SECTION_TYPES.IMAGE_TEXT,
        'قسم صورة ونص',
        '<h3>عنوان القسم</h3><p>هذا القسم يجمع بين النص والصورة لعرض المحتوى بطريقة جذابة وفعالة.</p>',
        SECTION_LAYOUTS.SIDE_BY_SIDE,
        {
          image: null,
          imagePosition: 'right'
        }
      )
    ],
    '/assets/images/templates/standard-template.jpg'
  ),
  
  new PageTemplate(
    '2',
    'صفحة تعريفية',
    'قالب للصفحات التعريفية والتقديمية',
    PAGE_TEMPLATE_TYPES.ABOUT,
    [
      new PageSection(
        '2-1',
        PAGE_SECTION_TYPES.HERO,
        'من نحن',
        '<h1>من نحن</h1><p>تعرّف على الجمعية السعودية للعلوم السياسية</p>',
        SECTION_LAYOUTS.FULL_WIDTH,
        { 
          backgroundImage: null
        }
      ),
      new PageSection(
        '2-2',
        PAGE_SECTION_TYPES.TEXT,
        'رسالتنا',
        '<h2>رسالتنا</h2><p>نسعى إلى تعزيز الوعي السياسي وتطوير الدراسات والبحوث في مجال العلوم السياسية.</p>',
        SECTION_LAYOUTS.CONTAINED
      ),
      new PageSection(
        '2-3',
        PAGE_SECTION_TYPES.LIST,
        'أهدافنا',
        '<h2>أهدافنا</h2><ul><li>تعزيز الدراسات السياسية في المملكة</li><li>تقديم الاستشارات السياسية للجهات المعنية</li><li>إثراء الثقافة السياسية في المجتمع</li><li>دعم الباحثين والمختصين في المجال</li></ul>',
        SECTION_LAYOUTS.CONTAINED
      ),
      new PageSection(
        '2-4',
        PAGE_SECTION_TYPES.GALLERY,
        'فريق العمل',
        '<h2>فريق العمل</h2>',
        SECTION_LAYOUTS.THREE_COLUMN,
        {
          items: [
            { image: null, title: 'الاسم الأول', description: 'المنصب الوظيفي' },
            { image: null, title: 'الاسم الثاني', description: 'المنصب الوظيفي' },
            { image: null, title: 'الاسم الثالث', description: 'المنصب الوظيفي' }
          ]
        }
      )
    ],
    '/assets/images/templates/about-template.jpg'
  ),
  
  new PageTemplate(
    '3',
    'صفحة تواصل',
    'قالب متكامل لصفحات التواصل',
    PAGE_TEMPLATE_TYPES.CONTACT,
    [
      new PageSection(
        '3-1',
        PAGE_SECTION_TYPES.HERO,
        'تواصل معنا',
        '<h1>تواصل معنا</h1><p>نرحب بتواصلكم واستفساراتكم</p>',
        SECTION_LAYOUTS.FULL_WIDTH
      ),
      new PageSection(
        '3-2',
        PAGE_SECTION_TYPES.TEXT,
        'معلومات التواصل',
        '<h3>معلومات التواصل</h3><p>العنوان: الرياض، المملكة العربية السعودية</p><p>البريد الإلكتروني: info@saudipoliticalscience.org</p><p>الهاتف: +966 11 000 0000</p>',
        SECTION_LAYOUTS.CONTAINED
      ),
      new PageSection(
        '3-3',
        PAGE_SECTION_TYPES.CONTACT_FORM,
        'نموذج التواصل',
        '<h3>راسلنا</h3><p>يمكنكم إرسال رسالتكم من خلال النموذج التالي وسيتم الرد عليكم في أقرب وقت</p>',
        SECTION_LAYOUTS.CONTAINED,
        {
          fields: [
            { name: 'name', label: 'الاسم', type: 'text', required: true },
            { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true },
            { name: 'subject', label: 'الموضوع', type: 'text', required: true },
            { name: 'message', label: 'الرسالة', type: 'textarea', required: true }
          ]
        }
      )
    ],
    '/assets/images/templates/contact-template.jpg'
  )
];

// Initialize storage if empty
const initializeStorage = () => {
  if (!localStorageService.getItem(PAGE_TEMPLATES_STORAGE_KEY)) {
    localStorageService.setItem(PAGE_TEMPLATES_STORAGE_KEY, initialTemplates);
  }
};

// Page Template CRUD operations
const pageTemplateService = {
  // Get all templates
  getAll: async () => {
    initializeStorage();
    return Promise.resolve(localStorageService.getItem(PAGE_TEMPLATES_STORAGE_KEY));
  },
  
  // Get template by ID
  getById: async (id) => {
    initializeStorage();
    const templates = localStorageService.getItem(PAGE_TEMPLATES_STORAGE_KEY);
    const template = templates.find(t => t.id === id);
    
    if (!template) {
      return Promise.reject(new Error('Template not found'));
    }
    
    return Promise.resolve(template);
  },
  
  // Create new template
  create: async (templateData) => {
    initializeStorage();
    const templates = localStorageService.getItem(PAGE_TEMPLATES_STORAGE_KEY);
    
    // Generate a unique ID
    const newId = String(Math.max(0, ...templates.map(t => parseInt(t.id) || 0)) + 1);
    
    // Create template instance to ensure all methods are available
    const newTemplate = new PageTemplate(
      newId,
      templateData.name,
      templateData.description,
      templateData.type,
      templateData.sections || [],
      templateData.thumbnail
    );
    
    templates.push(newTemplate);
    localStorageService.setItem(PAGE_TEMPLATES_STORAGE_KEY, templates);
    
    return Promise.resolve(newTemplate);
  },
  
  // Update existing template
  update: async (id, templateData) => {
    initializeStorage();
    const templates = localStorageService.getItem(PAGE_TEMPLATES_STORAGE_KEY);
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) {
      return Promise.reject(new Error('Template not found'));
    }
    
    // Create template instance to ensure all methods are available
    const updatedTemplate = new PageTemplate(
      id,
      templateData.name,
      templateData.description,
      templateData.type,
      templateData.sections || [],
      templateData.thumbnail
    );
    
    // Preserve creation date
    updatedTemplate.createdAt = templates[index].createdAt;
    updatedTemplate.updatedAt = new Date().toISOString();
    
    templates[index] = updatedTemplate;
    localStorageService.setItem(PAGE_TEMPLATES_STORAGE_KEY, templates);
    
    return Promise.resolve(updatedTemplate);
  },
  
  // Delete template
  delete: async (id) => {
    initializeStorage();
    const templates = localStorageService.getItem(PAGE_TEMPLATES_STORAGE_KEY);
    const newTemplates = templates.filter(t => t.id !== id);
    
    if (newTemplates.length === templates.length) {
      return Promise.reject(new Error('Template not found'));
    }
    
    localStorageService.setItem(PAGE_TEMPLATES_STORAGE_KEY, newTemplates);
    return Promise.resolve({ success: true });
  },
  
  // Clone template
  clone: async (id) => {
    initializeStorage();
    const templates = localStorageService.getItem(PAGE_TEMPLATES_STORAGE_KEY);
    const template = templates.find(t => t.id === id);
    
    if (!template) {
      return Promise.reject(new Error('Template not found'));
    }
    
    // Generate a unique ID
    const newId = String(Math.max(0, ...templates.map(t => parseInt(t.id) || 0)) + 1);
    
    // Create a deep copy with new ID
    const clonedTemplate = new PageTemplate(
      newId,
      `${template.name} (نسخة)`,
      template.description,
      template.type,
      template.sections.map(section => new PageSection(
        Math.random().toString(36).substr(2, 9),
        section.type,
        section.title,
        section.content,
        section.layout,
        { ...section.props }
      )),
      template.thumbnail
    );
    
    templates.push(clonedTemplate);
    localStorageService.setItem(PAGE_TEMPLATES_STORAGE_KEY, templates);
    
    return Promise.resolve(clonedTemplate);
  },
  
  // Apply template to content
  applyTemplateToContent: async (contentData, templateId) => {
    initializeStorage();
    const templates = localStorageService.getItem(PAGE_TEMPLATES_STORAGE_KEY);
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      return Promise.reject(new Error('Template not found'));
    }
    
    // Convert template sections to content
    const htmlContent = template.sections
      .map(section => section.content)
      .join('\n\n');
    
    return Promise.resolve({
      ...contentData,
      content: htmlContent
    });
  }
};

export { pageTemplateService };