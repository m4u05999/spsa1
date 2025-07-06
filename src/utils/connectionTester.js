/**
 * Connection Tester - أداة اختبار الاتصال
 * اختبار الاتصال مع Supabase والخدمات الخارجية
 */

import supabaseService from '../services/supabaseService.js';
import backendService from '../services/backendService.js';
import databaseChecker from './databaseChecker.js';
import { ENV } from '../config/environment.js';

/**
 * Connection test results
 * نتائج اختبار الاتصال
 */
let testResults = {
  supabase: { status: 'pending', message: '', details: null },
  backend: { status: 'pending', message: '', details: null },
  database: { status: 'pending', message: '', details: null },
  environment: { status: 'pending', message: '', details: null },
  overall: { status: 'pending', score: 0, ready: false }
};

/**
 * Test Supabase connection
 * اختبار اتصال Supabase
 */
const testSupabaseConnection = async () => {
  try {
    // التحقق من إعدادات Supabase
    if (!ENV.SUPABASE.URL || !ENV.SUPABASE.ANON_KEY) {
      testResults.supabase = {
        status: 'error',
        message: 'إعدادات Supabase غير مكتملة',
        details: {
          hasUrl: !!ENV.SUPABASE.URL,
          hasAnonKey: !!ENV.SUPABASE.ANON_KEY,
          hasServiceKey: !!ENV.SUPABASE.SERVICE_ROLE_KEY
        }
      };
      return false;
    }

    // اختبار الاتصال
    const connectionTest = await supabaseService.testConnection();
    
    if (connectionTest.success) {
      testResults.supabase = {
        status: 'success',
        message: 'تم الاتصال بـ Supabase بنجاح',
        details: {
          url: ENV.SUPABASE.URL,
          isAvailable: supabaseService.isAvailable(),
          timestamp: new Date().toISOString()
        }
      };
      return true;
    } else {
      testResults.supabase = {
        status: 'error',
        message: `فشل في الاتصال بـ Supabase: ${connectionTest.error}`,
        details: connectionTest
      };
      return false;
    }
  } catch (error) {
    testResults.supabase = {
      status: 'error',
      message: `خطأ في اختبار Supabase: ${error.message}`,
      details: { error: error.message }
    };
    return false;
  }
};

/**
 * Test backend service
 * اختبار خدمة الواجهة الخلفية
 */
const testBackendService = async () => {
  try {
    // تهيئة خدمة الواجهة الخلفية
    const initResult = await backendService.initialize();
    
    if (initResult.isOnline) {
      testResults.backend = {
        status: 'success',
        message: 'خدمة الواجهة الخلفية تعمل بنجاح',
        details: {
          isOnline: initResult.isOnline,
          services: initResult.services,
          errors: initResult.errors || []
        }
      };
      return true;
    } else {
      testResults.backend = {
        status: 'warning',
        message: 'خدمة الواجهة الخلفية تعمل في الوضع المحلي',
        details: initResult
      };
      return true; // لا يزال يعمل، لكن في الوضع المحلي
    }
  } catch (error) {
    testResults.backend = {
      status: 'error',
      message: `خطأ في خدمة الواجهة الخلفية: ${error.message}`,
      details: { error: error.message }
    };
    return false;
  }
};

/**
 * Test database structure
 * اختبار بنية قاعدة البيانات
 */
const testDatabaseStructure = async () => {
  try {
    const dbCheck = await databaseChecker.check();
    
    if (dbCheck.success) {
      const score = dbCheck.results.overall.score;
      
      testResults.database = {
        status: score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error',
        message: `نتيجة فحص قاعدة البيانات: ${score}/100`,
        details: dbCheck.results
      };
      
      return score >= 60; // قبول النتيجة إذا كانت 60% أو أكثر
    } else {
      testResults.database = {
        status: 'error',
        message: `فشل في فحص قاعدة البيانات: ${dbCheck.error}`,
        details: dbCheck
      };
      return false;
    }
  } catch (error) {
    testResults.database = {
      status: 'error',
      message: `خطأ في فحص قاعدة البيانات: ${error.message}`,
      details: { error: error.message }
    };
    return false;
  }
};

/**
 * Test environment configuration
 * اختبار إعدادات البيئة
 */
