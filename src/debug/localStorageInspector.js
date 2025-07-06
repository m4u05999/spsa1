/**
 * localStorage Inspector
 * فاحص التخزين المحلي
 */

export const inspectLocalStorage = () => {
  console.log('🔍 Inspecting localStorage...');
  console.log('='.repeat(50));
  
  const results = {
    registeredUsers: null,
    spsaUsers: null,
    allKeys: [],
    userRelatedKeys: []
  };
  
  // Get all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    results.allKeys.push(key);
    
    if (key.toLowerCase().includes('user')) {
      results.userRelatedKeys.push(key);
    }
  }
  
  console.log('📋 All localStorage keys:', results.allKeys);
  console.log('👥 User-related keys:', results.userRelatedKeys);
  
  // Check registeredUsers (from secureAuthService)
  try {
    const registeredUsers = localStorage.getItem('registeredUsers');
    if (registeredUsers) {
      results.registeredUsers = JSON.parse(registeredUsers);
      console.log('✅ registeredUsers found:', results.registeredUsers.length, 'users');
      console.log('📝 registeredUsers data:', results.registeredUsers);
    } else {
      console.log('❌ registeredUsers not found');
    }
  } catch (error) {
    console.error('❌ Error reading registeredUsers:', error);
  }
  
  // Check spsa_users (from userManagementApi)
  try {
    const spsaUsers = localStorage.getItem('spsa_users');
    if (spsaUsers) {
      results.spsaUsers = JSON.parse(spsaUsers);
      console.log('✅ spsa_users found:', results.spsaUsers.length, 'users');
      console.log('📝 spsa_users data:', results.spsaUsers);
    } else {
      console.log('❌ spsa_users not found');
    }
  } catch (error) {
    console.error('❌ Error reading spsa_users:', error);
  }
  
  // Check other user-related keys
  results.userRelatedKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      console.log(`🔑 ${key}:`, value ? JSON.parse(value) : value);
    } catch (error) {
      console.log(`🔑 ${key}:`, localStorage.getItem(key));
    }
  });
  
  console.log('='.repeat(50));
  
  return results;
};

export const syncUserData = () => {
  console.log('🔄 Syncing user data between storage keys...');
  
  try {
    // Get registered users from secureAuthService
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    console.log('📥 Found registeredUsers:', registeredUsers.length);
    
    // Get existing spsa_users
    const spsaUsers = JSON.parse(localStorage.getItem('spsa_users') || '[]');
    console.log('📥 Found spsa_users:', spsaUsers.length);
    
    // Convert registeredUsers to spsa_users format
    const convertedUsers = registeredUsers.map((user, index) => ({
      id: user.id || `reg_user_${Date.now()}_${index}`,
      firstName: user.name ? user.name.split(' ')[0] : user.firstName || 'مستخدم',
      lastName: user.name ? user.name.split(' ').slice(1).join(' ') : user.lastName || 'جديد',
      email: user.email,
      role: user.role || 'MEMBER',
      status: user.status || 'ACTIVE',
      membershipType: user.membershipType || 'REGULAR',
      phone: user.phone || '',
      specialization: user.specialization || user.specialty || '',
      workplace: user.workplace || user.organization || '',
      academicDegree: user.academicDegree || '',
      permissions: user.permissions || [],
      isActive: user.isActive !== false,
      isVerified: user.isVerified || false,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString(),
      lastLoginAt: user.lastLoginAt || null,
      profilePicture: user.profilePicture || null
    }));
    
    console.log('🔄 Converted users:', convertedUsers);
    
    // Merge with existing spsa_users (avoid duplicates)
    const mergedUsers = [...spsaUsers];
    
    convertedUsers.forEach(newUser => {
      const existingIndex = mergedUsers.findIndex(u => u.email === newUser.email);
      if (existingIndex === -1) {
        mergedUsers.push(newUser);
        console.log('➕ Added new user:', newUser.email);
      } else {
        console.log('⚠️ User already exists:', newUser.email);
      }
    });
    
    // Save merged data
    localStorage.setItem('spsa_users', JSON.stringify(mergedUsers));
    console.log('✅ Synced data saved to spsa_users:', mergedUsers.length, 'total users');
    
    return {
      success: true,
      registeredCount: registeredUsers.length,
      existingCount: spsaUsers.length,
      totalCount: mergedUsers.length,
      newUsersAdded: mergedUsers.length - spsaUsers.length
    };
    
  } catch (error) {
    console.error('❌ Error syncing user data:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const clearAllUserData = () => {
  console.log('🗑️ Clearing all user data...');
  
  const keysToRemove = [
    'registeredUsers',
    'spsa_users',
    'spsa_auth_token',
    'user',
    'authToken'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed: ${key}`);
  });
  
  console.log('✅ All user data cleared');
};

export const testRegistrationFlow = async () => {
  console.log('🧪 Testing complete registration flow...');
  
  try {
    // Clear existing data
    clearAllUserData();
    
    // Import and test secureAuthService
    const { secureAuthService } = await import('/src/services/secureAuthService.js');
    
    const testData = {
      name: 'مستخدم اختبار التدفق',
      email: `flow.test.${Date.now()}@example.com`,
      password: 'FlowTest123!',
      phone: '0501234567',
      specialization: 'political-science',
      organization: 'جامعة الاختبار'
    };
    
    console.log('📝 Test data:', testData);
    
    // Step 1: Register user
    console.log('1️⃣ Registering user...');
    const registerResult = await secureAuthService.register(testData);
    console.log('📊 Registration result:', registerResult);
    
    // Step 2: Check registeredUsers storage
    console.log('2️⃣ Checking registeredUsers storage...');
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    console.log('📥 registeredUsers:', registeredUsers);
    
    // Step 3: Sync to spsa_users
    console.log('3️⃣ Syncing to spsa_users...');
    const syncResult = syncUserData();
    console.log('🔄 Sync result:', syncResult);
    
    // Step 4: Check spsa_users storage
    console.log('4️⃣ Checking spsa_users storage...');
    const spsaUsers = JSON.parse(localStorage.getItem('spsa_users') || '[]');
    console.log('📥 spsa_users:', spsaUsers);
    
    // Step 5: Test userManagementApi
    console.log('5️⃣ Testing userManagementApi...');
    const userManagementApi = (await import('/src/services/api/userManagementApi.js')).default;
    const apiResult = await userManagementApi.getUsers();
    console.log('📊 API result:', apiResult);
    
    return {
      success: true,
      steps: {
        registration: registerResult,
        registeredUsers: registeredUsers,
        sync: syncResult,
        spsaUsers: spsaUsers,
        api: apiResult
      }
    };
    
  } catch (error) {
    console.error('❌ Flow test error:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
};

// Make available in browser console
if (typeof window !== 'undefined') {
  window.inspectLocalStorage = inspectLocalStorage;
  window.syncUserData = syncUserData;
  window.clearAllUserData = clearAllUserData;
  window.testRegistrationFlow = testRegistrationFlow;
  
  console.log('🔧 localStorage Inspector available:');
  console.log('  - window.inspectLocalStorage()');
  console.log('  - window.syncUserData()');
  console.log('  - window.clearAllUserData()');
  console.log('  - window.testRegistrationFlow()');
}

export default {
  inspectLocalStorage,
  syncUserData,
  clearAllUserData,
  testRegistrationFlow
};
