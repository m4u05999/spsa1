/**
 * Database Checker Utility - أداة فحص قاعدة البيانات
 * فحص حالة قاعدة البيانات والتحقق من التكوين الصحيح
 */

import supabaseService from '../services/supabaseService.js';
import { ENV } from '../config/environment.js';

/**
 * Required tables and their expected structure
 * الجداول المطلوبة والبنية المتوقعة لها
 */
const REQUIRED_TABLES = [
  'users',
  'categories', 
  'tags',
  'content',
  'content_tags',
  'events',
  'event_registrations',
  'memberships',
  'inquiries',
  'settings',
  'audit_logs'
];

/**
 * Required RLS policies
 * سياسات RLS المطلوبة
 */
const REQUIRED_POLICIES = [
  'Users can view own profile',
  'Anyone can view published content',
  'Anyone can view active categories',
  'Anyone can view active tags'
];

/**
 * Database check results
 * نتائج فحص قاعدة البيانات
 */
let checkResults = {
  connection: { status: 'pending', message: '', details: null },
  tables: { status: 'pending', message: '', details: [] },
  rls: { status: 'pending', message: '', details: [] },
  data: { status: 'pending', message: '', details: {} },
  performance: { status: 'pending', message: '', details: {} },
  overall: { status: 'pending', score: 0, issues: [] }
};

/**
 * Check database connection
 * فحص اتصال قاعدة البيانات
 */
const checkConnection = async () => {
  try {
    const result = await supabaseService.testConnection();
    
    if (result.success) {
      checkResults.connection = {
        status: 'success',
        message: 'تم الاتصال بقاعدة البيانات بنجاح',
        details: {
          url: ENV.SUPABASE.URL,
          timestamp: new Date().toISOString()
        }
      };
      return true;
    } else {
      checkResults.connection = {
        status: 'error',
        message: `فشل في الاتصال بقاعدة البيانات: ${result.error}`,
        details: result
      };
      return false;
    }
  } catch (error) {
    checkResults.connection = {
      status: 'error',
      message: `خطأ في اتصال قاعدة البيانات: ${error.message}`,
      details: { error: error.message }
    };
    return false;
  }
};

/**
 * Check if required tables exist
 * فحص وجود الجداول المطلوبة
 */
const checkTables = async () => {
  try {
    const client = supabaseService.client();
    if (!client) {
      throw new Error('Supabase client not available');
    }

    const tableResults = [];
    let existingTables = 0;

    for (const tableName of REQUIRED_TABLES) {
      try {
        // محاولة الاستعلام من الجدول للتحقق من وجوده
        const { data, error } = await client
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          tableResults.push({
            table: tableName,
            status: 'exists',
            message: 'الجدول موجود'
          });
          existingTables++;
        } else {
          tableResults.push({
            table: tableName,
            status: 'missing',
            message: `الجدول غير موجود: ${error.message}`
          });
        }
      } catch (error) {
        tableResults.push({
          table: tableName,
          status: 'error',
          message: `خطأ في فحص الجدول: ${error.message}`
        });
      }
    }

    const successRate = (existingTables / REQUIRED_TABLES.length) * 100;

    checkResults.tables = {
      status: existingTables === REQUIRED_TABLES.length ? 'success' : 'warning',
      message: `${existingTables}/${REQUIRED_TABLES.length} جدول موجود (${successRate.toFixed(1)}%)`,
      details: tableResults
    };

    return existingTables === REQUIRED_TABLES.length;
  } catch (error) {
    checkResults.tables = {
      status: 'error',
      message: `خطأ في فحص الجداول: ${error.message}`,
      details: []
    };
    return false;
  }
};

/**
 * Check RLS policies
 * فحص سياسات RLS
 */
