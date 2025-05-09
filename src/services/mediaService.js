// src/services/mediaService.js
/**
 * @fileoverview خدمة لإدارة مكتبة الوسائط - تتعامل مع تخزين واسترجاع وتنظيم ملفات الوسائط
 */
import Media, { MEDIA_TYPES, FILE_EXTENSIONS } from '../models/Media';
import localStorageService from './localStorageService';

// مفاتيح التخزين المحلي
const MEDIA_STORAGE_KEY = 'mediaLibrary';
const MEDIA_CATEGORIES_KEY = 'mediaCategories';
const MEDIA_TAGS_KEY = 'mediaTags';

// الفئات الافتراضية للوسائط
const DEFAULT_CATEGORIES = [
  { id: 'uncategorized', name: 'غير مصنف' },
  { id: 'banners', name: 'بانرات' },
  { id: 'profiles', name: 'صور شخصية' },
  { id: 'events', name: 'فعاليات' },
  { id: 'documents', name: 'مستندات' },
  { id: 'logos', name: 'شعارات' }
];

/**
 * تعيين الفئات الافتراضية إذا لم تكن موجودة
 */
const initializeMediaLibrary = () => {
  if (!localStorageService.hasItem(MEDIA_STORAGE_KEY)) {
    localStorageService.setItem(MEDIA_STORAGE_KEY, []);
  }

  if (!localStorageService.hasItem(MEDIA_CATEGORIES_KEY)) {
    localStorageService.setItem(MEDIA_CATEGORIES_KEY, DEFAULT_CATEGORIES);
  }

  if (!localStorageService.hasItem(MEDIA_TAGS_KEY)) {
    localStorageService.setItem(MEDIA_TAGS_KEY, []);
  }
};

/**
 * خدمة إدارة مكتبة الوسائط
 */
