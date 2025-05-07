// src/components/dashboard/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
};

export default StatCard;