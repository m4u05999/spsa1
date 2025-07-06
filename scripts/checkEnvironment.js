#!/usr/bin/env node

/**
 * Environment Configuration Checker
 * فاحص تكوين البيئة
 * 
 * Checks if environment variables are properly configured
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');
const logInfo = (message) => log(`ℹ️  ${message}`, 'blue');

class EnvironmentChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.recommendations = [];
  }

  checkEnvFiles() {
    log('\n📁 Checking Environment Files:', 'bold');
    
    const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
    const foundFiles = [];
    
    envFiles.forEach(file => {
      const filePath = join(projectRoot, file);
      if (existsSync(filePath)) {
        foundFiles.push(file);
        logSuccess(`Found: ${file}`);
        
        try {
          const content = readFileSync(filePath, 'utf8');
          const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
          logInfo(`  Contains ${lines.length} environment variables`);
          
          // Check for required variables
          const hasApiUrl = content.includes('VITE_API_URL');
          const hasAppEnv = content.includes('VITE_APP_ENV');
          
          if (hasApiUrl) logSuccess(`  ✓ Contains VITE_API_URL`);
          if (hasAppEnv) logSuccess(`  ✓ Contains VITE_APP_ENV`);
          
          if (!hasApiUrl) {
            this.issues.push(`${file} missing VITE_API_URL`);
          }
          
        } catch (error) {
          this.issues.push(`Cannot read ${file}: ${error.message}`);
        }
      } else {
        logWarning(`Missing: ${file}`);
      }
    });
    
    if (foundFiles.length === 0) {
      this.issues.push('No environment files found');
    }
    
    return foundFiles;
  }

  checkEnvVariables() {
    log('\n🔧 Checking Environment Variables:', 'bold');
    
    const requiredVars = [
      { name: 'VITE_API_URL', expected: 'http://localhost:3001/api', description: 'Backend API URL' },
      { name: 'VITE_APP_ENV', expected: 'development', description: 'Application environment' },
      { name: 'VITE_ENABLE_NEW_BACKEND', expected: 'true', description: 'Enable new backend' }
    ];
    
    const optionalVars = [
      { name: 'VITE_USE_NEW_AUTH', description: 'Use new authentication system' },
      { name: 'VITE_ENABLE_DEBUG_MODE', description: 'Enable debug mode' },
      { name: 'VITE_SUPABASE_URL', description: 'Supabase URL for fallback' }
    ];
    
    // Check required variables
    requiredVars.forEach(({ name, expected, description }) => {
      const value = process.env[name];
      
      if (value) {
        if (expected && value === expected) {
          logSuccess(`${name}: ${value} ✓`);
        } else if (expected) {
          logWarning(`${name}: ${value} (expected: ${expected})`);
          this.warnings.push(`${name} has unexpected value`);
        } else {
          logSuccess(`${name}: ${value}`);
        }
      } else {
        logError(`${name}: NOT SET`);
        this.issues.push(`Required variable ${name} is not set`);
      }
      
      logInfo(`  ${description}`);
    });
    
    // Check optional variables
    log('\n📋 Optional Variables:', 'blue');
    optionalVars.forEach(({ name, description }) => {
      const value = process.env[name];
      
      if (value) {
        logSuccess(`${name}: ${value}`);
      } else {
        logInfo(`${name}: not set`);
      }
      
      logInfo(`  ${description}`);
    });
  }

  checkViteConfig() {
    log('\n⚙️ Checking Vite Configuration:', 'bold');
    
    const viteConfigPath = join(projectRoot, 'vite.config.js');
    
    if (existsSync(viteConfigPath)) {
      logSuccess('vite.config.js found');
      
      try {
        const content = readFileSync(viteConfigPath, 'utf8');
        
        // Check for environment variable handling
        if (content.includes('loadEnv')) {
          logSuccess('✓ Uses loadEnv for environment variables');
        } else {
          logInfo('Does not explicitly use loadEnv');
        }
        
        // Check for define configuration
        if (content.includes('define:')) {
          logSuccess('✓ Has define configuration');
        }
        
        // Check for environment mode handling
        if (content.includes('mode')) {
          logSuccess('✓ Handles environment modes');
        }
        
      } catch (error) {
        this.issues.push(`Cannot read vite.config.js: ${error.message}`);
      }
    } else {
      this.issues.push('vite.config.js not found');
    }
  }

  checkPackageJson() {
    log('\n📦 Checking Package Configuration:', 'bold');
    
    const packageJsonPath = join(projectRoot, 'package.json');
    
    if (existsSync(packageJsonPath)) {
      logSuccess('package.json found');
      
      try {
        const content = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        
        // Check for required dependencies
        const requiredDeps = ['vite', 'react', '@vitejs/plugin-react'];
        const devDeps = content.devDependencies || {};
        const deps = content.dependencies || {};
        const allDeps = { ...deps, ...devDeps };
        
        requiredDeps.forEach(dep => {
          if (allDeps[dep]) {
            logSuccess(`✓ ${dep}: ${allDeps[dep]}`);
          } else {
            this.issues.push(`Missing dependency: ${dep}`);
          }
        });
        
        // Check scripts
        const scripts = content.scripts || {};
        if (scripts.dev) {
          logSuccess(`✓ Dev script: ${scripts.dev}`);
        } else {
          this.issues.push('Missing dev script');
        }
        
      } catch (error) {
        this.issues.push(`Cannot parse package.json: ${error.message}`);
      }
    } else {
      this.issues.push('package.json not found');
    }
  }

  generateRecommendations() {
    log('\n💡 Recommendations:', 'bold');
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      logSuccess('Environment configuration looks good!');
      this.recommendations.push('Environment is properly configured');
      return;
    }
    
    if (this.issues.length > 0) {
      this.recommendations.push('Fix critical issues before running the application');
      
      if (this.issues.some(issue => issue.includes('VITE_API_URL'))) {
        this.recommendations.push('Create .env.local with VITE_API_URL=http://localhost:3001/api');
      }
      
      if (this.issues.some(issue => issue.includes('environment files'))) {
        this.recommendations.push('Create .env file with basic configuration');
      }
    }
    
    if (this.warnings.length > 0) {
      this.recommendations.push('Review warning messages and adjust configuration if needed');
    }
    
    this.recommendations.push('Restart Vite dev server after changing environment files');
    this.recommendations.push('Clear browser cache if issues persist');
    
    this.recommendations.forEach(rec => logInfo(rec));
  }

  generateSampleEnvFile() {
    if (this.issues.some(issue => issue.includes('environment files') || issue.includes('VITE_API_URL'))) {
      log('\n📝 Sample .env.local file:', 'bold');
      
      const sampleEnv = `# Development Environment Variables
VITE_APP_ENV=development
VITE_API_URL=http://localhost:3001/api
VITE_ENABLE_NEW_BACKEND=true
VITE_USE_NEW_AUTH=true
VITE_ENABLE_DEBUG_MODE=true`;
      
      console.log(sampleEnv);
      
      logInfo('Copy the above content to .env.local file in your project root');
    }
  }

  run() {
    log('🔍 Environment Configuration Checker - SPSA', 'bold');
    log('================================================', 'blue');
    
    this.checkEnvFiles();
    this.checkEnvVariables();
    this.checkViteConfig();
    this.checkPackageJson();
    this.generateRecommendations();
    this.generateSampleEnvFile();
    
    log('\n📊 Summary:', 'bold');
    logInfo(`Issues found: ${this.issues.length}`);
    logInfo(`Warnings: ${this.warnings.length}`);
    logInfo(`Recommendations: ${this.recommendations.length}`);
    
    if (this.issues.length === 0) {
      logSuccess('✅ Environment configuration is healthy!');
      return true;
    } else {
      logError('❌ Environment configuration needs attention');
      
      log('\n🚨 Issues to fix:', 'red');
      this.issues.forEach(issue => logError(`  • ${issue}`));
      
      if (this.warnings.length > 0) {
        log('\n⚠️  Warnings:', 'yellow');
        this.warnings.forEach(warning => logWarning(`  • ${warning}`));
      }
      
      return false;
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new EnvironmentChecker();
  const isHealthy = checker.run();
  process.exit(isHealthy ? 0 : 1);
}

export default EnvironmentChecker;
