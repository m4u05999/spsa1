/**
 * Data Migration Utility - ترحيل البيانات
 * أداة ترحيل البيانات من التخزين المحلي إلى Supabase
 */

import { unifiedContentService } from '../services/unifiedContentService.js';
import supabaseService from '../services/supabaseService.js';
import { localStorageService } from './localStorage.js';
import { ENV } from '../config/environment.js';

/**
 * Migration status tracking
 * تتبع حالة الترحيل
 */
let migrationStatus = {
  isRunning: false,
  progress: 0,
  currentStep: '',
  errors: [],
  results: {
    categories: { total: 0, migrated: 0, errors: 0 },
    tags: { total: 0, migrated: 0, errors: 0 },
    content: { total: 0, migrated: 0, errors: 0 },
    users: { total: 0, migrated: 0, errors: 0 }
  }
};

/**
 * Get migration status
 * الحصول على حالة الترحيل
 */
export const getMigrationStatus = () => {
  return { ...migrationStatus };
};

/**
 * Update migration progress
 * تحديث تقدم الترحيل
 */
const updateProgress = (step, progress) => {
  migrationStatus.currentStep = step;
  migrationStatus.progress = progress;
  
  if (ENV.IS_DEVELOPMENT) {
    console.log(`Migration Progress: ${step} - ${progress}%`);
  }
};

/**
 * Log migration error
 * تسجيل خطأ الترحيل
 */
const logError = (step, error, item = null) => {
  const errorLog = {
    step,
    error: error.message || error,
    item,
    timestamp: new Date().toISOString()
  };
  
  migrationStatus.errors.push(errorLog);
  console.error('Migration Error:', errorLog);
};

/**
 * Migrate categories to Supabase
 * ترحيل الفئات إلى Supabase
 */
const migrateCategories = async () => {
  try {
    updateProgress('ترحيل الفئات', 10);
    
    const localCategories = await unifiedContentService.getCategories() || [];
    migrationStatus.results.categories.total = localCategories.length;
    
    for (let i = 0; i < localCategories.length; i++) {
      const category = localCategories[i];
      
      try {
        // تحويل البيانات لتتوافق مع مخطط Supabase
        const supabaseCategory = {
          id: category.id,
          name: category.name,
          name_en: category.name, // يمكن تحسينه لاحقاً
          slug: category.slug,
          description: category.description || '',
          description_en: category.description || '',
          icon: 'folder',
          color: '#3B82F6',
          sort_order: i + 1,
          is_active: true
        };
        
        const result = await supabaseService.db.insert('categories', supabaseCategory);
        
        if (result.success) {
          migrationStatus.results.categories.migrated++;
        } else {
          migrationStatus.results.categories.errors++;
          logError('categories', result.error, category);
        }
      } catch (error) {
        migrationStatus.results.categories.errors++;
        logError('categories', error, category);
      }
      
      // تحديث التقدم
      const progress = 10 + (i / localCategories.length) * 20;
      updateProgress('ترحيل الفئات', Math.round(progress));
    }
    
    updateProgress('تم ترحيل الفئات', 30);
    return true;
  } catch (error) {
    logError('categories', error);
    return false;
  }
};

/**
 * Migrate tags to Supabase
 * ترحيل العلامات إلى Supabase
 */
const migrateTags = async () => {
  try {
    updateProgress('ترحيل العلامات', 30);
    
    const localTags = await unifiedContentService.getTags() || [];
    migrationStatus.results.tags.total = localTags.length;
    
    for (let i = 0; i < localTags.length; i++) {
      const tag = localTags[i];
      
      try {
        const supabaseTag = {
          id: tag.id,
          name: tag.name,
          name_en: tag.name,
          slug: tag.slug,
          description: tag.description || '',
          color: '#6B7280',
          usage_count: tag.count || 0,
          is_active: true
        };
        
        const result = await supabaseService.db.insert('tags', supabaseTag);
        
        if (result.success) {
          migrationStatus.results.tags.migrated++;
        } else {
          migrationStatus.results.tags.errors++;
          logError('tags', result.error, tag);
        }
      } catch (error) {
        migrationStatus.results.tags.errors++;
        logError('tags', error, tag);
      }
      
      const progress = 30 + (i / localTags.length) * 20;
      updateProgress('ترحيل العلامات', Math.round(progress));
    }
    
    updateProgress('تم ترحيل العلامات', 50);
    return true;
  } catch (error) {
    logError('tags', error);
    return false;
  }
};

/**
 * Migrate content to Supabase
 * ترحيل المحتوى إلى Supabase
 */
