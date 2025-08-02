// src/hooks/useRipple.js
// Hook متقدم لتأثير الموجة (Ripple Effect) مع تخصيصات متقدمة

import { useState, useCallback, useRef } from 'react';

export const useRipple = ({
  duration = 600,
  color = 'rgba(255, 255, 255, 0.6)',
  disabled = false
} = {}) => {
  const [ripples, setRipples] = useState([]);
  const nextRippleId = useRef(0);

  const addRipple = useCallback((event) => {
    if (disabled) return;

    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    
    // حساب موضع الضغطة بالنسبة للعنصر
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // حساب الحجم المطلوب للموجة لتغطي العنصر بالكامل
    const size = Math.max(
      Math.sqrt(x * x + y * y),
      Math.sqrt((rect.width - x) * (rect.width - x) + y * y),
      Math.sqrt(x * x + (rect.height - y) * (rect.height - y)),
      Math.sqrt((rect.width - x) * (rect.width - x) + (rect.height - y) * (rect.height - y))
    ) * 2;

    const ripple = {
      id: nextRippleId.current++,
      x: x - size / 2,
      y: y - size / 2,
      size,
      color
    };

    setRipples(prev => [...prev, ripple]);

    // إزالة الموجة بعد انتهاء الحركة
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, duration);
  }, [disabled, duration, color]);

  // تنظيف جميع الموجات
  const clearRipples = useCallback(() => {
    setRipples([]);
  }, []);

  const rippleProps = {
    onMouseDown: addRipple,
    onTouchStart: addRipple,
    style: { position: 'relative', overflow: 'hidden' }
  };

  const RippleContainer = () => (
    <>
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            borderRadius: '50%',
            backgroundColor: ripple.color,
            transform: 'scale(0)',
            animation: `ripple ${duration}ms linear`,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      ))}
    </>
  );

  return {
    addRipple,
    clearRipples,
    rippleProps,
    RippleContainer,
    ripples
  };
};