const testEnvironmentConfig = () => {
  try {
    const issues = [];
    let score = 100;

    // فحص متغيرات البيئة المطلوبة
    const requiredVars = [
      'VITE_APP_ENV',
      'VITE_APP_URL',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    requiredVars.forEach(varName => {
      if (!ENV[varName.replace('VITE_', '').replace('_', '.')]) {
        issues.push(`متغير البيئة مفقود: ${varName}`);
        score -= 20;
      }
    });

    // فحص إعدادات الأمان
    if (!ENV.SECURITY.ENCRYPTION_KEY) {
      issues.push('مفتاح التشفير غير مُعرف');
      score -= 10;
    }

    // فحص إعدادات الميزات
    if (ENV.FEATURES.SUPABASE && (!ENV.SUPABASE.URL || !ENV.SUPABASE.ANON_KEY)) {
      issues.push('Supabase مُفعل لكن الإعدادات ناقصة');
      score -= 15;
    }

    testResults.environment = {
      status: score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error',
      message: `إعدادات البيئة: ${score}/100`,
      details: {
        score,
        issues,
        environment: ENV.APP_ENV,
        features: ENV.FEATURES,
        supabaseConfigured: !!(ENV.SUPABASE.URL && ENV.SUPABASE.ANON_KEY)
      }
    };

    return score >= 60;
  } catch (error) {
    testResults.environment = {
      status: 'error',
      message: `خطأ في فحص البيئة: ${error.message}`,
      details: { error: error.message }
    };
    return false;
  }
};

/**
 * Calculate overall readiness
 * حساب الجاهزية الإجمالية
 */
const calculateOverallReadiness = () => {
  const tests = [
    testResults.environment,
    testResults.supabase,
    testResults.backend,
    testResults.database
  ];

  let totalScore = 0;
  let passedTests = 0;
  const issues = [];

  tests.forEach((test, index) => {
    const testNames = ['البيئة', 'Supabase', 'الواجهة الخلفية', 'قاعدة البيانات'];
    
    if (test.status === 'success') {
      totalScore += 25;
      passedTests++;
    } else if (test.status === 'warning') {
      totalScore += 15;
      passedTests++;
      issues.push(`تحذير في ${testNames[index]}: ${test.message}`);
    } else if (test.status === 'error') {
      issues.push(`خطأ في ${testNames[index]}: ${test.message}`);
    }
  });

  const isReady = passedTests >= 3 && totalScore >= 60;

  testResults.overall = {
    status: isReady ? 'success' : 'error',
    score: totalScore,
    ready: isReady,
    passedTests,
    totalTests: tests.length,
    issues,
    message: isReady ? 
      `النظام جاهز للاستخدام (${totalScore}/100)` : 
      `النظام غير جاهز (${totalScore}/100)`
  };
};

/**
 * Run comprehensive connection test
 * تشغيل اختبار الاتصال الشامل
 */
export const runConnectionTest = async () => {
  try {
    // إعادة تعيين النتائج
    testResults = {
      supabase: { status: 'pending', message: '', details: null },
      backend: { status: 'pending', message: '', details: null },
      database: { status: 'pending', message: '', details: null },
      environment: { status: 'pending', message: '', details: null },
      overall: { status: 'pending', score: 0, ready: false }
    };

    if (ENV.FEATURES.DEBUG) {
      console.log('بدء اختبار الاتصال الشامل...');
    }

    // تشغيل الاختبارات
    const environmentOk = testEnvironmentConfig();
    const supabaseOk = await testSupabaseConnection();
    const backendOk = await testBackendService();
    const databaseOk = await testDatabaseStructure();

    // حساب الجاهزية الإجمالية
    calculateOverallReadiness();

    if (ENV.FEATURES.DEBUG) {
      console.log('نتائج اختبار الاتصال:', testResults);
    }

    return {
      success: true,
      results: testResults,
      ready: testResults.overall.ready,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('خطأ في اختبار الاتصال:', error);
    
    return {
      success: false,
      error: error.message,
      results: testResults,
      ready: false,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get quick status check
 * فحص سريع للحالة
 */
export const getQuickStatus = async () => {
  try {
    const environmentOk = testEnvironmentConfig();
    const supabaseOk = ENV.FEATURES.SUPABASE ? await testSupabaseConnection() : true;
    
    return {
      ready: environmentOk && supabaseOk,
      environment: testResults.environment.status,
      supabase: testResults.supabase.status,
      message: environmentOk && supabaseOk ? 
        'النظام جاهز' : 
        'النظام يحتاج إعداد'
    };
  } catch (error) {
    return {
      ready: false,
      error: error.message,
      message: 'خطأ في فحص الحالة'
    };
  }
};

/**
 * Generate setup instructions
 * إنشاء تعليمات الإعداد
 */
export const generateSetupInstructions = () => {
  const instructions = [];

  if (testResults.environment.status === 'error') {
    instructions.push({
      step: 1,
      title: 'إعداد متغيرات البيئة',
      description: 'قم بتحديث ملف .env.development بالقيم الصحيحة',
      details: testResults.environment.details?.issues || []
    });
  }

  if (testResults.supabase.status === 'error') {
    instructions.push({
      step: 2,
      title: 'إعداد Supabase',
      description: 'قم بإنشاء مشروع Supabase وتحديث المفاتيح',
      details: [
        'زيارة https://supabase.com',
        'إنشاء مشروع جديد',
        'نسخ URL و API Keys',
        'تحديث متغيرات البيئة'
      ]
    });
  }

  if (testResults.database.status === 'error') {
    instructions.push({
      step: 3,
      title: 'إعداد قاعدة البيانات',
      description: 'قم بتنفيذ مخطط قاعدة البيانات في Supabase',
      details: [
        'تنفيذ ملف database/schema.sql',
        'تنفيذ ملف database/rls_policies.sql',
        'تنفيذ ملف database/seed_data.sql'
      ]
    });
  }

  return instructions;
};

export default {
  runTest: runConnectionTest,
  getStatus: getQuickStatus,
  getInstructions: generateSetupInstructions,
  getResults: () => testResults
};
