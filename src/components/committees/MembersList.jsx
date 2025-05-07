// src/components/committees/MembersList.jsx
import React from 'react';

const MembersList = ({ members }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">أعضاء اللجنة</h3>
      <div className="space-y-4">
        {members.map((member, index) => (
          <div
            key={index}
            className="border-b last:border-b-0 pb-4 last:pb-0"
          >
            <h4 className="font-semibold text-lg">{member.name}</h4>
            <p className="text-blue-600">{member.role}</p>
            <p className="text-gray-600 text-sm">{member.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersList;