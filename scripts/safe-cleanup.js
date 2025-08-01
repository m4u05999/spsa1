#!/usr/bin/env node

/**
 * 🧹 Script التنظيف الآمن للكود
 * ينفذ عملية حذف آمنة للخدمات المكررة مع التحقق المستمر
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { runAnalysis } from './cleanup-analysis.js';
import { createBackup } from './backup-files.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 🗑️ قائمة الملفات المراد حذفها
const filesToDelete = [
  'src/services/contentService.js',
  'src/services/enhancedContentService.js',
  'src/services/contentApiService.js',
  'src/services/categoriesApiService.js',
  'src/data/mockNews.js',
  'src/data/mockEvents.js',
  'src/data/mockPublications.js',
  'src/data/mockCategories.js',
  'src/data/mockUsers.js',
  'src/data/mockInquiries.js',
  'src/data/mockStatistics.js'
];

/**
 * 🧪 تشغيل الاختبارات والحصول على النتائج
 */
function runTests() {
  try {
    console.log('🧪 تشغيل الاختبارات...');
    
    const result = execSync('npm run test:run', {
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 300000 // 5 دقائق
    });
    
    // Parse the output to extract test results
    const lines = result.split('\n');
    let passed = 0, failed = 0, total = 0;

    // Look for the summary line
    for (const line of lines) {
      if (line.includes('Test Files') && line.includes('passed')) {
        const match = line.match(/(\d+) failed.*?(\d+) passed.*?\((\d+)\)/);
        if (match) {
          failed = parseInt(match[1]) || 0;
          passed = parseInt(match[2]) || 0;
          total = parseInt(match[3]) || 0;
          break;
        }
      }
      if (line.includes('Tests') && line.includes('passed')) {
        const match = line.match(/(\d+) failed.*?(\d+) passed.*?\((\d+)\)/);
        if (match) {
          failed = parseInt(match[1]) || 0;
          passed = parseInt(match[2]) || 0;
          total = parseInt(match[3]) || 0;
        }
      }
    }

    return {
      success: true,
      passed: passed,
      failed: failed,
      total: total,
      successRate: total > 0 ? ((passed / total) * 100).toFixed(2) : 0
    };
  } catch (error) {
    console.error('❌ فشل في تشغيل الاختبارات:', error.message);
    return {
      success: false,
      error: error.message,
      passed: 0,
      failed: 0,
      total: 0,
      successRate: 0
    };
  }
}

/**
 * 🗑️ حذف ملف واحد بأمان
 */
