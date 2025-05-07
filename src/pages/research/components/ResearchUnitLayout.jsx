// src/pages/research/components/ResearchUnitLayout.jsx
import React from 'react';

const ResearchUnitLayout = ({ title, description, members, publications, currentProjects }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">أعضاء الوحدة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member, index) => (
            <div key={index} className="flex items-center space-x-4 space-x-reverse">
              <img
                src={member.image || '/assets/images/avatar-placeholder.png'}
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold">{member.name}</h4>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">المشاريع الحالية</h3>
        <div className="space-y-4">
          {currentProjects.map((project, index) => (
            <div key={index} className="border-r-4 border-blue-500 pr-4">
              <h4 className="font-semibold">{project.title}</h4>
              <p className="text-gray-600">{project.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">المنشورات</h3>
        <div className="space-y-4">
          {publications.map((pub, index) => (
            <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
              <h4 className="font-semibold">{pub.title}</h4>
              <p className="text-sm text-gray-600">{pub.authors.join('، ')}</p>
              <p className="text-sm text-gray-500">{pub.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResearchUnitLayout;