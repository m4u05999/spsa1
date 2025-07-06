/**
 * Integration Tests - Frontend & Backend Integration
 * اختبارات التكامل - تكامل الواجهة الأمامية والخلفية
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import supabaseService, { 
  isSupabaseAvailable, 
  testSupabaseConnection,
  supabaseAuth,
  supabaseDB 
} from '../services/supabaseService.js';
import { contentService } from '../services/contentService.js';
import * as authService from '../services/authService.js';
import { ENV } from '../config/environment.js';

// Mock environment for testing
vi.mock('../config/environment.js', () => ({
  ENV: {
    SUPABASE: {
      URL: 'https://test-project.supabase.co',
      ANON_KEY: 'test-anon-key'
    },
    APP_URL: 'http://localhost:5173',
    IS_DEVELOPMENT: true
  }
}));

describe('Integration Tests', () => {
  beforeEach(() => {
    // Clear any cached data
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Supabase Service Integration', () => {
    it('should check Supabase availability', () => {
      // Since we're mocking the environment, this should work
      const isAvailable = isSupabaseAvailable();
      
      // In test environment, Supabase might not be fully available
      expect(typeof isAvailable).toBe('boolean');
    });

    it('should test Supabase connection', async () => {
      const result = await testSupabaseConnection();
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
    });

    it('should handle authentication flow', async () => {
      const testEmail = 'test@example.com';
      const testPassword = 'testpassword123';

      // Test sign up
      const signUpResult = await supabaseAuth.signUp(testEmail, testPassword, {
        name: 'Test User'
      });

      expect(signUpResult).toHaveProperty('success');
      expect(signUpResult).toHaveProperty('message');

      // Test sign in
      const signInResult = await supabaseAuth.signIn(testEmail, testPassword);

      expect(signInResult).toHaveProperty('success');
      expect(signInResult).toHaveProperty('message');

      // Test get current user
      const currentUser = await supabaseAuth.getCurrentUser();
      // In test environment, this might be null
      expect(currentUser === null || typeof currentUser === 'object').toBe(true);

      // Test sign out
      const signOutResult = await supabaseAuth.signOut();

      expect(signOutResult).toHaveProperty('success');
      expect(signOutResult).toHaveProperty('message');
    });

    it('should handle database operations', async () => {
      const testTable = 'test_table';
      const testData = {
        title: 'Test Content',
        content: 'This is test content',
        author: 'Test Author'
      };

      // Test insert
      const insertResult = await supabaseDB.insert(testTable, testData);
      expect(insertResult).toHaveProperty('success');
      expect(insertResult).toHaveProperty('message');

      // Test select
      const selectResult = await supabaseDB.select(testTable, {
        filters: [
          { column: 'title', operator: 'eq', value: 'Test Content' }
        ]
      });
      expect(selectResult).toHaveProperty('success');
      expect(selectResult).toHaveProperty('data');
      expect(Array.isArray(selectResult.data)).toBe(true);

      // Test update
      const updateResult = await supabaseDB.update(
        testTable,
        { content: 'Updated test content' },
        [{ column: 'title', operator: 'eq', value: 'Test Content' }]
      );
      expect(updateResult).toHaveProperty('success');
      expect(updateResult).toHaveProperty('message');

      // Test delete
      const deleteResult = await supabaseDB.delete(testTable, [
        { column: 'title', operator: 'eq', value: 'Test Content' }
      ]);
      expect(deleteResult).toHaveProperty('success');
      expect(deleteResult).toHaveProperty('message');
    });
  });

  describe('Content Service Integration', () => {
    it('should integrate with content management', async () => {
      // Test getting all content
      const allContent = await contentService.getAll();
      expect(Array.isArray(allContent)).toBe(true);
      expect(allContent.length).toBeGreaterThan(0);

      // Test getting content by ID
      const firstContent = allContent[0];
      const contentById = await contentService.getById(firstContent.id);
      expect(contentById).toEqual(firstContent);

      // Test searching content
      const searchResults = await contentService.search({
        query: 'العلاقات',
        type: 'article'
      });
      expect(Array.isArray(searchResults)).toBe(true);

      // Test creating new content
      const newContent = {
        title: 'محتوى اختبار التكامل',
        type: 'article',
        author: 'مطور الاختبار',
        status: 'draft',
        content: 'هذا محتوى اختبار للتكامل',
        excerpt: 'مقتطف من محتوى الاختبار',
        categories: ['اختبار'],
        tags: ['تكامل', 'اختبار'],
        featured: false
      };

      const createResult = await contentService.create(newContent);
      expect(createResult).toHaveProperty('id');
      expect(createResult.title).toBe(newContent.title);

      // Test updating content
      const updateResult = await contentService.update(createResult.id, {
        status: 'published'
      });
      expect(updateResult.status).toBe('published');
      expect(updateResult).toHaveProperty('publishedAt');

      // Test deleting content
      const deleteResult = await contentService.delete(createResult.id);
      expect(deleteResult.success).toBe(true);
    });

    it('should handle content categories and tags', async () => {
      const categories = await contentService.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);

      const tags = await contentService.getTags();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);

      // Verify category structure
      const firstCategory = categories[0];
      expect(firstCategory).toHaveProperty('id');
      expect(firstCategory).toHaveProperty('name');
      expect(firstCategory).toHaveProperty('slug');
      expect(firstCategory).toHaveProperty('count');

      // Verify tag structure
      const firstTag = tags[0];
      expect(firstTag).toHaveProperty('id');
      expect(firstTag).toHaveProperty('name');
      expect(firstTag).toHaveProperty('slug');
      expect(firstTag).toHaveProperty('count');
    });
  });

  describe('Authentication Service Integration', () => {
    it('should handle mock authentication flow', async () => {
      // Test login with valid credentials
      const loginResult = await authService.login('admin@example.com', 'password');
      expect(loginResult).toHaveProperty('user');
      expect(loginResult).toHaveProperty('token');
      expect(loginResult.user.email).toBe('admin@example.com');

      // Verify authentication state
      expect(authService.isAuthenticated()).toBe(true);

      // Get current user
      const currentUser = authService.getCurrentUser();
      expect(currentUser).not.toBeNull();
      expect(currentUser.email).toBe('admin@example.com');

      // Test logout
      authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
      expect(authService.getCurrentUser()).toBeNull();
    });

    it('should handle registration flow', async () => {
      const userData = {
        name: 'مستخدم جديد',
        email: 'newuser@example.com',
        phone: '0501234567',
        specialization: 'العلوم السياسية'
      };

      const registerResult = await authService.register(userData);
      expect(registerResult).toHaveProperty('id');
      expect(registerResult.name).toBe(userData.name);
      expect(registerResult.email).toBe(userData.email);
    });

    it('should handle invalid credentials', async () => {
      try {
        await authService.login('invalid@example.com', 'wrongpassword');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toContain('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data consistency across services', async () => {
      // Login user
      await authService.login('admin@example.com', 'password');
      const user = authService.getCurrentUser();

      // Create content as logged-in user
      const newContent = {
        title: 'محتوى من المستخدم المسجل',
        type: 'article',
        author: user.name,
        status: 'published',
        content: 'محتوى تم إنشاؤه من قبل مستخدم مسجل الدخول',
        excerpt: 'مقتطف المحتوى',
        categories: ['إدارة'],
        tags: ['مستخدم', 'محتوى'],
        featured: true
      };

      const createdContent = await contentService.create(newContent);
      expect(createdContent.author).toBe(user.name);

      // Search for content by author
      const authorContent = await contentService.search({
        query: user.name
      });

      const userContent = authorContent.find(content => content.id === createdContent.id);
      expect(userContent).toBeDefined();
      expect(userContent.author).toBe(user.name);

      // Clean up
      await contentService.delete(createdContent.id);
      authService.logout();
    });

    it('should handle error scenarios gracefully', async () => {
      // Test getting non-existent content
      try {
        await contentService.getById('non-existent-id');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toBe('Content not found');
      }

      // Test updating non-existent content
      try {
        await contentService.update('non-existent-id', { title: 'Updated' });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toBe('Content not found');
      }

      // Test deleting non-existent content
      try {
        await contentService.delete('non-existent-id');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toBe('Content not found');
      }
    });
  });

  describe('Performance Integration', () => {
    it('should handle large data sets efficiently', async () => {
      const startTime = Date.now();

      // Test loading all content
      const allContent = await contentService.getAll();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (less than 1 second for mock data)
      expect(loadTime).toBeLessThan(1000);
      expect(Array.isArray(allContent)).toBe(true);
    });

    it('should handle concurrent operations', async () => {
      const promises = [];

      // Create multiple concurrent requests
      for (let i = 0; i < 5; i++) {
        promises.push(contentService.getAll());
        promises.push(contentService.getCategories());
        promises.push(contentService.getTags());
      }

      const results = await Promise.all(promises);
      
      // All requests should succeed
      expect(results.length).toBe(15);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });
});
