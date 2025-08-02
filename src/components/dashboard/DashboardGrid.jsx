// src/components/dashboard/DashboardGrid.jsx
// مكون الشبكة المحسن لتخطيط لوحة التحكم مع دعم RTL والاستجابة

import React, { useState, useEffect, useCallback } from 'react';
import { useIntersection } from '../../hooks/useIntersection.js';

const DashboardGrid = ({ 
  children, 
  columns = { sm: 1, md: 2, lg: 4 }, 
  gap = 6, 
  className = "",
  animationType = "stagger",
  direction = "rtl" 
}) => {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const { ref: gridRef, isVisible } = useIntersection({ threshold: 0.1 });

  // تحديد فئات الأعمدة
  const getColumnClasses = useCallback(() => {
    const baseClasses = "grid";
    const columnClasses = [
      `grid-cols-${columns.sm}`,
      `md:grid-cols-${columns.md}`,
      `lg:grid-cols-${columns.lg}`
    ];
    const gapClass = `gap-${gap}`;
    const directionClass = direction === 'rtl' ? 'dir-rtl' : 'dir-ltr';
    
    return `${baseClasses} ${columnClasses.join(' ')} ${gapClass} ${directionClass} ${className}`;
  }, [columns, gap, className, direction]);

  // معالجة ظهور العناصر تدريجياً
  useEffect(() => {
    if (isVisible && animationType === "stagger") {
      const itemCount = React.Children.count(children);
      let currentIndex = 0;
      
      const showNextItem = () => {
        if (currentIndex < itemCount) {
          setVisibleItems(prev => new Set([...prev, currentIndex]));
          currentIndex++;
          setTimeout(showNextItem, 150); // تأخير 150ms بين كل عنصر
        }
      };
      
      showNextItem();
    } else if (isVisible) {
      // إظهار جميع العناصر فوراً
      const itemCount = React.Children.count(children);
      setVisibleItems(new Set(Array.from({ length: itemCount }, (_, i) => i)));
    }
  }, [isVisible, children, animationType]);

  // تحديد فئة الحركة لكل عنصر
  const getItemAnimationClass = useCallback((index) => {
    const isItemVisible = visibleItems.has(index);
    
    switch (animationType) {
      case "stagger":
        return isItemVisible 
          ? "transform translate-y-0 opacity-100 transition-all duration-500 ease-out"
          : "transform translate-y-8 opacity-0 transition-all duration-500 ease-out";
      
      case "fade":
        return isItemVisible 
          ? "opacity-100 transition-opacity duration-700 ease-out"
          : "opacity-0 transition-opacity duration-700 ease-out";
      
      case "scale":
        return isItemVisible 
          ? "transform scale-100 opacity-100 transition-all duration-600 ease-out"
          : "transform scale-95 opacity-0 transition-all duration-600 ease-out";
      
      case "slide":
        const slideDirection = direction === 'rtl' ? 'translate-x-8' : '-translate-x-8';
        return isItemVisible 
          ? "transform translate-x-0 opacity-100 transition-all duration-500 ease-out"
          : `transform ${slideDirection} opacity-0 transition-all duration-500 ease-out`;
      
      default:
        return "";
    }
  }, [visibleItems, animationType, direction]);

  // معالجة الأطفال مع إضافة الحركات
  const renderChildren = useCallback(() => {
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;
      
      return (
        <div 
          key={index}
          className={getItemAnimationClass(index)}
          style={{ 
            transitionDelay: animationType === "stagger" ? `${index * 100}ms` : '0ms' 
          }}
        >
          {React.cloneElement(child, {
            ...child.props,
            'data-grid-index': index,
            'data-visible': visibleItems.has(index)
          })}
        </div>
      );
    });
  }, [children, getItemAnimationClass, visibleItems, animationType]);

  return (
    <div 
      ref={gridRef}
      className={`dashboard-grid ${getColumnClasses()}`}
      role="grid"
      aria-label="شبكة لوحة التحكم"
    >
      {renderChildren()}
      
      {/* مؤشر التحميل */}
      {!isVisible && (
        <div className="col-span-full flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

// مكون Grid متقدم مع تخطيطات مختلفة
export const AdvancedDashboardGrid = ({ 
  children, 
  layout = "auto", 
  responsiveBreakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 },
  className = "",
  enableVirtualization = false,
  itemHeight = 200
}) => {
  const [screenSize, setScreenSize] = useState('lg');
  const [virtualizedItems, setVirtualizedItems] = useState([]);
  
  // تحديد حجم الشاشة
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < responsiveBreakpoints.sm) setScreenSize('xs');
      else if (width < responsiveBreakpoints.md) setScreenSize('sm');
      else if (width < responsiveBreakpoints.lg) setScreenSize('md');
      else if (width < responsiveBreakpoints.xl) setScreenSize('lg');
      else setScreenSize('xl');
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [responsiveBreakpoints]);

  // تحديد فئات التخطيط
  const getLayoutClasses = useCallback(() => {
    switch (layout) {
      case "masonry":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 masonry-grid";
      
      case "featured":
        return "grid grid-cols-1 lg:grid-cols-3 gap-6 featured-grid";
      
      case "sidebar":
        return "grid grid-cols-1 lg:grid-cols-4 gap-6 sidebar-grid";
      
      case "compact":
        return "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 compact-grid";
      
      default: // auto
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-grid";
    }
  }, [layout]);

  // Virtual scrolling للقوائم الكبيرة
  useEffect(() => {
    if (enableVirtualization) {
      const itemsPerPage = Math.ceil(window.innerHeight / itemHeight) * 2;
      setVirtualizedItems(React.Children.toArray(children).slice(0, itemsPerPage));
    }
  }, [children, enableVirtualization, itemHeight]);

  const renderContent = () => {
    const itemsToRender = enableVirtualization ? virtualizedItems : children;
    
    return React.Children.map(itemsToRender, (child, index) => {
      if (!React.isValidElement(child)) return child;
      
      // إضافة فئات خاصة بالتخطيط
      let layoutSpecificProps = {};
      
      if (layout === "featured" && index === 0) {
        layoutSpecificProps.className = `${child.props.className || ''} lg:col-span-2 lg:row-span-2 featured-item`;
      } else if (layout === "sidebar" && index === 0) {
        layoutSpecificProps.className = `${child.props.className || ''} lg:col-span-3 sidebar-main`;
      }
      
      return React.cloneElement(child, {
        ...child.props,
        ...layoutSpecificProps,
        'data-layout': layout,
        'data-screen-size': screenSize
      });
    });
  };

  return (
    <div className={`advanced-dashboard-grid ${getLayoutClasses()} ${className}`}>
      {renderContent()}
    </div>
  );
};

