// src/hooks/useIntersection.js
// Hook متقدم لمراقبة ظهور العناصر في منطقة العرض مع تحسينات الأداء

import { useState, useEffect, useRef, useCallback } from 'react';

// Cache مشترك لـ observers لتحسين الأداء
const observersCache = new Map();

export const useIntersection = ({
  threshold = 0.1,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
  initialIntersecting = false,
  trackVisibility = false,
  delay = 0
} = {}) => {
  const [isVisible, setIsVisible] = useState(initialIntersecting);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const [boundingBox, setBoundingBox] = useState(null);
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const timeoutRef = useRef(null);

  // إنشاء مفتاح فريد للـ observer
  const observerKey = `${threshold}-${rootMargin}-${root?.toString() || 'null'}`;

  // تنظيف timeout عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // معالج التقاطع مع تأخير اختياري
  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    
    const updateState = () => {
      const isIntersecting = entry.isIntersecting;
      
      // تحديث الحالة فقط إذا تغيرت أو لم يتم تجميدها
      if (!freezeOnceVisible || !isVisible) {
        setIsVisible(isIntersecting);
      }
      
      setIntersectionRatio(entry.intersectionRatio);
      
      // تحديث معلومات الـ bounding box
      setBoundingBox({
        top: entry.boundingClientRect.top,
        left: entry.boundingClientRect.left,
        bottom: entry.boundingClientRect.bottom,
        right: entry.boundingClientRect.right,
        width: entry.boundingClientRect.width,
        height: entry.boundingClientRect.height
      });
    };

    if (delay > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(updateState, delay);
    } else {
      updateState();
    }
  }, [freezeOnceVisible, isVisible, delay]);

  // إنشاء أو استرداد observer من الـ cache
  const getOrCreateObserver = useCallback(() => {
    if (observersCache.has(observerKey)) {
      return observersCache.get(observerKey);
    }

    const options = {
      threshold,
      root,
      rootMargin
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    observersCache.set(observerKey, observer);
    
    return observer;
  }, [observerKey, threshold, root, rootMargin, handleIntersection]);

  // إعداد المراقبة
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // إنشاء أو استرداد observer
    const observer = getOrCreateObserver();
    observerRef.current = observer;

    // بدء المراقبة
    observer.observe(element);

    // تنظيف عند إلغاء المكون
    return () => {
      if (observer && element) {
        observer.unobserve(element);
      }
    };
  }, [getOrCreateObserver]);

  // دالة لإعادة تشغيل المراقبة يدوياً
  const refresh = useCallback(() => {
    const element = elementRef.current;
    const observer = observerRef.current;
    
    if (element && observer) {
      observer.unobserve(element);
      observer.observe(element);
    }
  }, []);

  // دالة لتحديث threshold ديناميكياً
  const updateThreshold = useCallback((newThreshold) => {
    const element = elementRef.current;
    const observer = observerRef.current;
    
    if (element && observer) {
      observer.unobserve(element);
      
      // إنشاء observer جديد بـ threshold محدث
      const newObserver = new IntersectionObserver(handleIntersection, {
        threshold: newThreshold,
        root,
        rootMargin
      });
      
      observerRef.current = newObserver;
      newObserver.observe(element);
    }
  }, [handleIntersection, root, rootMargin]);

  return {
    ref: elementRef,
    isVisible,
    intersectionRatio,
    boundingBox,
    refresh,
    updateThreshold
  };
};

// Hook متقدم للعناصر المتعددة
export const useMultipleIntersection = (elements = [], options = {}) => {
  const [visibleElements, setVisibleElements] = useState(new Set());
  const [intersectionData, setIntersectionData] = useState(new Map());
  const observerRef = useRef(null);

  const handleIntersection = useCallback((entries) => {
    const newVisibleElements = new Set(visibleElements);
    const newIntersectionData = new Map(intersectionData);

    entries.forEach(entry => {
      const elementIndex = parseInt(entry.target.dataset.elementIndex);
      
      if (entry.isIntersecting) {
        newVisibleElements.add(elementIndex);
      } else {
        newVisibleElements.delete(elementIndex);
      }

      newIntersectionData.set(elementIndex, {
        isIntersecting: entry.isIntersecting,
        intersectionRatio: entry.intersectionRatio,
        boundingRect: entry.boundingClientRect
      });
    });

    setVisibleElements(newVisibleElements);
    setIntersectionData(newIntersectionData);
  }, [visibleElements, intersectionData]);

  useEffect(() => {
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: options.threshold || 0.1,
      root: options.root || null,
      rootMargin: options.rootMargin || '0px'
    });

    observerRef.current = observer;

    elements.forEach((element, index) => {
      if (element && element.current) {
        element.current.dataset.elementIndex = index;
        observer.observe(element.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [elements, handleIntersection, options]);

  return {
    visibleElements,
    intersectionData,
    isVisible: (index) => visibleElements.has(index),
    getIntersectionData: (index) => intersectionData.get(index)
  };
};

// Hook للكشف عن اتجاه التمرير
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isScrolling, setIsScrolling] = useState(false);
  const prevScrollY = useRef(0);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > prevScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < prevScrollY.current) {
        setScrollDirection('up');
      }
      
      setIsScrolling(true);
      prevScrollY.current = currentScrollY;

      // إعادة تعيين حالة التمرير بعد توقف التمرير
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return { scrollDirection, isScrolling };
};

// Hook لتحميل العناصر تدريجياً
export const useLazyLoading = ({
  itemsPerPage = 10,
  threshold = 0.5,
  rootMargin = '100px'
} = {}) => {
  const [loadedItems, setLoadedItems] = useState(itemsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const { ref: triggerRef, isVisible } = useIntersection({
    threshold,
    rootMargin
  });

  const loadMore = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // محاكاة تحميل بيانات
    setTimeout(() => {
      setLoadedItems(prev => prev + itemsPerPage);
      setIsLoading(false);
    }, 500);
  }, [isLoading, itemsPerPage]);

  useEffect(() => {
    if (isVisible && !isLoading) {
      loadMore();
    }
  }, [isVisible, isLoading, loadMore]);

  return {
    loadedItems,
    isLoading,
    triggerRef,
    loadMore
  };
};

export default useIntersection;