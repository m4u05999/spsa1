// src/components/committees/ResearchUnitCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ResearchUnitCard = ({ title, description, link, icon }) => {
  return (
    <Link to={link} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-100 hover:border-blue-500 transition-all duration-300 h-full">
        <div className="flex items-center mb-4">
          <span className="text-3xl bg-blue-100 text-blue-700 p-3 rounded-full mr-4">{icon}</span>
          <h3 className="text-lg font-bold text-blue-800">{title}</h3>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="mt-auto flex justify-end">
          <span className="text-blue-600 hover:text-blue-800 flex items-center">
            <span>عرض التفاصيل</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ResearchUnitCard;