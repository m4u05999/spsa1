// src/components/dashboard/StatsCard.jsx
import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 border-r-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;