// src/hooks/useGesture.js
// Hook متقدم للتفاعل باللمس والحركات على الأجهزة اللوحية

import { useState, useCallback, useRef, useEffect } from 'react';

// تحديد نوع الجهاز
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// حساب المسافة بين نقطتين
const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

// حساب زاوية الدوران
const getAngle = (touch1, touch2) => {
  return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
};

// Hook أساسي للحركات
export const useGesture = ({
  onSwipe,
  onPinch,
  onRotate,
  onTap,
  onDoubleTap,
  onLongPress,
  onDrag,
  threshold = {
    swipe: 50,
    pinch: 10,
    rotate: 15,
    drag: 5
  },
  longPressDelay = 500,
  doubleTapDelay = 300,
  disabled = false
} = {}) => {
  const [gestureState, setGestureState] = useState({
    isGesturing: false,
    gestureType: null,
    startTime: null,
    touches: []
  });

  const gestureRef = useRef({
    startTouches: [],
    lastTouches: [],
    startDistance: 0,
    startAngle: 0,
    lastTap: 0,
    longPressTimer: null,
    isDragging: false,
    dragStart: null
  });

  // تنظيف المؤقتات
  const clearTimers = useCallback(() => {
    if (gestureRef.current.longPressTimer) {
      clearTimeout(gestureRef.current.longPressTimer);
      gestureRef.current.longPressTimer = null;
    }
  }, []);

  // معالج بداية اللمس
  const handleTouchStart = useCallback((event) => {
    if (disabled) return;

    const touches = Array.from(event.touches);
    gestureRef.current.startTouches = touches;
    gestureRef.current.lastTouches = touches;
    
    setGestureState({
      isGesturing: true,
      gestureType: null,
      startTime: Date.now(),
      touches: touches.length
    });

    // تحديد نوع الحركة المحتملة
    if (touches.length === 1) {
      const touch = touches[0];
      gestureRef.current.dragStart = { x: touch.clientX, y: touch.clientY };
      
      // إعداد مؤقت الضغط الطويل
      gestureRef.current.longPressTimer = setTimeout(() => {
        if (onLongPress) {
          onLongPress({
            clientX: touch.clientX,
            clientY: touch.clientY,
            element: event.target
          });
        }
        setGestureState(prev => ({ ...prev, gestureType: 'longPress' }));
      }, longPressDelay);
      
    } else if (touches.length === 2) {
      clearTimers();
      gestureRef.current.startDistance = getDistance(touches[0], touches[1]);
      gestureRef.current.startAngle = getAngle(touches[0], touches[1]);
    }
  }, [disabled, onLongPress, longPressDelay, clearTimers]);

  // معالج حركة اللمس
  const handleTouchMove = useCallback((event) => {
    if (disabled || !gestureState.isGesturing) return;

    const touches = Array.from(event.touches);
    
    if (touches.length === 1 && gestureRef.current.startTouches.length === 1) {
      // معالجة السحب
      const currentTouch = touches[0];
      const startTouch = gestureRef.current.startTouches[0];
      
      const deltaX = currentTouch.clientX - startTouch.clientX;
      const deltaY = currentTouch.clientY - startTouch.clientY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > threshold.drag && !gestureRef.current.isDragging) {
        gestureRef.current.isDragging = true;
        clearTimers();
        setGestureState(prev => ({ ...prev, gestureType: 'drag' }));
      }
      
      if (gestureRef.current.isDragging && onDrag) {
        onDrag({
          deltaX,
          deltaY,
          distance,
          startX: startTouch.clientX,
          startY: startTouch.clientY,
          currentX: currentTouch.clientX,
          currentY: currentTouch.clientY
        });
      }
      
    } else if (touches.length === 2 && gestureRef.current.startTouches.length === 2) {
      clearTimers();
      
      const currentDistance = getDistance(touches[0], touches[1]);
      const currentAngle = getAngle(touches[0], touches[1]);
      
      const distanceChange = currentDistance - gestureRef.current.startDistance;
      const angleChange = currentAngle - gestureRef.current.startAngle;
      
      // معالجة القرص للتكبير/التصغير
      if (Math.abs(distanceChange) > threshold.pinch && onPinch) {
        const scale = currentDistance / gestureRef.current.startDistance;
        onPinch({
          scale,
          distanceChange,
          center: {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
          }
        });
        setGestureState(prev => ({ ...prev, gestureType: 'pinch' }));
      }
      
      // معالجة الدوران
      if (Math.abs(angleChange) > threshold.rotate && onRotate) {
        onRotate({
          angle: angleChange,
          totalRotation: currentAngle,
          center: {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
          }
        });
        setGestureState(prev => ({ ...prev, gestureType: 'rotate' }));
      }
    }
    
    gestureRef.current.lastTouches = touches;
  }, [disabled, gestureState.isGesturing, threshold, onDrag, onPinch, onRotate, clearTimers]);

  // معالج انتهاء اللمس
  const handleTouchEnd = useCallback((event) => {
    if (disabled) return;

    clearTimers();
    
    const endTime = Date.now();
    const duration = endTime - gestureState.startTime;
    const touches = gestureRef.current.startTouches;
    
    // معالجة النقر
    if (touches.length === 1 && duration < 200 && !gestureRef.current.isDragging) {
      const now = Date.now();
      const timeSinceLastTap = now - gestureRef.current.lastTap;
      
      if (timeSinceLastTap < doubleTapDelay && onDoubleTap) {
        onDoubleTap({
          clientX: touches[0].clientX,
          clientY: touches[0].clientY,
          element: event.target
        });
        setGestureState(prev => ({ ...prev, gestureType: 'doubleTap' }));
        gestureRef.current.lastTap = 0;
      } else {
        if (onTap) {
          onTap({
            clientX: touches[0].clientX,
            clientY: touches[0].clientY,
            element: event.target
          });
        }
        setGestureState(prev => ({ ...prev, gestureType: 'tap' }));
        gestureRef.current.lastTap = now;
      }
    }
    
    // معالجة المسح
    if (touches.length === 1 && gestureRef.current.isDragging) {
      const startTouch = touches[0];
      const lastTouch = gestureRef.current.lastTouches[0];
      
      if (lastTouch) {
        const deltaX = lastTouch.clientX - startTouch.clientX;
        const deltaY = lastTouch.clientY - startTouch.clientY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > threshold.swipe && onSwipe) {
          const direction = Math.abs(deltaX) > Math.abs(deltaY) 
            ? (deltaX > 0 ? 'right' : 'left')
            : (deltaY > 0 ? 'down' : 'up');
            
          onSwipe({
            direction,
            distance,
            deltaX,
            deltaY,
            velocity: distance / duration
          });
          setGestureState(prev => ({ ...prev, gestureType: 'swipe' }));
        }
      }
    }
    
    // إعادة تعيين الحالة
    setTimeout(() => {
      setGestureState({
        isGesturing: false,
        gestureType: null,
        startTime: null,
        touches: 0
      });
      gestureRef.current.isDragging = false;
      gestureRef.current.dragStart = null;
    }, 100);
    
  }, [disabled, gestureState.startTime, threshold, onTap, onDoubleTap, onSwipe, doubleTapDelay, clearTimers]);

  // تنظيف عند إلغاء المكون
  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const gestureProps = isTouchDevice() ? {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    style: { touchAction: 'none' }
  } : {};

  return {
    gestureProps,
    gestureState,
    isGesturing: gestureState.isGesturing,
    gestureType: gestureState.gestureType,
    isTouchDevice: isTouchDevice()
  };
};

// Hook للمسح فقط
export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  disabled = false
} = {}) => {
  const { gestureProps, gestureState } = useGesture({
    onSwipe: ({ direction, distance, deltaX, deltaY, velocity }) => {
      switch (direction) {
        case 'left':
          if (onSwipeLeft) onSwipeLeft({ distance, deltaX, deltaY, velocity });
          break;
        case 'right':
          if (onSwipeRight) onSwipeRight({ distance, deltaX, deltaY, velocity });
          break;
        case 'up':
          if (onSwipeUp) onSwipeUp({ distance, deltaX, deltaY, velocity });
          break;
        case 'down':
          if (onSwipeDown) onSwipeDown({ distance, deltaX, deltaY, velocity });
          break;
      }
    },
    threshold: { swipe: threshold },
    disabled
  });

  return {
    swipeProps: gestureProps,
    isSwipeActive: gestureState.gestureType === 'swipe'
  };
};

// Hook للقرص (Pinch to Zoom)
export const usePinchZoom = ({
  onZoom,
  onZoomStart,
  onZoomEnd,
  minScale = 0.5,
  maxScale = 3,
  disabled = false
} = {}) => {
  const [scale, setScale] = useState(1);
  const [isZooming, setIsZooming] = useState(false);

  const { gestureProps } = useGesture({
    onPinch: ({ scale: newScale, center }) => {
      const clampedScale = Math.min(Math.max(newScale, minScale), maxScale);
      setScale(clampedScale);
      
      if (!isZooming) {
        setIsZooming(true);
        if (onZoomStart) onZoomStart({ scale: clampedScale, center });
      }
      
      if (onZoom) onZoom({ scale: clampedScale, center });
    },
    disabled
  });

  // إنهاء التكبير عند رفع الأصابع
  useEffect(() => {
    const handleTouchEnd = () => {
      if (isZooming) {
        setIsZooming(false);
        if (onZoomEnd) onZoomEnd({ scale });
      }
    };

    document.addEventListener('touchend', handleTouchEnd);
    return () => document.removeEventListener('touchend', handleTouchEnd);
  }, [isZooming, scale, onZoomEnd]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setIsZooming(false);
  }, []);

  return {
    pinchProps: gestureProps,
    scale,
    isZooming,
    resetZoom
  };
};

// Hook للسحب للتحديث (Pull to Refresh)
export const usePullToRefresh = ({
  onRefresh,
  refreshThreshold = 80,
  disabled = false
} = {}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);

  const { gestureProps } = useGesture({
    onDrag: ({ deltaY, currentY }) => {
      // فقط إذا كان السحب للأسفل من أعلى الصفحة
      if (window.scrollY === 0 && deltaY > 0) {
        const distance = Math.min(deltaY, refreshThreshold * 2);
        setPullDistance(distance);
        setCanRefresh(distance >= refreshThreshold);
      }
    },
    disabled
  });

  // معالجة انتهاء السحب
  useEffect(() => {
    const handleTouchEnd = async () => {
      if (canRefresh && !isRefreshing) {
        setIsRefreshing(true);
        if (onRefresh) {
          await onRefresh();
        }
        setIsRefreshing(false);
      }
      setPullDistance(0);
      setCanRefresh(false);
    };

    document.addEventListener('touchend', handleTouchEnd);
    return () => document.removeEventListener('touchend', handleTouchEnd);
  }, [canRefresh, isRefreshing, onRefresh]);

  return {
    pullProps: gestureProps,
    pullDistance,
    isRefreshing,
    canRefresh,
    progress: Math.min(pullDistance / refreshThreshold, 1)
  };
};

// Hook للحركات الخاصة بالعربية (RTL)
export const useRTLGesture = ({
  onSwipeNext,
  onSwipePrevious,
  isRTL = true,
  ...gestureOptions
} = {}) => {
  const { gestureProps, gestureState } = useGesture({
    onSwipe: ({ direction, distance, deltaX, deltaY, velocity }) => {
      // في الوضع العربي، اليسار = التالي، اليمين = السابق
      if (isRTL) {
        if (direction === 'left' && onSwipeNext) {
          onSwipeNext({ distance, deltaX, deltaY, velocity });
        } else if (direction === 'right' && onSwipePrevious) {
          onSwipePrevious({ distance, deltaX, deltaY, velocity });
        }
      } else {
        if (direction === 'right' && onSwipeNext) {
          onSwipeNext({ distance, deltaX, deltaY, velocity });
        } else if (direction === 'left' && onSwipePrevious) {
          onSwipePrevious({ distance, deltaX, deltaY, velocity });
        }
      }
    },
    ...gestureOptions
  });

  return {
    rtlGestureProps: gestureProps,
    gestureState,
    isRTL
  };
};

export default useGesture;