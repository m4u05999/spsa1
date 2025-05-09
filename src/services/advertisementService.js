// src/services/advertisementService.js
/**
 * @fileoverview خدمة لإدارة الإعلانات - تتعامل مع تخزين واسترجاع وجدولة الإعلانات
 */
import Advertisement, { AD_PLACEMENT_LOCATIONS, AD_STATUS } from '../models/Advertisement';
import Banner, { BANNER_STATUS } from '../models/Banner';
import localStorageService from './localStorageService';
import bannerService from './bannerService';

// مفاتيح التخزين المحلي
const ADS_STORAGE_KEY = 'advertisements';

/**
 * تهيئة بيانات الإعلانات في التخزين المحلي
 */
const initializeAdStorage = () => {
  if (!localStorageService.hasItem(ADS_STORAGE_KEY)) {
    localStorageService.setItem(ADS_STORAGE_KEY, []);
  }
};

/**
 * خدمة إدارة الإعلانات
 */
const advertisementService = {
  /**
   * الحصول على جميع الإعلانات
   * @param {Object} options - خيارات تصفية وترتيب النتائج
   * @param {string} [options.search] - نص للبحث في أسماء الإعلانات
   * @param {string} [options.location] - موقع الإعلان للتصفية
   * @param {string} [options.status] - حالة الإعلان للتصفية
   * @param {string} [options.bannerId] - معرف البانر للتصفية
   * @param {boolean} [options.onlyActive=false] - إظهار الإعلانات النشطة فقط
   * @param {string} [options.sortBy='createdAt'] - حقل الترتيب
   * @param {boolean} [options.sortDesc=true] - ترتيب تنازلي؟
   * @returns {Array<Advertisement>} قائمة كائنات الإعلانات
   */
  getAll: (options = {}) => {
    initializeAdStorage();
    
    const {
      search,
      location,
      status,
      bannerId,
      onlyActive = false,
      sortBy = 'createdAt',
      sortDesc = true
    } = options;
    
    let advertisements = localStorageService.getItem(ADS_STORAGE_KEY, [])
      .map(item => {
        const ad = Advertisement.fromJSON(item);
        // تحديث حالة الإعلان بناءً على تواريخ البدء والانتهاء
        if (!onlyActive) {
          ad.updateStatus();
        }
        return ad;
      });
    
    // تطبيق التصفية
    if (search) {
      const searchLower = search.toLowerCase();
      advertisements = advertisements.filter(ad => 
        ad.name.toLowerCase().includes(searchLower)
      );
    }
    
    if (location) {
      advertisements = advertisements.filter(ad => ad.location === location);
    }
    
    if (status) {
      advertisements = advertisements.filter(ad => ad.status === status);
    }
    
    if (bannerId) {
      advertisements = advertisements.filter(ad => ad.bannerId === bannerId);
    }
    
    if (onlyActive) {
      advertisements = advertisements.filter(ad => ad.isEligibleToDisplay());
    }
    
    // تطبيق الترتيب
    advertisements.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'startDate' || sortBy === 'endDate') {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      }
      
      if (valueA < valueB) return sortDesc ? 1 : -1;
      if (valueA > valueB) return sortDesc ? -1 : 1;
      
      // عند تساوي القيم، نرتب حسب الأولوية
      return b.priority - a.priority;
    });
    
    return advertisements;
  },
  
  /**
   * الحصول على إعلان بواسطة المعرف
   * @param {string} id - معرف الإعلان
   * @returns {Advertisement|null} كائن الإعلان أو null إذا لم يتم العثور عليه
   */
  getById: (id) => {
    initializeAdStorage();
    
    const advertisements = localStorageService.getItem(ADS_STORAGE_KEY, []);
    const advertisement = advertisements.find(item => item.id === id);
    
    if (!advertisement) {
      return null;
    }
    
    const ad = Advertisement.fromJSON(advertisement);
    ad.updateStatus();
    return ad;
  },
  
  /**
   * إنشاء إعلان جديد
   * @param {Object} adData - بيانات الإعلان
   * @returns {Advertisement} كائن الإعلان المنشأ
   */
  create: (adData) => {
    initializeAdStorage();
    
    // التأكد من وجود البانر المرتبط
    if (adData.bannerId) {
      const banner = bannerService.getById(adData.bannerId);
      if (!banner) {
        throw new Error(`البانر المحدد غير موجود: ${adData.bannerId}`);
      }
    }
    
    const advertisement = new Advertisement({
      ...adData,
      createdAt: new Date(),
      status: adData.status || AD_STATUS.DRAFT
    });
    
    // التحقق من صحة البيانات
    const validation = advertisement.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // حفظ الإعلان
    const advertisements = localStorageService.getItem(ADS_STORAGE_KEY, []);
    advertisements.push(advertisement.toJSON());
    localStorageService.setItem(ADS_STORAGE_KEY, advertisements);
    
    return advertisement;
  },
  
  /**
   * تحديث بيانات الإعلان
   * @param {string} id - معرف الإعلان
   * @param {Object} updates - البيانات المحدثة
   * @param {string} [userId] - معرف المستخدم الذي يقوم بالتحديث
   * @returns {Advertisement|null} كائن الإعلان المحدث أو null إذا لم يتم العثور عليه
   */
  update: (id, updates = {}, userId = '') => {
    initializeAdStorage();
    
    const advertisements = localStorageService.getItem(ADS_STORAGE_KEY, []);
    const index = advertisements.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    // التأكد من وجود البانر المرتبط إذا تم تحديثه
    if (updates.bannerId) {
      const banner = bannerService.getById(updates.bannerId);
      if (!banner) {
        throw new Error(`البانر المحدد غير موجود: ${updates.bannerId}`);
      }
    }
    
    // إنشاء كائن الإعلان الحالي
    const currentAd = Advertisement.fromJSON(advertisements[index]);
    
    // تحديث البيانات
    const updatedAd = currentAd.update(updates, userId);
    updatedAd.updateStatus();
    
    // التحقق من صحة البيانات
    const validation = updatedAd.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // حفظ البيانات المحدثة
    advertisements[index] = updatedAd.toJSON();
    localStorageService.setItem(ADS_STORAGE_KEY, advertisements);
    
    return updatedAd;
  },
  
  /**
   * حذف إعلان من النظام
   * @param {string} id - معرف الإعلان
   * @returns {boolean} هل تم الحذف بنجاح
   */
  delete: (id) => {
    initializeAdStorage();
    
    const advertisements = localStorageService.getItem(ADS_STORAGE_KEY, []);
    const newAdvertisements = advertisements.filter(item => item.id !== id);
    
    if (newAdvertisements.length === advertisements.length) {
      // لم يتم العثور على الإعلان
      return false;
    }
    
    localStorageService.setItem(ADS_STORAGE_KEY, newAdvertisements);
    return true;
  },
  
  /**
   * حذف مجموعة من الإعلانات
   * @param {Array<string>} ids - قائمة معرفات الإعلانات
   * @returns {number} عدد الإعلانات التي تم حذفها
   */
  bulkDelete: (ids) => {
    initializeAdStorage();
    
    const advertisements = localStorageService.getItem(ADS_STORAGE_KEY, []);
    const newAdvertisements = advertisements.filter(item => !ids.includes(item.id));
    
    const deletedCount = advertisements.length - newAdvertisements.length;
    
    if (deletedCount > 0) {
      localStorageService.setItem(ADS_STORAGE_KEY, newAdvertisements);
    }
    
    return deletedCount;
  },
  
  /**
   * تغيير حالة الإعلان
   * @param {string} id - معرف الإعلان
   * @param {string} status - الحالة الجديدة
   * @param {string} [userId] - معرف المستخدم الذي يقوم بالتغيير
   * @returns {Advertisement|null} كائن الإعلان المحدث أو null إذا لم يتم العثور عليه
   */
  changeStatus: (id, status, userId = '') => {
    if (!Object.values(AD_STATUS).includes(status)) {
      throw new Error(`حالة الإعلان غير صالحة: ${status}`);
    }
    
    return advertisementService.update(id, { status }, userId);
  },
  
  /**
   * تسجيل ظهور للإعلان
   * @param {string} id - معرف الإعلان
   * @returns {boolean} هل تم تسجيل الظهور بنجاح
   */
  recordImpression: (id) => {
    initializeAdStorage();
    
    const ad = advertisementService.getById(id);
    if (!ad || !ad.isEligibleToDisplay()) {
      return false;
    }
    
    ad.recordImpression();
    
    // حفظ البيانات المحدثة
    const advertisements = localStorageService.getItem(ADS_STORAGE_KEY, []);
    const index = advertisements.findIndex(item => item.id === id);
    
    if (index !== -1) {
      advertisements[index] = ad.toJSON();
      localStorageService.setItem(ADS_STORAGE_KEY, advertisements);
      return true;
    }
    
    return false;
  },
  
  /**
   * تسجيل نقرة على الإعلان
   * @param {string} id - معرف الإعلان
   * @returns {boolean} هل تم تسجيل النقرة بنجاح
   */
  recordClick: (id) => {
    initializeAdStorage();
    
    const ad = advertisementService.getById(id);
    if (!ad) {
      return false;
    }
    
    ad.recordClick();
    
    // حفظ البيانات المحدثة
    const advertisements = localStorageService.getItem(ADS_STORAGE_KEY, []);
    const index = advertisements.findIndex(item => item.id === id);
    
    if (index !== -1) {
      advertisements[index] = ad.toJSON();
      localStorageService.setItem(ADS_STORAGE_KEY, advertisements);
      return true;
    }
    
    return false;
  },
  
  /**
   * الحصول على الإعلانات النشطة لموقع محدد
   * @param {string} location - موقع الإعلان
   * @param {string} [page] - صفحة محددة (اختياري)
   * @param {number} [limit=1] - عدد الإعلانات المطلوبة
   * @returns {Array<Object>} قائمة الإعلانات النشطة مع بيانات البانر
   */
  getActiveAdsForLocation: (location, page = null, limit = 1) => {
    if (!Object.values(AD_PLACEMENT_LOCATIONS).includes(location)) {
      throw new Error(`موقع الإعلان غير صالح: ${location}`);
    }
    
    // الحصول على الإعلانات النشطة لهذا الموقع
    const ads = advertisementService.getAll({
      location,
      onlyActive: true,
      sortBy: 'priority',
      sortDesc: true
    });
    
    // تصفية حسب الصفحة المحددة إذا كانت موجودة
    const filteredAds = page
      ? ads.filter(ad => ad.pages.length === 0 || ad.pages.includes(page))
      : ads;
    
    // محدودية عدد الإعلانات المطلوبة
    const limitedAds = filteredAds.slice(0, limit);
    
    // جلب بيانات البانر لكل إعلان
    return limitedAds.map(ad => {
      const banner = bannerService.getById(ad.bannerId);
      return {
        advertisement: ad,
        banner: banner,
        id: ad.id,
        bannerId: ad.bannerId
      };
    });
  },
  
  /**
   * الحصول على جميع مواقع الإعلانات المتاحة
   * @returns {Array<Object>} قائمة مواقع الإعلانات
   */
  getAdPlacements: () => {
    return Object.entries(AD_PLACEMENT_LOCATIONS).map(([key, value]) => ({
      id: value,
      name: getAdPlacementName(value),
      description: getAdPlacementDescription(value),
      group: getAdPlacementGroup(value)
    }));
  },
  
  /**
   * الحصول على جميع حالات الإعلان
   * @returns {Array<Object>} قائمة حالات الإعلان
   */
  getAdStatuses: () => {
    return Object.entries(AD_STATUS).map(([key, value]) => ({
      id: value,
      name: getAdStatusName(value)
    }));
  },
  
  /**
   * إنشاء إعلان مرتبط ببانر جديد دفعة واحدة
   * @param {Object} bannerData - بيانات البانر
   * @param {Object} adData - بيانات الإعلان
   * @returns {Object} كائن يحتوي على البانر والإعلان المنشأ
   */
  createBannerWithAd: (bannerData, adData) => {
    // إنشاء البانر أولاً
    const banner = bannerService.create(bannerData);
    
    // إنشاء الإعلان مع ربطه بالبانر
    const advertisement = advertisementService.create({
      ...adData,
      bannerId: banner.id
    });
    
    return {
      banner,
      advertisement
    };
  },
  
  /**
   * تحديث إحصائيات الإعلانات وحالاتها
   * يستخدم هذا الإجراء لتحديث حالات الإعلانات بناء على تواريخ البدء والانتهاء
   * والإحصائيات مثل عدد الظهور والنقرات
   * @returns {number} عدد الإعلانات التي تم تحديثها
   */
  updateAdStatuses: () => {
    initializeAdStorage();
    
    const advertisements = localStorageService.getItem(ADS_STORAGE_KEY, []);
    let updatedCount = 0;
    
    const updatedAds = advertisements.map(adData => {
      const ad = Advertisement.fromJSON(adData);
      const oldStatus = ad.status;
      const newStatus = ad.updateStatus();
      
      if (oldStatus !== newStatus) {
        updatedCount++;
      }
      
      return ad.toJSON();
    });
    
    localStorageService.setItem(ADS_STORAGE_KEY, updatedAds);
    return updatedCount;
  },
  
  /**
   * الحصول على إحصائيات الإعلانات
   * @returns {Object} إحصائيات حول الإعلانات في النظام
   */
  getStatistics: () => {
    initializeAdStorage();
    
    const advertisements = localStorageService.getItem(ADS_STORAGE_KEY, [])
      .map(item => Advertisement.fromJSON(item));
    
    // تحديث حالات الإعلانات
    advertisements.forEach(ad => ad.updateStatus());
    
    // حساب الإحصائيات
    const totalAds = advertisements.length;
    const activeAds = advertisements.filter(ad => ad.status === AD_STATUS.ACTIVE).length;
    const scheduledAds = advertisements.filter(ad => ad.status === AD_STATUS.SCHEDULED).length;
    const expiredAds = advertisements.filter(ad => ad.status === AD_STATUS.EXPIRED).length;
    const draftAds = advertisements.filter(ad => ad.status === AD_STATUS.DRAFT).length;
    const inactiveAds = advertisements.filter(ad => ad.status === AD_STATUS.INACTIVE).length;
    
    // إجمالي الظهور والنقرات
    const totalImpressions = advertisements.reduce((sum, ad) => sum + ad.impressions, 0);
    const totalClicks = advertisements.reduce((sum, ad) => sum + ad.clicks, 0);
    
    // حساب متوسط معدل النقر إلى الظهور (CTR)
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    
    // إعلانات حسب الموقع
    const adsByLocation = {};
    Object.values(AD_PLACEMENT_LOCATIONS).forEach(location => {
      adsByLocation[location] = advertisements.filter(ad => ad.location === location).length;
    });
    
    return {
      totalAds,
      activeAds,
      scheduledAds,
      expiredAds,
      draftAds,
      inactiveAds,
      totalImpressions,
      totalClicks,
      averageCTR,
      adsByLocation
    };
  }
};

