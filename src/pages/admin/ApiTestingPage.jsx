/**
 * API Testing Page
 * صفحة اختبار APIs
 * 
 * Comprehensive testing interface for all API services
 */

import React, { useState, useEffect } from 'react';
import { 
  apiManager,
  userManagementApi,
  contentManagementApi,
  categoryManagementApi,
  basicOperationsApi,
  USER_ROLES,
  CONTENT_TYPES,
  CATEGORY_TYPES
} from '../../services/api/index.js';
// import './ApiTestingPage.css';

/**
 * ApiTestingPage Component
 * مكون صفحة اختبار APIs
 */
const ApiTestingPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [servicesStatus, setServicesStatus] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadServicesStatus();
  }, []);

  /**
   * Load services status
   * تحميل حالة الخدمات
   */
  const loadServicesStatus = async () => {
    try {
      setIsLoading(true);
      
      // Initialize APIs if not already initialized
      await apiManager.initialize();
      
      // Get services status
      const status = apiManager.getServicesStatus();
      setServicesStatus(status);
      
    } catch (error) {
      console.error('Failed to load services status:', error);
      addTestResult('System', 'Load Status', false, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add test result
   * إضافة نتيجة اختبار
   */
  const addTestResult = (service, operation, success, data) => {
    const result = {
      id: Date.now(),
      service,
      operation,
      success,
      data,
      timestamp: new Date().toLocaleString('ar-SA')
    };
    
    setTestResults(prev => [result, ...prev.slice(0, 19)]); // Keep last 20 results
  };

  /**
   * Test user management API
   * اختبار API إدارة المستخدمين
   */
  const testUserManagementApi = async () => {
    try {
      // Test get users
      const usersResult = await userManagementApi.getUsers({ limit: 5 });
      addTestResult('Users', 'Get Users', usersResult.success, usersResult);

      // Test create user
      const createResult = await userManagementApi.createUser({
        email: 'test@spsa.org.sa',
        firstName: 'مستخدم',
        lastName: 'تجريبي',
        role: USER_ROLES.MEMBER
      });
      addTestResult('Users', 'Create User', createResult.success, createResult);

      // Test search users
      const searchResult = await userManagementApi.searchUsers('test', { limit: 5 });
      addTestResult('Users', 'Search Users', searchResult.success, searchResult);

      // Test get statistics
      const statsResult = await userManagementApi.getUserStatistics();
      addTestResult('Users', 'Get Statistics', statsResult.success, statsResult);

    } catch (error) {
      addTestResult('Users', 'API Test', false, error.message);
    }
  };

  /**
   * Test content management API
   * اختبار API إدارة المحتوى
   */
  const testContentManagementApi = async () => {
    try {
      // Test get content
      const contentResult = await contentManagementApi.getContent({ limit: 5 });
      addTestResult('Content', 'Get Content', contentResult.success, contentResult);

      // Test create content
      const createResult = await contentManagementApi.createContent({
        title: 'مقال تجريبي',
        content: 'محتوى المقال التجريبي',
        type: CONTENT_TYPES.ARTICLE,
        author: 'مؤلف تجريبي'
      });
      addTestResult('Content', 'Create Content', createResult.success, createResult);

      // Test search content
      const searchResult = await contentManagementApi.searchContent('تجريبي', { limit: 5 });
      addTestResult('Content', 'Search Content', searchResult.success, searchResult);

      // Test get featured content
      const featuredResult = await contentManagementApi.getFeaturedContent('', 3);
      addTestResult('Content', 'Get Featured', featuredResult.success, featuredResult);

      // Test get statistics
      const statsResult = await contentManagementApi.getContentStatistics();
      addTestResult('Content', 'Get Statistics', statsResult.success, statsResult);

    } catch (error) {
      addTestResult('Content', 'API Test', false, error.message);
    }
  };

  /**
   * Test category management API
   * اختبار API إدارة الفئات
   */
  const testCategoryManagementApi = async () => {
    try {
      // Test get categories
      const categoriesResult = await categoryManagementApi.getCategories({ limit: 10 });
      addTestResult('Categories', 'Get Categories', categoriesResult.success, categoriesResult);

      // Test create category
      const createResult = await categoryManagementApi.createCategory({
        name: 'فئة تجريبية',
        description: 'وصف الفئة التجريبية',
        type: CATEGORY_TYPES.CONTENT
      });
      addTestResult('Categories', 'Create Category', createResult.success, createResult);

      // Test get category tree
      const treeResult = await categoryManagementApi.getCategoryTree();
      addTestResult('Categories', 'Get Tree', treeResult.success, treeResult);

      // Test get tags
      const tagsResult = await categoryManagementApi.getTags({ limit: 10 });
      addTestResult('Categories', 'Get Tags', tagsResult.success, tagsResult);

      // Test create tag
      const tagResult = await categoryManagementApi.createTag({
        name: 'علامة تجريبية',
        description: 'وصف العلامة التجريبية'
      });
      addTestResult('Categories', 'Create Tag', tagResult.success, tagResult);

    } catch (error) {
      addTestResult('Categories', 'API Test', false, error.message);
    }
  };

  /**
   * Test basic operations API
   * اختبار API العمليات الأساسية
   */
  const testBasicOperationsApi = async () => {
    try {
      // Test global search
      const searchResult = await basicOperationsApi.globalSearch('السياسة', { limit: 5 });
      addTestResult('Operations', 'Global Search', searchResult.success, searchResult);

      // Test get search suggestions
      const suggestionsResult = await basicOperationsApi.getSearchSuggestions('سياسة', 5);
      addTestResult('Operations', 'Search Suggestions', suggestionsResult.success, suggestionsResult);

      // Test get system analytics
      const analyticsResult = await basicOperationsApi.getSystemAnalytics('month');
      addTestResult('Operations', 'System Analytics', analyticsResult.success, analyticsResult);

      // Test get system info
      const infoResult = await basicOperationsApi.getSystemInfo();
      addTestResult('Operations', 'System Info', infoResult.success, infoResult);

      // Test get system health
      const healthResult = await basicOperationsApi.getSystemHealth();
      addTestResult('Operations', 'System Health', healthResult.success, healthResult);

      // Test get system statistics
      const statsResult = await basicOperationsApi.getSystemStatistics();
      addTestResult('Operations', 'System Statistics', statsResult.success, statsResult);

    } catch (error) {
      addTestResult('Operations', 'API Test', false, error.message);
    }
  };

  /**
   * Test all APIs
   * اختبار جميع APIs
   */
  const testAllApis = async () => {
    setIsLoading(true);
    
    try {
      await testUserManagementApi();
      await testContentManagementApi();
      await testCategoryManagementApi();
      await testBasicOperationsApi();
      
      addTestResult('System', 'All APIs Test', true, 'تم اختبار جميع APIs بنجاح');
      
    } catch (error) {
      addTestResult('System', 'All APIs Test', false, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Perform health check
   * إجراء فحص الصحة
   */
  const performHealthCheck = async () => {
    try {
      setIsLoading(true);
      
      const healthResult = await apiManager.healthCheck();
      addTestResult('System', 'Health Check', healthResult.status === 'healthy', healthResult);
      
    } catch (error) {
      addTestResult('System', 'Health Check', false, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear all caches
   * مسح جميع ذاكرات التخزين المؤقت
   */
  const clearAllCaches = () => {
    try {
      apiManager.clearAllCaches();
      addTestResult('System', 'Clear Caches', true, 'تم مسح جميع ذاكرات التخزين المؤقت');
    } catch (error) {
      addTestResult('System', 'Clear Caches', false, error.message);
    }
  };

  /**
   * Clear test results
   * مسح نتائج الاختبار
   */
  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div className="api-testing-page">
      {/* Header */}
      <div className="page-header">
        <h1>اختبار APIs الأساسية</h1>
        <p>واجهة شاملة لاختبار جميع خدمات APIs في النظام</p>
        
        {isLoading && (
          <div className="loading-indicator">
            <span className="loading-spinner"></span>
            <span>جاري التحميل...</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          نظرة عامة
        </button>
        <button
          className={`nav-tab ${activeTab === 'testing' ? 'active' : ''}`}
          onClick={() => setActiveTab('testing')}
        >
          الاختبار
        </button>
        <button
          className={`nav-tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          النتائج ({testResults.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="services-status">
              <h2>حالة الخدمات</h2>
              
              {servicesStatus ? (
                <div className="status-grid">
                  <div className="status-card">
                    <h3>حالة النظام</h3>
                    <div className={`status-indicator ${servicesStatus.isInitialized ? 'healthy' : 'unhealthy'}`}>
                      {servicesStatus.isInitialized ? '✅ مهيأ' : '❌ غير مهيأ'}
                    </div>
                  </div>
                  
                  {Object.entries(servicesStatus.services).map(([name, status]) => (
                    <div key={name} className="status-card">
                      <h3>{name.toUpperCase()} API</h3>
                      <div className={`status-indicator ${status.isInitialized ? 'healthy' : 'unhealthy'}`}>
                        {status.isInitialized ? '✅ نشط' : '❌ غير نشط'}
                      </div>
                      <div className="status-details">
                        <p>مفعل: {status.isEnabled ? 'نعم' : 'لا'}</p>
                        {status.baseEndpoint && <p>المسار: {status.baseEndpoint}</p>}
                        {status.cacheSize !== undefined && <p>حجم التخزين المؤقت: {status.cacheSize}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="loading-placeholder">
                  <p>جاري تحميل حالة الخدمات...</p>
                </div>
              )}
            </div>

            <div className="quick-actions">
              <h2>إجراءات سريعة</h2>
              <div className="actions-grid">
                <button className="action-button" onClick={performHealthCheck} disabled={isLoading}>
                  🏥 فحص الصحة
                </button>
                <button className="action-button" onClick={testAllApis} disabled={isLoading}>
                  🧪 اختبار جميع APIs
                </button>
                <button className="action-button" onClick={clearAllCaches} disabled={isLoading}>
                  🧹 مسح التخزين المؤقت
                </button>
                <button className="action-button" onClick={loadServicesStatus} disabled={isLoading}>
                  🔄 تحديث الحالة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Testing Tab */}
        {activeTab === 'testing' && (
          <div className="testing-tab">
            <div className="test-sections">
              <div className="test-section">
                <h3>اختبار APIs المستخدمين</h3>
                <p>اختبار عمليات إدارة المستخدمين والعضوية</p>
                <button 
                  className="test-button users"
                  onClick={testUserManagementApi}
                  disabled={isLoading}
                >
                  👥 اختبار Users API
                </button>
              </div>

              <div className="test-section">
                <h3>اختبار APIs المحتوى</h3>
                <p>اختبار عمليات إدارة المقالات والأخبار والمنشورات</p>
                <button 
                  className="test-button content"
                  onClick={testContentManagementApi}
                  disabled={isLoading}
                >
                  📝 اختبار Content API
                </button>
              </div>

              <div className="test-section">
                <h3>اختبار APIs الفئات</h3>
                <p>اختبار عمليات إدارة الفئات والعلامات</p>
                <button 
                  className="test-button categories"
                  onClick={testCategoryManagementApi}
                  disabled={isLoading}
                >
                  🏷️ اختبار Categories API
                </button>
              </div>

              <div className="test-section">
                <h3>اختبار العمليات الأساسية</h3>
                <p>اختبار البحث والتحليلات ومعلومات النظام</p>
                <button 
                  className="test-button operations"
                  onClick={testBasicOperationsApi}
                  disabled={isLoading}
                >
                  ⚙️ اختبار Operations API
                </button>
              </div>
            </div>

            <div className="comprehensive-test">
              <h3>اختبار شامل</h3>
              <p>تشغيل جميع الاختبارات مرة واحدة</p>
              <button 
                className="test-button comprehensive"
                onClick={testAllApis}
                disabled={isLoading}
              >
                🚀 اختبار جميع APIs
              </button>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="results-tab">
            <div className="results-header">
              <h2>نتائج الاختبار</h2>
              <button 
                className="clear-button"
                onClick={clearTestResults}
                disabled={testResults.length === 0}
              >
                مسح النتائج
              </button>
            </div>

            <div className="results-list">
              {testResults.map((result) => (
                <div 
                  key={result.id} 
                  className={`result-item ${result.success ? 'success' : 'error'}`}
                >
                  <div className="result-header">
                    <span className="result-service">{result.service}</span>
                    <span className="result-operation">{result.operation}</span>
                    <span className="result-time">{result.timestamp}</span>
                    <span className={`result-status ${result.success ? 'success' : 'error'}`}>
                      {result.success ? '✅ نجح' : '❌ فشل'}
                    </span>
                  </div>
                  
                  <div className="result-data">
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                  </div>
                </div>
              ))}
              
              {testResults.length === 0 && (
                <div className="no-results">
                  <p>لا توجد نتائج اختبار بعد. قم بتشغيل اختبار لرؤية النتائج هنا.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTestingPage;
