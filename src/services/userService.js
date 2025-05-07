// src/services/userService.js
import localStorageService from './localStorageService';
import { updateUserLocalData } from './authService';

// رموز التخزين المحلي
const MEMBERSHIPS_KEY = 'user_memberships';
const DONATIONS_KEY = 'user_donations';
const CONTRIBUTORS_KEY = 'contributors';

/**
 * الحصول على معلومات العضوية للمستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {Promise<Object|null>} - معلومات العضوية أو null
 */
export const getUserMembership = async (userId) => {
  try {
    // للعرض التوضيحي، نستخدم التخزين المحلي
    // في التطبيق الحقيقي، سنقوم بطلب من الخادم
    const memberships = localStorageService.getItem(MEMBERSHIPS_KEY, {});
    
    // إذا كان المستخدم له عضوية مخزنة
    if (memberships[userId]) {
      return memberships[userId];
    }
    
    return null;
  } catch (error) {
    console.error('خطأ في الحصول على معلومات العضوية:', error);
    throw new Error('فشل في استرداد بيانات العضوية');
  }
};

/**
 * تحديث معلومات العضوية للمستخدم
 * @param {string} userId - معرف المستخدم
 * @param {Object} membershipData - بيانات العضوية الجديدة
 * @returns {Promise<Object>} - معلومات العضوية المحدثة
 */
export const updateUserMembership = async (userId, membershipData) => {
  try {
    // للعرض التوضيحي، نستخدم التخزين المحلي
    const memberships = localStorageService.getItem(MEMBERSHIPS_KEY, {});
    
    // تحديث بيانات العضوية
    memberships[userId] = {
      ...memberships[userId],
      ...membershipData
    };
    
    // حفظ البيانات المحدثة
    localStorageService.setItem(MEMBERSHIPS_KEY, memberships);
    
    return memberships[userId];
  } catch (error) {
    console.error('خطأ في تحديث معلومات العضوية:', error);
    throw new Error('فشل في تحديث بيانات العضوية');
  }
};

/**
 * الحصول على بيانات المستخدم
 * @returns {Promise<Object|null>} - بيانات المستخدم أو null
 */
export const getUserData = async () => {
  try {
    // للعرض التوضيحي، نستخدم التخزين المحلي
    const userData = localStorageService.getUserData();
    return userData;
  } catch (error) {
    console.error('خطأ في الحصول على بيانات المستخدم:', error);
    throw new Error('فشل في استرداد بيانات المستخدم');
  }
};

/**
 * تحديث الملف الشخصي للمستخدم
 * @param {Object} userData - بيانات المستخدم المحدثة
 * @returns {Promise<Object>} - بيانات المستخدم بعد التحديث
 */
export const updateUserProfile = async (userData) => {
  try {
    // تحديث البيانات في التخزين المحلي
    updateUserLocalData(userData);
    return userData;
  } catch (error) {
    console.error('خطأ في تحديث الملف الشخصي:', error);
    throw new Error('فشل في تحديث الملف الشخصي');
  }
};

/**
 * إضافة تبرع جديد
 * @param {Object} donationData - بيانات التبرع
 * @returns {Promise<Object>} - بيانات التبرع المضافة
 */
export const addNewDonation = async (donationData) => {
  try {
    // الحصول على سجل التبرعات الحالي
    const donations = localStorageService.getItem(DONATIONS_KEY, []);
    
    // إنشاء تبرع جديد مع معرف فريد وتاريخ
    const newDonation = {
      id: `donation_${Date.now()}`,
      date: new Date().toISOString(),
      ...donationData
    };
    
    // إضافة التبرع الجديد إلى السجل
    donations.push(newDonation);
    
    // حفظ سجل التبرعات المحدث
    localStorageService.setItem(DONATIONS_KEY, donations);
    
    // تحديث قائمة المساهمين
    await updateContributor(donationData.contributorId || donationData.userId, donationData.amount);
    
    return newDonation;
  } catch (error) {
    console.error('خطأ في إضافة تبرع جديد:', error);
    throw new Error('فشل في إضافة التبرع');
  }
};

/**
 * الحصول على قائمة التبرعات للمستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {Promise<Array>} - قائمة التبرعات
 */
export const getUserDonations = async (userId) => {
  try {
    // الحصول على سجل التبرعات
    const donations = localStorageService.getItem(DONATIONS_KEY, []);
    
    // تصفية التبرعات الخاصة بالمستخدم
    return donations.filter(donation => donation.userId === userId);
  } catch (error) {
    console.error('خطأ في الحصول على تبرعات المستخدم:', error);
    throw new Error('فشل في استرداد بيانات التبرعات');
  }
};

/**
 * الحصول على قائمة المساهمين
 * @returns {Promise<Array>} - قائمة المساهمين
 */
export const getContributors = async () => {
  try {
    // الحصول على قائمة المساهمين
    return localStorageService.getItem(CONTRIBUTORS_KEY, []);
  } catch (error) {
    console.error('خطأ في الحصول على قائمة المساهمين:', error);
    throw new Error('فشل في استرداد قائمة المساهمين');
  }
};

/**
 * تحديث بيانات المساهم
 * @param {string} id - معرف المساهم
 * @param {number} amount - مبلغ المساهمة
 * @returns {Promise<Object>} - بيانات المساهم المحدثة
 */
export const updateContributor = async (id, amount) => {
  try {
    // الحصول على قائمة المساهمين الحالية
    const contributors = localStorageService.getItem(CONTRIBUTORS_KEY, []);
    
    // البحث عن المساهم في القائمة
    let contributor = contributors.find(c => c.id === id);
    
    if (contributor) {
      // تحديث المساهم الموجود
      contributor.totalAmount += amount;
      contributor.lastDonation = new Date().toISOString();
      contributor.tier = getContributorTier(contributor.totalAmount);
    } else {
      // إنشاء مساهم جديد
      const userData = localStorageService.getUserData();
      contributor = {
        id,
        name: userData?.name || 'مساهم',
        email: userData?.email || '',
        totalAmount: amount,
        firstDonation: new Date().toISOString(),
        lastDonation: new Date().toISOString(),
        tier: getContributorTier(amount)
      };
      contributors.push(contributor);
    }
    
    // حفظ قائمة المساهمين المحدثة
    localStorageService.setItem(CONTRIBUTORS_KEY, contributors);
    
    return contributor;
  } catch (error) {
    console.error('خطأ في تحديث بيانات المساهم:', error);
    throw new Error('فشل في تحديث بيانات المساهم');
  }
};

/**
 * تحديد مستوى المساهم بناءً على إجمالي المساهمات
 * @param {number} totalAmount - إجمالي المساهمات
 * @returns {string} - مستوى المساهم
 */
export const getContributorTier = (totalAmount) => {
  if (totalAmount >= 10000) {
    return 'ذهبي';
  } else if (totalAmount >= 5000) {
    return 'فضي';
  } else {
    return 'برونزي';
  }
};