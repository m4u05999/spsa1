/**
 * Simple Import Test - اختبار بسيط للاستيراد
 * 
 * هذا الملف يختبر استيراد userManagementApi بطريقة مبسطة
 * لتحديد سبب مشكلة 503 Service Unavailable
 */

// Test function that can be called from browser console
export async function testUserManagementApiImport() {
  console.log('🔧 بدء اختبار استيراد userManagementApi...');
  
  const results = {
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };
  
  // Helper function to add test result
  function addTest(name, success, message, details = null) {
    const test = {
      name,
      success,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    results.tests.push(test);
    results.summary.total++;
    if (success) {
      results.summary.passed++;
      console.log(`✅ ${name}: ${message}`);
    } else {
      results.summary.failed++;
      console.log(`❌ ${name}: ${message}`);
      if (details) console.log('   تفاصيل:', details);
    }
  }
  
  // Test 1: Check if file exists via fetch
  try {
    console.log('1️⃣ اختبار وجود الملف...');
    const response = await fetch('/src/services/api/userManagementApi.js');
    
    if (response.ok) {
      const content = await response.text();
      addTest(
        'وجود الملف',
        true,
        `الملف موجود (${content.length} حرف)`,
        {
          status: response.status,
          contentType: response.headers.get('content-type'),
          size: content.length
        }
      );
    } else {
      addTest(
        'وجود الملف',
        false,
        `فشل في الوصول للملف: ${response.status} ${response.statusText}`,
        {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        }
      );
      return results; // Stop here if file doesn't exist
    }
  } catch (error) {
    addTest(
      'وجود الملف',
      false,
      `خطأ في fetch: ${error.message}`,
      { error: error.toString() }
    );
    return results;
  }
  
  // Test 2: Try dynamic import
  try {
    console.log('2️⃣ اختبار dynamic import...');
    const startTime = performance.now();
    const module = await import('/src/services/api/userManagementApi.js');
    const endTime = performance.now();
    
    addTest(
      'Dynamic Import',
      true,
      `نجح الاستيراد في ${Math.round(endTime - startTime)}ms`,
      {
        loadTime: Math.round(endTime - startTime),
        hasDefault: !!module.default,
        exportedKeys: Object.keys(module)
      }
    );
    
    // Test 3: Check default export
    if (module.default) {
      try {
        console.log('3️⃣ اختبار default export...');
        const api = module.default;
        
        // Check if it's a class instance
        const isInstance = typeof api === 'object' && api.constructor;
        const hasGetUsers = typeof api.getUsers === 'function';
        const hasGetServiceStatus = typeof api.getServiceStatus === 'function';
        
        addTest(
          'Default Export',
          true,
          'default export صحيح',
          {
            isInstance,
            hasGetUsers,
            hasGetServiceStatus,
            constructorName: api.constructor?.name
          }
        );
        
        // Test 4: Try calling getServiceStatus
        if (hasGetServiceStatus) {
          try {
            console.log('4️⃣ اختبار getServiceStatus...');
            const status = api.getServiceStatus();
            
            addTest(
              'getServiceStatus',
              true,
              'تم استدعاء getServiceStatus بنجاح',
              status
            );
          } catch (error) {
            addTest(
              'getServiceStatus',
              false,
              `خطأ في getServiceStatus: ${error.message}`,
              { error: error.toString() }
            );
          }
        }
        
        // Test 5: Try calling getUsers (this might fail due to dependencies)
        if (hasGetUsers) {
          try {
            console.log('5️⃣ اختبار getUsers...');
            const usersResult = await api.getUsers({ limit: 1 });
            
            addTest(
              'getUsers',
              true,
              'تم استدعاء getUsers بنجاح',
              {
                success: usersResult.success,
                dataLength: usersResult.data?.length || 0
              }
            );
          } catch (error) {
            addTest(
              'getUsers',
              false,
              `خطأ في getUsers: ${error.message}`,
              { error: error.toString() }
            );
          }
        }
        
      } catch (error) {
        addTest(
          'Default Export',
          false,
          `خطأ في اختبار default export: ${error.message}`,
          { error: error.toString() }
        );
      }
    } else {
      addTest(
        'Default Export',
        false,
        'لا يوجد default export',
        { exportedKeys: Object.keys(module) }
      );
    }
    
  } catch (error) {
    addTest(
      'Dynamic Import',
      false,
      `فشل في dynamic import: ${error.message}`,
      {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack?.split('\n').slice(0, 5) // First 5 lines of stack
      }
    );
  }
  
  // Final summary
  console.log('📊 ملخص النتائج:');
  console.log(`   المجموع: ${results.summary.total}`);
  console.log(`   نجح: ${results.summary.passed}`);
  console.log(`   فشل: ${results.summary.failed}`);
  console.log(`   معدل النجاح: ${Math.round((results.summary.passed / results.summary.total) * 100)}%`);
  
  return results;
}

// Test dependencies individually
export async function testDependencies() {
  console.log('🔗 اختبار التبعيات...');
  
  const dependencies = [
    { name: 'unifiedApiService', path: '/src/services/unifiedApiService.js' },
    { name: 'featureFlags', path: '/src/config/featureFlags.js' },
    { name: 'monitoring', path: '/src/utils/monitoring.js' },
    { name: 'localStorageService', path: '/src/services/localStorageService.js' }
  ];
  
  const results = [];
  
  for (const dep of dependencies) {
    try {
      console.log(`📦 اختبار ${dep.name}...`);
      const startTime = performance.now();
      const module = await import(dep.path);
      const endTime = performance.now();
      
      results.push({
        name: dep.name,
        path: dep.path,
        success: true,
        loadTime: Math.round(endTime - startTime),
        hasDefault: !!module.default,
        exportedKeys: Object.keys(module)
      });
      
      console.log(`✅ ${dep.name}: نجح في ${Math.round(endTime - startTime)}ms`);
    } catch (error) {
      results.push({
        name: dep.name,
        path: dep.path,
        success: false,
        error: error.message,
        errorDetails: error.toString()
      });
      
      console.log(`❌ ${dep.name}: فشل - ${error.message}`);
    }
  }
  
  return results;
}

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  window.testUserManagementApiImport = testUserManagementApiImport;
  window.testDependencies = testDependencies;
}

export default {
  testUserManagementApiImport,
  testDependencies
};
