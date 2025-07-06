// src/debug/comprehensiveTest.js
// اختبار شامل لنظام التسجيل والتخزين

import { inspectLocalStorage, syncUserData, testRegistrationFlow } from './localStorageInspector.js';

// بيانات اختبار متنوعة
const testUsers = [
  {
    name: 'أحمد محمد السعودي',
    email: 'ahmed.test@spsa.org.sa',
    password: 'TestPass123!',
    role: 'MEMBER'
  },
  {
    name: 'فاطمة علي الأحمدي',
    email: 'fatima.test@spsa.org.sa',
    password: 'SecurePass456!',
    role: 'RESEARCHER'
  },
  {
    name: 'محمد عبدالله القحطاني',
    email: 'mohammed.test@spsa.org.sa',
    password: 'StrongPass789!',
    role: 'ADMIN'
  }
];

// تشغيل اختبار شامل
export const runComprehensiveTest = async () => {
  console.log('🚀 بدء الاختبار الشامل لنظام التسجيل');
  console.log('=' .repeat(50));
  
  const results = {
    initialState: null,
    registrationTests: [],
    storageSync: null,
    adminPanelTest: null,
    finalState: null,
    success: false,
    errors: []
  };

  try {
    // 1. فحص الحالة الأولية
    console.log('📊 المرحلة 1: فحص الحالة الأولية');
    results.initialState = inspectLocalStorage();
    console.log('✅ تم فحص الحالة الأولية');
    
    // 2. اختبار التسجيل لكل مستخدم
    console.log('\n👥 المرحلة 2: اختبار التسجيل للمستخدمين');
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      console.log(`\n🔄 اختبار المستخدم ${i + 1}: ${user.name}`);
      
      try {
        const registrationResult = await testRegistrationFlow(user);
        results.registrationTests.push({
          user: user.name,
          email: user.email,
          success: registrationResult.success,
          details: registrationResult
        });
        
        if (registrationResult.success) {
          console.log(`✅ نجح تسجيل: ${user.name}`);
        } else {
          console.log(`❌ فشل تسجيل: ${user.name}`);
          results.errors.push(`فشل تسجيل ${user.name}: ${registrationResult.error}`);
        }
      } catch (error) {
        console.error(`❌ خطأ في تسجيل ${user.name}:`, error);
        results.errors.push(`خطأ في تسجيل ${user.name}: ${error.message}`);
        results.registrationTests.push({
          user: user.name,
          email: user.email,
          success: false,
          error: error.message
        });
      }
      
      // انتظار قصير بين الاختبارات
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 3. اختبار مزامنة البيانات
    console.log('\n🔄 المرحلة 3: اختبار مزامنة البيانات');
    try {
      results.storageSync = syncUserData();
      console.log('✅ تمت مزامنة البيانات بنجاح');
    } catch (error) {
      console.error('❌ خطأ في مزامنة البيانات:', error);
      results.errors.push(`خطأ في مزامنة البيانات: ${error.message}`);
    }
    
    // 4. فحص الحالة النهائية
    console.log('\n📊 المرحلة 4: فحص الحالة النهائية');
    results.finalState = inspectLocalStorage();
    
    // 5. تحليل النتائج
    console.log('\n📈 المرحلة 5: تحليل النتائج');
    const successfulRegistrations = results.registrationTests.filter(test => test.success).length;
    const totalRegistrations = results.registrationTests.length;
    
    console.log(`✅ نجح: ${successfulRegistrations}/${totalRegistrations} تسجيلات`);
    console.log(`📦 registeredUsers: ${results.finalState?.registeredUsers?.length || 0} مستخدم`);
    console.log(`🏢 spsa_users: ${results.finalState?.spsaUsers?.length || 0} مستخدم`);
    
    // تحديد نجاح الاختبار الشامل
    results.success = (
      successfulRegistrations > 0 &&
      results.finalState?.registeredUsers?.length > 0 &&
      results.finalState?.spsaUsers?.length > 0 &&
      results.errors.length === 0
    );
    
    if (results.success) {
      console.log('\n🎉 الاختبار الشامل نجح بالكامل!');
    } else {
      console.log('\n⚠️ الاختبار الشامل واجه مشاكل');
      if (results.errors.length > 0) {
        console.log('الأخطاء المكتشفة:');
        results.errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ عام في الاختبار الشامل:', error);
    results.errors.push(`خطأ عام: ${error.message}`);
    results.success = false;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 انتهى الاختبار الشامل');
  
  return results;
};

// اختبار سريع للتحقق من عمل النظام
export const quickTest = async () => {
  console.log('⚡ اختبار سريع للنظام');
  
  try {
    // فحص التخزين الحالي
    const currentState = inspectLocalStorage();
    console.log('📊 الحالة الحالية:', {
      registeredUsers: currentState.registeredUsers?.length || 0,
      spsaUsers: currentState.spsaUsers?.length || 0
    });
    
    // اختبار تسجيل واحد
    const testUser = {
      name: 'اختبار سريع',
      email: `quick.test.${Date.now()}@spsa.org.sa`,
      password: 'QuickTest123!',
      role: 'MEMBER'
    };
    
    console.log('🔄 اختبار تسجيل سريع...');
    const result = await testRegistrationFlow(testUser);
    
    if (result.success) {
      console.log('✅ الاختبار السريع نجح!');
      
      // فحص النتيجة
      const newState = inspectLocalStorage();
      console.log('📊 الحالة الجديدة:', {
        registeredUsers: newState.registeredUsers?.length || 0,
        spsaUsers: newState.spsaUsers?.length || 0
      });
      
      return { success: true, result };
    } else {
      console.log('❌ الاختبار السريع فشل:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار السريع:', error);
    return { success: false, error: error.message };
  }
};

// اختبار التحقق من لوحة المدير
export const testAdminPanel = () => {
  console.log('🏢 اختبار لوحة المدير');
  
  try {
    // فحص البيانات في localStorage
    const spsaUsers = JSON.parse(localStorage.getItem('spsa_users') || '[]');
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    console.log(`📊 البيانات المتاحة:`);
    console.log(`- spsa_users: ${spsaUsers.length} مستخدم`);
    console.log(`- registeredUsers: ${registeredUsers.length} مستخدم`);
    
    if (spsaUsers.length > 0) {
      console.log('✅ البيانات متوفرة للوحة المدير');
      console.log('👥 عينة من المستخدمين:');
      spsaUsers.slice(0, 3).forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      });
      
      return { success: true, userCount: spsaUsers.length, users: spsaUsers };
    } else {
      console.log('⚠️ لا توجد بيانات في spsa_users');
      return { success: false, error: 'لا توجد بيانات في spsa_users' };
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار لوحة المدير:', error);
    return { success: false, error: error.message };
  }
};

// تصدير الوظائف للاستخدام في console
if (typeof window !== 'undefined') {
  window.runComprehensiveTest = runComprehensiveTest;
  window.quickTest = quickTest;
  window.testAdminPanel = testAdminPanel;
}

export default {
  runComprehensiveTest,
  quickTest,
  testAdminPanel
};
