// src/components/research/UnitCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const UnitCard = ({ title, description, link, icon }) => {
  return (
    <Link to={link} className="block">
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-4">{icon}</span>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
        <div className="mt-4 flex justify-end">
          <span className="text-blue-600 hover:text-blue-800">
            اقرأ المزيد ←
          </span>
        </div>
      </div>
    </Link>
  );
};

export default UnitCard;