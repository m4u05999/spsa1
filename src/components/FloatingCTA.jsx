// src/components/FloatingCTA.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FloatingCTA = () => {
  const [visible, setVisible] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // تتبع موضع التمرير لإضافة تأثيرات حركية
  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.pageYOffset;
      setVisible(currentPosition < scrollPosition || currentPosition < 100);
      setScrollPosition(currentPosition);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollPosition]);
  
  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${visible ? 'opacity-100 scale-100' : 'opacity-75 scale-95'}`}
    >
      <Link 
        to="/membership" 
        className="flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 hover:shadow-xl transition-all group"
        aria-label="انضم إلى الجمعية"
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <div className="absolute bottom-full right-1/2 transform translate-x-1/2 -translate-y-2 whitespace-nowrap bg-gray-900 text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 group-hover:-translate-y-4 transition-all pointer-events-none">
            انضم للجمعية الآن
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FloatingCTA;
