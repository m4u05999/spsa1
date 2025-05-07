// src/services/paymentService.js
import localStorageService from './localStorageService';
import { updateUserMembership } from './userService';

// رموز التخزين المحلي
const PAYMENTS_KEY = 'payment_transactions';

/**
 * معالجة دفع العضوية
 * @param {Object} paymentData - بيانات الدفع
 * @returns {Promise<Object>} - نتيجة عملية الدفع
 */
export const processPayment = async (paymentData) => {
  try {
    // للعرض التوضيحي، نحاكي عملية الدفع
    // في تطبيق حقيقي، هذه العملية ستكون من خلال بوابة دفع
    
    // تأخير لمحاكاة عملية الدفع
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // إنشاء معاملة دفع جديدة
    const transaction = {
      id: `trx_${Date.now()}`,
      amount: paymentData.amount,
      date: new Date().toISOString(),
      status: 'completed',
      membershipId: paymentData.membershipId
    };
    
    // حفظ المعاملة في التخزين المحلي
    const transactions = localStorageService.getItem(PAYMENTS_KEY, []);
    transactions.push(transaction);
    localStorageService.setItem(PAYMENTS_KEY, transactions);
    
    // احصل على معرف المستخدم الحالي
    const currentUser = localStorageService.getUserData();
    
    if (currentUser && currentUser.id) {
      // تحديث عضوية المستخدم
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // العضوية صالحة لمدة سنة
      
      await updateUserMembership(currentUser.id, {
        type: getMembershipName(paymentData.membershipId),
        status: 'active',
        startDate: new Date().toISOString(),
        expiresAt: expiryDate.toISOString()
      });
    }
    
    return transaction;
  } catch (error) {
    console.error('خطأ في معالجة الدفع:', error);
    throw new Error('فشل في إتمام عملية الدفع');
  }
};

/**
 * معالجة تبرع
 * @param {Object} donationData - بيانات التبرع
 * @returns {Promise<Object>} - نتيجة عملية التبرع
 */
export const processDonation = async (donationData) => {
  try {
    // للعرض التوضيحي، نحاكي عملية الدفع
    // في تطبيق حقيقي، هذه العملية ستكون من خلال بوابة دفع
    
    // تأخير لمحاكاة عملية الدفع
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // إنشاء معاملة دفع جديدة
    const transaction = {
      id: `donation_${Date.now()}`,
      amount: donationData.amount,
      date: new Date().toISOString(),
      status: 'completed',
      type: 'donation',
      purpose: donationData.purpose || 'تبرع عام',
      message: donationData.message || ''
    };
    
    // حفظ المعاملة في التخزين المحلي
    const transactions = localStorageService.getItem(PAYMENTS_KEY, []);
    transactions.push(transaction);
    localStorageService.setItem(PAYMENTS_KEY, transactions);
    
    return transaction;
  } catch (error) {
    console.error('خطأ في معالجة التبرع:', error);
    throw new Error('فشل في إتمام عملية التبرع');
  }
};

/**
 * الحصول على معاملات الدفع للمستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {Promise<Array>} - قائمة المعاملات
 */
export const getUserPayments = async (userId) => {
  try {
    // للعرض التوضيحي، نستخدم التخزين المحلي
    const transactions = localStorageService.getItem(PAYMENTS_KEY, []);
    
    // في تطبيق حقيقي، سنقوم بتصفية المعاملات حسب المستخدم
    // هنا نفترض أن جميع المعاملات المخزنة محليًا تخص المستخدم الحالي
    return transactions;
  } catch (error) {
    console.error('خطأ في الحصول على معاملات الدفع:', error);
    throw new Error('فشل في استرداد معاملات الدفع');
  }
};

/**
 * الحصول على اسم العضوية من المعرف
 * @param {string} membershipId - معرف العضوية
 * @returns {string} - اسم العضوية
 */
export const getMembershipName = (membershipId) => {
  const membershipTypes = {
    'student': 'عضوية طالب',
    'standard': 'عضوية أساسية',
    'professional': 'عضوية متخصص'
  };
  
  return membershipTypes[membershipId] || 'عضوية غير معروفة';
};