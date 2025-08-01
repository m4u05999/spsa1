#!/usr/bin/env node

/**
 * 🔍 Script تحليل وفحص الملفات قبل التنظيف
 * يفحص جميع الملفات للتأكد من عدم استخدام الخدمات المراد حذفها
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// 🔍 أنماط الاستيراد للبحث عنها
const importPatterns = [
  /import.*from\s+['"`]\.\.?\/.*contentService['"`]/g,
  /import.*from\s+['"`]\.\.?\/.*enhancedContentService['"`]/g,
  /import.*from\s+['"`]\.\.?\/.*contentApiService['"`]/g,
  /import.*from\s+['"`]\.\.?\/.*categoriesApiService['"`]/g,
  /import.*from\s+['"`]\.\.?\/.*data\/mock.*['"`]/g,
  /require\(['"`]\.\.?\/.*contentService['"`]\)/g,
  /require\(['"`]\.\.?\/.*enhancedContentService['"`]\)/g,
  /require\(['"`]\.\.?\/.*contentApiService['"`]\)/g,
  /require\(['"`]\.\.?\/.*categoriesApiService['"`]\)/g,
  /require\(['"`]\.\.?\/.*data\/mock.*['"`]\)/g
];

// 📊 نتائج التحليل
const analysisResults = {
  filesToDelete: [],
  filesWithImports: [],
  safeToDelete: [],
  warnings: [],
  totalFilesScanned: 0,
  timestamp: new Date().toISOString()
};

/**
 * 🔍 فحص ملف واحد للبحث عن استيرادات
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const foundImports = [];
    
    importPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        foundImports.push(...matches);
      }
    });
    
    if (foundImports.length > 0) {
      analysisResults.filesWithImports.push({
        file: filePath,
        imports: foundImports,
        lineNumbers: getLineNumbers(content, foundImports)
      });
    }
    
    analysisResults.totalFilesScanned++;
    
  } catch (error) {
    analysisResults.warnings.push(`❌ خطأ في قراءة الملف: ${filePath} - ${error.message}`);
  }
}

/**
 * 📍 الحصول على أرقام الأسطر للاستيرادات
 */
function getLineNumbers(content, imports) {
  const lines = content.split('\n');
  const lineNumbers = [];
  
  imports.forEach(importStatement => {
    lines.forEach((line, index) => {
      if (line.includes(importStatement.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
        lineNumbers.push(index + 1);
      }
    });
  });
  
  return lineNumbers;
}

/**
 * 🔍 فحص جميع الملفات في المجلد
 */
function scanDirectory(dirPath, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // تجاهل مجلدات معينة
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          scanDirectory(fullPath, extensions);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          analyzeFile(fullPath);
        }
      }
    });
  } catch (error) {
    analysisResults.warnings.push(`❌ خطأ في فحص المجلد: ${dirPath} - ${error.message}`);
  }
}

/**
 * ✅ التحقق من وجود الملفات المراد حذفها
 */
function checkFilesToDelete() {
  filesToDelete.forEach(file => {
    const fullPath = path.join(projectRoot, file);
    if (fs.existsSync(fullPath)) {
      analysisResults.filesToDelete.push({
        path: file,
        fullPath: fullPath,
        size: fs.statSync(fullPath).size,
        exists: true
      });
      analysisResults.safeToDelete.push(file);
    } else {
      analysisResults.warnings.push(`⚠️ الملف غير موجود: ${file}`);
    }
  });
}

/**
 * 📋 إنشاء تقرير التحليل
 */
function generateReport() {
  const reportPath = path.join(projectRoot, 'cleanup-analysis-report.json');
  const readableReportPath = path.join(projectRoot, 'cleanup-analysis-report.md');
  
  // تقرير JSON
  fs.writeFileSync(reportPath, JSON.stringify(analysisResults, null, 2));
  
  // تقرير قابل للقراءة
  const readableReport = `
# 🔍 تقرير تحليل تنظيف الكود

**تاريخ التحليل:** ${analysisResults.timestamp}
**إجمالي الملفات المفحوصة:** ${analysisResults.totalFilesScanned}

## 📊 ملخص النتائج

### ✅ الملفات الآمنة للحذف (${analysisResults.safeToDelete.length})
${analysisResults.safeToDelete.map(file => `- \`${file}\``).join('\n')}

### ⚠️ الملفات التي تحتوي على استيرادات (${analysisResults.filesWithImports.length})
${analysisResults.filesWithImports.map(item => 
  `- **${item.file}**\n  - الاستيرادات: ${item.imports.length}\n  - الأسطر: ${item.lineNumbers.join(', ')}\n`
).join('\n')}

### 🗑️ الملفات المراد حذفها (${analysisResults.filesToDelete.length})
${analysisResults.filesToDelete.map(item => 
  `- \`${item.path}\` (${(item.size / 1024).toFixed(2)} KB)`
).join('\n')}

### ⚠️ التحذيرات (${analysisResults.warnings.length})
${analysisResults.warnings.map(warning => `- ${warning}`).join('\n')}

## 🎯 التوصيات

${analysisResults.filesWithImports.length === 0 
  ? '✅ **آمن للمتابعة**: لم يتم العثور على أي استيرادات للخدمات المراد حذفها'
  : '⚠️ **يتطلب مراجعة**: تم العثور على استيرادات تحتاج إلى تحديث قبل الحذف'
}

---
*تم إنشاء هذا التقرير بواسطة cleanup-analysis.js*
`;

  fs.writeFileSync(readableReportPath, readableReport);
  
  return { reportPath, readableReportPath };
}

/**
 * 🚀 تشغيل التحليل الرئيسي
 */
function runAnalysis() {
  console.log('🔍 بدء تحليل الملفات...');
  
  // فحص الملفات المراد حذفها
  checkFilesToDelete();
  
  // فحص جميع ملفات المشروع
  scanDirectory(path.join(projectRoot, 'src'));
  
  // إنشاء التقرير
  const reports = generateReport();
  
  console.log(`✅ تم إكمال التحليل!`);
  console.log(`📊 إجمالي الملفات المفحوصة: ${analysisResults.totalFilesScanned}`);
  console.log(`🗑️ الملفات المراد حذفها: ${analysisResults.filesToDelete.length}`);
  console.log(`⚠️ الملفات مع استيرادات: ${analysisResults.filesWithImports.length}`);
  console.log(`📋 التقرير محفوظ في: ${reports.readableReportPath}`);
  
  return analysisResults;
}

// تشغيل التحليل إذا تم استدعاء الملف مباشرة
if (import.meta.url.startsWith('file://') && process.argv[1] && import.meta.url.includes(process.argv[1])) {
  runAnalysis();
}

export { runAnalysis, analysisResults };
