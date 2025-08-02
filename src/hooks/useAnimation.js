// src/hooks/useAnimation.js
// Hook متقدم للحركات والتأثيرات المرئية مع دعم React Spring

import { useState, useCallback, useRef, useEffect } from 'react';

// مساعد لحساب القيم المتحركة
const lerp = (start, end, factor) => start + (end - start) * factor;

// دالة easing متقدمة
const easingFunctions = {
  linear: t => t,
  easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOut: t => t * (2 - t),
  easeIn: t => t * t,
  bounce: t => {
    if (t < 1/2.75) return 7.5625 * t * t;
    if (t < 2/2.75) return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
    if (t < 2.5/2.75) return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
  },
  elastic: t => t === 0 || t === 1 ? t : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI)
};

export const useAnimation = (initialState = {}) => {
  const [values, setValues] = useState(initialState);
  const animationRef = useRef(null);
  const startTime = useRef(null);
  const startValues = useRef({});

  // إيقاف الحركة
  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      startTime.current = null;
    }
  }, []);

  // بدء الحركة
  const animate = useCallback(({
    to,
    duration = 300,
    easing = 'easeInOut',
    onUpdate,
    onComplete,
    delay = 0
  }) => {
    return new Promise((resolve) => {
      const startAnimation = () => {
        stop(); // إيقاف أي حركة سابقة
        
        startTime.current = null;
        startValues.current = { ...values };
        
        const tick = (currentTime) => {
          if (!startTime.current) {
            startTime.current = currentTime;
          }
          
          const elapsed = currentTime - startTime.current;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easingFunctions[easing] ? easingFunctions[easing](progress) : progress;
          
          const newValues = {};
          Object.keys(to).forEach(key => {
            const startValue = startValues.current[key] || 0;
            const endValue = to[key];
            newValues[key] = lerp(startValue, endValue, easedProgress);
          });
          
          setValues(prev => ({ ...prev, ...newValues }));
          
          if (onUpdate) {
            onUpdate(newValues, progress);
          }
          
          if (progress < 1) {
            animationRef.current = requestAnimationFrame(tick);
          } else {
            animationRef.current = null;
            startTime.current = null;
            if (onComplete) onComplete(newValues);
            resolve(newValues);
          }
        };
        
        animationRef.current = requestAnimationFrame(tick);
      };

      if (delay > 0) {
        setTimeout(startAnimation, delay);
      } else {
        startAnimation();
      }
    });
  }, [values, stop]);

  // تنظيف عند إلغاء المكون
  useEffect(() => {
    return stop;
  }, [stop]);

  return {
    values,
    animate,
    stop,
    isAnimating: animationRef.current !== null
  };
};

