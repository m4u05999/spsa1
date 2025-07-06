/**
 * Module Loader Utility - SPSA
 * أداة تحميل الوحدات - الجمعية السعودية للعلوم السياسية
 * 
 * Handles dynamic module loading with fallback mechanisms
 * for better compatibility with Vite and ESM/CJS conflicts
 */

import { ENV } from '../config/environment.js';

/**
 * Module loading cache
 */
const moduleCache = new Map();

/**
 * Module loading status
 */
const moduleStatus = new Map();

/**
 * Safely load a module with error handling
 */
export const safeModuleLoad = async (modulePath, fallback = null) => {
  // Check cache first
  if (moduleCache.has(modulePath)) {
    return moduleCache.get(modulePath);
  }

  // Check if module is currently being loaded
  if (moduleStatus.get(modulePath) === 'loading') {
    // Wait for the module to finish loading
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (moduleStatus.get(modulePath) === 'loaded') {
          clearInterval(checkInterval);
          resolve(moduleCache.get(modulePath));
        } else if (moduleStatus.get(modulePath) === 'error') {
          clearInterval(checkInterval);
          resolve(fallback);
        }
      }, 100);
    });
  }

  try {
    moduleStatus.set(modulePath, 'loading');
    
    const module = await import(/* @vite-ignore */ modulePath);
    const loadedModule = module.default || module;
    
    moduleCache.set(modulePath, loadedModule);
    moduleStatus.set(modulePath, 'loaded');
    
    if (ENV.IS_DEVELOPMENT) {
      console.log(`✅ Module loaded successfully: ${modulePath}`);
    }
    
    return loadedModule;
    
  } catch (error) {
    moduleStatus.set(modulePath, 'error');
    
    console.warn(`⚠️ Failed to load module: ${modulePath}`, error.message);
    
    if (fallback) {
      moduleCache.set(modulePath, fallback);
      return fallback;
    }
    
    throw error;
  }
};

/**
 * Load Supabase service with fallback
 */
export const loadSupabaseService = async () => {
  const fallbackService = {
    isAvailable: () => false,
    testConnection: () => Promise.resolve({ success: false }),
    auth: {
      signIn: () => Promise.reject(new Error('Supabase service not available')),
      signUp: () => Promise.reject(new Error('Supabase service not available')),
      signOut: () => Promise.reject(new Error('Supabase service not available'))
    },
    db: {
      select: () => Promise.reject(new Error('Supabase service not available')),
      insert: () => Promise.reject(new Error('Supabase service not available')),
      update: () => Promise.reject(new Error('Supabase service not available')),
      delete: () => Promise.reject(new Error('Supabase service not available'))
    }
  };

  return await safeModuleLoad('../services/supabaseService.js', fallbackService);
};

/**
 * Load any service with retry mechanism
 */
export const loadServiceWithRetry = async (servicePath, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await safeModuleLoad(servicePath);
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        console.warn(`Retry ${attempt}/${maxRetries} for ${servicePath} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError;
};

/**
 * Check if module is available
 */
export const isModuleAvailable = async (modulePath) => {
  try {
    await import(/* @vite-ignore */ modulePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get module loading status
 */
export const getModuleStatus = (modulePath) => {
  return {
    status: moduleStatus.get(modulePath) || 'not_loaded',
    cached: moduleCache.has(modulePath),
    module: moduleCache.get(modulePath) || null
  };
};

/**
 * Clear module cache (for development/testing)
 */
export const clearModuleCache = (modulePath = null) => {
  if (modulePath) {
    moduleCache.delete(modulePath);
    moduleStatus.delete(modulePath);
  } else {
    moduleCache.clear();
    moduleStatus.clear();
  }
  
  if (ENV.IS_DEVELOPMENT) {
    console.log('🧹 Module cache cleared');
  }
};

/**
 * Preload critical modules
 */
export const preloadCriticalModules = async () => {
  const criticalModules = [
    '../services/supabaseService.js',
    '../services/secureAuthService.js'
  ];

  const loadPromises = criticalModules.map(async (modulePath) => {
    try {
      await safeModuleLoad(modulePath);
      return { modulePath, success: true };
    } catch (error) {
      return { modulePath, success: false, error: error.message };
    }
  });

  const results = await Promise.allSettled(loadPromises);
  
  if (ENV.IS_DEVELOPMENT) {
    console.log('📦 Critical modules preload results:', results);
  }
  
  return results;
};

/**
 * Module compatibility checker
 */
export const checkModuleCompatibility = async () => {
  const compatibilityReport = {
    supabase: false,
    secureAuth: false,
    environment: ENV.NODE_ENV,
    timestamp: new Date().toISOString()
  };

  try {
    await loadSupabaseService();
    compatibilityReport.supabase = true;
  } catch (error) {
    console.warn('Supabase compatibility issue:', error.message);
  }

  try {
    await safeModuleLoad('../services/secureAuthService.js');
    compatibilityReport.secureAuth = true;
  } catch (error) {
    console.warn('SecureAuth compatibility issue:', error.message);
  }

  return compatibilityReport;
};

// Development helpers
if (ENV.IS_DEVELOPMENT) {
  window.moduleLoader = {
    load: safeModuleLoad,
    status: getModuleStatus,
    clear: clearModuleCache,
    preload: preloadCriticalModules,
    compatibility: checkModuleCompatibility
  };
}

export default {
  safeModuleLoad,
  loadSupabaseService,
  loadServiceWithRetry,
  isModuleAvailable,
  getModuleStatus,
  clearModuleCache,
  preloadCriticalModules,
  checkModuleCompatibility
};