const checkRLS = async () => {
  try {
    // فحص أساسي لـ RLS عبر محاولة الوصول للجداول
    const rlsResults = [];
    let workingPolicies = 0;

    for (const tableName of ['users', 'content', 'categories', 'tags']) {
      try {
        const client = supabaseService.client();
        const { data, error } = await client
          .from(tableName)
          .select('*')
          .limit(1);

        // إذا لم يكن هناك خطأ أو كان الخطأ متعلق بـ RLS، فهذا يعني أن RLS يعمل
        if (!error || error.message.includes('row-level security')) {
          rlsResults.push({
            table: tableName,
            status: 'active',
            message: 'RLS مفعل'
          });
          workingPolicies++;
        } else {
          rlsResults.push({
            table: tableName,
            status: 'inactive',
            message: 'RLS غير مفعل أو غير مكون بشكل صحيح'
          });
        }
      } catch (error) {
        rlsResults.push({
          table: tableName,
          status: 'error',
          message: `خطأ في فحص RLS: ${error.message}`
        });
      }
    }

    const successRate = (workingPolicies / 4) * 100;

    checkResults.rls = {
      status: workingPolicies >= 3 ? 'success' : 'warning',
      message: `${workingPolicies}/4 جدول لديه RLS مفعل (${successRate.toFixed(1)}%)`,
      details: rlsResults
    };

    return workingPolicies >= 3;
  } catch (error) {
    checkResults.rls = {
      status: 'error',
      message: `خطأ في فحص RLS: ${error.message}`,
      details: []
    };
    return false;
  }
};

/**
 * Check sample data
 * فحص البيانات التجريبية
 */
const checkData = async () => {
  try {
    const dataResults = {};
    let totalRecords = 0;

    // فحص البيانات في الجداول الرئيسية
    const tablesToCheck = ['categories', 'tags', 'content', 'settings'];

    for (const tableName of tablesToCheck) {
      try {
        const result = await supabaseService.db.select(tableName, { limit: 100 });
        
        if (result.success) {
          dataResults[tableName] = {
            count: result.data.length,
            status: result.data.length > 0 ? 'has_data' : 'empty',
            sample: result.data.slice(0, 3) // عينة من البيانات
          };
          totalRecords += result.data.length;
        } else {
          dataResults[tableName] = {
            count: 0,
            status: 'error',
            error: result.error
          };
        }
      } catch (error) {
        dataResults[tableName] = {
          count: 0,
          status: 'error',
          error: error.message
        };
      }
    }

    checkResults.data = {
      status: totalRecords > 0 ? 'success' : 'warning',
      message: `إجمالي ${totalRecords} سجل في قاعدة البيانات`,
      details: dataResults
    };

    return totalRecords > 0;
  } catch (error) {
    checkResults.data = {
      status: 'error',
      message: `خطأ في فحص البيانات: ${error.message}`,
      details: {}
    };
    return false;
  }
};

/**
 * Check database performance
 * فحص أداء قاعدة البيانات
 */
const checkPerformance = async () => {
  try {
    const performanceResults = {};
    
    // اختبار سرعة الاستعلام
    const startTime = Date.now();
    
    // استعلام بسيط لقياس الأداء
    const result = await supabaseService.db.select('content', {
      filters: [{ column: 'status', operator: 'eq', value: 'published' }],
      limit: 10
    });
    
    const queryTime = Date.now() - startTime;
    
    performanceResults.querySpeed = {
      time: queryTime,
      status: queryTime < 1000 ? 'excellent' : queryTime < 3000 ? 'good' : 'slow',
      message: `وقت الاستعلام: ${queryTime}ms`
    };

    // فحص حجم البيانات
    let totalSize = 0;
    for (const tableName of REQUIRED_TABLES) {
      try {
        const tableResult = await supabaseService.db.select(tableName, { limit: 1000 });
        if (tableResult.success) {
          totalSize += tableResult.data.length;
        }
      } catch (error) {
        // تجاهل الأخطاء في هذا السياق
      }
    }

    performanceResults.dataSize = {
      records: totalSize,
      status: totalSize < 10000 ? 'optimal' : totalSize < 50000 ? 'good' : 'large',
      message: `إجمالي ${totalSize} سجل`
    };

    const overallPerformance = queryTime < 1000 && totalSize < 10000 ? 'excellent' : 'good';

    checkResults.performance = {
      status: overallPerformance === 'excellent' ? 'success' : 'warning',
      message: `أداء قاعدة البيانات: ${overallPerformance === 'excellent' ? 'ممتاز' : 'جيد'}`,
      details: performanceResults
    };

    return true;
  } catch (error) {
    checkResults.performance = {
      status: 'error',
      message: `خطأ في فحص الأداء: ${error.message}`,
      details: {}
    };
    return false;
  }
};

