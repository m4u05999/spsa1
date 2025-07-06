#!/usr/bin/env node

/**
 * Environment Files Fixer
 * مصحح ملفات البيئة
 * 
 * Ensures all environment files have consistent API URL configuration
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
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

class EnvironmentFixer {
  constructor() {
    this.correctApiUrl = 'http://localhost:3001/api';
    this.incorrectApiUrl = 'http://localhost:3000/api';
    this.fixedFiles = [];
    this.issues = [];
  }

  checkAndFixFile(filePath, fileName) {
    if (!existsSync(filePath)) {
      logInfo(`${fileName} does not exist - skipping`);
      return;
    }

    try {
      const content = readFileSync(filePath, 'utf8');
      
      if (content.includes(this.incorrectApiUrl)) {
        logWarning(`Found incorrect API URL in ${fileName}`);
        
        // Fix the content
        const fixedContent = content.replace(
          new RegExp(this.incorrectApiUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          this.correctApiUrl
        );
        
        // Write back the fixed content
        writeFileSync(filePath, fixedContent, 'utf8');
        
        logSuccess(`Fixed API URL in ${fileName}`);
        this.fixedFiles.push(fileName);
        
      } else if (content.includes(this.correctApiUrl)) {
        logSuccess(`${fileName} already has correct API URL`);
        
      } else if (content.includes('VITE_API_URL')) {
        // Has VITE_API_URL but with different value
        const match = content.match(/VITE_API_URL=([^\n\r]+)/);
        if (match) {
          logWarning(`${fileName} has VITE_API_URL=${match[1]} - should be ${this.correctApiUrl}`);
          this.issues.push(`${fileName}: VITE_API_URL=${match[1]}`);
        }
        
      } else {
        logInfo(`${fileName} does not contain VITE_API_URL`);
      }
      
    } catch (error) {
      logError(`Failed to process ${fileName}: ${error.message}`);
      this.issues.push(`${fileName}: ${error.message}`);
    }
  }

  run() {
    log('🔧 Environment Files Fixer - SPSA', 'bold');
    log('=====================================', 'blue');
    
    logInfo(`Looking for incorrect API URL: ${this.incorrectApiUrl}`);
    logInfo(`Will replace with correct URL: ${this.correctApiUrl}`);
    
    // List of environment files to check
    const envFiles = [
      { path: join(projectRoot, '.env'), name: '.env' },
      { path: join(projectRoot, '.env.local'), name: '.env.local' },
      { path: join(projectRoot, '.env.development'), name: '.env.development' },
      { path: join(projectRoot, '.env.production'), name: '.env.production' },
      { path: join(projectRoot, '.env.test'), name: '.env.test' },
      { path: join(projectRoot, '.env.example'), name: '.env.example' }
    ];
    
    log('\n📁 Checking environment files:', 'blue');
    
    envFiles.forEach(({ path, name }) => {
      this.checkAndFixFile(path, name);
    });
    
    log('\n📊 Summary:', 'bold');
    logInfo(`Files checked: ${envFiles.length}`);
    logInfo(`Files fixed: ${this.fixedFiles.length}`);
    logInfo(`Issues found: ${this.issues.length}`);
    
    if (this.fixedFiles.length > 0) {
      log('\n✅ Fixed files:', 'green');
      this.fixedFiles.forEach(file => logSuccess(`  • ${file}`));
      
      log('\n💡 Next steps:', 'blue');
      logInfo('1. Restart Vite dev server: npm run dev');
      logInfo('2. Clear browser cache');
      logInfo('3. Verify API URL in console debug output');
    }
    
    if (this.issues.length > 0) {
      log('\n⚠️  Issues that need manual review:', 'yellow');
      this.issues.forEach(issue => logWarning(`  • ${issue}`));
    }
    
    if (this.fixedFiles.length === 0 && this.issues.length === 0) {
      logSuccess('🎉 All environment files are already correctly configured!');
    }
    
    return {
      fixedFiles: this.fixedFiles,
      issues: this.issues,
      success: this.issues.length === 0
    };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new EnvironmentFixer();
  const result = fixer.run();
  process.exit(result.success ? 0 : 1);
}

export default EnvironmentFixer;