const migrateContent = async () => {
  try {
    updateProgress('ترحيل المحتوى', 50);
    
    const localContent = await unifiedContentService.getAll() || [];
    migrationStatus.results.content.total = localContent.length;
    
    for (let i = 0; i < localContent.length; i++) {
      const content = localContent[i];
      
      try {
        // تحويل البيانات لتتوافق مع مخطط Supabase
        const supabaseContent = {
          id: content.id,
          title: content.title,
          title_en: content.title,
          slug: content.slug || content.title.toLowerCase().replace(/\s+/g, '-'),
          excerpt: content.excerpt || '',
          excerpt_en: content.excerpt || '',
          content: content.content || '',
          content_en: content.content || '',
          type: content.type || 'article',
          status: content.status || 'published',
          author_id: null, // سيتم تعيينه لاحقاً
          category_id: content.categoryId || null,
          featured_image_url: content.image || null,
          images: JSON.stringify(content.images || []),
          attachments: JSON.stringify([]),
          metadata: JSON.stringify({
            originalId: content.id,
            migratedAt: new Date().toISOString()
          }),
          views_count: 0,
          likes_count: 0,
          comments_count: 0,
          is_featured: content.featured || false,
          is_pinned: false,
          published_at: content.publishedAt || content.createdAt || new Date().toISOString()
        };
        
        const result = await supabaseService.db.insert('content', supabaseContent);
        
        if (result.success) {
          migrationStatus.results.content.migrated++;
          
          // ترحيل العلامات المرتبطة بالمحتوى
          if (content.tags && content.tags.length > 0) {
            await migrateContentTags(content.id, content.tags);
          }
        } else {
          migrationStatus.results.content.errors++;
          logError('content', result.error, content);
        }
      } catch (error) {
        migrationStatus.results.content.errors++;
        logError('content', error, content);
      }
      
      const progress = 50 + (i / localContent.length) * 30;
      updateProgress('ترحيل المحتوى', Math.round(progress));
    }
    
    updateProgress('تم ترحيل المحتوى', 80);
    return true;
  } catch (error) {
    logError('content', error);
    return false;
  }
};

/**
 * Migrate content tags relationships
 * ترحيل علاقات المحتوى بالعلامات
 */
const migrateContentTags = async (contentId, tags) => {
  try {
    for (const tagName of tags) {
      // البحث عن العلامة في Supabase
      const tagResult = await supabaseService.db.select('tags', {
        filters: [{ column: 'name', operator: 'eq', value: tagName }]
      });
      
      if (tagResult.success && tagResult.data.length > 0) {
        const tagId = tagResult.data[0].id;
        
        // إنشاء العلاقة
        await supabaseService.db.insert('content_tags', {
          content_id: contentId,
          tag_id: tagId
        });
      }
    }
  } catch (error) {
    logError('content_tags', error, { contentId, tags });
  }
};

/**
 * Create sample admin user
 * إنشاء مستخدم إداري تجريبي
 */
const createSampleUsers = async () => {
  try {
    updateProgress('إنشاء المستخدمين التجريبيين', 80);
    
    const sampleUsers = [
      {
        id: '990e8400-e29b-41d4-a716-446655440001',
        email: 'admin@sapsa.org',
        name: 'مدير النظام',
        role: 'admin',
        membership_type: 'regular',
        membership_status: 'active',
        is_verified: true,
        is_active: true,
        membership_date: new Date().toISOString().split('T')[0]
      },
      {
        id: '990e8400-e29b-41d4-a716-446655440002',
        email: 'staff@sapsa.org',
        name: 'موظف النظام',
        role: 'staff',
        membership_type: 'regular',
        membership_status: 'active',
        is_verified: true,
        is_active: true,
        membership_date: new Date().toISOString().split('T')[0]
      }
    ];
    
    migrationStatus.results.users.total = sampleUsers.length;
    
    for (const user of sampleUsers) {
      try {
        const result = await supabaseService.db.insert('users', user);
        
        if (result.success) {
          migrationStatus.results.users.migrated++;
        } else {
          migrationStatus.results.users.errors++;
          logError('users', result.error, user);
        }
      } catch (error) {
        migrationStatus.results.users.errors++;
        logError('users', error, user);
      }
    }
    
    updateProgress('تم إنشاء المستخدمين التجريبيين', 90);
    return true;
  } catch (error) {
    logError('users', error);
    return false;
  }
};

/**
 * Update content with author IDs
 * تحديث المحتوى بمعرفات المؤلفين
 */