// Hook لتأثير الموجة مع ألوان متعددة
export const useMultiColorRipple = ({
  duration = 600,
  colors = ['rgba(255, 255, 255, 0.6)'],
  disabled = false
} = {}) => {
  const [ripples, setRipples] = useState([]);
  const nextRippleId = useRef(0);
  const colorIndex = useRef(0);

  const addRipple = useCallback((event, customColor = null) => {
    if (disabled) return;

    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const size = Math.max(
      Math.sqrt(x * x + y * y),
      Math.sqrt((rect.width - x) * (rect.width - x) + y * y),
      Math.sqrt(x * x + (rect.height - y) * (rect.height - y)),
      Math.sqrt((rect.width - x) * (rect.width - x) + (rect.height - y) * (rect.height - y))
    ) * 2;

    // اختيار لون بالتتابع أو استخدام اللون المخصص
    const selectedColor = customColor || colors[colorIndex.current % colors.length];
    colorIndex.current++;

    const ripple = {
      id: nextRippleId.current++,
      x: x - size / 2,
      y: y - size / 2,
      size,
      color: selectedColor
    };

    setRipples(prev => [...prev, ripple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, duration);
  }, [disabled, duration, colors]);

  return {
    addRipple,
    ripples,
    clearRipples: () => setRipples([])
  };
};

// Hook لتأثير الموجة المتقدم مع أنماط مختلفة
export const useAdvancedRipple = ({
  duration = 600,
  color = 'rgba(255, 255, 255, 0.6)',
  style = 'circle', // circle, square, heart, star
  disabled = false,
  maxRipples = 3
} = {}) => {
  const [ripples, setRipples] = useState([]);
  const nextRippleId = useRef(0);

  const addRipple = useCallback((event) => {
    if (disabled) return;

    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const size = Math.max(rect.width, rect.height) * 1.5;

    const ripple = {
      id: nextRippleId.current++,
      x: x - size / 2,
      y: y - size / 2,
      size,
      color,
      style
    };

    setRipples(prev => {
      const newRipples = [...prev, ripple];
      // الحفاظ على عدد محدود من الموجات
      return newRipples.slice(-maxRipples);
    });

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, duration);
  }, [disabled, duration, color, style, maxRipples]);

  const getShapeClipPath = useCallback((style) => {
    switch (style) {
      case 'square':
        return 'none';
      case 'heart':
        return 'polygon(50% 0%, 100% 38%, 82% 100%, 50% 75%, 18% 100%, 0% 38%)';
      case 'star':
        return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
      default: // circle
        return 'circle(50%)';
    }
  }, []);

  const RippleContainer = () => (
    <>
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="advanced-ripple-effect"
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: ripple.color,
            clipPath: getShapeClipPath(ripple.style),
            borderRadius: ripple.style === 'square' ? '8px' : '50%',
            transform: 'scale(0)',
            animation: `ripple ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      ))}
    </>
  );

  return {
    addRipple,
    RippleContainer,
    ripples,
    clearRipples: () => setRipples([])
  };
};

// Hook لتأثير الموجة مع أصوات
export const useAudioRipple = ({
  duration = 600,
  color = 'rgba(255, 255, 255, 0.6)',
  soundUrl = null,
  volume = 0.3,
  disabled = false
} = {}) => {
  const [ripples, setRipples] = useState([]);
  const audioRef = useRef(null);
  const nextRippleId = useRef(0);

  // إنشاء عنصر الصوت
  const initAudio = useCallback(() => {
    if (soundUrl && !audioRef.current) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.volume = volume;
      audioRef.current.preload = 'auto';
    }
  }, [soundUrl, volume]);

  const addRipple = useCallback((event) => {
    if (disabled) return;

    // تشغيل الصوت
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.warn);
    }

    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const size = Math.max(
      Math.sqrt(x * x + y * y),
      Math.sqrt((rect.width - x) * (rect.width - x) + y * y),
      Math.sqrt(x * x + (rect.height - y) * (rect.height - y)),
      Math.sqrt((rect.width - x) * (rect.width - x) + (rect.height - y) * (rect.height - y))
    ) * 2;

    const ripple = {
      id: nextRippleId.current++,
      x: x - size / 2,
      y: y - size / 2,
      size,
      color
    };

    setRipples(prev => [...prev, ripple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, duration);
  }, [disabled, duration, color]);

  // تهيئة الصوت عند التحميل
  React.useEffect(() => {
    initAudio();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [initAudio]);

  return {
    addRipple,
    ripples,
    clearRipples: () => setRipples([])
  };
};

// Hook لتأثير الموجة المتجاوب
export const useResponsiveRipple = ({
  duration = 600,
  color = 'rgba(255, 255, 255, 0.6)',
  disabled = false,
  breakpoints = {
    mobile: { duration: 400, size: 0.8 },
    tablet: { duration: 500, size: 0.9 },
    desktop: { duration: 600, size: 1.0 }
  }
} = {}) => {
  const [ripples, setRipples] = useState([]);
  const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop');
  const nextRippleId = useRef(0);

  // تحديد نقطة التوقف الحالية
  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) setCurrentBreakpoint('mobile');
      else if (width < 1024) setCurrentBreakpoint('tablet');
      else setCurrentBreakpoint('desktop');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const addRipple = useCallback((event) => {
    if (disabled) return;

    const config = breakpoints[currentBreakpoint];
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const baseSize = Math.max(
      Math.sqrt(x * x + y * y),
      Math.sqrt((rect.width - x) * (rect.width - x) + y * y),
      Math.sqrt(x * x + (rect.height - y) * (rect.height - y)),
      Math.sqrt((rect.width - x) * (rect.width - x) + (rect.height - y) * (rect.height - y))
    ) * 2;

    const size = baseSize * (config?.size || 1);

    const ripple = {
      id: nextRippleId.current++,
      x: x - size / 2,
      y: y - size / 2,
      size,
      color,
      duration: config?.duration || duration
    };

    setRipples(prev => [...prev, ripple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, ripple.duration);
  }, [disabled, duration, color, breakpoints, currentBreakpoint]);

  return {
    addRipple,
    ripples,
    currentBreakpoint,
    clearRipples: () => setRipples([])
  };
};

export default useRipple;