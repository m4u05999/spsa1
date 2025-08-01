/**
 * Local Image Placeholders
 * صور محلية بديلة للصور الخارجية
 * 
 * This file provides local alternatives to external images for better performance and security
 */

// Base64 encoded placeholder images for different content types
export const LOCAL_PLACEHOLDERS = {
  // Article placeholder - blue theme
  article: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMEVBNUU5Ii8+CjxwYXRoIGQ9Ik0xNjAgMTAwSDI0MFYxMjBIMTYwVjEwMFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8cGF0aCBkPSJNMTYwIDEzMEgyMDBWMTQwSDE2MFYxMzBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjYiLz4KPHN2ZyB4PSIxMDAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ij4KPHA+YXRoIGQ9Ik0xNCAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOGwtNi02eiIvPgo8cGF0aCBkPSJNMTQgMnY2aDZNMTYgMTNIOHYtMWg4djF6bTAgMkg4di0xaDh2MXptLTMgMkg4di0xaDV2MXoiLz4KPC9zdmc+Cjwvc3ZnPg==',
  
  // News placeholder - green theme
  news: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMTBCOTgxIi8+CjxwYXRoIGQ9Ik0xNjAgMTAwSDI0MFYxMjBIMTYwVjEwMFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8cGF0aCBkPSJNMTYwIDEzMEgyMDBWMTQwSDE2MFYxMzBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjYiLz4KPHN2ZyB4PSIxMDAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ij4KPHA+YXRoIGQ9Ik00IDZoMTZ2MmgtMTZWNnptMCA1aDE2djJINFYxMXptMCA1aDE2djJINFYxNnoiLz4KPC9zdmc+Cjwvc3ZnPg==',
  
  // Event placeholder - purple theme
  event: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjODMzQUI0Ii8+CjxwYXRoIGQ9Ik0xNjAgMTAwSDI0MFYxMjBIMTYwVjEwMFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8cGF0aCBkPSJNMTYwIDEzMEgyMDBWMTQwSDE2MFYxMzBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjYiLz4KPHN2ZyB4PSIxMDAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ij4KPHA+YXRoIGQ9Ik0xOSAzaC0xVjFoLTJ2Mkg4VjFINnYySDVhMiAyIDAgMCAwLTIgMnYxNGEyIDIgMCAwIDAgMiAyaDE0YTIgMiAwIDAgMCAyLTJWNWEyIDIgMCAwIDAtMi0yem0wIDE2SDVWOGgxNHY5eiIvPgo8L3N2Zz4KPC9zdmc+',
  
  // Research placeholder - indigo theme
  research: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjNjM2NkYxIi8+CjxwYXRoIGQ9Ik0xNjAgMTAwSDI0MFYxMjBIMTYwVjEwMFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8cGF0aCBkPSJNMTYwIDEzMEgyMDBWMTQwSDE2MFYxMzBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjYiLz4KPHN2ZyB4PSIxMDAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ij4KPHA+YXRoIGQ9Ik0xNS41IDE0aC0uNzlsLS4yOC0uMjdDMTUuNDEgMTIuNTkgMTYgMTEuMTEgMTYgOS41IDE2IDUuOTEgMTMuMDkgMyA5LjUgM1MzIDUuOTEgMyA5LjUgNS45MSAxNiA5LjUgMTZjMS42MSAwIDMuMDktLjU5IDQuMjMtMS41N2wuMjcuMjh2Ljc5bDUgNC45OUwyMC40OSAxOWwtNC45OS01em0tNiAwQzcuMDEgMTQgNSAxMS45OSA1IDkuNVM3LjAxIDUgOS41IDUgMTQgNy4wMSAxNCA5LjUgMTEuOTkgMTQgOS41IDE0eiIvPgo8L3N2Zz4KPC9zdmc+',
  
  // Press placeholder - red theme
  press: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRUY0NDQ0Ii8+CjxwYXRoIGQ9Ik0xNjAgMTAwSDI0MFYxMjBIMTYwVjEwMFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8cGF0aCBkPSJNMTYwIDEzMEgyMDBWMTQwSDE2MFYxMzBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjYiLz4KPHN2ZyB4PSIxMDAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ij4KPHA+YXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01aDN2LTRoNHY0aDNsLTUgNXoiLz4KPC9zdmc+Cjwvc3ZnPg==',
  
  // Publication placeholder - teal theme
  publication: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMTRCOEE2Ii8+CjxwYXRoIGQ9Ik0xNjAgMTAwSDI0MFYxMjBIMTYwVjEwMFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8cGF0aCBkPSJNMTYwIDEzMEgyMDBWMTQwSDE2MFYxMzBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjYiLz4KPHN2ZyB4PSIxMDAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ij4KPHA+YXRoIGQ9Ik0xOCA2VjRoLTJWMmgtNHYySDhWNEg2djJINHYxNGgxNlY2aDE0em0tMiAydjEwSDhWOGgxMHoiLz4KPC9zdmc+Cjwvc3ZnPg==',
  
  // Default placeholder - gray theme
  default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjNjM2NkYxIi8+CjxwYXRoIGQ9Ik0xNjAgMTAwSDI0MFYxMjBIMTYwVjEwMFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8cGF0aCBkPSJNMTYwIDEzMEgyMDBWMTQwSDE2MFYxMzBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjYiLz4KPHN2ZyB4PSIxMDAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ij4KPHA+YXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHptLTEtMTNoMnYyaC0ydi0yem0wIDRoMnY2aC0ydi02eiIvPgo8L3N2Zz4KPC9zdmc+'
};

// Fallback images with better performance
export const FALLBACK_IMAGES = {
  article: LOCAL_PLACEHOLDERS.article,
  news: LOCAL_PLACEHOLDERS.news,
  event: LOCAL_PLACEHOLDERS.event,
  research: LOCAL_PLACEHOLDERS.research,
  press: LOCAL_PLACEHOLDERS.press,
  publication: LOCAL_PLACEHOLDERS.publication,
  default: LOCAL_PLACEHOLDERS.default
};

/**
 * Get appropriate placeholder image for content type
 * الحصول على صورة بديلة مناسبة لنوع المحتوى
 */
export const getPlaceholderImage = (contentType = 'default') => {
  return FALLBACK_IMAGES[contentType] || FALLBACK_IMAGES.default;
};

/**
 * Image loading utility with fallback
 * أداة تحميل الصور مع البديل
 */
export const getImageWithFallback = (primaryUrl, contentType = 'default') => {
  // Always use local placeholders to avoid CSP issues
  // External images can be enabled later with proper CSP configuration
  const isDevelopment = import.meta.env.DEV;

  // In development, always use local placeholders to avoid CSP errors
  if (isDevelopment) {
    return getPlaceholderImage(contentType);
  }

  // In production, use external images with local fallback
  return primaryUrl || getPlaceholderImage(contentType);
};

/**
 * Preload critical images
 * تحميل مسبق للصور المهمة
 */
export const preloadCriticalImages = () => {
  // Preload placeholder images for better performance
  Object.values(LOCAL_PLACEHOLDERS).forEach(imageSrc => {
    const img = new Image();
    img.src = imageSrc;
  });
};

export default {
  LOCAL_PLACEHOLDERS,
  FALLBACK_IMAGES,
  getPlaceholderImage,
  getImageWithFallback,
  preloadCriticalImages
};