const updateContentAuthors = async () => {
  try {
    updateProgress('تحديث مؤلفي المحتوى', 90);
    
    // الحصول على معرف المدير
    const adminResult = await supabaseService.db.select('users', {
      filters: [{ column: 'role', operator: 'eq', value: 'admin' }],
      limit: 1
    });
    
    if (adminResult.success && adminResult.data.length > 0) {
      const adminId = adminResult.data[0].id;
      
      // تحديث جميع المحتوى ليكون المدير هو المؤلف
      await supabaseService.db.update('content', 
        { author_id: adminId },
        [{ column: 'author_id', operator: 'is', value: null }]
      );
    }
    
    updateProgress('تم تحديث مؤلفي المحتوى', 95);
    return true;
  } catch (error) {
    logError('update_authors', error);
    return false;
  }
};

/**
 * Main migration function
 * دالة الترحيل الرئيسية
 */
export const migrateDataToSupabase = async () => {
  if (migrationStatus.isRunning) {
    throw new Error('Migration is already running');
  }
  
  // التحقق من توفر Supabase
  if (!supabaseService.isAvailable()) {
    throw new Error('Supabase is not available. Please check your configuration.');
  }
  
  try {
    // إعادة تعيين الحالة
    migrationStatus = {
      isRunning: true,
      progress: 0,
      currentStep: 'بدء الترحيل',
      errors: [],
      results: {
        categories: { total: 0, migrated: 0, errors: 0 },
        tags: { total: 0, migrated: 0, errors: 0 },
        content: { total: 0, migrated: 0, errors: 0 },
        users: { total: 0, migrated: 0, errors: 0 }
      }
    };
    
    updateProgress('بدء عملية الترحيل', 0);
    
    // اختبار الاتصال
    const connectionTest = await supabaseService.testConnection();
    if (!connectionTest.success) {
      throw new Error(`Failed to connect to Supabase: ${connectionTest.error}`);
    }
    
    updateProgress('تم التحقق من الاتصال', 5);
    
    // تنفيذ خطوات الترحيل
    const steps = [
      migrateCategories,
      migrateTags,
      migrateContent,
      createSampleUsers,
      updateContentAuthors
    ];
    
    for (const step of steps) {
      const success = await step();
      if (!success) {
        console.warn(`Migration step failed, but continuing...`);
      }
    }
    
    updateProgress('تم إكمال الترحيل بنجاح', 100);
    
    return {
      success: true,
      message: 'تم ترحيل البيانات بنجاح',
      results: migrationStatus.results,
      errors: migrationStatus.errors
    };
    
  } catch (error) {
    logError('migration', error);
    
    return {
      success: false,
      message: 'فشل في ترحيل البيانات',
      error: error.message,
      results: migrationStatus.results,
      errors: migrationStatus.errors
    };
  } finally {
    migrationStatus.isRunning = false;
  }
};

/**
 * Verify migration results
 * التحقق من نتائج الترحيل
 */
export const verifyMigration = async () => {
  try {
    const results = {
      categories: 0,
      tags: 0,
      content: 0,
      users: 0
    };
    
    // عد الفئات
    const categoriesResult = await supabaseService.db.select('categories');
    if (categoriesResult.success) {
      results.categories = categoriesResult.data.length;
    }
    
    // عد العلامات
    const tagsResult = await supabaseService.db.select('tags');
    if (tagsResult.success) {
      results.tags = tagsResult.data.length;
    }
    
    // عد المحتوى
    const contentResult = await supabaseService.db.select('content');
    if (contentResult.success) {
      results.content = contentResult.data.length;
    }
    
    // عد المستخدمين
    const usersResult = await supabaseService.db.select('users');
    if (usersResult.success) {
      results.users = usersResult.data.length;
    }
    
    return {
      success: true,
      results
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Clear migration data (for testing)
 * مسح بيانات الترحيل (للاختبار)
 */
export const clearMigrationData = async () => {
  if (!ENV.IS_DEVELOPMENT) {
    throw new Error('This function is only available in development mode');
  }
  
  try {
    // حذف البيانات بالترتيب الصحيح (بسبب القيود الخارجية)
    await supabaseService.db.delete('content_tags', []);
    await supabaseService.db.delete('content', []);
    await supabaseService.db.delete('tags', []);
    await supabaseService.db.delete('categories', []);
    await supabaseService.db.delete('users', []);
    
    return {
      success: true,
      message: 'تم مسح بيانات الترحيل بنجاح'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  migrate: migrateDataToSupabase,
  getStatus: getMigrationStatus,
  verify: verifyMigration,
  clear: clearMigrationData
};