/**
 * الحصول على اسم موقع الإعلان بالعربية
 * @param {string} placement - موقع الإعلان
 * @returns {string} اسم الموقع بالعربية
 */
function getAdPlacementName(placement) {
  const placementNames = {
    [AD_PLACEMENT_LOCATIONS.HOME_TOP]: 'أعلى الصفحة الرئيسية',
    [AD_PLACEMENT_LOCATIONS.HOME_MIDDLE]: 'منتصف الصفحة الرئيسية',
    [AD_PLACEMENT_LOCATIONS.HOME_BOTTOM]: 'أسفل الصفحة الرئيسية',
    [AD_PLACEMENT_LOCATIONS.ARTICLE_TOP]: 'أعلى المقال',
    [AD_PLACEMENT_LOCATIONS.ARTICLE_MIDDLE]: 'منتصف المقال',
    [AD_PLACEMENT_LOCATIONS.ARTICLE_BOTTOM]: 'أسفل المقال',
    [AD_PLACEMENT_LOCATIONS.ARTICLE_SIDEBAR]: 'الشريط الجانبي للمقال',
    [AD_PLACEMENT_LOCATIONS.CATEGORY_TOP]: 'أعلى صفحة التصنيف',
    [AD_PLACEMENT_LOCATIONS.SEARCH_TOP]: 'أعلى نتائج البحث',
    [AD_PLACEMENT_LOCATIONS.GLOBAL_HEADER]: 'الهيدر العام',
    [AD_PLACEMENT_LOCATIONS.GLOBAL_FOOTER]: 'الفوتر العام',
    [AD_PLACEMENT_LOCATIONS.POPUP]: 'إعلان منبثق'
  };
  
  return placementNames[placement] || 'غير معروف';
}

