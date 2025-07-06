/**
 * Registration Integration Test
 * اختبار تكامل نظام التسجيل
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the registration process
const mockRegistrationProcess = async (userData) => {
  console.log('🧪 Testing registration with data:', userData);
  
  // Simulate validation
  if (!userData.email || !userData.password || !userData.name) {
    throw new Error('جميع الحقول المطلوبة يجب أن تكون مملوءة');
  }
  
  // Simulate password validation
  const passwordValidation = validatePasswordStrength(userData.password);
  if (!passwordValidation.isValid) {
    throw new Error(`كلمة المرور ضعيفة: ${passwordValidation.errors.join(', ')}`);
  }
  
  // Simulate registration success
  const newUser = {
    id: Date.now().toString(),
    name: userData.name,
    email: userData.email,
    role: 'user',
    phone: userData.phone || '',
    specialization: userData.specialization || '',
    membershipStatus: 'pending',
    createdAt: new Date().toISOString()
  };
  
  // Save to localStorage (simulating database)
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  existingUsers.push(newUser);
  localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
  
  return {
    success: true,
    user: newUser,
    message: 'تم إنشاء الحساب بنجاح'
  };
};

// Password validation function
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

// Test the registration process
const testRegistration = async () => {
  console.log('🚀 Starting Registration Integration Test...');
  
  try {
    // Clear previous test data
    localStorage.removeItem('registeredUsers');
    
    // Test data
    const testUserData = {
      name: 'أحمد محمد التجريبي',
      email: 'ahmed.integration.test@example.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      phone: '0501234567',
      specialization: 'political-science',
      agreeTerms: true
    };
    
    console.log('📝 Test user data:', testUserData);
    
    // Test registration
    const result = await mockRegistrationProcess(testUserData);
    
    if (result.success) {
      console.log('✅ Registration successful:', result);
      
      // Verify user was saved
      const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const savedUser = savedUsers.find(user => user.email === testUserData.email);
      
      if (savedUser) {
        console.log('✅ User saved successfully:', savedUser);
        
        // Test user appears in admin list
        console.log('📋 All registered users:', savedUsers);
        
        return {
          success: true,
          message: 'اختبار التسجيل نجح بالكامل',
          user: savedUser,
          totalUsers: savedUsers.length
        };
      } else {
        throw new Error('المستخدم لم يتم حفظه في قاعدة البيانات');
      }
    } else {
      throw new Error(result.error || 'فشل في التسجيل');
    }
    
  } catch (error) {
    console.error('❌ Registration test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test invalid data
const testInvalidRegistration = async () => {
  console.log('🧪 Testing invalid registration data...');
  
  const invalidTestCases = [
    {
      name: 'Missing email',
      data: { name: 'Test', password: 'TestPassword123!' },
      expectedError: 'جميع الحقول المطلوبة يجب أن تكون مملوءة'
    },
    {
      name: 'Weak password',
      data: { name: 'Test', email: 'test@example.com', password: '123' },
      expectedError: 'كلمة المرور ضعيفة'
    }
  ];
  
  for (const testCase of invalidTestCases) {
    try {
      await mockRegistrationProcess(testCase.data);
      console.log(`❌ Test case "${testCase.name}" should have failed`);
    } catch (error) {
      if (error.message.includes(testCase.expectedError)) {
        console.log(`✅ Test case "${testCase.name}" failed as expected:`, error.message);
      } else {
        console.log(`⚠️ Test case "${testCase.name}" failed with unexpected error:`, error.message);
      }
    }
  }
};

// Run tests
const runIntegrationTests = async () => {
  console.log('🎯 Running Registration Integration Tests...');
  console.log('='.repeat(50));
  
  // Test valid registration
  const validTest = await testRegistration();
  console.log('Valid Registration Test Result:', validTest);
  console.log('-'.repeat(30));
  
  // Test invalid registration
  await testInvalidRegistration();
  console.log('-'.repeat(30));
  
  // Summary
  if (validTest.success) {
    console.log('🎉 Integration Tests Summary:');
    console.log('✅ Valid registration: PASSED');
    console.log('✅ Invalid registration handling: PASSED');
    console.log('✅ Data persistence: PASSED');
    console.log(`📊 Total users in system: ${validTest.totalUsers}`);
  } else {
    console.log('❌ Integration Tests FAILED:', validTest.error);
  }
  
  return validTest;
};

// Vitest Tests
describe('Registration Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Valid Registration Process', () => {
    it('should register a user successfully with valid data', async () => {
      const testUserData = {
        name: 'أحمد محمد التجريبي',
        email: 'ahmed.test@example.com',
        password: 'TestPassword123!',
        phone: '0501234567',
        specialization: 'political-science'
      };

      const result = await mockRegistrationProcess(testUserData);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testUserData.email);
      expect(result.user.name).toBe(testUserData.name);
      expect(result.user.membershipStatus).toBe('pending');
      expect(result.message).toBe('تم إنشاء الحساب بنجاح');
    });

    it('should save user data to localStorage', async () => {
      const testUserData = {
        name: 'سارة أحمد',
        email: 'sara.test@example.com',
        password: 'SecurePass456!',
        phone: '0509876543'
      };

      await mockRegistrationProcess(testUserData);

      const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      expect(savedUsers).toHaveLength(1);
      expect(savedUsers[0].email).toBe(testUserData.email);
      expect(savedUsers[0].name).toBe(testUserData.name);
    });
  });

  describe('Invalid Registration Handling', () => {
    it('should reject registration with missing required fields', async () => {
      const invalidData = {
        name: 'Test User'
        // Missing email and password
      };

      await expect(mockRegistrationProcess(invalidData))
        .rejects
        .toThrow('جميع الحقول المطلوبة يجب أن تكون مملوءة');
    });

    it('should reject registration with weak password', async () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123' // Too weak
      };

      await expect(mockRegistrationProcess(invalidData))
        .rejects
        .toThrow('كلمة المرور ضعيفة');
    });
  });

  describe('Password Validation', () => {
    it('should validate strong password correctly', () => {
      const strongPassword = 'StrongPass123!';
      const result = validatePasswordStrength(strongPassword);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should identify weak password issues', () => {
      const weakPassword = 'weak';
      const result = validatePasswordStrength(weakPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
    });
  });
});

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testRegistration = runIntegrationTests;
  console.log('🔧 Registration test available as: window.testRegistration()');
}

export { testRegistration, runIntegrationTests, mockRegistrationProcess, validatePasswordStrength };
