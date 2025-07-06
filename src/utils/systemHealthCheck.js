/**
 * System Health Check Utility
 * أداة فحص صحة النظام
 * 
 * Comprehensive system health verification
 */

/**
 * Perform comprehensive system health check
 */
export const performSystemHealthCheck = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    overall: 'unknown',
    checks: {},
    recommendations: []
  };

  console.group('🏥 System Health Check - SPSA');

  try {
    // 1. Environment Configuration Check
    results.checks.environment = await checkEnvironmentHealth();
    
    // 2. Module Loading Check
    results.checks.moduleLoading = await checkModuleLoading();
    
    // 3. Service Integration Check
    results.checks.serviceIntegration = await checkServiceIntegration();
    
    // 4. Fallback Mechanisms Check
    results.checks.fallbackMechanisms = await checkFallbackMechanisms();
    
    // 5. Feature Flags Check
    results.checks.featureFlags = await checkFeatureFlags();
    
    // Determine overall health
    const allChecks = Object.values(results.checks);
    const healthyChecks = allChecks.filter(check => check.status === 'healthy').length;
    const totalChecks = allChecks.length;
    
    if (healthyChecks === totalChecks) {
      results.overall = 'healthy';
    } else if (healthyChecks >= totalChecks * 0.8) {
      results.overall = 'warning';
    } else {
      results.overall = 'critical';
    }
    
    // Generate recommendations
    results.recommendations = generateRecommendations(results.checks);
    
    // Log summary
    logHealthSummary(results);
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    results.overall = 'critical';
    results.error = error.message;
  }

  console.groupEnd();
  return results;
};

/**
 * Check environment configuration health
 */
const checkEnvironmentHealth = async () => {
  const check = {
    name: 'Environment Configuration',
    status: 'unknown',
    details: {},
    issues: []
  };

  try {
    // Check Vite environment variables
    const viteApiUrl = import.meta.env.VITE_API_URL;
    const viteAppEnv = import.meta.env.VITE_APP_ENV;
    const isDev = import.meta.env.DEV;

    check.details.viteApiUrl = viteApiUrl;
    check.details.viteAppEnv = viteAppEnv;
    check.details.isDev = isDev;

    // Check if API URL is correct for development
    if (isDev && viteApiUrl !== 'http://localhost:3001/api') {
      check.issues.push(`API URL should be 'http://localhost:3001/api' for development, got: ${viteApiUrl}`);
    }

    // Check if required variables are present
    if (!viteApiUrl) {
      check.issues.push('VITE_API_URL is not set');
    }

    // Check processed ENV object
    const { ENV } = await import('../config/environment.js');
    check.details.processedApiUrl = ENV.API_URL;
    check.details.isProduction = ENV.IS_PRODUCTION;

    check.status = check.issues.length === 0 ? 'healthy' : 'warning';
    console.log(`✅ Environment: ${check.status}`);

  } catch (error) {
    check.status = 'critical';
    check.error = error.message;
    console.error(`❌ Environment: ${error.message}`);
  }

  return check;
};

/**
 * Check module loading health
 */
const checkModuleLoading = async () => {
  const check = {
    name: 'Module Loading',
    status: 'unknown',
    details: {},
    issues: []
  };

  try {
    // Test Supabase service loading
    const { loadSupabaseService } = await import('./moduleLoader.js');
    const supabaseService = await loadSupabaseService();
    
    check.details.supabaseLoaded = !!supabaseService;
    check.details.supabaseAvailable = supabaseService.isAvailable();

    if (!supabaseService) {
      check.issues.push('Failed to load Supabase service');
    }

    // Test other critical modules
    const modules = [
      '../services/unifiedApiService.js',
      '../config/featureFlags.js',
      '../utils/monitoring.js'
    ];

    for (const modulePath of modules) {
      try {
        await import(modulePath);
        check.details[`${modulePath.split('/').pop()}`] = 'loaded';
      } catch (error) {
        check.issues.push(`Failed to load ${modulePath}: ${error.message}`);
      }
    }

    check.status = check.issues.length === 0 ? 'healthy' : 'warning';
    console.log(`✅ Module Loading: ${check.status}`);

  } catch (error) {
    check.status = 'critical';
    check.error = error.message;
    console.error(`❌ Module Loading: ${error.message}`);
  }

  return check;
};

/**
 * Check service integration health
 */
