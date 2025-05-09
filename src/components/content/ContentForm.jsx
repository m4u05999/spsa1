import React, { useState, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ContentEditor.css';
import { 
  CONTENT_TYPES, 
  CONTENT_STATUS, 
  translateContentType,
  translateContentStatus,
  validateContent
} from '../../models/Content';

/**
 * ContentForm - Reusable form for creating and editing content
 */
const ContentForm = ({ 
  initialContent = {},
  onSubmit,
  onCancel,
  loading = false,
  availableCategories = [],
  availableTags = []
}) => {
  // Default empty content
  const defaultContent = {
    title: '',
    type: CONTENT_TYPES.ARTICLE,
    author: '',
    status: CONTENT_STATUS.DRAFT,
    content: '',
    excerpt: '',
    categories: [],
    tags: [],
    featured: false,
    image: null
  };

  // Form state
  const [content, setContent] = useState({...defaultContent, ...initialContent});
  const [errors, setErrors] = useState({});
  const [tempCategory, setTempCategory] = useState('');
  const [tempTag, setTempTag] = useState('');
  const [preview, setPreview] = useState(null);

  // Rich text editor modules and formats
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'direction': 'rtl' }],
    ],
  }), []);
  
  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image',
    'align', 'color', 'background', 'direction'
  ];

  // Reset form when initialContent changes
  useEffect(() => {
    setContent({...defaultContent, ...initialContent});
    
    // Set image preview if image exists
    if (initialContent?.image) {
      setPreview(initialContent.image);
    } else {
      setPreview(null);
    }
  }, [initialContent]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Handle rich text editor content change
  const handleEditorChange = (value) => {
    setContent(prev => ({
      ...prev,
      content: value
    }));
    
    // Clear error when content is edited
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: undefined }));
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        image: 'يرجى اختيار صورة بتنسيق JPEG أو PNG أو GIF أو WEBP' 
      }));
      return;
    }

    // Create preview URL and update content
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setContent(prev => ({
        ...prev,
        image: reader.result // In a real app, this would be a file reference or URL
      }));
      
      // Clear error if any
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: undefined }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Add category
  const handleAddCategory = () => {
    if (tempCategory && !content.categories.includes(tempCategory)) {
      setContent(prev => ({
        ...prev,
        categories: [...prev.categories, tempCategory]
      }));
      setTempCategory('');
    }
  };

  // Remove category
  const handleRemoveCategory = (category) => {
    setContent(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  // Add tag
  const handleAddTag = () => {
    if (tempTag && !content.tags.includes(tempTag)) {
      setContent(prev => ({
        ...prev,
        tags: [...prev.tags, tempTag]
      }));
      setTempTag('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tag) => {
    setContent(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate the content
    const { isValid, errors: validationErrors } = validateContent(content);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    
    onSubmit(content);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          العنوان <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={content.title}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.title ? 'border-red-500' : ''}`}
          placeholder="أدخل عنوان المحتوى"
          dir="rtl"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Type and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Content Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            نوع المحتوى <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={content.type}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.type ? 'border-red-500' : ''}`}
            dir="rtl"
          >
            {Object.entries(CONTENT_TYPES).map(([key, value]) => (
              <option key={key} value={value}>
                {translateContentType(value)}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            الحالة <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={content.status}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.status ? 'border-red-500' : ''}`}
            dir="rtl"
          >
            {Object.entries(CONTENT_STATUS).map(([key, value]) => (
              <option key={key} value={value}>
                {translateContentStatus(value)}
              </option>
            ))}
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
        </div>
      </div>

      {/* Author */}
      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700">
          الكاتب <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="author"
          name="author"
          value={content.author}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.author ? 'border-red-500' : ''}`}
          placeholder="أدخل اسم الكاتب"
          dir="rtl"
        />
        {errors.author && <p className="mt-1 text-sm text-red-600">{errors.author}</p>}
      </div>

      {/* Content Text - Rich Text Editor */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          المحتوى <span className="text-red-500">*</span>
        </label>
        <div className={`mt-1 ${errors.content ? 'border border-red-500 rounded-md' : ''}`}>
          <ReactQuill
            theme="snow"
            value={content.content}
            onChange={handleEditorChange}
            modules={quillModules}
            formats={quillFormats}
            placeholder="أدخل محتوى النص"
            className="rtl-editor"
            style={{ direction: 'rtl', minHeight: '200px' }}
          />
        </div>
        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
          مقتطف
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows="3"
          value={content.excerpt}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="أدخل مقتطفاً مختصراً عن المحتوى"
          dir="rtl"
        />
        <p className="mt-1 text-sm text-gray-500">المقتطف يظهر في صفحة العرض وفي نتائج البحث</p>
      </div>

      {/* Featured Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          الصورة الرئيسية
        </label>
        <div className="mt-1 flex items-center space-x-5 space-x-reverse">
          <div className="flex-shrink-0 h-20 w-20 bg-gray-100 rounded-md overflow-hidden">
            {preview ? (
              <img src={preview} alt="معاينة الصورة" className="h-full w-full object-cover" />
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
                id="image"
                name="image"
                accept="image/jpeg, image/png, image/gif, image/webp"
                onChange={handleImageChange}
                className="sr-only"
              />
              <label
                htmlFor="image"
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
                  setContent(prev => ({ ...prev, image: null }));
                }}
              >
                إزالة الصورة
              </button>
            )}
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700">التصنيفات</label>
        <div className="mt-1 flex rounded-md">
          <div className="relative flex-grow focus-within:z-10">
            <input
              type="text"
              id="category"
              value={tempCategory}
              onChange={(e) => setTempCategory(e.target.value)}
              className="block w-full rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="اكتب اسم التصنيف"
              list="available-categories"
              dir="rtl"
            />
            <datalist id="available-categories">
              {availableCategories.map(category => (
                <option key={category.id} value={category.name} />
              ))}
            </datalist>
          </div>
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={!tempCategory}
            className="-mr-px px-4 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            إضافة
          </button>
        </div>
        {content.categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {content.categories.map(category => (
              <span key={category} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                {category}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="mr-1 flex-shrink-0 inline-flex text-blue-400 hover:text-blue-500 focus:outline-none"
                >
                  <span className="sr-only">إزالة</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700">الوسوم</label>
        <div className="mt-1 flex rounded-md">
          <div className="relative flex-grow focus-within:z-10">
            <input
              type="text"
              id="tag"
              value={tempTag}
              onChange={(e) => setTempTag(e.target.value)}
              className="block w-full rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="اكتب اسم الوسم"
              list="available-tags"
              dir="rtl"
            />
            <datalist id="available-tags">
              {availableTags.map(tag => (
                <option key={tag.id} value={tag.name} />
              ))}
            </datalist>
          </div>
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!tempTag}
            className="-mr-px px-4 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            إضافة
          </button>
        </div>
        {content.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {content.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="mr-1 flex-shrink-0 inline-flex text-green-400 hover:text-green-500 focus:outline-none"
                >
                  <span className="sr-only">إزالة</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Featured checkbox */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            checked={content.featured}
            onChange={handleInputChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="mr-3 text-sm">
          <label htmlFor="featured" className="font-medium text-gray-700">
            تمييز المحتوى
          </label>
          <p className="text-gray-500">المحتوى المميز سيظهر في المكان البارز بالصفحة الرئيسية</p>
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
            'حفظ المحتوى'
          )}
        </button>
      </div>
    </form>
  );
};

export default ContentForm;