function deleteFileSafely(filePath) {
  try {
    const fullPath = path.join(projectRoot, filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✅ تم حذف: ${filePath}`);
      return { success: true, file: filePath };
    } else {
      console.log(`⚠️ الملف غير موجود: ${filePath}`);
      return { success: false, file: filePath, reason: 'غير موجود' };
    }
  } catch (error) {
    console.error(`❌ فشل في حذف ${filePath}:`, error.message);
    return { success: false, file: filePath, reason: error.message };
  }
}

/**
 * 🧹 تنفيذ عملية التنظيف الكاملة
 */
async function performSafeCleanup() {
  const cleanupResults = {
    startTime: new Date().toISOString(),
    phases: {},
    finalResults: null
  };
  
  console.log('🚀 بدء عملية التنظيف الآمن...');
  
  // المرحلة 1: التحليل الأولي
  console.log('\n📋 المرحلة 1: التحليل الأولي');
  const analysisResults = runAnalysis();
  cleanupResults.phases.analysis = analysisResults;
  
  if (analysisResults.filesWithImports.length > 0) {
    console.log('⚠️ تم العثور على استيرادات للخدمات المراد حذفها!');
    console.log('🛑 يجب تحديث هذه الملفات أولاً:');
    analysisResults.filesWithImports.forEach(item => {
      console.log(`   - ${item.file}`);
    });
    return { success: false, reason: 'وجود استيرادات تحتاج تحديث' };
  }
  
  // المرحلة 2: الاختبارات الأولية
  console.log('\n🧪 المرحلة 2: تشغيل الاختبارات الأولية');
  const initialTests = runTests();
  cleanupResults.phases.initialTests = initialTests;
  
  if (!initialTests.success) {
    console.log('❌ فشل في الاختبارات الأولية - توقف العملية');
    return { success: false, reason: 'فشل الاختبارات الأولية' };
  }
  
  console.log(`✅ الاختبارات الأولية: ${initialTests.passed}/${initialTests.total} (${initialTests.successRate}%)`);
  
  // المرحلة 3: إنشاء النسخة الاحتياطية
  console.log('\n💾 المرحلة 3: إنشاء النسخة الاحتياطية');
  const backupResults = createBackup(filesToDelete);
  cleanupResults.phases.backup = backupResults;
  
  if (backupResults.errors.length > 0) {
    console.log('⚠️ أخطاء في النسخة الاحتياطية:');
    backupResults.errors.forEach(error => console.log(`   ${error}`));
  }
  
  // المرحلة 4: حذف الملفات
  console.log('\n🗑️ المرحلة 4: حذف الملفات');
  const deletionResults = {
    deleted: [],
    failed: [],
    total: filesToDelete.length
  };
  
  for (const file of filesToDelete) {
    const result = deleteFileSafely(file);
    if (result.success) {
      deletionResults.deleted.push(result);
    } else {
      deletionResults.failed.push(result);
    }
  }
  
  cleanupResults.phases.deletion = deletionResults;
  
  console.log(`📊 نتائج الحذف: ${deletionResults.deleted.length}/${deletionResults.total} ملف`);
  
  // المرحلة 5: الاختبارات النهائية
  console.log('\n🧪 المرحلة 5: تشغيل الاختبارات النهائية');
  const finalTests = runTests();
  cleanupResults.phases.finalTests = finalTests;
  
  if (!finalTests.success) {
    console.log('❌ فشل في الاختبارات النهائية!');
    console.log('🔄 يُنصح بالاستعادة من النسخة الاحتياطية');
    return { 
      success: false, 
      reason: 'فشل الاختبارات النهائية',
      backupDir: backupResults.backupDir 
    };
  }
  
  console.log(`✅ الاختبارات النهائية: ${finalTests.passed}/${finalTests.total} (${finalTests.successRate}%)`);
  
  // مقارنة النتائج
  const successRateChange = (finalTests.successRate - initialTests.successRate).toFixed(2);
  console.log(`📈 تغيير معدل النجاح: ${successRateChange}%`);
  
  if (finalTests.successRate < initialTests.successRate - 5) {
    console.log('⚠️ انخفاض كبير في معدل نجاح الاختبارات!');
    console.log('🔄 يُنصح بالاستعادة من النسخة الاحتياطية');
    return {
      success: false,
      reason: 'انخفاض كبير في معدل نجاح الاختبارات',
      backupDir: backupResults.backupDir
    };
  }
  
  cleanupResults.endTime = new Date().toISOString();
  cleanupResults.finalResults = {
    success: true,
    deletedFiles: deletionResults.deleted.length,
    failedDeletions: deletionResults.failed.length,
    initialSuccessRate: initialTests.successRate,
    finalSuccessRate: finalTests.successRate,
    successRateChange: successRateChange,
    backupLocation: backupResults.backupDir
  };
  
  // حفظ تقرير التنظيف
  const reportPath = path.join(projectRoot, 'cleanup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(cleanupResults, null, 2));
  
  console.log('\n🎉 تم إكمال عملية التنظيف بنجاح!');
  console.log(`📋 تقرير مفصل محفوظ في: ${reportPath}`);
  
  return cleanupResults.finalResults;
}

// تشغيل التنظيف إذا تم استدعاء الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  performSafeCleanup()
    .then(result => {
      if (result.success) {
        console.log('✅ عملية التنظيف مكتملة بنجاح!');
        process.exit(0);
      } else {
        console.log('❌ فشلت عملية التنظيف:', result.reason);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 خطأ غير متوقع:', error);
      process.exit(1);
    });
}

export { performSafeCleanup };
