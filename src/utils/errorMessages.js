/**
 * Enhanced Arabic Error Messages
 * رسائل الخطأ العربية المحسنة
 * 
 * Centralized error messages with improved UX and clarity
 */

/**
 * Form Validation Messages
 * رسائل التحقق من صحة النماذج
 */
export const VALIDATION_MESSAGES = {
  // Required fields
  REQUIRED: {
    name: 'يرجى إدخال الاسم الكامل',
    email: 'يرجى إدخال البريد الإلكتروني',
    password: 'يرجى إدخال كلمة المرور',
    confirmPassword: 'يرجى تأكيد كلمة المرور',
    phone: 'يرجى إدخال رقم الهاتف',
    message: 'يرجى إدخال الرسالة',
    title: 'يرجى إدخال العنوان',
    description: 'يرجى إدخال الوصف',
    amount: 'يرجى إدخال المبلغ',
    purpose: 'يرجى اختيار الغرض',
    type: 'يرجى اختيار النوع',
    category: 'يرجى اختيار الفئة',
    date: 'يرجى اختيار التاريخ',
    time: 'يرجى اختيار الوقت',
    location: 'يرجى إدخال الموقع',
    terms: 'يرجى الموافقة على الشروط والأحكام'
  },

  // Format validation
  FORMAT: {
    email: 'يرجى إدخال بريد إلكتروني صحيح (مثال: user@example.com)',
    phone: 'يرجى إدخال رقم هاتف سعودي صحيح (مثال: 0501234567)',
    password: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم',
    url: 'يرجى إدخال رابط صحيح (مثال: https://example.com)',
    number: 'يرجى إدخال رقم صحيح',
    positiveNumber: 'يرجى إدخال رقم أكبر من الصفر',
    date: 'يرجى إدخال تاريخ صحيح',
    time: 'يرجى إدخال وقت صحيح'
  },

  // Length validation
  LENGTH: {
    nameMin: 'الاسم يجب أن يكون أكثر من حرفين',
    nameMax: 'الاسم يجب أن يكون أقل من 100 حرف',
    passwordMin: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    passwordMax: 'كلمة المرور يجب أن تكون أقل من 128 حرف',
    messageMin: 'الرسالة يجب أن تكون أكثر من 10 أحرف',
    messageMax: 'الرسالة يجب أن تكون أقل من 1000 حرف',
    titleMax: 'العنوان يجب أن يكون أقل من 200 حرف',
    descriptionMax: 'الوصف يجب أن يكون أقل من 2000 حرف'
  },

  // Match validation
  MATCH: {
    passwordMismatch: 'كلمات المرور غير متطابقة',
    emailMismatch: 'عناوين البريد الإلكتروني غير متطابقة'
  },

  // Range validation
  RANGE: {
    amountMin: 'المبلغ يجب أن يكون أكبر من 1 ريال',
    amountMax: 'المبلغ يجب أن يكون أقل من 1,000,000 ريال',
    ageMin: 'العمر يجب أن يكون أكبر من 16 سنة',
    ageMax: 'العمر يجب أن يكون أقل من 100 سنة',
    dateMin: 'التاريخ يجب أن يكون في المستقبل',
    dateMax: 'التاريخ يجب أن يكون خلال السنة القادمة'
  }
};

/**
 * API Error Messages
 * رسائل أخطاء API
 */