const checkServiceIntegration = async () => {
  const check = {
    name: 'Service Integration',
    status: 'unknown',
    details: {},
    issues: []
  };

  try {
    // Test UnifiedApiService
    const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
    const serviceStatus = unifiedApiService.getServiceStatus();
    
    check.details.unifiedApiService = serviceStatus;

    // Test Enhanced Content Service
    const { default: enhancedContentService } = await import('../services/enhancedContentService.js');
    const contentServiceStatus = enhancedContentService.getServiceStatus();
    
    check.details.enhancedContentService = contentServiceStatus;

    if (!contentServiceStatus.fallbackAvailable) {
      check.issues.push('Enhanced Content Service fallback not available');
    }

    check.status = check.issues.length === 0 ? 'healthy' : 'warning';
    console.log(`✅ Service Integration: ${check.status}`);

  } catch (error) {
    check.status = 'critical';
    check.error = error.message;
    console.error(`❌ Service Integration: ${error.message}`);
  }

  return check;
};

/**
 * Check fallback mechanisms health
 */
const checkFallbackMechanisms = async () => {
  const check = {
    name: 'Fallback Mechanisms',
    status: 'unknown',
    details: {},
    issues: []
  };

  try {
    // Mock fetch to test fallback
    const originalFetch = global.fetch;
    global.fetch = () => Promise.reject(new Error('Connection refused'));

    // Test UnifiedApiService fallback
    const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
    const backendHealth = await unifiedApiService.checkNewBackendHealth();
    const supabaseHealth = await unifiedApiService.checkSupabaseHealth();

    check.details.backendHealthCheck = typeof backendHealth === 'boolean';
    check.details.supabaseHealthCheck = typeof supabaseHealth === 'boolean';

    // Test Enhanced Content Service fallback
    const { default: enhancedContentService } = await import('../services/enhancedContentService.js');
    const serviceStatus = enhancedContentService.getServiceStatus();

    check.details.contentServiceFallback = serviceStatus.fallbackAvailable;

    if (!serviceStatus.fallbackAvailable) {
      check.issues.push('Content service fallback not available');
    }

    // Restore fetch
    global.fetch = originalFetch;

    check.status = check.issues.length === 0 ? 'healthy' : 'warning';
    console.log(`✅ Fallback Mechanisms: ${check.status}`);

  } catch (error) {
    check.status = 'critical';
    check.error = error.message;
    console.error(`❌ Fallback Mechanisms: ${error.message}`);
  }

  return check;
};

/**
 * Check feature flags health
 */
const checkFeatureFlags = async () => {
  const check = {
    name: 'Feature Flags',
    status: 'unknown',
    details: {},
    issues: []
  };

  try {
    const { getFeatureFlag, getAllFeatureFlags } = await import('../config/featureFlags.js');
    
    const allFlags = getAllFeatureFlags();
    check.details.totalFlags = Object.keys(allFlags).length;
    check.details.enabledFlags = Object.values(allFlags).filter(Boolean).length;

    // Test critical flags
    const criticalFlags = ['USE_NEW_AUTH', 'ENABLE_NEW_BACKEND'];
    criticalFlags.forEach(flag => {
      const value = getFeatureFlag(flag);
      check.details[flag] = value;
      
      if (typeof value !== 'boolean') {
        check.issues.push(`Feature flag ${flag} is not boolean`);
      }
    });

    check.status = check.issues.length === 0 ? 'healthy' : 'warning';
    console.log(`✅ Feature Flags: ${check.status}`);

  } catch (error) {
    check.status = 'critical';
    check.error = error.message;
    console.error(`❌ Feature Flags: ${error.message}`);
  }

  return check;
};

/**
 * Generate recommendations based on check results
 */
const generateRecommendations = (checks) => {
  const recommendations = [];

  Object.values(checks).forEach(check => {
    if (check.status === 'critical') {
      recommendations.push(`CRITICAL: Fix ${check.name} - ${check.error || 'Multiple issues detected'}`);
    } else if (check.status === 'warning' && check.issues.length > 0) {
      recommendations.push(`WARNING: ${check.name} - ${check.issues.join(', ')}`);
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('✅ All systems are healthy - ready for Phase 3 development');
  } else {
    recommendations.push('🔧 Address the above issues before proceeding to Phase 3');
  }

  return recommendations;
};

/**
 * Log health summary
 */
const logHealthSummary = (results) => {
  console.log('\n📊 Health Check Summary:');
  console.log(`Overall Status: ${results.overall.toUpperCase()}`);
  
  Object.entries(results.checks).forEach(([name, check]) => {
    const icon = check.status === 'healthy' ? '✅' : 
                 check.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.status}`);
  });

  if (results.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    results.recommendations.forEach(rec => console.log(`  • ${rec}`));
  }
};

/**
 * Auto-run health check in development
 */
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
  // Run health check after other modules are loaded
  setTimeout(async () => {
    await performSystemHealthCheck();
  }, 2000);
}

export default {
  performSystemHealthCheck,
  checkEnvironmentHealth,
  checkModuleLoading,
  checkServiceIntegration,
  checkFallbackMechanisms,
  checkFeatureFlags
};