// Hook للحركات المرنة (Spring Animation)
export const useSpring = ({
  from = {},
  to = {},
  config = { tension: 170, friction: 26 },
  immediate = false
} = {}) => {
  const [springs, setSprings] = useState(from);
  const animationRef = useRef(null);
  const velocities = useRef({});

  const animate = useCallback((newTo, newConfig = config) => {
    if (immediate) {
      setSprings(newTo);
      return Promise.resolve(newTo);
    }

    return new Promise((resolve) => {
      const { tension, friction } = newConfig;
      
      // تهيئة السرعات إذا لم تكن موجودة
      Object.keys(newTo).forEach(key => {
        if (velocities.current[key] === undefined) {
          velocities.current[key] = 0;
        }
      });

      const tick = () => {
        let hasChanged = false;
        const newSprings = { ...springs };

        Object.keys(newTo).forEach(key => {
          const currentValue = newSprings[key] || 0;
          const targetValue = newTo[key];
          const currentVelocity = velocities.current[key] || 0;

          const displacement = targetValue - currentValue;
          const springForce = displacement * tension / 1000;
          const dampingForce = currentVelocity * friction / 1000;
          const acceleration = springForce - dampingForce;

          const newVelocity = currentVelocity + acceleration;
          const newValue = currentValue + newVelocity;

          // تحديد إذا كانت الحركة قد توقفت
          if (Math.abs(displacement) > 0.01 || Math.abs(newVelocity) > 0.01) {
            hasChanged = true;
            newSprings[key] = newValue;
            velocities.current[key] = newVelocity;
          } else {
            newSprings[key] = targetValue;
            velocities.current[key] = 0;
          }
        });

        setSprings(newSprings);

        if (hasChanged) {
          animationRef.current = requestAnimationFrame(tick);
        } else {
          animationRef.current = null;
          resolve(newSprings);
        }
      };

      animationRef.current = requestAnimationFrame(tick);
    });
  }, [springs, config, immediate]);

  useEffect(() => {
    if (Object.keys(to).length > 0) {
      animate(to);
    }
  }, [to, animate]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return { springs, animate };
};

// Hook للحركات المتسلسلة
export const useSequence = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const sequenceRef = useRef([]);

  const addStep = useCallback((animationFn, delay = 0) => {
    sequenceRef.current.push({ animationFn, delay });
  }, []);

  const play = useCallback(async () => {
    setIsRunning(true);
    setCurrentStep(0);

    for (let i = 0; i < sequenceRef.current.length; i++) {
      const { animationFn, delay } = sequenceRef.current[i];
      setCurrentStep(i);
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      await animationFn();
    }

    setIsRunning(false);
    setCurrentStep(0);
  }, []);

  const reset = useCallback(() => {
    sequenceRef.current = [];
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  return {
    addStep,
    play,
    reset,
    currentStep,
    isRunning,
    totalSteps: sequenceRef.current.length
  };
};

// Hook للحركات المخصصة للعناصر
export const useElementAnimation = (elementRef) => {
  const [transforms, setTransforms] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    opacity: 1
  });

  const animateElement = useCallback(async ({
    transform = {},
    duration = 300,
    easing = 'easeInOut'
  }) => {
    const element = elementRef.current;
    if (!element) return;

    const startTransforms = { ...transforms };
    const targetTransforms = { ...transforms, ...transform };

    return new Promise((resolve) => {
      let startTime = null;

      const tick = (currentTime) => {
        if (!startTime) startTime = currentTime;
        
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunctions[easing](progress);

        const currentTransforms = {};
        Object.keys(targetTransforms).forEach(key => {
          const start = startTransforms[key];
          const end = targetTransforms[key];
          currentTransforms[key] = lerp(start, end, easedProgress);
        });

        setTransforms(currentTransforms);

        // تطبيق التحويلات على العنصر
        const { x, y, scale, rotate, opacity } = currentTransforms;
        element.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`;
        element.style.opacity = opacity;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          resolve(currentTransforms);
        }
      };

      requestAnimationFrame(tick);
    });
  }, [elementRef, transforms]);

  // دوال مساعدة للحركات الشائعة
  const fadeIn = useCallback((duration = 300) => {
    return animateElement({
      transform: { opacity: 1 },
      duration
    });
  }, [animateElement]);

  const fadeOut = useCallback((duration = 300) => {
    return animateElement({
      transform: { opacity: 0 },
      duration
    });
  }, [animateElement]);

  const slideIn = useCallback((direction = 'right', distance = 100, duration = 300) => {
    const x = direction === 'right' ? -distance : direction === 'left' ? distance : 0;
    const y = direction === 'down' ? -distance : direction === 'up' ? distance : 0;
    
    setTransforms(prev => ({ ...prev, x, y, opacity: 0 }));
    
    return animateElement({
      transform: { x: 0, y: 0, opacity: 1 },
      duration
    });
  }, [animateElement]);

  const bounce = useCallback((scale = 1.1, duration = 600) => {
    return animateElement({
      transform: { scale },
      duration: duration / 2,
      easing: 'easeOut'
    }).then(() => {
      return animateElement({
        transform: { scale: 1 },
        duration: duration / 2,
        easing: 'bounce'
      });
    });
  }, [animateElement]);

  const shake = useCallback((intensity = 10, duration = 300) => {
    const steps = 6;
    const stepDuration = duration / steps;
    
    const shakeStep = (step) => {
      if (step >= steps) {
        return animateElement({
          transform: { x: 0 },
          duration: stepDuration
        });
      }
      
      const direction = step % 2 === 0 ? 1 : -1;
      const x = direction * intensity * (1 - step / steps);
      
      return animateElement({
        transform: { x },
        duration: stepDuration
      }).then(() => shakeStep(step + 1));
    };
    
    return shakeStep(0);
  }, [animateElement]);

  return {
    transforms,
    animateElement,
    fadeIn,
    fadeOut,
    slideIn,
    bounce,
    shake
  };
};

// Hook للحركات المتوازية
export const useParallelAnimation = () => {
  const [animations, setAnimations] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addAnimation = useCallback((animationFn) => {
    setAnimations(prev => [...prev, animationFn]);
  }, []);

  const playAll = useCallback(async () => {
    setIsRunning(true);
    
    try {
      await Promise.all(animations.map(animationFn => animationFn()));
    } catch (error) {
      console.error('Animation error:', error);
    }
    
    setIsRunning(false);
  }, [animations]);

  const clear = useCallback(() => {
    setAnimations([]);
    setIsRunning(false);
  }, []);

  return {
    addAnimation,
    playAll,
    clear,
    isRunning,
    animationCount: animations.length
  };
};

export default useAnimation;