export const API_ERROR_MESSAGES = {
  // Network errors
  NETWORK: {
    offline: 'لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى',
    timeout: 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى',
    serverError: 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً',
    notFound: 'الصفحة أو المورد المطلوب غير موجود',
    forbidden: 'ليس لديك صلاحية للوصول إلى هذا المورد',
    unauthorized: 'يرجى تسجيل الدخول للمتابعة'
  },

  // Authentication errors
  AUTH: {
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    accountLocked: 'تم قفل الحساب مؤقتاً بسبب محاولات دخول متعددة فاشلة',
    sessionExpired: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
    emailNotVerified: 'يرجى تفعيل البريد الإلكتروني أولاً',
    passwordExpired: 'انتهت صلاحية كلمة المرور. يرجى تحديثها',
    accountDisabled: 'تم تعطيل الحساب. يرجى التواصل مع الدعم الفني'
  },

  // Validation errors
  VALIDATION: {
    invalidData: 'البيانات المدخلة غير صحيحة',
    missingFields: 'يرجى ملء جميع الحقول المطلوبة',
    duplicateEntry: 'هذه البيانات موجودة مسبقاً',
    invalidFormat: 'تنسيق البيانات غير صحيح',
    fileTooLarge: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت',
    invalidFileType: 'نوع الملف غير مدعوم. الأنواع المدعومة: PDF, JPG, PNG'
  },

  // Payment errors
  PAYMENT: {
    cardDeclined: 'تم رفض البطاقة. يرجى التحقق من البيانات أو استخدام بطاقة أخرى',
    insufficientFunds: 'الرصيد غير كافي',
    expiredCard: 'انتهت صلاحية البطاقة',
    invalidCard: 'بيانات البطاقة غير صحيحة',
    paymentFailed: 'فشل في عملية الدفع. يرجى المحاولة مرة أخرى',
    processingError: 'خطأ في معالجة الدفع. يرجى التواصل مع البنك'
  },

  // Rate limiting
  RATE_LIMIT: {
    tooManyRequests: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد قليل',
    loginAttempts: 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة',
    apiCalls: 'تم تجاوز الحد المسموح من استدعاءات API. يرجى المحاولة لاحقاً'
  }
};

/**
 * Success Messages
 * رسائل النجاح
 */
export const SUCCESS_MESSAGES = {
  // General actions
  GENERAL: {
    saved: 'تم الحفظ بنجاح',
    updated: 'تم التحديث بنجاح',
    deleted: 'تم الحذف بنجاح',
    created: 'تم الإنشاء بنجاح',
    sent: 'تم الإرسال بنجاح',
    uploaded: 'تم رفع الملف بنجاح',
    downloaded: 'تم تحميل الملف بنجاح'
  },

  // Authentication
  AUTH: {
    loginSuccess: 'تم تسجيل الدخول بنجاح',
    logoutSuccess: 'تم تسجيل الخروج بنجاح',
    registerSuccess: 'تم إنشاء الحساب بنجاح. يرجى تفعيل البريد الإلكتروني',
    passwordChanged: 'تم تغيير كلمة المرور بنجاح',
    emailVerified: 'تم تفعيل البريد الإلكتروني بنجاح',
    passwordReset: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
  },

  // Profile
  PROFILE: {
    updated: 'تم تحديث الملف الشخصي بنجاح',
    photoUploaded: 'تم تحديث الصورة الشخصية بنجاح',
    preferencesUpdated: 'تم تحديث التفضيلات بنجاح'
  },

  // Content
  CONTENT: {
    published: 'تم نشر المحتوى بنجاح',
    unpublished: 'تم إلغاء نشر المحتوى',
    archived: 'تم أرشفة المحتوى',
    restored: 'تم استعادة المحتوى'
  },

  // Payment
  PAYMENT: {
    successful: 'تم الدفع بنجاح',
    refunded: 'تم استرداد المبلغ بنجاح',
    pending: 'الدفع قيد المعالجة'
  }
};

/**
 * Warning Messages
 * رسائل التحذير
 */
