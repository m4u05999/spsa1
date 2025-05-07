// src/utils/validators.js
/**
 * وظيفة للتحقق من صحة عنوان البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني المراد التحقق منه
 * @returns {boolean} - صحيح إذا كان البريد الإلكتروني صالحًا
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * وظيفة للتحقق من صحة رقم الهاتف
 * @param {string} phone - رقم الهاتف المراد التحقق منه
 * @returns {boolean} - صحيح إذا كان رقم الهاتف صالحًا
 */
export const validatePhone = (phone) => {
  // تنسيق أرقام الهواتف السعودية (يبدأ بـ 05 ويتكون من 10 أرقام)
  const phoneRegex = /^(05)[0-9]{8}$/;
  return phoneRegex.test(phone);
};

/**
 * وظيفة للتحقق من صحة كلمة المرور
 * @param {string} password - كلمة المرور المراد التحقق منها
 * @returns {boolean} - صحيح إذا كانت كلمة المرور صالحة
 */
export const validatePassword = (password) => {
  // على الأقل 8 أحرف، تحتوي على رقم واحد على الأقل وحرف كبير واحد على الأقل
  const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * وظيفة للتحقق من صحة رقم بطاقة الائتمان
 * @param {string} cardNumber - رقم البطاقة المراد التحقق منه
 * @returns {boolean} - صحيح إذا كان رقم البطاقة صالحًا
 */
export const validateCreditCard = (cardNumber) => {
  // التحقق من أن رقم البطاقة يتكون من 16 رقمًا
  const cardRegex = /^[0-9]{16}$/;
  return cardRegex.test(cardNumber);
};

/**
 * وظيفة للتحقق من صحة تاريخ انتهاء البطاقة
 * @param {string} expiryDate - تاريخ انتهاء البطاقة بالنموذج MM/YY
 * @returns {boolean} - صحيح إذا كان تاريخ الانتهاء صالحًا
 */
export const validateExpiryDate = (expiryDate) => {
  // تحقق من التنسيق MM/YY
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    return false;
  }

  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // الحصول على آخر رقمين من السنة الحالية
  const currentMonth = currentDate.getMonth() + 1; // الشهور تبدأ من 0

  // تحويل إلى أرقام
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  // التحقق من صحة الشهر
  if (monthNum < 1 || monthNum > 12) {
    return false;
  }

  // التحقق من تاريخ انتهاء صالح (غير منتهي)
  return (
    yearNum > currentYear ||
    (yearNum === currentYear && monthNum >= currentMonth)
  );
};

/**
 * وظيفة للتحقق من صحة رمز الأمان CVV
 * @param {string} cvv - رمز الأمان المراد التحقق منه
 * @returns {boolean} - صحيح إذا كان رمز الأمان صالحًا
 */
export const validateCVV = (cvv) => {
  // رمز الأمان يتكون من 3 أو 4 أرقام
  const cvvRegex = /^[0-9]{3,4}$/;
  return cvvRegex.test(cvv);
};

/**
 * وظيفة للتحقق من صحة المبلغ
 * @param {string|number} amount - المبلغ المراد التحقق منه
 * @returns {boolean} - صحيح إذا كان المبلغ صالحًا
 */
export const validateAmount = (amount) => {
  // تحويل المبلغ إلى رقم إذا كان نصًا
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // التحقق من أن المبلغ رقم موجب
  return !isNaN(numAmount) && numAmount > 0;
};