/**
 * Calculate overall score
 * حساب النتيجة الإجمالية
 */
const calculateOverallScore = () => {
  const checks = [
    checkResults.connection,
    checkResults.tables,
    checkResults.rls,
    checkResults.data,
    checkResults.performance
  ];

  let score = 0;
  const issues = [];

  checks.forEach((check, index) => {
    const checkNames = ['الاتصال', 'الجداول', 'الأمان', 'البيانات', 'الأداء'];
    
    if (check.status === 'success') {
      score += 20;
    } else if (check.status === 'warning') {
      score += 10;
      issues.push(`تحذير في ${checkNames[index]}: ${check.message}`);
    } else if (check.status === 'error') {
      issues.push(`خطأ في ${checkNames[index]}: ${check.message}`);
    }
  });

  let overallStatus = 'error';
  if (score >= 80) overallStatus = 'success';
  else if (score >= 60) overallStatus = 'warning';

  checkResults.overall = {
    status: overallStatus,
    score,
    issues,
    message: `النتيجة الإجمالية: ${score}/100`
  };
};

/**
 * Main database check function
 * دالة فحص قاعدة البيانات الرئيسية
 */
export const checkDatabase = async () => {
  try {
    // إعادة تعيين النتائج
    checkResults = {
      connection: { status: 'pending', message: '', details: null },
      tables: { status: 'pending', message: '', details: [] },
      rls: { status: 'pending', message: '', details: [] },
      data: { status: 'pending', message: '', details: {} },
      performance: { status: 'pending', message: '', details: {} },
      overall: { status: 'pending', score: 0, issues: [] }
    };

    // تنفيذ الفحوصات
    await checkConnection();
    await checkTables();
    await checkRLS();
    await checkData();
    await checkPerformance();

    // حساب النتيجة الإجمالية
    calculateOverallScore();

    return {
      success: true,
      results: checkResults,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      results: checkResults,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get database status summary
 * الحصول على ملخص حالة قاعدة البيانات
 */
export const getDatabaseStatus = () => {
  return {
    isHealthy: checkResults.overall.status === 'success',
    score: checkResults.overall.score,
    issues: checkResults.overall.issues,
    lastCheck: checkResults.timestamp || null
  };
};

/**
 * Generate database report
 * إنشاء تقرير قاعدة البيانات
 */
export const generateDatabaseReport = async () => {
  const results = await checkDatabase();
  
  const report = {
    title: 'تقرير حالة قاعدة البيانات - SPSA',
    timestamp: new Date().toISOString(),
    summary: {
      status: results.results.overall.status,
      score: results.results.overall.score,
      message: results.results.overall.message
    },
    details: results.results,
    recommendations: []
  };

  // إضافة التوصيات بناءً على النتائج
  if (results.results.connection.status !== 'success') {
    report.recommendations.push('تحقق من إعدادات الاتصال بـ Supabase');
  }

  if (results.results.tables.status !== 'success') {
    report.recommendations.push('قم بتنفيذ مخطط قاعدة البيانات (schema.sql)');
  }

  if (results.results.rls.status !== 'success') {
    report.recommendations.push('قم بتطبيق سياسات الأمان (rls_policies.sql)');
  }

  if (results.results.data.status !== 'success') {
    report.recommendations.push('قم بإدراج البيانات الأولية (seed_data.sql)');
  }

  if (results.results.performance.status !== 'success') {
    report.recommendations.push('راجع أداء قاعدة البيانات وقم بتحسين الاستعلامات');
  }

  return report;
};

export default {
  check: checkDatabase,
  getStatus: getDatabaseStatus,
  generateReport: generateDatabaseReport
};