export const WARNING_MESSAGES = {
  // Data loss warnings
  DATA_LOSS: {
    unsavedChanges: 'لديك تغييرات غير محفوظة. هل تريد المتابعة؟',
    deleteConfirm: 'هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء',
    permanentAction: 'هذا الإجراء نهائي ولا يمكن التراجع عنه',
    dataWillBeLost: 'سيتم فقدان جميع البيانات المدخلة'
  },

  // Security warnings
  SECURITY: {
    passwordWeak: 'كلمة المرور ضعيفة. يُنصح باستخدام كلمة مرور أقوى',
    publicNetwork: 'أنت متصل بشبكة عامة. تجنب إدخال معلومات حساسة',
    sessionTimeout: 'ستنتهي صلاحية الجلسة خلال 5 دقائق',
    suspiciousActivity: 'تم اكتشاف نشاط مشبوه في حسابك'
  },

  // System warnings
  SYSTEM: {
    maintenance: 'سيتم إجراء صيانة للنظام قريباً',
    slowConnection: 'الاتصال بطيء. قد تستغرق العمليات وقتاً أطول',
    browserNotSupported: 'المتصفح الحالي غير مدعوم بالكامل. يُنصح بالتحديث',
    cookiesDisabled: 'ملفات تعريف الارتباط معطلة. قد لا تعمل بعض الميزات'
  }
};

/**
 * Info Messages
 * رسائل المعلومات
 */
export const INFO_MESSAGES = {
  // Loading states
  LOADING: {
    general: 'جاري التحميل...',
    saving: 'جاري الحفظ...',
    uploading: 'جاري رفع الملف...',
    processing: 'جاري المعالجة...',
    connecting: 'جاري الاتصال...',
    verifying: 'جاري التحقق...'
  },

  // Empty states
  EMPTY: {
    noData: 'لا توجد بيانات للعرض',
    noResults: 'لم يتم العثور على نتائج',
    noNotifications: 'لا توجد إشعارات جديدة',
    noMessages: 'لا توجد رسائل',
    noFiles: 'لم يتم رفع أي ملفات بعد'
  },

  // Help messages
  HELP: {
    passwordRequirements: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم',
    phoneFormat: 'أدخل رقم الهاتف بالصيغة: 05xxxxxxxx',
    emailFormat: 'أدخل البريد الإلكتروني بالصيغة: user@example.com',
    fileUpload: 'يمكنك رفع ملفات PDF, JPG, PNG بحد أقصى 10 ميجابايت'
  }
};

/**
 * Get formatted error message
 * الحصول على رسالة خطأ منسقة
 */
export const getErrorMessage = (category, key, params = {}) => {
  const messages = {
    validation: VALIDATION_MESSAGES,
    api: API_ERROR_MESSAGES,
    success: SUCCESS_MESSAGES,
    warning: WARNING_MESSAGES,
    info: INFO_MESSAGES
  };

  const categoryMessages = messages[category];
  if (!categoryMessages) return 'حدث خطأ غير متوقع';

  const message = categoryMessages[key];
  if (!message) return 'حدث خطأ غير متوقع';

  // Replace parameters in message
  let formattedMessage = message;
  Object.keys(params).forEach(param => {
    formattedMessage = formattedMessage.replace(`{{${param}}}`, params[param]);
  });

  return formattedMessage;
};

/**
 * Format validation errors for forms
 * تنسيق أخطاء التحقق للنماذج
 */
export const formatValidationErrors = (errors) => {
  const formattedErrors = {};
  
  Object.keys(errors).forEach(field => {
    const error = errors[field];
    if (typeof error === 'string') {
      formattedErrors[field] = error;
    } else if (error && error.message) {
      formattedErrors[field] = error.message;
    } else if (error && error.type) {
      // Map error types to Arabic messages
      const errorType = error.type;
      const errorValue = error.value;
      
      if (errorType === 'required') {
        formattedErrors[field] = VALIDATION_MESSAGES.REQUIRED[field] || 'هذا الحقل مطلوب';
      } else if (errorType === 'format') {
        formattedErrors[field] = VALIDATION_MESSAGES.FORMAT[field] || 'تنسيق البيانات غير صحيح';
      } else if (errorType === 'length') {
        formattedErrors[field] = VALIDATION_MESSAGES.LENGTH[`${field}${error.constraint}`] || 'طول البيانات غير صحيح';
      } else {
        formattedErrors[field] = 'البيانات غير صحيحة';
      }
    }
  });
  
  return formattedErrors;
};

export default {
  VALIDATION_MESSAGES,
  API_ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WARNING_MESSAGES,
  INFO_MESSAGES,
  getErrorMessage,
  formatValidationErrors
};
