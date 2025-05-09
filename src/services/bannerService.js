// src/services/bannerService.js
/**
 * @fileoverview خدمة لإدارة البانرات - تتعامل مع تخزين واسترجاع وتنظيم البانرات
 */
import Banner, { BANNER_TYPES, BANNER_STATUS } from '../models/Banner';
import localStorageService from './localStorageService';
import mediaService from './mediaService';

// أحجام البانرات القياسية حسب النوع
const BANNER_SIZES = {
  [BANNER_TYPES.HERO]: { width: 1200, height: 400 },
  [BANNER_TYPES.SIDEBAR]: { width: 300, height: 600 },
  [BANNER_TYPES.INLINE]: { width: 728, height: 90 },
  [BANNER_TYPES.POPUP]: { width: 600, height: 400 },
  [BANNER_TYPES.SLIDER]: { width: 800, height: 400 },
  [BANNER_TYPES.RIBBON]: { width: 1200, height: 60 }
};

// مفاتيح التخزين المحلي
const BANNERS_STORAGE_KEY = 'banners';
const BANNER_CATEGORIES_KEY = 'bannerCategories';
const BANNER_TAGS_KEY = 'bannerTags';

// الفئات الافتراضية للبانرات
const DEFAULT_CATEGORIES = [
  { id: 'uncategorized', name: 'غير مصنف' },
  { id: 'homepage', name: 'الصفحة الرئيسية' },
  { id: 'events', name: 'فعاليات' },
  { id: 'announcements', name: 'إعلانات' },
  { id: 'promotions', name: 'ترويج' }
];

/**
 * تعيين الفئات الافتراضية إذا لم تكن موجودة
 */
const initializeBannerStorage = () => {
  if (!localStorageService.hasItem(BANNERS_STORAGE_KEY)) {
    localStorageService.setItem(BANNERS_STORAGE_KEY, []);
  }

  if (!localStorageService.hasItem(BANNER_CATEGORIES_KEY)) {
    localStorageService.setItem(BANNER_CATEGORIES_KEY, DEFAULT_CATEGORIES);
  }

  if (!localStorageService.hasItem(BANNER_TAGS_KEY)) {
    localStorageService.setItem(BANNER_TAGS_KEY, []);
  }
};

/**
 * خدمة إدارة البانرات
 */
