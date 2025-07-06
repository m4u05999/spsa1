/**
 * Diagnostics Utility - أداة التشخيص الشامل
 * فحص شامل لحالة النظام والخدمات
 */

import { dashboardStatsService } from '../services/dashboardStatsService';
import { contentService } from '../services/contentService';
import { unifiedContentService } from '../services/unifiedContentService';

/**
 * تشخيص شامل للنظام
 */
export const runSystemDiagnostics = async () => {
  console.log('🔍 بدء التشخيص الشامل للنظام...');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    services: {},
    data: {},
    errors: [],
    warnings: [],
    recommendations: []
  };

  try {
    // 1. فحص خدمة الإحصائيات
    console.log('📊 فحص خدمة الإحصائيات...');
    try {
      const stats = await dashboardStatsService.getDashboardStats();
      diagnostics.services.dashboardStats = {
        status: 'working',
        data: stats,
        message: 'خدمة الإحصائيات تعمل بشكل صحيح'
      };
      console.log('✅ خدمة الإحصائيات: تعمل بشكل صحيح');
    } catch (error) {
      diagnostics.services.dashboardStats = {
        status: 'error',
        error: error.message,
        message: 'خطأ في خدمة الإحصائيات'
      };
      diagnostics.errors.push(`خدمة الإحصائيات: ${error.message}`);
      console.error('❌ خدمة الإحصائيات: خطأ', error);
    }

    // 2. فحص خدمة المحتوى
    console.log('📝 فحص خدمة المحتوى...');
    try {
      const content = await contentService.getAll();
      diagnostics.services.contentService = {
        status: 'working',
        dataCount: content?.length || 0,
        message: `خدمة المحتوى تعمل بشكل صحيح (${content?.length || 0} عنصر)`
      };
      console.log(`✅ خدمة المحتوى: تعمل بشكل صحيح (${content?.length || 0} عنصر)`);
    } catch (error) {
      diagnostics.services.contentService = {
        status: 'error',
        error: error.message,
        message: 'خطأ في خدمة المحتوى'
      };
      diagnostics.errors.push(`خدمة المحتوى: ${error.message}`);
      console.error('❌ خدمة المحتوى: خطأ', error);
    }

    // 3. فحص الخدمة الموحدة للمحتوى
    console.log('🔗 فحص الخدمة الموحدة للمحتوى...');
    try {
      const unifiedContent = unifiedContentService.getDefaultContent();
      diagnostics.services.unifiedContentService = {
        status: 'working',
        dataCount: unifiedContent?.length || 0,
        message: `الخدمة الموحدة للمحتوى تعمل بشكل صحيح (${unifiedContent?.length || 0} عنصر)`
      };
      console.log(`✅ الخدمة الموحدة للمحتوى: تعمل بشكل صحيح (${unifiedContent?.length || 0} عنصر)`);
    } catch (error) {
      diagnostics.services.unifiedContentService = {
        status: 'error',
        error: error.message,
        message: 'خطأ في الخدمة الموحدة للمحتوى'
      };
      diagnostics.errors.push(`الخدمة الموحدة للمحتوى: ${error.message}`);
      console.error('❌ الخدمة الموحدة للمحتوى: خطأ', error);
    }

    // 4. فحص البيانات المحلية
    console.log('💾 فحص البيانات المحلية...');
    try {
      const localStorageKeys = Object.keys(localStorage);
      diagnostics.data.localStorage = {
        status: 'available',
        keysCount: localStorageKeys.length,
        keys: localStorageKeys,
        message: `التخزين المحلي متاح (${localStorageKeys.length} مفتاح)`
      };
      console.log(`✅ التخزين المحلي: متاح (${localStorageKeys.length} مفتاح)`);
    } catch (error) {
      diagnostics.data.localStorage = {
        status: 'error',
        error: error.message,
        message: 'خطأ في الوصول للتخزين المحلي'
      };
      diagnostics.errors.push(`التخزين المحلي: ${error.message}`);
      console.error('❌ التخزين المحلي: خطأ', error);
    }

    // 5. فحص متغيرات البيئة
    console.log('🌍 فحص متغيرات البيئة...');
    const envVars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'موجود' : 'غير موجود',
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE
    };
    
    diagnostics.data.environment = {
      status: 'checked',
      variables: envVars,
      message: 'تم فحص متغيرات البيئة'
    };
    console.log('✅ متغيرات البيئة: تم فحصها', envVars);

    // 6. إنشاء التوصيات
    if (diagnostics.errors.length === 0) {
      diagnostics.recommendations.push('🎉 جميع الخدمات تعمل بشكل صحيح!');
    } else {
      diagnostics.recommendations.push('🔧 يوجد مشاكل تحتاج إلى إصلاح');
      diagnostics.recommendations.push('📋 راجع قائمة الأخطاء أعلاه للتفاصيل');
    }

    // 7. ملخص التشخيص
    const summary = {
      totalServices: Object.keys(diagnostics.services).length,
      workingServices: Object.values(diagnostics.services).filter(s => s.status === 'working').length,
      errorCount: diagnostics.errors.length,
      warningCount: diagnostics.warnings.length,
      overallStatus: diagnostics.errors.length === 0 ? 'healthy' : 'needs_attention'
    };

    diagnostics.summary = summary;

    console.log('📋 ملخص التشخيص:', summary);
    console.log('🏁 انتهى التشخيص الشامل');

    return diagnostics;

  } catch (error) {
    console.error('💥 خطأ في التشخيص الشامل:', error);
    diagnostics.errors.push(`خطأ عام في التشخيص: ${error.message}`);
    diagnostics.summary = {
      totalServices: 0,
      workingServices: 0,
      errorCount: diagnostics.errors.length,
      warningCount: 0,
      overallStatus: 'critical_error'
    };
    return diagnostics;
  }
};

/**
 * عرض نتائج التشخيص في وحدة التحكم
 */
export const displayDiagnostics = async () => {
  const diagnostics = await runSystemDiagnostics();
  
  console.group('🔍 نتائج التشخيص الشامل');
  console.log('📊 الملخص:', diagnostics.summary);
  
  if (diagnostics.errors.length > 0) {
    console.group('❌ الأخطاء');
    diagnostics.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  if (diagnostics.warnings.length > 0) {
    console.group('⚠️ التحذيرات');
    diagnostics.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }
  
  console.group('💡 التوصيات');
  diagnostics.recommendations.forEach(rec => console.log(rec));
  console.groupEnd();
  
  console.groupEnd();
  
  return diagnostics;
};

/**
 * تشغيل التشخيص التلقائي عند تحميل الصفحة
 */
export const autoRunDiagnostics = () => {
  if (import.meta.env.MODE === 'development') {
    setTimeout(() => {
      displayDiagnostics();
    }, 2000);
  }
};

// تصدير افتراضي
export default {
  runSystemDiagnostics,
  displayDiagnostics,
  autoRunDiagnostics
};
