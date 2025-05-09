import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { pageTemplateService } from '../../services/pageTemplateService';
import { PAGE_TEMPLATE_TYPES, translateTemplateType } from '../../models/PageTemplate';
import '../content/ContentEditor.css'; // Reuse styles from ContentEditor

/**
 * PageEditor - Component for editing static pages with template selection
 */
const PageEditor = ({ 
  initialPage = null,
  onSave,
  onCancel,
  loading = false
}) => {
  const defaultPage = {
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    templateId: null,
    meta: {
      description: '',
      keywords: ''
    }
  };

  // Form state
  const [page, setPage] = useState({...defaultPage, ...initialPage});
  const [errors, setErrors] = useState({});
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Refs
  const quillRef = useRef(null);

  // Load templates when component mounts
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const allTemplates = await pageTemplateService.getAll();
        setTemplates(allTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    };

    loadTemplates();
  }, []);

  // Reset form when initialPage changes
  useEffect(() => {
    if (initialPage) {
      setPage({...defaultPage, ...initialPage});
      if (initialPage.templateId) {
        const loadTemplate = async () => {
          try {
            const template = await pageTemplateService.getById(initialPage.templateId);
            setSelectedTemplate(template);
          } catch (error) {
            console.error('Failed to load template:', error);
          }
        };
        loadTemplate();
      }
    }
  }, [initialPage]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPage(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPage(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle content change from rich text editor
  const handleContentChange = (content) => {
    setPage(prev => ({ ...prev, content }));
    
    // Clear error if any
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: undefined }));
    }
  };

  // Generate slug from title
  const generateSlug = () => {
    const slug = page.title
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\u0621-\u064A\u0660-\u0669a-z0-9-]/g, '') // Keep Arabic, English letters, and numbers
      .replace(/-+/g, '-') // Replace multiple - with single -
      .replace(/^-+|-+$/g, ''); // Trim - from start and end

    setPage(prev => ({ ...prev, slug }));
  };

  // Apply template to content
  const applyTemplate = async (templateId) => {
    try {
      if (!templateId) return;
      
      const template = await pageTemplateService.getById(templateId);
      setSelectedTemplate(template);
      
      // Ask for confirmation if there's already content
      if (page.content && page.content.trim() !== '') {
        if (!window.confirm('تطبيق القالب سيؤدي إلى استبدال المحتوى الحالي. هل تريد المتابعة؟')) {
          return;
        }
      }
      
      // Apply the template
      const updatedPage = await pageTemplateService.applyTemplateToContent(page, templateId);
      setPage(updatedPage);
      setShowTemplateSelector(false);
      
    } catch (error) {
      console.error('Failed to apply template:', error);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate the form
    const validationErrors = {};
    
    if (!page.title.trim()) {
      validationErrors.title = 'عنوان الصفحة مطلوب';
    }
    
    if (!page.slug.trim()) {
      validationErrors.slug = 'الرابط المختصر للصفحة مطلوب';
    }
    
    if (!page.content || page.content.trim() === '') {
      validationErrors.content = 'محتوى الصفحة مطلوب';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    onSave(page);
  };

  // Rich text editor modules and formats
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ align: [] }],
      [{ direction: 'rtl' }],
      ['link', 'image', 'video'],
      [{ color: [] }, { background: [] }],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'script',
    'align', 'direction',
    'link', 'image', 'video',
    'color', 'background'
  ];

  return (
    <div className="page-editor-container" dir="rtl">
      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowTemplateSelector(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-right sm:w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      اختر قالب الصفحة
                    </h3>
                    <div className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(template => (
                          <div 
                            key={template.id} 
                            className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => applyTemplate(template.id)}
                          >
                            <div className="h-40 bg-gray-100 relative">
                              {template.thumbnail ? (
                                <img 
                                  src={template.thumbnail} 
                                  alt={template.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                  </svg>
                                </div>
                              )}
                              <span className="absolute top-2 left-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                {translateTemplateType(template.type)}
                              </span>
                            </div>
                            <div className="p-4">
                              <h4 className="text-md font-semibold mb-1">{template.name}</h4>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                              <div className="text-xs text-gray-500">
                                {template.sections?.length} {template.sections?.length === 1 ? 'قسم' : 'أقسام'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowTemplateSelector(false)}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{initialPage ? 'تحرير صفحة' : 'إنشاء صفحة جديدة'}</h2>
          
          {/* Template Selection */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowTemplateSelector(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              اختر قالبًا
            </button>
            {selectedTemplate && (
              <span className="text-sm text-gray-600">
                القالب المستخدم: {selectedTemplate.name}
              </span>
            )}
          </div>
        </div>

        {/* Basic Page Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Page Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              عنوان الصفحة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={page.title}
              onChange={handleInputChange}
              onBlur={page.slug ? undefined : generateSlug}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.title ? 'border-red-500' : ''}`}
              placeholder="أدخل عنوان الصفحة"
              dir="rtl"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Page Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              الرابط المختصر <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                /pages/
              </span>
              <input
                type="text"
                id="slug"
                name="slug"
                value={page.slug}
                onChange={handleInputChange}
                className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.slug ? 'border-red-500' : ''}`}
                placeholder="رابط-الصفحة"
                dir="ltr"
              />
            </div>
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
            {!errors.slug && (
              <p className="mt-1 text-xs text-gray-500">
                سيتمكن الزوار من الوصول إلى هذه الصفحة عبر الرابط: /pages/{page.slug}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            حالة الصفحة
          </label>
          <select
            id="status"
            name="status"
            value={page.status}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="draft">مسودة</option>
            <option value="published">منشورة</option>
            <option value="archived">مؤرشفة</option>
          </select>
        </div>

        {/* Meta Information */}
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="text-md font-medium text-gray-700 mb-3">معلومات الصفحة (SEO)</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Meta Description */}
            <div>
              <label htmlFor="meta.description" className="block text-sm font-medium text-gray-700">
                وصف الصفحة (Meta Description)
              </label>
              <textarea
                id="meta.description"
                name="meta.description"
                value={page.meta.description}
                onChange={handleInputChange}
                rows="2"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="وصف مختصر للصفحة يظهر في نتائج البحث"
              />
              <p className="mt-1 text-xs text-gray-500">
                يساعد على تحسين ظهور الصفحة في محركات البحث. يجب ألا يتجاوز 160 حرفًا.
              </p>
            </div>
            
            {/* Meta Keywords */}
            <div>
              <label htmlFor="meta.keywords" className="block text-sm font-medium text-gray-700">
                الكلمات المفتاحية (Meta Keywords)
              </label>
              <input
                type="text"
                id="meta.keywords"
                name="meta.keywords"
                value={page.meta.keywords}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="كلمات مفتاحية مفصولة بفواصل"
              />
              <p className="mt-1 text-xs text-gray-500">
                كلمات مفتاحية تساعد في تصنيف الصفحة في محركات البحث. يفضل إضافة 5-10 كلمات مفتاحية.
              </p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            محتوى الصفحة <span className="text-red-500">*</span>
          </label>
          <div className={`editor-container ${errors.content ? 'border border-red-500 rounded' : ''}`}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={page.content}
              onChange={handleContentChange}
              modules={modules}
              formats={formats}
              placeholder="أدخل محتوى الصفحة هنا..."
              className="rtl-editor"
            />
          </div>
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 space-x-reverse pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جارٍ الحفظ...
              </span>
            ) : initialPage ? 'حفظ التغييرات' : 'إنشاء الصفحة'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PageEditor;