const bannerService = {
  /**
   * الحصول على جميع البانرات
   * @param {Object} options - خيارات تصفية وترتيب النتائج
   * @param {string} [options.search] - نص للبحث في عناوين أو وصف البانرات
   * @param {string} [options.type] - نوع البانر للتصفية
   * @param {string} [options.status] - حالة البانر للتصفية
   * @param {string} [options.category] - فئة البانر للتصفية
   * @param {Array<string>} [options.tags] - وسوم للتصفية
   * @param {string} [options.sortBy='createdAt'] - حقل الترتيب
   * @param {boolean} [options.sortDesc=true] - ترتيب تنازلي؟
   * @returns {Array<Banner>} قائمة كائنات البانر
   */
  getAll: (options = {}) => {
    initializeBannerStorage();
    
    const {
      search,
      type,
      status,
      category,
      tags,
      sortBy = 'createdAt',
      sortDesc = true
    } = options;
    
    let banners = localStorageService.getItem(BANNERS_STORAGE_KEY, [])
      .map(item => Banner.fromJSON(item));
    
    // تطبيق التصفية
    if (search) {
      const searchLower = search.toLowerCase();
      banners = banners.filter(item => 
        item.title.toLowerCase().includes(searchLower) || 
        item.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (type) {
      banners = banners.filter(item => item.type === type);
    }
    
    if (status) {
      banners = banners.filter(item => item.status === status);
    }
    
    if (category) {
      banners = banners.filter(item => item.category === category);
    }
    
    if (tags && tags.length > 0) {
      banners = banners.filter(item => 
        tags.some(tag => item.tags.includes(tag))
      );
    }
    
    // تطبيق الترتيب
    banners.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
      
      if (valueA < valueB) return sortDesc ? 1 : -1;
      if (valueA > valueB) return sortDesc ? -1 : 1;
      return 0;
    });
    
    return banners;
  },
  
  /**
   * الحصول على بانر بواسطة المعرف
   * @param {string} id - معرف البانر
   * @returns {Banner|null} كائن البانر أو null إذا لم يتم العثور عليه
   */
  getById: (id) => {
    initializeBannerStorage();
    
    const banners = localStorageService.getItem(BANNERS_STORAGE_KEY, []);
    const banner = banners.find(item => item.id === id);
    
    return banner ? Banner.fromJSON(banner) : null;
  },
  
  /**
   * إنشاء بانر جديد
   * @param {Object} bannerData - بيانات البانر
   * @returns {Banner} كائن البانر المنشأ
   */
  create: (bannerData) => {
    initializeBannerStorage();
    
    const banner = new Banner({
      ...bannerData,
      createdAt: new Date(),
      status: bannerData.status || BANNER_STATUS.DRAFT
    });
    
    // التحقق من صحة البيانات
    const validation = banner.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // إضافة الوسوم الجديدة إلى قائمة الوسوم العامة
    if (banner.tags && banner.tags.length > 0) {
      const existingTags = localStorageService.getItem(BANNER_TAGS_KEY, []);
      const newTags = banner.tags.filter(tag => !existingTags.includes(tag));
      
      if (newTags.length > 0) {
        localStorageService.setItem(BANNER_TAGS_KEY, [...existingTags, ...newTags]);
      }
    }
    
    // حفظ البانر
    const banners = localStorageService.getItem(BANNERS_STORAGE_KEY, []);
    banners.push(banner.toJSON());
    localStorageService.setItem(BANNERS_STORAGE_KEY, banners);
    
    return banner;
  },
  
  /**
   * تحديث بيانات البانر
   * @param {string} id - معرف البانر
   * @param {Object} updates - البيانات المحدثة
   * @param {string} [userId] - معرف المستخدم الذي يقوم بالتحديث
   * @returns {Banner|null} كائن البانر المحدث أو null إذا لم يتم العثور عليه
   */
  update: (id, updates = {}, userId = '') => {
    initializeBannerStorage();
    
    const banners = localStorageService.getItem(BANNERS_STORAGE_KEY, []);
    const index = banners.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    // إنشاء كائن البانر الحالي
    const currentBanner = Banner.fromJSON(banners[index]);
    
    // تحديث البيانات
    const updatedBanner = currentBanner.update(updates, userId);
    
    // التحقق من صحة البيانات
    const validation = updatedBanner.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // حفظ البيانات المحدثة
    banners[index] = updatedBanner.toJSON();
    localStorageService.setItem(BANNERS_STORAGE_KEY, banners);
    
    // تحديث الوسوم العامة
    if (updates.tags && updates.tags.length > 0) {
      const existingTags = localStorageService.getItem(BANNER_TAGS_KEY, []);
      const newTags = updates.tags.filter(tag => !existingTags.includes(tag));
      
      if (newTags.length > 0) {
        localStorageService.setItem(BANNER_TAGS_KEY, [...existingTags, ...newTags]);
      }
    }
    
    return updatedBanner;
  },
  
  /**
   * حذف بانر من النظام
   * @param {string} id - معرف البانر
   * @returns {boolean} هل تم الحذف بنجاح
   */
  delete: (id) => {
    initializeBannerStorage();
    
    const banners = localStorageService.getItem(BANNERS_STORAGE_KEY, []);
    const newBanners = banners.filter(item => item.id !== id);
    
    if (newBanners.length === banners.length) {
      // لم يتم العثور على البانر
      return false;
    }
    
    localStorageService.setItem(BANNERS_STORAGE_KEY, newBanners);
    return true;
  },
  
  /**
   * حذف مجموعة من البانرات
   * @param {Array<string>} ids - قائمة معرفات البانرات
   * @returns {number} عدد البانرات التي تم حذفها
   */
  bulkDelete: (ids) => {
    initializeBannerStorage();
    
    const banners = localStorageService.getItem(BANNERS_STORAGE_KEY, []);
    const newBanners = banners.filter(item => !ids.includes(item.id));
    
    const deletedCount = banners.length - newBanners.length;
    
    if (deletedCount > 0) {
      localStorageService.setItem(BANNERS_STORAGE_KEY, newBanners);
    }
    
    return deletedCount;
  },
  
  /**
   * الحصول على جميع فئات البانرات
   * @returns {Array<Object>} قائمة الفئات
   */
  getCategories: () => {
    initializeBannerStorage();
    return localStorageService.getItem(BANNER_CATEGORIES_KEY, []);
  },
  
  /**
   * إضافة فئة جديدة للبانرات
   * @param {string} name - اسم الفئة
   * @returns {Object} الفئة الجديدة
   */
  createCategory: (name) => {
    initializeBannerStorage();
    
    // التحقق من عدم وجود فئة بنفس الاسم
    const categories = localStorageService.getItem(BANNER_CATEGORIES_KEY, []);
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
    localStorageService.setItem(BANNER_CATEGORIES_KEY, updatedCategories);
    
    return newCategory;
  },
  
  /**
   * حذف فئة
   * @param {string} id - معرف الفئة
   * @returns {boolean} هل تم الحذف بنجاح
   */
  deleteCategory: (id) => {
    initializeBannerStorage();
    
    // لا يمكن حذف الفئة "غير مصنف"
    if (id === 'uncategorized') {
      throw new Error('لا يمكن حذف الفئة الافتراضية "غير مصنف"');
    }
    
    const categories = localStorageService.getItem(BANNER_CATEGORIES_KEY, []);
    const newCategories = categories.filter(cat => cat.id !== id);
    
    if (newCategories.length === categories.length) {
      // لم يتم العثور على الفئة
      return false;
    }
    
    localStorageService.setItem(BANNER_CATEGORIES_KEY, newCategories);
    
    // تحديث البانرات التي تستخدم هذه الفئة إلى "غير مصنف"
    const banners = localStorageService.getItem(BANNERS_STORAGE_KEY, []);
    const updatedBanners = banners.map(item => {
      if (item.category === id) {
        return { ...item, category: 'uncategorized' };
      }
      return item;
    });
    
    localStorageService.setItem(BANNERS_STORAGE_KEY, updatedBanners);
    
    return true;
  },
  
  /**
   * الحصول على جميع الوسوم
   * @returns {Array<string>} قائمة الوسوم
   */
  getTags: () => {
    initializeBannerStorage();
    return localStorageService.getItem(BANNER_TAGS_KEY, []);
  },
  
  /**
   * تغيير حالة البانر
   * @param {string} id - معرف البانر
   * @param {string} status - الحالة الجديدة
   * @param {string} [userId] - معرف المستخدم الذي يقوم بالتغيير
   * @returns {Banner|null} كائن البانر المحدث أو null إذا لم يتم العثور عليه
   */
  changeStatus: (id, status, userId = '') => {
    if (!Object.values(BANNER_STATUS).includes(status)) {
      throw new Error(`حالة البانر غير صالحة: ${status}`);
    }
    
    return bannerService.update(id, { status }, userId);
  },
  
  /**
   * الحصول على كل أنواع البانرات
   * @returns {Object} أنواع البانرات
   */
  getBannerTypes: () => {
    return Object.entries(BANNER_TYPES).map(([key, value]) => ({
      id: value,
      name: getBannerTypeName(value)
    }));
  },
  
  /**
   * الحصول على كل حالات البانرات
   * @returns {Object} حالات البانرات
   */
  getBannerStatuses: () => {
    return Object.entries(BANNER_STATUS).map(([key, value]) => ({
      id: value,
      name: getBannerStatusName(value)
    }));
  },
  
  /**
   * الحصول على الأبعاد القياسية لنوع البانر
   * @param {string} type - نوع البانر
   * @returns {Object|null} أبعاد البانر القياسية أو null إذا كان النوع غير معروف
   */
  getStandardSizeForType: (type) => {
    return BANNER_SIZES[type] || null;
  }
};

