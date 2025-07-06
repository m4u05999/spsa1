/**
 * Key Test Utility - اختبار مفاتيح React للتأكد من عدم التكرار
 * 
 * هذه الأداة تختبر توليد المفاتيح الفريدة في مكونات React
 * لضمان عدم حدوث تحذيرات "Encountered two children with the same key"
 */

// Generate unique ID with timestamp and random component
export const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Test key uniqueness for rapid generation
export const testKeyUniqueness = (iterations = 1000) => {
  console.log(`🔑 اختبار توليد ${iterations} مفتاح فريد...`);
  
  const keys = new Set();
  const duplicates = [];
  let counter = 0;
  
  for (let i = 0; i < iterations; i++) {
    counter += 1;
    const key = `${Date.now()}-${counter}-${Math.random().toString(36).substr(2, 6)}`;
    
    if (keys.has(key)) {
      duplicates.push(key);
    } else {
      keys.add(key);
    }
    
    // Simulate rapid calls
    if (i % 100 === 0 && i > 0) {
      // Small delay every 100 iterations to simulate real usage
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }
  
  const results = {
    totalGenerated: iterations,
    uniqueKeys: keys.size,
    duplicates: duplicates.length,
    duplicateKeys: duplicates,
    success: duplicates.length === 0
  };
  
  console.log('📊 نتائج اختبار المفاتيح:', results);
  
  if (results.success) {
    console.log('✅ جميع المفاتيح فريدة - لا توجد تكرارات');
  } else {
    console.log(`❌ تم العثور على ${duplicates.length} مفتاح مكرر`);
    console.log('المفاتيح المكررة:', duplicates);
  }
  
  return results;
};

// Test user key generation patterns
export const testUserKeyPatterns = () => {
  console.log('👥 اختبار أنماط مفاتيح المستخدمين...');
  
  // Simulate user data
  const mockUsers = [
    { email: 'user1@test.com', createdAt: '2024-01-01', firstName: 'أحمد', lastName: 'محمد' },
    { email: 'user2@test.com', createdAt: '2024-01-01', firstName: 'فاطمة', lastName: 'علي' },
    { email: 'user1@test.com', createdAt: '2024-01-02', firstName: 'أحمد', lastName: 'محمد' }, // Same email, different date
    { email: 'user3@test.com', createdAt: null, firstName: 'سارة', lastName: 'أحمد' }, // No createdAt
  ];
  
  const registeredKeys = mockUsers.map((user, index) => 
    `registered-${user.email}-${user.createdAt || index}`
  );
  
  const spsaKeys = mockUsers.map((user, index) => 
    `spsa-${user.email}-${user.id || user.createdAt || index}`
  );
  
  console.log('🔑 مفاتيح registeredUsers:', registeredKeys);
  console.log('🔑 مفاتيح spsaUsers:', spsaKeys);
  
  // Check for duplicates
  const registeredDuplicates = registeredKeys.filter((key, index) => 
    registeredKeys.indexOf(key) !== index
  );
  
  const spsaDuplicates = spsaKeys.filter((key, index) => 
    spsaKeys.indexOf(key) !== index
  );
  
  const results = {
    registeredKeys: {
      total: registeredKeys.length,
      unique: new Set(registeredKeys).size,
      duplicates: registeredDuplicates
    },
    spsaKeys: {
      total: spsaKeys.length,
      unique: new Set(spsaKeys).size,
      duplicates: spsaDuplicates
    }
  };
  
  console.log('📊 نتائج اختبار مفاتيح المستخدمين:', results);
  
  if (registeredDuplicates.length === 0 && spsaDuplicates.length === 0) {
    console.log('✅ جميع مفاتيح المستخدمين فريدة');
  } else {
    console.log('❌ توجد مفاتيح مكررة في بيانات المستخدمين');
  }
  
  return results;
};

// Test comprehensive test result keys
export const testComprehensiveResultKeys = () => {
  console.log('🎯 اختبار مفاتيح نتائج الاختبار الشامل...');
  
  // Simulate comprehensive test results
  const mockTests = [
    { user: 'أحمد محمد', email: 'ahmed@test.com', success: true },
    { user: 'فاطمة علي', email: 'fatima@test.com', success: false, error: 'خطأ في التسجيل' },
    { user: 'سارة أحمد', email: 'sara@test.com', success: true },
    { user: 'أحمد محمد', email: 'ahmed2@test.com', success: true }, // Same name, different email
  ];
  
  const mockErrors = [
    'خطأ في الاتصال بالخادم',
    'فشل في حفظ البيانات',
    'خطأ في التحقق من صحة البيانات',
    'خطأ في الاتصال بالخادم', // Duplicate error message
  ];
  
  const testKeys = mockTests.map((test, index) => 
    `test-${test.email}-${test.user}-${index}`
  );
  
  const errorKeys = mockErrors.map((error, index) => 
    `error-${index}-${error.substring(0, 20).replace(/\s/g, '')}`
  );
  
  console.log('🔑 مفاتيح اختبارات التسجيل:', testKeys);
  console.log('🔑 مفاتيح الأخطاء:', errorKeys);
  
  // Check for duplicates
  const testDuplicates = testKeys.filter((key, index) => 
    testKeys.indexOf(key) !== index
  );
  
  const errorDuplicates = errorKeys.filter((key, index) => 
    errorKeys.indexOf(key) !== index
  );
  
  const results = {
    testKeys: {
      total: testKeys.length,
      unique: new Set(testKeys).size,
      duplicates: testDuplicates
    },
    errorKeys: {
      total: errorKeys.length,
      unique: new Set(errorKeys).size,
      duplicates: errorDuplicates
    }
  };
  
  console.log('📊 نتائج اختبار مفاتيح النتائج:', results);
  
  if (testDuplicates.length === 0 && errorDuplicates.length === 0) {
    console.log('✅ جميع مفاتيح النتائج فريدة');
  } else {
    console.log('❌ توجد مفاتيح مكررة في النتائج');
  }
  
  return results;
};

// Run all key tests
export const runAllKeyTests = async () => {
  console.log('🚀 بدء اختبار شامل لجميع المفاتيح...');
  console.log('='.repeat(50));
  
  const results = {
    uniqueIdTest: await testKeyUniqueness(1000),
    userKeyTest: testUserKeyPatterns(),
    resultKeyTest: testComprehensiveResultKeys()
  };
  
  const allTestsPassed = 
    results.uniqueIdTest.success &&
    results.userKeyTest.registeredKeys.duplicates.length === 0 &&
    results.userKeyTest.spsaKeys.duplicates.length === 0 &&
    results.resultKeyTest.testKeys.duplicates.length === 0 &&
    results.resultKeyTest.errorKeys.duplicates.length === 0;
  
  console.log('='.repeat(50));
  console.log(`🏁 انتهى الاختبار الشامل للمفاتيح: ${allTestsPassed ? '✅ نجح' : '❌ فشل'}`);
  
  return {
    success: allTestsPassed,
    results
  };
};

// Export for browser console testing
if (typeof window !== 'undefined') {
  window.keyTestUtility = {
    generateUniqueId,
    testKeyUniqueness,
    testUserKeyPatterns,
    testComprehensiveResultKeys,
    runAllKeyTests
  };
}

export default {
  generateUniqueId,
  testKeyUniqueness,
  testUserKeyPatterns,
  testComprehensiveResultKeys,
  runAllKeyTests
};
