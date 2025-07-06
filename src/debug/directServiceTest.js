/**
 * Direct Service Test
 * اختبار مباشر للخدمات
 */

// Test secureAuthService directly
export const testSecureAuthService = async () => {
  console.log('🧪 Testing secureAuthService directly...');
  
  try {
    // Import the service
    const { secureAuthService } = await import('../services/secureAuthService.js');
    console.log('✅ secureAuthService imported:', secureAuthService);
    
    // Test data
    const testData = {
      name: 'اختبار مباشر',
      email: `direct.test.${Date.now()}@example.com`,
      password: 'DirectTest123!',
      phone: '0501234567',
      specialization: 'political-science'
    };
    
    console.log('📝 Test data:', testData);
    
    // Clear existing users
    localStorage.removeItem('registeredUsers');
    console.log('🗑️ Cleared existing users');
    
    // Test registration
    const result = await secureAuthService.register(testData);
    console.log('📊 Registration result:', result);
    
    // Check localStorage
    const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    console.log('💾 Saved users:', savedUsers);
    
    return {
      success: result.success,
      result,
      savedUsers,
      userFound: savedUsers.find(u => u.email === testData.email)
    };
    
  } catch (error) {
    console.error('❌ Direct service test error:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
};

// Test feature flags
export const testFeatureFlags = async () => {
  console.log('🏁 Testing feature flags...');
  
  try {
    const { getFeatureFlag } = await import('../config/featureFlags.js');
    
    const useNewAuth = getFeatureFlag('USE_NEW_AUTH');
    const enableSupabaseFallback = getFeatureFlag('ENABLE_SUPABASE_FALLBACK', true);
    
    console.log('USE_NEW_AUTH:', useNewAuth);
    console.log('ENABLE_SUPABASE_FALLBACK:', enableSupabaseFallback);
    
    return {
      useNewAuth,
      enableSupabaseFallback
    };
    
  } catch (error) {
    console.error('❌ Feature flags test error:', error);
    return {
      error: error.message
    };
  }
};

// Test AuthContext
export const testAuthContext = async () => {
  console.log('🔍 Testing AuthContext...');
  
  try {
    const authModule = await import('../context/AuthContext.jsx');
    console.log('✅ AuthContext module:', authModule);
    console.log('AuthContext:', authModule.AuthContext);
    console.log('useAuth:', authModule.useAuth);
    console.log('AuthProvider:', authModule.default);
    
    return {
      hasAuthContext: !!authModule.AuthContext,
      hasUseAuth: !!authModule.useAuth,
      hasAuthProvider: !!authModule.default
    };
    
  } catch (error) {
    console.error('❌ AuthContext test error:', error);
    return {
      error: error.message
    };
  }
};

// Run all tests
export const runAllDirectTests = async () => {
  console.log('🎯 Running all direct tests...');
  console.log('='.repeat(50));
  
  const results = {};
  
  // Test 1: Feature Flags
  console.log('\n1️⃣ Testing Feature Flags...');
  results.featureFlags = await testFeatureFlags();
  
  // Test 2: AuthContext
  console.log('\n2️⃣ Testing AuthContext...');
  results.authContext = await testAuthContext();
  
  // Test 3: secureAuthService
  console.log('\n3️⃣ Testing secureAuthService...');
  results.secureAuth = await testSecureAuthService();
  
  console.log('\n📊 All test results:', results);
  
  return results;
};

// Make available in browser console
if (typeof window !== 'undefined') {
  window.testSecureAuth = testSecureAuthService;
  window.testFeatureFlags = testFeatureFlags;
  window.testAuthContext = testAuthContext;
  window.runAllDirectTests = runAllDirectTests;
  
  console.log('🔧 Direct tests available:');
  console.log('  - window.testSecureAuth()');
  console.log('  - window.testFeatureFlags()');
  console.log('  - window.testAuthContext()');
  console.log('  - window.runAllDirectTests()');
}

export default {
  testSecureAuthService,
  testFeatureFlags,
  testAuthContext,
  runAllDirectTests
};
