import { performSafeCleanup } from './scripts/safe-cleanup.js';

console.log('🧹 بدء عملية التنظيف الآمن...');

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
