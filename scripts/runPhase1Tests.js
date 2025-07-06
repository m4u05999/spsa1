#!/usr/bin/env node

/**
 * Phase 1 Testing Script
 * سكريبت اختبار المرحلة الأولى
 * 
 * Runs comprehensive tests for Phase 1 components and generates report
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
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

const logSection = (title) => {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`${title}`, 'bold');
  log(`${'='.repeat(60)}`, 'blue');
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');
const logInfo = (message) => log(`ℹ️  ${message}`, 'blue');

class TestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      phase: 'Phase 1 - Integration Foundation',
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      performance: {},
      issues: [],
      recommendations: []
    };
  }

  async runTest(testName, testFile, description) {
    logInfo(`Running: ${testName}`);
    
    const startTime = Date.now();
    let result = {
      name: testName,
      file: testFile,
      description,
      status: 'unknown',
      duration: 0,
      output: '',
      error: null
    };

    try {
      const output = execSync(`npm test ${testFile}`, {
        cwd: projectRoot,
        encoding: 'utf8',
        timeout: 30000
      });
      
      result.status = 'passed';
      result.output = output;
      result.duration = Date.now() - startTime;
      
      logSuccess(`${testName} - PASSED (${result.duration}ms)`);
      this.results.summary.passed++;
      
    } catch (error) {
      result.status = 'failed';
      result.error = error.message;
      result.duration = Date.now() - startTime;
      
      logError(`${testName} - FAILED (${result.duration}ms)`);
      logError(`Error: ${error.message.split('\n')[0]}`);
      this.results.summary.failed++;
      
      this.results.issues.push({
        test: testName,
        error: error.message.split('\n')[0],
        severity: 'high'
      });
    }

    this.results.tests.push(result);
    this.results.summary.total++;
  }

  async checkSystemHealth() {
    logSection('System Health Check');
    
    const healthChecks = [
      {
        name: 'Node.js Version',
        check: () => {
          const version = process.version;
          const major = parseInt(version.slice(1).split('.')[0]);
          return { status: major >= 18, message: `Node.js ${version}` };
        }
      },
      {
        name: 'NPM Dependencies',
        check: () => {
          try {
            execSync('npm list --depth=0', { cwd: projectRoot, stdio: 'pipe' });
            return { status: true, message: 'All dependencies installed' };
          } catch {
            return { status: false, message: 'Missing dependencies' };
          }
        }
      },
      {
        name: 'TypeScript/JSDoc',
        check: () => {
          const hasTypes = existsSync(join(projectRoot, 'jsconfig.json')) || 
                          existsSync(join(projectRoot, 'tsconfig.json'));
          return { status: hasTypes, message: hasTypes ? 'Type checking available' : 'No type checking' };
        }
      },
      {
        name: 'Vite Configuration',
        check: () => {
          const hasViteConfig = existsSync(join(projectRoot, 'vite.config.js'));
          return { status: hasViteConfig, message: hasViteConfig ? 'Vite configured' : 'Vite config missing' };
        }
      }
    ];

    for (const check of healthChecks) {
      const result = check.check();
      if (result.status) {
        logSuccess(`${check.name}: ${result.message}`);
      } else {
        logWarning(`${check.name}: ${result.message}`);
        this.results.issues.push({
          test: 'System Health',
          error: `${check.name}: ${result.message}`,
          severity: 'medium'
        });
      }
    }
  }

  async runAllTests() {
    logSection('Phase 1 Integration Tests');
    
    const tests = [
      {
        name: 'Supabase Fix Verification',
        file: 'src/tests/supabaseFix.test.js',
        description: 'Verify Supabase PostgREST module issue is resolved'
      },
      {
        name: 'Module Compatibility',
        file: 'src/tests/moduleCompatibility.test.js',
        description: 'Test module loading and compatibility'
      },
      {
        name: 'System Integration',
        file: 'src/tests/systemIntegration.test.js',
        description: 'Comprehensive integration tests for all Phase 1 components'
      },
      {
        name: 'UnifiedApiService',
        file: 'src/tests/integration/unifiedApiService.test.js',
        description: 'Test UnifiedApiService with fallback mechanisms'
      },
      {
        name: 'AuthContext Integration',
        file: 'src/tests/integration/authContext.test.js',
        description: 'Test updated AuthContext with JWT support'
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.file, test.description);
    }
  }

  async checkPerformance() {
    logSection('Performance Analysis');
    
    try {
      // Bundle size analysis
      logInfo('Analyzing bundle size...');
      const buildOutput = execSync('npm run build', {
        cwd: projectRoot,
        encoding: 'utf8',
        timeout: 60000
      });
      
      this.results.performance.buildTime = 'Success';
      logSuccess('Build completed successfully');
      
      // Extract bundle size info if available
      const sizeMatch = buildOutput.match(/dist\/.*\.js\s+(\d+\.?\d*)\s*kB/);
      if (sizeMatch) {
        this.results.performance.bundleSize = sizeMatch[1] + ' kB';
        logInfo(`Bundle size: ${sizeMatch[1]} kB`);
      }
      
    } catch (error) {
      logError('Build failed');
      this.results.performance.buildTime = 'Failed';
      this.results.issues.push({
        test: 'Performance',
        error: 'Build failed',
        severity: 'high'
      });
    }
  }

  generateRecommendations() {
    logSection('Recommendations');
    
    const recommendations = [];
    
    if (this.results.summary.failed > 0) {
      recommendations.push('Fix failing tests before proceeding to Phase 2');
    }
    
    if (this.results.issues.some(i => i.severity === 'high')) {
      recommendations.push('Address high-severity issues immediately');
    }
    
    if (this.results.summary.passed / this.results.summary.total < 0.8) {
      recommendations.push('Improve test coverage before Phase 2');
    } else {
      recommendations.push('System is ready for Phase 2 development');
    }
    
    recommendations.push('Continue monitoring system performance');
    recommendations.push('Update documentation with any changes');
    
    this.results.recommendations = recommendations;
    
    recommendations.forEach(rec => logInfo(rec));
  }

  generateReport() {
    logSection('Test Report Generation');
    
    const reportDir = join(projectRoot, 'reports');
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }
    
    const reportFile = join(reportDir, `phase1-test-report-${Date.now()}.json`);
    const htmlReportFile = join(reportDir, `phase1-test-report-${Date.now()}.html`);
    
    // JSON Report
    writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    logSuccess(`JSON report saved: ${reportFile}`);
    
    // HTML Report
    const htmlReport = this.generateHTMLReport();
    writeFileSync(htmlReportFile, htmlReport);
    logSuccess(`HTML report saved: ${htmlReportFile}`);
    
    return { json: reportFile, html: htmlReportFile };
  }

  generateHTMLReport() {
    const { summary, tests, issues, recommendations } = this.results;
    const successRate = ((summary.passed / summary.total) * 100).toFixed(1);
    
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير اختبارات المرحلة الأولى - SPSA</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; }
        .test-results { margin-bottom: 30px; }
        .test-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; }
        .test-item.failed { border-left-color: #dc3545; }
        .issues { background: #fff3cd; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .recommendations { background: #d1ecf1; padding: 20px; border-radius: 5px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>تقرير اختبارات المرحلة الأولى</h1>
            <h2>الجمعية السعودية للعلوم السياسية</h2>
            <p class="timestamp">تم إنشاؤه في: ${new Date(this.results.timestamp).toLocaleString('ar-SA')}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">${summary.total}</div>
                <div>إجمالي الاختبارات</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.passed}</div>
                <div>اختبارات ناجحة</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.failed}</div>
                <div>اختبارات فاشلة</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${successRate}%</div>
                <div>معدل النجاح</div>
            </div>
        </div>
        
        <div class="test-results">
            <h3>نتائج الاختبارات</h3>
            ${tests.map(test => `
                <div class="test-item ${test.status}">
                    <h4>${test.name} <span class="${test.status === 'passed' ? 'success' : 'error'}">(${test.status.toUpperCase()})</span></h4>
                    <p>${test.description}</p>
                    <small>المدة: ${test.duration}ms</small>
                    ${test.error ? `<div class="error">خطأ: ${test.error}</div>` : ''}
                </div>
            `).join('')}
        </div>
        
        ${issues.length > 0 ? `
            <div class="issues">
                <h3>المشاكل المكتشفة</h3>
                <ul>
                    ${issues.map(issue => `<li><strong>${issue.test}:</strong> ${issue.error}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        <div class="recommendations">
            <h3>التوصيات</h3>
            <ul>
                ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  async run() {
    logSection('Phase 1 Testing Suite - SPSA');
    logInfo('Starting comprehensive testing for Phase 1 components...');
    
    await this.checkSystemHealth();
    await this.runAllTests();
    await this.checkPerformance();
    this.generateRecommendations();
    
    const reports = this.generateReport();
    
    logSection('Summary');
    logInfo(`Total Tests: ${this.results.summary.total}`);
    logSuccess(`Passed: ${this.results.summary.passed}`);
    if (this.results.summary.failed > 0) {
      logError(`Failed: ${this.results.summary.failed}`);
    }
    
    const successRate = ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1);
    logInfo(`Success Rate: ${successRate}%`);
    
    if (this.results.summary.failed === 0) {
      logSuccess('🎉 All tests passed! System is ready for Phase 2.');
    } else {
      logWarning('⚠️  Some tests failed. Review issues before proceeding.');
    }
    
    return this.results;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  runner.run().catch(console.error);
}

export default TestRunner;