const mediaService = {
  /**
   * الحصول على جميع ملفات الوسائط
   * @param {Object} options - خيارات تصفية وترتيب النتائج
   * @param {string} [options.search] - نص للبحث في أسماء أو وصف الملفات
   * @param {string} [options.type] - نوع الوسائط للتصفية
   * @param {string} [options.category] - فئة الوسائط للتصفية
   * @param {Array<string>} [options.tags] - وسوم للتصفية
   * @param {string} [options.sortBy='createdAt'] - حقل الترتيب
   * @param {boolean} [options.sortDesc=true] - ترتيب تنازلي؟
   * @returns {Array<Media>} قائمة كائنات الوسائط
   */
  getAll: (options = {}) => {
    initializeMediaLibrary();
    
    const {
      search,
      type,
      category,
      tags,
      sortBy = 'createdAt',
      sortDesc = true
    } = options;
    
    let mediaItems = localStorageService.getItem(MEDIA_STORAGE_KEY, [])
      .map(item => Media.fromJSON(item));
    
    // تطبيق التصفية
    if (search) {
      const searchLower = search.toLowerCase();
      mediaItems = mediaItems.filter(item => 
        item.name.toLowerCase().includes(searchLower) || 
        item.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (type) {
      mediaItems = mediaItems.filter(item => item.type === type);
    }
    
    if (category) {
      mediaItems = mediaItems.filter(item => item.category === category);
    }
    
    if (tags && tags.length > 0) {
      mediaItems = mediaItems.filter(item => 
        tags.some(tag => item.tags.includes(tag))
      );
    }
    
    // تطبيق الترتيب
    mediaItems.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      if (sortBy === 'createdAt') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
      
      if (valueA < valueB) return sortDesc ? 1 : -1;
      if (valueA > valueB) return sortDesc ? -1 : 1;
      return 0;
    });
    
    return mediaItems;
  },
  
  /**
   * الحصول على ملف وسائط بواسطة المعرف
   * @param {string} id - معرف الملف
   * @returns {Media|null} كائن الوسائط أو null إذا لم يتم العثور عليه
   */
  getById: (id) => {
    initializeMediaLibrary();
    
    const mediaItems = localStorageService.getItem(MEDIA_STORAGE_KEY, []);
    const mediaItem = mediaItems.find(item => item.id === id);
    
    return mediaItem ? Media.fromJSON(mediaItem) : null;
  },
  
  /**
   * تحميل ملف جديد إلى مكتبة الوسائط
   * @param {File} file - كائن ملف من واجهة المستخدم
   * @param {Object} metadata - بيانات وصفية إضافية للملف
   * @returns {Promise<Media>} كائن الوسائط المضاف
   */
  upload: async (file, metadata = {}) => {
    initializeMediaLibrary();
    
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          // إنشاء مسار وهمي يبدأ بـ "assets/media" للاستخدام مع localStorage
          // في تطبيق حقيقي، سنقوم بتحميل الملف إلى الخادم وتخزين المسار الفعلي
          const timestamp = new Date().getTime();
          const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
          const path = `assets/media/${timestamp}_${safeName}`;
          
          // إنشاء كائن وسائط جديد
          const media = new Media({
            name: metadata.name || file.name,
            filename: file.name,
            path: path,
            size: file.size,
            mimeType: file.type,
            createdBy: metadata.createdBy || 'current_user',
            tags: metadata.tags || [],
            category: metadata.category || 'uncategorized',
            description: metadata.description || '',
            alt: metadata.alt || '',
            // تخزين البيانات الثنائية للملف مباشرة (في تطبيق حقيقي، لا نفعل ذلك)
            dataUrl: event.target.result
          });
          
          // التحقق من صحة البيانات
          const validation = media.validate();
          if (!validation.isValid) {
            reject(new Error(validation.errors.join(', ')));
            return;
          }
          
          // حفظ وسم الملف في وسوم النظام إذا لم يكن موجودًا
          if (metadata.tags && metadata.tags.length > 0) {
            const existingTags = localStorageService.getItem(MEDIA_TAGS_KEY, []);
            const newTags = metadata.tags.filter(tag => !existingTags.includes(tag));
            
            if (newTags.length > 0) {
              localStorageService.setItem(MEDIA_TAGS_KEY, [...existingTags, ...newTags]);
            }
          }
          
          // حفظ الملف في مكتبة الوسائط
          const mediaItems = localStorageService.getItem(MEDIA_STORAGE_KEY, []);
          mediaItems.push(media.toJSON());
          localStorageService.setItem(MEDIA_STORAGE_KEY, mediaItems);
          
          resolve(media);
        };
        
        reader.onerror = () => {
          reject(new Error('فشل في قراءة الملف'));
        };
        
        // بدء قراءة الملف كـ Data URL
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  /**
   * تحديث بيانات ملف وسائط
   * @param {string} id - معرف الملف
   * @param {Object} updates - البيانات المحدثة
   * @returns {Media|null} كائن الوسائط المحدث أو null إذا لم يتم العثور عليه
   */
  update: (id, updates = {}) => {
    initializeMediaLibrary();
    
    const mediaItems = localStorageService.getItem(MEDIA_STORAGE_KEY, []);
    const index = mediaItems.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    // تحديث البيانات مع الاحتفاظ بالقيم الموجودة
    const updatedData = {
      ...mediaItems[index],
      ...updates,
      id // التأكد من عدم تغيير المعرف
    };
    
    // إنشاء كائن وسائط جديد للتحقق من صحة البيانات
    const media = Media.fromJSON(updatedData);
    const validation = media.validate();
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // تحديث الملف في المكتبة
    mediaItems[index] = media.toJSON();
    localStorageService.setItem(MEDIA_STORAGE_KEY, mediaItems);
    
    // تحديث وسوم النظام إذا تم إضافة وسوم جديدة
    if (updates.tags && updates.tags.length > 0) {
      const existingTags = localStorageService.getItem(MEDIA_TAGS_KEY, []);
      const newTags = updates.tags.filter(tag => !existingTags.includes(tag));
      
      if (newTags.length > 0) {
        localStorageService.setItem(MEDIA_TAGS_KEY, [...existingTags, ...newTags]);
      }
    }
    
    return media;
  },
  
  /**
   * حذف ملف وسائط من المكتبة
   * @param {string} id - معرف الملف
   * @returns {boolean} هل تم الحذف بنجاح
   */
  delete: (id) => {
    initializeMediaLibrary();
    
    const mediaItems = localStorageService.getItem(MEDIA_STORAGE_KEY, []);
    const newMediaItems = mediaItems.filter(item => item.id !== id);
    
    if (newMediaItems.length === mediaItems.length) {
      // لم يتم العثور على الملف
      return false;
    }
    
    localStorageService.setItem(MEDIA_STORAGE_KEY, newMediaItems);
    return true;
  },
  
  /**
   * حذف مجموعة من ملفات الوسائط
   * @param {Array<string>} ids - قائمة معرفات الملفات
   * @returns {number} عدد الملفات التي تم حذفها
   */
  bulkDelete: (ids) => {
    initializeMediaLibrary();
    
    const mediaItems = localStorageService.getItem(MEDIA_STORAGE_KEY, []);
    const newMediaItems = mediaItems.filter(item => !ids.includes(item.id));
    
    const deletedCount = mediaItems.length - newMediaItems.length;
    
    if (deletedCount > 0) {
      localStorageService.setItem(MEDIA_STORAGE_KEY, newMediaItems);
    }
    
    return deletedCount;
  },
  
  /**
   * تحديث فئات الملفات بمجموعة جديدة
   * @param {Array<Object>} categories - الفئات الجديدة
   * @returns {Array<Object>} قائمة الفئات المحدثة
   */
  updateCategories: (categories) => {
    initializeMediaLibrary();
    
    // حفظ الفئات الجديدة
    localStorageService.setItem(MEDIA_CATEGORIES_KEY, categories);
    
    return categories;
  },
  
  /**
   * إنشاء فئة جديدة
   * @param {string} name - اسم الفئة
   * @returns {Object} الفئة الجديدة
   */
  createCategory: (name) => {
    initializeMediaLibrary();
    
    // التحقق من عدم وجود فئة بنفس الاسم
    const categories = localStorageService.getItem(MEDIA_CATEGORIES_KEY, []);
    const existingCategory = categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
    
    if (existingCategory) {
      throw new Error(`توجد فئة بنفس الاسم: ${name}`);
    }
    
    // إنشاء معرف آمن من الاسم
    const safeId = name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    
    const newCategory = { id: safeId, name };
    
    // إضافة الفئة الجديدة
    const updatedCategories = [...categories, newCategory];
    localStorageService.setItem(MEDIA_CATEGORIES_KEY, updatedCategories);
    
    return newCategory;
  },
  
  /**
   * حذف فئة
   * @param {string} id - معرف الفئة
   * @returns {boolean} هل تم الحذف بنجاح
   */
  deleteCategory: (id) => {
    initializeMediaLibrary();
    
    // لا يمكن حذف الفئة "غير مصنف"
    if (id === 'uncategorized') {
      throw new Error('لا يمكن حذف الفئة الافتراضية "غير مصنف"');
    }
    
    const categories = localStorageService.getItem(MEDIA_CATEGORIES_KEY, []);
    const newCategories = categories.filter(cat => cat.id !== id);
    
    if (newCategories.length === categories.length) {
      // لم يتم العثور على الفئة
      return false;
    }
    
    localStorageService.setItem(MEDIA_CATEGORIES_KEY, newCategories);
    
    // تحديث الملفات التي تستخدم هذه الفئة إلى "غير مصنف"
    const mediaItems = localStorageService.getItem(MEDIA_STORAGE_KEY, []);
    const updatedMediaItems = mediaItems.map(item => {
      if (item.category === id) {
        return { ...item, category: 'uncategorized' };
      }
      return item;
    });
    
    localStorageService.setItem(MEDIA_STORAGE_KEY, updatedMediaItems);
    
    return true;
  },
  
  /**
   * الحصول على جميع الفئات
   * @returns {Array<Object>} قائمة الفئات
   */
  getCategories: () => {
    initializeMediaLibrary();
    return localStorageService.getItem(MEDIA_CATEGORIES_KEY, []);
  },
  
  /**
   * الحصول على جميع الوسوم
   * @returns {Array<string>} قائمة الوسوم
   */
  getTags: () => {
    initializeMediaLibrary();
    return localStorageService.getItem(MEDIA_TAGS_KEY, []);
  },
  
  /**
   * إضافة وسم جديد
   * @param {string} tag - الوسم الجديد
   * @returns {Array<string>} قائمة الوسوم المحدثة
   */
  addTag: (tag) => {
    initializeMediaLibrary();
    
    const tags = localStorageService.getItem(MEDIA_TAGS_KEY, []);
    
    if (!tags.includes(tag)) {
      const updatedTags = [...tags, tag];
      localStorageService.setItem(MEDIA_TAGS_KEY, updatedTags);
      return updatedTags;
    }
    
    return tags;
  },
  
  /**
   * حذف وسم
   * @param {string} tag - الوسم المراد حذفه
   * @returns {Array<string>} قائمة الوسوم المحدثة
   */
  deleteTag: (tag) => {
    initializeMediaLibrary();
    
    const tags = localStorageService.getItem(MEDIA_TAGS_KEY, []);
    const updatedTags = tags.filter(t => t !== tag);
    
    if (updatedTags.length !== tags.length) {
      localStorageService.setItem(MEDIA_TAGS_KEY, updatedTags);
      
      // تحديث الملفات التي تستخدم هذا الوسم
      const mediaItems = localStorageService.getItem(MEDIA_STORAGE_KEY, []);
      const updatedMediaItems = mediaItems.map(item => {
        if (item.tags && item.tags.includes(tag)) {
          return {
            ...item,
            tags: item.tags.filter(t => t !== tag)
          };
        }
        return item;
      });
      
      localStorageService.setItem(MEDIA_STORAGE_KEY, updatedMediaItems);
    }
    
    return updatedTags;
  },

  /**
   * تحميل مجموعة من الملفات دفعة واحدة
   * @param {Array<File>} files - قائمة كائنات الملفات
   * @param {Object} commonMetadata - بيانات وصفية مشتركة للملفات
   * @returns {Promise<Array<Media>>} قائمة كائنات الوسائط المضافة
   */
  bulkUpload: async (files, commonMetadata = {}) => {
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const media = await mediaService.upload(file, commonMetadata);
        results.push(media);
      } catch (error) {
        errors.push({ file: file.name, error: error.message });
      }
    }

    if (errors.length > 0) {
      console.error('أخطاء أثناء رفع بعض الملفات:', errors);
    }

    return results;
  }
};

export default mediaService;