/**
 * الحصول على وصف موقع الإعلان
 * @param {string} placement - موقع الإعلان
 * @returns {string} وصف الموقع
 */
function getAdPlacementDescription(placement) {
  const placementDescriptions = {
    [AD_PLACEMENT_LOCATIONS.HOME_TOP]: 'يظهر أعلى الصفحة الرئيسية تحت القائمة العلوية مباشرة',
    [AD_PLACEMENT_LOCATIONS.HOME_MIDDLE]: 'يظهر في منتصف الصفحة الرئيسية بين الأقسام',
    [AD_PLACEMENT_LOCATIONS.HOME_BOTTOM]: 'يظهر في أسفل الصفحة الرئيسية قبل تذييل الصفحة',
    [AD_PLACEMENT_LOCATIONS.ARTICLE_TOP]: 'يظهر في أعلى صفحة المقال قبل بداية المحتوى',
    [AD_PLACEMENT_LOCATIONS.ARTICLE_MIDDLE]: 'يظهر في منتصف محتوى المقال',
    [AD_PLACEMENT_LOCATIONS.ARTICLE_BOTTOM]: 'يظهر في نهاية المقال وقبل التعليقات',
    [AD_PLACEMENT_LOCATIONS.ARTICLE_SIDEBAR]: 'يظهر في الشريط الجانبي عند قراءة المقالات',
    [AD_PLACEMENT_LOCATIONS.CATEGORY_TOP]: 'يظهر في أعلى صفحات التصنيفات',
    [AD_PLACEMENT_LOCATIONS.SEARCH_TOP]: 'يظهر فوق نتائج البحث',
    [AD_PLACEMENT_LOCATIONS.GLOBAL_HEADER]: 'يظهر أعلى جميع صفحات الموقع',
    [AD_PLACEMENT_LOCATIONS.GLOBAL_FOOTER]: 'يظهر أسفل جميع صفحات الموقع',
    [AD_PLACEMENT_LOCATIONS.POPUP]: 'يظهر كإعلان منبثق على الشاشة'
  };
  
  return placementDescriptions[placement] || '';
}

