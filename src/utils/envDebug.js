/**
 * Environment Debug Utility
 * أداة تشخيص متغيرات البيئة
 * 
 * Helps debug environment variable loading issues
 */

/**
 * Debug environment variables loading
 */
export const debugEnvironment = async () => {
  console.group('🔧 Environment Debug Information');

  // Raw Vite environment variables
  console.log('📦 Raw Vite Env Variables:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
    VITE_ENABLE_NEW_BACKEND: import.meta.env.VITE_ENABLE_NEW_BACKEND,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD
  });

  // All VITE_ variables
  const viteVars = Object.keys(import.meta.env)
    .filter(key => key.startsWith('VITE_'))
    .reduce((acc, key) => {
      acc[key] = import.meta.env[key];
      return acc;
    }, {});

  console.log('🌍 All VITE_ Variables:', viteVars);

  // Check if .env files are being loaded
  console.log('📁 Environment File Detection:', {
    hasViteApiUrl: !!import.meta.env.VITE_API_URL,
    apiUrlValue: import.meta.env.VITE_API_URL,
    expectedForDev: 'http://localhost:3001/api',
    isCorrect: import.meta.env.VITE_API_URL === 'http://localhost:3001/api'
  });

  // Check processed ENV object
  try {
    const { ENV } = await import('../config/environment.js');
    console.log('⚙️ Processed ENV Object:', {
      API_URL: ENV.API_URL,
      APP_ENV: ENV.APP_ENV,
      IS_DEVELOPMENT: ENV.IS_DEVELOPMENT,
      NODE_ENV: ENV.NODE_ENV
    });
  } catch (error) {
    console.error('❌ Failed to load ENV object:', error);
  }

  console.groupEnd();
};

/**
 * Check if environment is properly configured
 */
export const checkEnvironmentHealth = () => {
  const issues = [];
  
  // Check if VITE_API_URL is set
  if (!import.meta.env.VITE_API_URL) {
    issues.push('VITE_API_URL is not set');
  }
  
  // Check if API URL is correct for development
  if (import.meta.env.MODE === 'development' && 
      import.meta.env.VITE_API_URL !== 'http://localhost:3001/api') {
    issues.push(`API URL should be 'http://localhost:3001/api' for development, got: ${import.meta.env.VITE_API_URL}`);
  }
  
  // Check if required VITE_ variables are present
  const requiredVars = [
    'VITE_API_URL',
    'VITE_APP_ENV',
    'VITE_ENABLE_NEW_BACKEND'
  ];
  
  requiredVars.forEach(varName => {
    if (import.meta.env[varName] === undefined) {
      issues.push(`Required variable ${varName} is missing`);
    }
  });
  
  return {
    isHealthy: issues.length === 0,
    issues,
    recommendations: issues.length > 0 ? [
      'Check if .env and .env.local files exist in project root',
      'Restart Vite dev server after changing .env files',
      'Ensure all VITE_ prefixed variables are properly set'
    ] : []
  };
};

/**
 * Auto-run debug in development
 */
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
  // Run debug after a short delay to ensure other modules are loaded
  setTimeout(async () => {
    await debugEnvironment();

    const health = checkEnvironmentHealth();
    if (!health.isHealthy) {
      console.group('⚠️ Environment Issues Detected');
      health.issues.forEach(issue => console.warn('❌', issue));
      console.log('💡 Recommendations:');
      health.recommendations.forEach(rec => console.log('  •', rec));
      console.groupEnd();
    } else {
      console.log('✅ Environment configuration is healthy');
    }
  }, 1000);
}

export default {
  debugEnvironment,
  checkEnvironmentHealth
};
