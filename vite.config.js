import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { generateCSPHeader, SECURITY_HEADERS } from './src/utils/security.js'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    base: '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    server: {
      port: 5173,
      open: true,
      // تطبيق headers الأمان
      headers: isDev ? {
        // Development mode - more permissive CSP
        'Content-Security-Policy': generateCSPHeader('development'),
        'Server': '',
        'X-Powered-By': '',
      } : {
        // Production mode - strict CSP
        'Content-Security-Policy': generateCSPHeader('production'),
        ...SECURITY_HEADERS,
        'Server': '',
        'X-Powered-By': '',
      },
      // تمكين CORS مع إعدادات آمنة
      cors: {
        origin: isDev ? true : ['https://political-science-assoc.com'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
      },
      // إعادة كتابة للمسارات لدعم التوجيه العميق مع React Router
      historyApiFallback: true,

      // File system security
      fs: {
        strict: true,
        allow: ['..'],
        deny: ['.env', '.env.*', '*.key', '*.pem', '*.crt']
      },
    },
    // إعداد خاص لمنع استخدام eval في development
    esbuild: {
      // منع استخدام eval في جميع البيئات
      legalComments: 'none',
      ...(isDev && {
        // في development mode، استخدم source maps بدلاً من eval
        sourcemap: true,
        minify: false
      })
    },

    build: {
      outDir: 'dist',
      sourcemap: false, // Disable source maps in production for security
      minify: 'terser',
      rollupOptions: {
        output: {
          // تقسيم الكود المحسن للأداء
          manualChunks: (id) => {
            // React core
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }

            // Router
            if (id.includes('react-router')) {
              return 'router';
            }

            // UI Libraries
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'ui-vendor';
            }

            // Supabase
            if (id.includes('@supabase') || id.includes('postgrest')) {
              return 'supabase';
            }

            // Utils and services
            if (id.includes('/src/utils/') || id.includes('/src/services/')) {
              return 'utils';
            }

            // Components
            if (id.includes('/src/components/')) {
              return 'components';
            }

            // Pages
            if (id.includes('/src/pages/')) {
              return 'pages';
            }

            // Other node_modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
              return `assets/images/[name]-[hash].${ext}`;
            }
            if (/\.(css)$/i.test(assetInfo.name)) {
              return `assets/css/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          }
        }
      },
      chunkSizeWarningLimit: 2000,
      assetsInlineLimit: 4096,
      cssCodeSplit: true,

      // Security: Remove comments and console logs in production
      terserOptions: {
        compress: {
          drop_console: !isDev,
          drop_debugger: !isDev,
        },
        format: {
          comments: false,
        },
      },
    },

    optimizeDeps: {
      // تضمين المكتبات الرئيسية
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled'
      ],
      // Force include Supabase packages to resolve module conflicts
      force: true,
      // Handle Supabase ESM/CJS compatibility
      esbuildOptions: {
        target: 'es2020'
      }
    },

    // Environment variables security
    define: {
      __DEV__: isDev,
      'process.env.NODE_ENV': JSON.stringify(mode),
      global: 'globalThis'
    },

    // إضافة تكوين خاص لحل مشاكل Supabase ESM/CJS
    ssr: {
      noExternal: ['@supabase/supabase-js', '@supabase/postgrest-js']
    },

    // Vitest configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.js'],
      css: true,
      reporters: ['verbose'],
      coverage: {
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/tests/',
          '**/*.d.ts',
        ],
      },
      // Handle Canvas and other browser APIs
      deps: {
        inline: ['canvas']
      },
      // Increase timeout for slow tests
      testTimeout: 10000,
      hookTimeout: 10000,
      // Handle JSX files in tests
      transformMode: {
        web: [/\.[jt]sx?$/],
      },
      // Resolve JSX imports
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
      // ESBuild options for JSX
      esbuild: {
        loader: 'jsx',
        include: /\.(js|jsx|tsx)$/,
        exclude: [],
      },
    },
  }
})