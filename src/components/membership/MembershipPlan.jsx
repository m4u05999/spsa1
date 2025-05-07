// src/components/membership/MembershipPlan.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../../utils/theme';

const MembershipPlan = ({ title, price, duration, features, isPopular, isPro }) => {
  return (
    <div 
      className={`relative flex flex-col border rounded-lg ${isPopular ? 'border-blue-500 shadow-lg md:scale-105 z-10' : isPro ? 'border-purple-500' : 'border-gray-200'} 
        overflow-hidden transition-transform hover:shadow-xl mx-2 sm:mx-0`}
    >
      {/* رأس الخطة */}
      <div 
        className={`p-4 sm:p-6 ${isPro ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' :
          isPopular ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' :
          'bg-gray-50'}`}
      >
        {isPopular && (
          <div className="absolute top-0 left-0 w-full">
            <div className="bg-yellow-400 text-blue-800 text-xs font-medium py-1 text-center">
              الخطة الأكثر شعبية
            </div>
          </div>
        )}
        
        {isPro && (
          <div className="absolute top-0 left-0 w-full">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-medium py-1 text-center">
              خطة متميزة
            </div>
          </div>
        )}
        
        <h3 className={`text-lg sm:text-xl font-bold mb-1 ${!isPro && !isPopular ? 'text-gray-900' : ''}`}>
          {title}
        </h3>
        
        <div className="flex items-baseline mb-4">
          <span className="text-2xl sm:text-3xl font-bold">{price}</span>
          <span className={`mr-2 text-xs sm:text-sm ${!isPro && !isPopular ? 'text-gray-600' : 'text-gray-100'}`}>
            / {duration}
          </span>
        </div>
        
        <Link
          to={`/membership/register?plan=${title === 'العضوية الأساسية' ? 'basic' :
            title === 'العضوية المحترفة' ? 'standard' :
            'premium'}`}
          className={`block text-center w-full ${isPro ? buttonStyles.primary.replace('bg-blue-600', 'bg-white').replace('hover:bg-blue-700', 'hover:bg-gray-100').replace('text-white', 'text-purple-700') :
            isPopular ? buttonStyles.primary.replace('bg-blue-600', 'bg-white').replace('hover:bg-blue-700', 'hover:bg-gray-100').replace('text-white', 'text-blue-700') :
            buttonStyles.primary
          } text-sm sm:text-base py-2 px-4 sm:px-6`}
        >
          سجّل الآن
        </Link>
      </div>
      
      {/* قائمة المميزات */}
      <div className="flex-grow bg-white p-4 sm:p-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <svg 
                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isPro ? 'text-purple-500' : isPopular ? 'text-blue-500' : 'text-green-500'}`}
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

MembershipPlan.propTypes = {
  title: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  features: PropTypes.arrayOf(PropTypes.string).isRequired,
  isPopular: PropTypes.bool,
  isPro: PropTypes.bool
};

MembershipPlan.defaultProps = {
  isPopular: false,
  isPro: false
};

export default MembershipPlan;