// مكون Grid للكروت التفاعلية
export const InteractiveCardGrid = ({ 
  cards, 
  onCardClick, 
  onCardHover,
  className = "",
  enableDragReorder = false 
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [orderedCards, setOrderedCards] = useState(cards);

  // تحديث الترتيب عند تغيير البيانات
  useEffect(() => {
    setOrderedCards(cards);
  }, [cards]);

  const handleDragStart = useCallback((e, index) => {
    if (!enableDragReorder) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, [enableDragReorder]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newCards = [...orderedCards];
    const draggedCard = newCards[draggedIndex];
    newCards.splice(draggedIndex, 1);
    newCards.splice(dropIndex, 0, draggedCard);
    
    setOrderedCards(newCards);
    setDraggedIndex(null);
  }, [draggedIndex, orderedCards]);

  return (
    <div className={`interactive-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {orderedCards.map((card, index) => (
        <div
          key={card.id || index}
          draggable={enableDragReorder}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          onClick={() => onCardClick && onCardClick(card, index)}
          onMouseEnter={() => onCardHover && onCardHover(card, index)}
          className={`interactive-card cursor-pointer transition-all duration-300 ${
            draggedIndex === index ? 'opacity-50 scale-95' : 'hover:scale-105'
          }`}
        >
          {card}
        </div>
      ))}
    </div>
  );
};

export default DashboardGrid;