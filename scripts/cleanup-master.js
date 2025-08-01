#!/usr/bin/env node

/**
 * 🎯 Script التنظيف الرئيسي
 * ينسق جميع مراحل عملية التنظيف الآمن
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// إنشاء واجهة للتفاعل مع المستخدم
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * ❓ طرح سؤال على المستخدم
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

/**
 * 📋 عرض معلومات العملية
 */
function displayOperationInfo() {
  console.log(`
🧹 ═══════════════════════════════════════════════════════════════
                    عملية التنظيف الآمن للكود
🧹 ═══════════════════════════════════════════════════════════════

📋 الهدف: حذف الخدمات المكررة بعد ترحيل جميع المكونات إلى MasterDataService

🗑️ الملفات المراد حذفها:
   • src/services/contentService.js
   • src/services/enhancedContentService.js  
   • src/services/contentApiService.js
   • src/services/categoriesApiService.js
   • جميع ملفات mock data في src/data/

🛡️ إجراءات الأمان:
   ✅ فحص شامل للاستيرادات
   ✅ إنشاء نسخة احتياطية كاملة
   ✅ تشغيل الاختبارات قبل وبعد الحذف
   ✅ إمكانية التراجع الكامل

📊 المتطلبات:
   • معدل نجاح الاختبارات الحالي: 92.7%
   • الهدف: الحفاظ على نفس المعدل أو أفضل
   • عدم كسر أي وظيفة موجودة

═══════════════════════════════════════════════════════════════
`);
}

/**
 * 🔍 تشغيل مرحلة التحليل
 */
async function runAnalysisPhase() {
  console.log('\n🔍 ═══ المرحلة 1: التحليل والفحص ═══');
  
  try {
    // استيراد وتشغيل script التحليل
    const { runAnalysis } = await import('./cleanup-analysis.js');
    const results = runAnalysis();
    
    console.log('\n📊 نتائج التحليل:');
    console.log(`   📁 إجمالي الملفات المفحوصة: ${results.totalFilesScanned}`);
    console.log(`   🗑️ الملفات المراد حذفها: ${results.filesToDelete.length}`);
    console.log(`   ⚠️ الملفات مع استيرادات: ${results.filesWithImports.length}`);
    console.log(`   🚨 التحذيرات: ${results.warnings.length}`);
    
    if (results.filesWithImports.length > 0) {
      console.log('\n⚠️ تحذير: تم العثور على ملفات تستورد الخدمات المراد حذفها:');
      results.filesWithImports.forEach(item => {
        console.log(`   📄 ${item.file}`);
        console.log(`      الاستيرادات: ${item.imports.length}`);
        console.log(`      الأسطر: ${item.lineNumbers.join(', ')}`);
      });
      
      const proceed = await askQuestion('\n❓ هل تريد المتابعة رغم وجود استيرادات؟ (y/n): ');
      if (proceed !== 'y' && proceed !== 'yes') {
        console.log('🛑 تم إيقاف العملية. يُنصح بتحديث الاستيرادات أولاً.');
        return false;
      }
    }
    
    if (results.warnings.length > 0) {
      console.log('\n⚠️ التحذيرات:');
      results.warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    console.log('\n✅ مرحلة التحليل مكتملة');
    return true;
    
  } catch (error) {
    console.error('❌ خطأ في مرحلة التحليل:', error.message);
    return false;
  }
}

/**
 * 🧹 تشغيل مرحلة التنظيف
 */
async function runCleanupPhase() {
  console.log('\n🧹 ═══ المرحلة 2: التنظيف الآمن ═══');
  
  try {
    const { performSafeCleanup } = await import('./safe-cleanup.js');
    const results = await performSafeCleanup();
    
    if (results.success) {
      console.log('\n🎉 نتائج التنظيف:');
      console.log(`   🗑️ الملفات المحذوفة: ${results.deletedFiles}`);
      console.log(`   ❌ فشل في الحذف: ${results.failedDeletions}`);
      console.log(`   📊 معدل النجاح الأولي: ${results.initialSuccessRate}%`);
      console.log(`   📊 معدل النجاح النهائي: ${results.finalSuccessRate}%`);
      console.log(`   📈 التغيير: ${results.successRateChange}%`);
      console.log(`   💾 النسخة الاحتياطية: ${results.backupLocation}`);
      
      return true;
    } else {
      console.log(`❌ فشل التنظيف: ${results.reason}`);
      if (results.backupDir) {
        console.log(`💾 النسخة الاحتياطية متوفرة في: ${results.backupDir}`);
      }
      return false;
    }
    
  } catch (error) {
    console.error('❌ خطأ في مرحلة التنظيف:', error.message);
    return false;
  }
}

/**
 * 📋 إنشاء تقرير نهائي
 */
function generateFinalReport() {
  console.log('\n📋 ═══ التقرير النهائي ═══');
  
  const reportFiles = [
    'cleanup-analysis-report.md',
    'cleanup-report.json'
  ];
  
  console.log('\n📄 التقارير المتوفرة:');
  reportFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} (غير موجود)`);
    }
  });
  
  console.log('\n🎯 الخطوات التالية الموصى بها:');
  console.log('   1. مراجعة التقارير المُنشأة');
  console.log('   2. تشغيل اختبارات إضافية للتأكد من سلامة النظام');
  console.log('   3. الانتقال إلى Phase 3 Development');
  console.log('   4. حذف النسخة الاحتياطية بعد التأكد من استقرار النظام');
}

/**
 * 🚀 تشغيل العملية الرئيسية
 */
async function main() {
  try {
    displayOperationInfo();
    
    const startConfirm = await askQuestion('❓ هل تريد بدء عملية التنظيف؟ (y/n): ');
    if (startConfirm !== 'y' && startConfirm !== 'yes') {
      console.log('🛑 تم إلغاء العملية.');
      rl.close();
      return;
    }
    
    // مرحلة التحليل
    const analysisSuccess = await runAnalysisPhase();
    if (!analysisSuccess) {
      rl.close();
      return;
    }
    
    const cleanupConfirm = await askQuestion('\n❓ هل تريد المتابعة مع التنظيف؟ (y/n): ');
    if (cleanupConfirm !== 'y' && cleanupConfirm !== 'yes') {
      console.log('🛑 تم إيقاف العملية قبل التنظيف.');
      rl.close();
      return;
    }
    
    // مرحلة التنظيف
    const cleanupSuccess = await runCleanupPhase();
    
    // التقرير النهائي
    generateFinalReport();
    
    if (cleanupSuccess) {
      console.log('\n🎉 تم إكمال عملية التنظيف بنجاح!');
      console.log('✅ المشروع جاهز للانتقال إلى Phase 3');
    } else {
      console.log('\n❌ فشلت عملية التنظيف');
      console.log('🔄 راجع التقارير واستخدم النسخة الاحتياطية إذا لزم الأمر');
    }
    
  } catch (error) {
    console.error('💥 خطأ غير متوقع:', error);
  } finally {
    rl.close();
  }
}

// تشغيل العملية الرئيسية
main();
