/**
 * Jest Configuration for SPSA Project
 * تكوين Jest لمشروع الجمعية السعودية للعلوم السياسية
 */

export default {
  // البيئة التي سيتم تشغيل الاختبارات فيها
  testEnvironment: 'jsdom',

  // أنماط الملفات التي سيتم اختبارها
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],

  // الملفات التي سيتم تجاهلها
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],

  // إعداد التحويل للملفات
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }]
  },

  // إعداد الوحدات
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1'
  },

  // ملفات الإعداد التي سيتم تشغيلها قبل الاختبارات
  setupFilesAfterEnv: [
    '<rootDir>/src/tests/setup.js'
  ],

  // تغطية الكود
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.jsx',
    '!src/vite-env.d.ts',
    '!src/tests/**',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.config.{js,jsx,ts,tsx}'
  ],

  // تقرير التغطية
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],

  // مجلد تقارير التغطية
  coverageDirectory: 'coverage',

  // حدود التغطية المطلوبة
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // إعدادات إضافية للبيئة
  testEnvironmentOptions: {
    url: 'http://localhost:5173'
  },

  // المتغيرات العامة
  globals: {
    'process.env.NODE_ENV': 'test'
  },

  // إعداد المهلة الزمنية للاختبارات
  testTimeout: 10000,

  // إعداد التنظيف التلقائي للـ mocks
  clearMocks: true,
  restoreMocks: true,

  // إعداد التقارير
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage/html-report',
      filename: 'report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'SPSA Test Report',
      logoImgPath: undefined,
      inlineSource: false
    }]
  ],

  // إعداد ملفات CSS والأصول الثابتة
  moduleNameMapping: {
    ...moduleNameMapping,
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/tests/__mocks__/fileMock.js'
  },

  // إعداد verbose للحصول على تفاصيل أكثر
  verbose: true,

  // إعداد الألوان في التقارير
  colors: true,

  // إعداد التشغيل المتوازي
  maxWorkers: '50%',

  // إعداد cache
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest'
};
