#!/usr/bin/env node

/**
 * 💾 Script إنشاء نسخة احتياطية من الملفات
 * ينشئ نسخة احتياطية آمنة من جميع الملفات المراد حذفها
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * 💾 إنشاء نسخة احتياطية
 */
function createBackup(filesToBackup) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(projectRoot, `backup-${timestamp}`);
  
  // إنشاء مجلد النسخ الاحتياطي
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupResults = {
    backupDir,
    timestamp,
    backedUpFiles: [],
    errors: [],
    totalSize: 0
  };
  
  console.log(`💾 إنشاء نسخة احتياطية في: ${backupDir}`);
  
  filesToBackup.forEach(file => {
    try {
      const sourcePath = path.join(projectRoot, file);
      
      if (fs.existsSync(sourcePath)) {
        // إنشاء المجلدات الفرعية في النسخة الاحتياطية
        const relativePath = path.relative(projectRoot, sourcePath);
        const backupFilePath = path.join(backupDir, relativePath);
        const backupFileDir = path.dirname(backupFilePath);
        
        if (!fs.existsSync(backupFileDir)) {
          fs.mkdirSync(backupFileDir, { recursive: true });
        }
        
        // نسخ الملف
        fs.copyFileSync(sourcePath, backupFilePath);
        
        const stats = fs.statSync(sourcePath);
        backupResults.backedUpFiles.push({
          original: file,
          backup: backupFilePath,
          size: stats.size
        });
        backupResults.totalSize += stats.size;
        
        console.log(`✅ تم نسخ: ${file}`);
      } else {
        backupResults.errors.push(`⚠️ الملف غير موجود: ${file}`);
      }
    } catch (error) {
      backupResults.errors.push(`❌ خطأ في نسخ ${file}: ${error.message}`);
    }
  });
  
  // إنشاء ملف معلومات النسخة الاحتياطية
  const backupInfo = {
    ...backupResults,
    createdAt: new Date().toISOString(),
    projectPath: projectRoot,
    purpose: 'نسخة احتياطية قبل تنظيف الكود وحذف الخدمات المكررة'
  };
  
  fs.writeFileSync(
    path.join(backupDir, 'backup-info.json'),
    JSON.stringify(backupInfo, null, 2)
  );
  
  // إنشاء script الاستعادة
  const restoreScript = `#!/usr/bin/env node

/**
 * 🔄 Script استعادة النسخة الاحتياطية
 * يستعيد جميع الملفات من النسخة الاحتياطية
 */

import fs from 'fs';
import path from 'path';

const backupDir = '${backupDir}';
const projectRoot = '${projectRoot}';

console.log('🔄 بدء استعادة النسخة الاحتياطية...');

const backupInfo = JSON.parse(fs.readFileSync(path.join(backupDir, 'backup-info.json'), 'utf8'));

backupInfo.backedUpFiles.forEach(file => {
  try {
    const sourcePath = file.backup;
    const targetPath = path.join(projectRoot, file.original);
    const targetDir = path.dirname(targetPath);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    fs.copyFileSync(sourcePath, targetPath);
    console.log(\`✅ تم استعادة: \${file.original}\`);
  } catch (error) {
    console.error(\`❌ خطأ في استعادة \${file.original}: \${error.message}\`);
  }
});

console.log('✅ تم إكمال استعادة النسخة الاحتياطية!');
`;

  fs.writeFileSync(path.join(backupDir, 'restore.js'), restoreScript);
  
  console.log(`💾 تم إنشاء النسخة الاحتياطية بنجاح!`);
  console.log(`📁 المجلد: ${backupDir}`);
  console.log(`📊 عدد الملفات: ${backupResults.backedUpFiles.length}`);
  console.log(`💽 الحجم الإجمالي: ${(backupResults.totalSize / 1024).toFixed(2)} KB`);
  
  if (backupResults.errors.length > 0) {
    console.log(`⚠️ الأخطاء:`);
    backupResults.errors.forEach(error => console.log(error));
  }
  
  return backupResults;
}

export { createBackup };
