// src/utils/theme.js

// تعريف الألوان الرئيسية للتطبيق
export const colors = {
  // الألوان الأساسية المستوحاة من الهوية السعودية
  primary: {
    50: '#f0f9f0',
    100: '#dcefdc',
    200: '#bbdfbb',
    300: '#93c893',
    400: '#6bac6b',
    500: '#1a8917',  // اللون الأخضر السعودي
    600: '#146e13',
    700: '#0f520f',
    800: '#0b3b0b',
    900: '#072907',
  },
  secondary: {
    50: '#fefbf6',
    100: '#fdf7ed',
    200: '#f9eacb',
    300: '#f5dca9',
    400: '#f1cf87',
    500: '#daa520',  // اللون الذهبي
    600: '#b88a1b',
    700: '#8a6813',
    800: '#5c460d',
    900: '#2e2306',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
};

// تعريف أنماط الأزرار
export const buttonStyles = {
  // زر أساسي
  primary: 'bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md px-4 py-2 transition-colors duration-300',
  
  // زر ثانوي
  secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white font-medium rounded-md px-4 py-2 transition-colors duration-300',
  
  // زر الإطار
  outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 font-medium rounded-md px-4 py-2 transition-colors duration-300',
  
  // زر الخطر
  danger: 'bg-red-600 hover:bg-red-700 text-white font-medium rounded-md px-4 py-2 transition-colors duration-300',
  
  // زر النجاح
  success: 'bg-green-600 hover:bg-green-700 text-white font-medium rounded-md px-4 py-2 transition-colors duration-300',
  
  // زر الإطار للنجاح
  successOutline: 'border border-green-600 text-green-600 hover:bg-green-50 font-medium rounded-md px-4 py-2 transition-colors duration-300',
  
  // زر الإطار للخطر
  dangerOutline: 'border border-red-600 text-red-600 hover:bg-red-50 font-medium rounded-md px-4 py-2 transition-colors duration-300',
  
  // زر معطل
  disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed font-medium rounded-md px-4 py-2',
  
  // زر شفاف
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 font-medium rounded-md px-4 py-2 transition-colors duration-300',
  
  // زر رابط
  link: 'bg-transparent text-primary-600 hover:text-primary-800 underline font-medium px-2 py-1 transition-colors duration-300',
};

// تعريف أنماط الحقول
export const inputStyles = {
  default: 'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full',
  error: 'border border-red-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full',
  disabled: 'bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-500 cursor-not-allowed w-full',
  
  // حقول مختلفة
  search: 'border border-gray-300 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full',
  textarea: 'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full min-h-[100px]',
};

// تعريف التأثيرات الحركية
export const transitions = {
  default: 'transition-all duration-300 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-500 ease-in-out',
  
  // تأثيرات محددة
  fadeIn: 'animate-fadeIn',
  fadeOut: 'animate-fadeOut',
  slideIn: 'animate-slideIn',
  slideOut: 'animate-slideOut',
  pulse: 'animate-pulse',
};

// تعريف الظلال
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  none: 'shadow-none',
  inner: 'shadow-inner',
};

// تعريف نقاط الكسر للتصميم المتجاوب
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// تعريف تباعدات الشبكة
export const spacing = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
};

// تعريف الخطوط
export const typography = {
  fontFamily: {
    sans: 'Tajawal, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    serif: 'Amiri, Georgia, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '4rem',
  },
};

// ضبط أنماط إضافية
export const utilities = {
  container: 'mx-auto px-4',
  section: 'py-12 md:py-16',
  card: 'bg-white rounded-lg shadow-md overflow-hidden',
  divider: 'border-t border-gray-200 my-6',
};

// أنماط البطاقات
export const cardStyles = {
  default: 'bg-white rounded-lg shadow-md overflow-hidden',
  pricing: 'bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all hover:shadow-lg',
  feature: 'bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all',
  dashboard: 'bg-white rounded-lg shadow-md p-6',
  profile: 'bg-white rounded-xl shadow-lg overflow-hidden',
  elevated: {
    shadow: 'shadow-lg',
    rounded: 'rounded-lg'
  },
};

export default {
  colors,
  buttonStyles,
  inputStyles,
  transitions,
  shadows,
  breakpoints,
  spacing,
  typography,
  utilities,
  cardStyles,
};