/**
 * الحصول على اسم نوع البانر بالعربية
 * @param {string} type - نوع البانر
 * @returns {string} اسم النوع بالعربية
 */
function getBannerTypeName(type) {
  const typeNames = {
    [BANNER_TYPES.HERO]: 'بانر رئيسي',
    [BANNER_TYPES.SIDEBAR]: 'بانر جانبي',
    [BANNER_TYPES.INLINE]: 'بانر داخلي',
    [BANNER_TYPES.POPUP]: 'بانر منبثق',
    [BANNER_TYPES.SLIDER]: 'بانر متحرك',
    [BANNER_TYPES.RIBBON]: 'شريط إعلاني'
  };
  
  return typeNames[type] || 'غير معروف';
}

/**
 * الحصول على اسم حالة البانر بالعربية
 * @param {string} status - حالة البانر
 * @returns {string} اسم الحالة بالعربية
 */
function getBannerStatusName(status) {
  const statusNames = {
    [BANNER_STATUS.DRAFT]: 'مسودة',
    [BANNER_STATUS.ACTIVE]: 'نشط',
    [BANNER_STATUS.INACTIVE]: 'غير نشط',
    [BANNER_STATUS.SCHEDULED]: 'مجدول'
  };
  
  return statusNames[status] || 'غير معروف';
}

export default bannerService;