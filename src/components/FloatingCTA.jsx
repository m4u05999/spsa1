// src/components/FloatingCTA.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const FloatingCTA = () => {
  return (
    <div 
      className="fixed top-1/2 -translate-y-1/2 right-0 z-50"
    >
      <Link 
        to="/membership" 
        className="flex flex-col items-center justify-center w-20 h-20 bg-red-600 text-white shadow-lg hover:bg-red-700 hover:shadow-xl transition-all duration-300"
        style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}
        aria-label="انضم إلى الجمعية الآن"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-bold text-center leading-tight">انضم للجمعية الآن</span>
      </Link>
    </div>
  );
};

export default FloatingCTA;
