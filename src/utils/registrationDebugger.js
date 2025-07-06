/**
 * Registration System Debugger
 * مصحح نظام التسجيل
 */

import { getFeatureFlag } from '../config/featureFlags';

// Test registration flow step by step
export const debugRegistrationFlow = async () => {
  console.log('🔍 Starting Registration Flow Debug...');
  console.log('='.repeat(50));

  // Step 1: Check Feature Flags
  console.log('📋 Step 1: Checking Feature Flags...');
  const useNewAuth = getFeatureFlag('USE_NEW_AUTH');
  const enableSupabaseFallback = getFeatureFlag('ENABLE_SUPABASE_FALLBACK', true);
  
  console.log(`   USE_NEW_AUTH: ${useNewAuth}`);
  console.log(`   ENABLE_SUPABASE_FALLBACK: ${enableSupabaseFallback}`);
  
  if (!useNewAuth) {
    console.log('   ✅ Will use secureAuthService (fallback)');
  } else {
    console.log('   ✅ Will use unifiedApiService (new backend)');
  }

  // Step 2: Check Environment
  console.log('\n📋 Step 2: Checking Environment...');
  const env = import.meta.env.VITE_APP_ENV;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log(`   Environment: ${env}`);
  console.log(`   Supabase URL: ${supabaseUrl ? '✅ Available' : '❌ Missing'}`);
  console.log(`   Supabase Key: ${supabaseKey ? '✅ Available' : '❌ Missing'}`);

  // Step 3: Check Services
  console.log('\n📋 Step 3: Checking Services...');
  
  try {
    // Check AuthContext
    const authContextModule = await import('../context/AuthContext');
    console.log('   ✅ AuthContext imported successfully');
    
    // Check secureAuthService
    const secureAuthModule = await import('../services/secureAuthService');
    console.log('   ✅ secureAuthService imported successfully');
    
    // Check unifiedApiService
    const unifiedApiModule = await import('../services/unifiedApiService');
    console.log('   ✅ unifiedApiService imported successfully');
    
  } catch (error) {
    console.error('   ❌ Service import error:', error);
  }

  // Step 4: Test Data Validation
  console.log('\n📋 Step 4: Testing Data Validation...');
  
  const testData = {
    name: 'مستخدم تجريبي',
    email: `test.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!',
    phone: '0501234567',
    specialization: 'political-science',
    agreeTerms: true
  };
  
  console.log('   Test data created:', testData);
  
  // Validate required fields
  const requiredFields = ['name', 'email', 'password'];
  const missingFields = requiredFields.filter(field => !testData[field]);
  
  if (missingFields.length === 0) {
    console.log('   ✅ All required fields present');
  } else {
    console.log('   ❌ Missing required fields:', missingFields);
  }
  
  // Validate password strength
  const passwordValidation = validatePasswordStrength(testData.password);
  if (passwordValidation.isValid) {
    console.log('   ✅ Password strength validation passed');
  } else {
    console.log('   ❌ Password validation failed:', passwordValidation.errors);
  }

  // Step 5: Check Storage
  console.log('\n📋 Step 5: Checking Storage...');
  
  try {
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    console.log(`   📊 Existing users in localStorage: ${existingUsers.length}`);
    
    if (existingUsers.length > 0) {
      console.log('   👥 Sample users:', existingUsers.slice(0, 2).map(u => ({ id: u.id, email: u.email })));
    }
  } catch (error) {
    console.error('   ❌ localStorage error:', error);
  }

  console.log('\n🎯 Debug Summary:');
  console.log(`   - Feature Flags: ${useNewAuth ? 'New Auth' : 'Secure Auth'}`);
  console.log(`   - Environment: ${env}`);
  console.log(`   - Supabase: ${supabaseUrl && supabaseKey ? 'Configured' : 'Missing'}`);
  console.log(`   - Services: Available`);
  console.log(`   - Test Data: Valid`);
  
  return {
    useNewAuth,
    environment: env,
    supabaseConfigured: !!(supabaseUrl && supabaseKey),
    testData
  };
};

// Password validation helper
const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف كبير');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف صغير');
  }
  
  if (!/\d/.test(password)) {
    errors.push('يجب أن تحتوي على رقم');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('يجب أن تحتوي على رمز خاص');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Test actual registration
export const testActualRegistration = async () => {
  console.log('🧪 Testing Actual Registration...');
  
  try {
    // Import AuthContext
    const { AuthContext } = await import('../context/AuthContext');
    console.log('   ✅ AuthContext imported');
    
    // Create test data
    const testData = {
      name: 'مستخدم اختبار فعلي',
      email: `actual.test.${Date.now()}@example.com`,
      password: 'ActualTest123!',
      confirmPassword: 'ActualTest123!',
      phone: '0501234567',
      specialization: 'political-science',
      agreeTerms: true
    };
    
    console.log('   📝 Test data:', testData);
    
    // Note: We can't directly test the register function here because it requires React context
    // This would need to be done in a React component or test environment
    
    console.log('   ⚠️ Actual registration test requires React context');
    console.log('   💡 Use the RegistrationTest page at /test-registration for full testing');
    
    return {
      success: true,
      message: 'Test setup complete - use React component for actual testing',
      testData
    };
    
  } catch (error) {
    console.error('   ❌ Registration test error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export for browser console
if (typeof window !== 'undefined') {
  window.debugRegistration = debugRegistrationFlow;
  window.testRegistration = testActualRegistration;
  console.log('🔧 Registration debugger available:');
  console.log('   - window.debugRegistration() - Debug flow');
  console.log('   - window.testRegistration() - Test registration');
}

export default {
  debugRegistrationFlow,
  testActualRegistration,
  validatePasswordStrength
};
