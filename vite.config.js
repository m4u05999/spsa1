import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    // تعطيل سياسة CSP في بيئة التطوير المحلية
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; img-src 'self' data: https://images.unsplash.com;",
    },
    // تمكين CORS للسماح بالاتصالات الخارجية
    cors: true,
    // إعادة كتابة للمسارات لدعم التوجيه العميق مع React Router
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild', // تغيير طريقة التصغير من terser إلى esbuild
    rollupOptions: {
      output: {
        // إلغاء تقسيم الكود يدوياً لتجنب مشاكل التبعيات
        manualChunks: undefined,
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 4096,
    cssCodeSplit: true
  },
  optimizeDeps: {
    // تضمين المكتبات الرئيسية
    include: ['react', 'react-dom', 'react-router-dom']
  }
})