/**
 * الحصول على مجموعة موقع الإعلان
 * @param {string} placement - موقع الإعلان
 * @returns {string} مجموعة الموقع
 */
function getAdPlacementGroup(placement) {
  if (placement.startsWith('home_')) {
    return 'الصفحة الرئيسية';
  } else if (placement.startsWith('article_')) {
    return 'صفحات المقالات';
  } else if (placement === 'category_top') {
    return 'صفحات التصنيفات';
  } else if (placement === 'search_top') {
    return 'صفحات البحث';
  } else if (placement.startsWith('global_')) {
    return 'عام';
  } else {
    return 'أخرى';
  }
}

/**
 * الحصول على اسم حالة الإعلان بالعربية
 * @param {string} status - حالة الإعلان
 * @returns {string} اسم الحالة بالعربية
 */
function getAdStatusName(status) {
  const statusNames = {
    [AD_STATUS.DRAFT]: 'مسودة',
    [AD_STATUS.ACTIVE]: 'نشط',
    [AD_STATUS.INACTIVE]: 'غير نشط',
    [AD_STATUS.SCHEDULED]: 'مجدول',
    [AD_STATUS.EXPIRED]: 'منتهي الصلاحية'
  };
  
  return statusNames[status] || 'غير معروف';
}

export default advertisementService;