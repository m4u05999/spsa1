// src/components/dashboard/EnhancedStatCard.jsx
// مكون الإحصائيات المحسن مع التفاعلات المتقدمة والذكاء الاصطناعي

import React, { useState, useEffect, useCallback } from 'react';
import { useIntersection } from '../../hooks/useIntersection.js';
import { useAnimation } from '../../hooks/useAnimation.js';
import { useRipple } from '../../hooks/useRipple.jsx';

const EnhancedStatCard = ({
  title,
  value,
  icon,
  gradient = "from-blue-500 to-blue-600",
  change,
  changeText,
  insights,
  priority = "normal",
  animationDelay = 0,
  onClick,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [countAnimation, setCountAnimation] = useState(0);
  
  // Hooks للتفاعلات المتقدمة
  const { ref: cardRef, isVisible } = useIntersection({ threshold: 0.3 });
  const { animate, spring } = useAnimation();
  const { addRipple, rippleProps } = useRipple();

  // استخراج القيمة الرقمية للعد التدريجي
  const numericValue = React.useMemo(() => {
    if (typeof value === 'string') {
      const numbers = value.match(/[\d,]+/);
      if (numbers) {
        return parseInt(numbers[0].replace(/,/g, ''));
      }
    }
    return typeof value === 'number' ? value : 0;
  }, [value]);

  // العد التدريجي للأرقام
  useEffect(() => {
    if (isVisible && numericValue > 0) {
      const duration = 2000; // 2 ثانية
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setCountAnimation(numericValue);
          clearInterval(timer);
        } else {
          setCountAnimation(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, numericValue]);

  // معالج النقر مع تأثير الموجة
  const handleClick = useCallback((e) => {
    addRipple(e);
    if (onClick) {
      onClick(e);
    }
  }, [addRipple, onClick]);

  // تحديد لون التغيير
  const getChangeColor = useCallback(() => {
    if (!change) return 'text-gray-500';
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  }, [change]);

  // تحديد أيقونة التغيير
  const getChangeIcon = useCallback(() => {
    if (!change) return null;
    
    const iconClass = `h-4 w-4 ${change >= 0 ? 'transform rotate-0' : 'transform rotate-180'}`;
    
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={iconClass}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    );
  }, [change]);

  // تحديد حدود الأولوية
  const getPriorityBorder = useCallback(() => {
    switch (priority) {
      case 'high':
        return 'border-red-200 shadow-red-100';
      case 'warning':
        return 'border-amber-200 shadow-amber-100';
      case 'success':
        return 'border-green-200 shadow-green-100';
      default:
        return 'border-gray-200 shadow-gray-100';
    }
  }, [priority]);

  // تنسيق القيمة المعروضة
  const formatDisplayValue = useCallback(() => {
    if (typeof value === 'string' && value.includes('ريال')) {
      const numPart = value.replace(/[^\d,]/g, '');
      const formattedNum = countAnimation.toLocaleString();
      return value.replace(numPart, formattedNum);
    }
    
    if (numericValue > 0) {
      return countAnimation.toLocaleString();
    }
    
    return value;
  }, [value, countAnimation, numericValue]);

  return (
    <div 
      ref={cardRef}
      className={`enhanced-stat-card bg-white rounded-2xl shadow-lg border ${getPriorityBorder()} p-6 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-xl relative overflow-hidden ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}
      style={{ 
        transitionDelay: `${animationDelay}ms`,
        transformStyle: 'preserve-3d'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      {...rippleProps}
    >
      {/* خلفية متدرجة متحركة */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-5' : ''}`}
      />
      
      {/* مؤشر الأولوية */}
      {priority === 'high' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600" />
      )}
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex-1">
          {/* العنوان */}
          <p className="text-sm font-medium text-gray-600 mb-2 transition-colors duration-200">
            {title}
          </p>
          
          {/* القيمة الرئيسية */}
          <h3 className={`text-3xl font-bold mt-2 transition-all duration-300 ${isHovered ? 'text-gray-900 scale-105' : 'text-gray-800'}`}>
            {formatDisplayValue()}
          </h3>
          
          {/* معلومات التغيير */}
          {change !== undefined && (
            <div className="flex items-center mt-4 space-x-2 space-x-reverse">
              <span className={`flex items-center text-sm font-medium ${getChangeColor()}`}>
                {getChangeIcon()}
                <span className="mr-1">{Math.abs(change)}%</span>
              </span>
              <span className="text-gray-500 text-sm">{changeText}</span>
            </div>
          )}
          
          {/* الرؤى الذكية */}
          {insights && (
            <div className={`mt-3 p-2 bg-blue-50 rounded-lg border-r-4 border-blue-400 transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-blue-700 font-medium">{insights}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* الأيقونة */}
        <div className={`bg-gradient-to-br ${gradient} p-4 rounded-xl shadow-lg transition-all duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
          {icon}
        </div>
      </div>
      
      {/* مؤثرات بصرية إضافية */}
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} transition-all duration-500 ${isVisible ? 'scale-x-100' : 'scale-x-0'}`} style={{ transformOrigin: 'left' }} />
      
      {/* تأثير الإضاءة عند التحويم */}
      {isHovered && (
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-10 animate-pulse"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
            animation: 'shimmer 2s infinite'
          }}
        />
      )}
      
      {/* مؤشر الحمولة */}
      {isVisible && numericValue > 0 && countAnimation < numericValue && (
        <div className="absolute bottom-2 left-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
        </div>
      )}
    </div>
  );
};

export default EnhancedStatCard;