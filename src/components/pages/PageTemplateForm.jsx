import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { PAGE_TEMPLATE_TYPES, translateTemplateType } from '../../models/PageTemplate';

/**
 * PageTemplateForm - Form for creating and editing page templates
 */
const PageTemplateForm = ({ 
  initialTemplate,
  onSubmit,
  onCancel,
  loading = false
}) => {
  // Default empty template
  const defaultTemplate = {
    name: '',
    description: '',
    type: PAGE_TEMPLATE_TYPES.STANDARD,
    sections: [],
    thumbnail: null
  };

  // Form state
  const [template, setTemplate] = useState({...defaultTemplate, ...initialTemplate});
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  // Reset form when initialTemplate changes
  useEffect(() => {
    setTemplate({...defaultTemplate, ...initialTemplate});
    
    // Set image preview if thumbnail exists
    if (initialTemplate?.thumbnail) {
      setPreview(initialTemplate.thumbnail);
    } else {
      setPreview(null);
    }
  }, [initialTemplate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemplate(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Handle image upload for template thumbnail
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        thumbnail: 'يرجى اختيار صورة بتنسيق JPEG أو PNG أو GIF أو WEBP' 
      }));
      return;
    }

    // Create preview URL and update template
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setTemplate(prev => ({
        ...prev,
        thumbnail: reader.result
      }));
      
      // Clear error if any
      if (errors.thumbnail) {
        setErrors(prev => ({ ...prev, thumbnail: undefined }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate the template
    const validationErrors = {};
    
    if (!template.name.trim()) {
      validationErrors.name = 'اسم القالب مطلوب';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    onSubmit(template);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {/* Template Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          اسم القالب <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={template.name}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.name ? 'border-red-500' : ''}`}
          placeholder="أدخل اسم القالب"
          dir="rtl"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Template Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          نوع القالب <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          name="type"
          value={template.type}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.type ? 'border-red-500' : ''}`}
          dir="rtl"
        >
          {Object.entries(PAGE_TEMPLATE_TYPES).map(([key, value]) => (
            <option key={key} value={value}>
              {translateTemplateType(value)}
            </option>
          ))}
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          وصف القالب
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={template.description}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="أدخل وصفًا مختصرًا للقالب"
          dir="rtl"
        />
      </div>

      {/* Template Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          صورة معاينة القالب
        </label>
        <div className="mt-1 flex items-center space-x-5 space-x-reverse">
          <div className="flex-shrink-0 h-24 w-24 bg-gray-100 rounded-md overflow-hidden">
            {preview ? (
              <img src={preview} alt="معاينة القالب" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-grow flex flex-col">
            <div className="relative rounded-md shadow-sm">
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                accept="image/jpeg, image/png, image/gif, image/webp"
                onChange={handleImageChange}
                className="sr-only"
              />
              <label
                htmlFor="thumbnail"
                className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                اختيار صورة
              </label>
            </div>
            {preview && (
              <button
                type="button"
                className="mt-2 text-sm text-red-600 hover:text-red-800"
                onClick={() => {
                  setPreview(null);
                  setTemplate(prev => ({ ...prev, thumbnail: null }));
                }}
              >
                إزالة الصورة
              </button>
            )}
            {errors.thumbnail && <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>}
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 space-x-reverse">
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
          ) : (
            'حفظ القالب'
          )}
        </button>
      </div>
    </form>
  );
};

export default PageTemplateForm;