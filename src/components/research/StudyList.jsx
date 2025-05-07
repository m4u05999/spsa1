// src/components/research/StudyList.jsx
import React from 'react';

const StudyList = ({ studies = [], region = '', showCategory = false }) => {
  if (!studies.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        لا توجد دراسات متاحة {region && `في منطقة ${region}`} حالياً
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {studies.map((study, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-2">{study.title}</h3>
              {showCategory && (
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {study.category}
                </span>
              )}
            </div>
            <span className="text-gray-500 text-sm">{study.date}</span>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="text-blue-600 hover:text-blue-800">
              تحميل الدراسة PDF →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudyList;