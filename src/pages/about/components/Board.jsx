// src/pages/about/components/Board.jsx
import React from 'react';

const Board = () => {
  const boardMembers = [
    {
      id: 1,
      name: 'د. عبدالغني بن شمس الدين الكندي',
      position: 'رئيس الجمعية',
      image: '/assets/images/chairman.jpg'
    },
    {
      id: 2,
      name: 'د. سلمان بن شائز العنزي',
      position: 'نائبًا للرئيس',
      image: '/assets/images/member1.jpg'
    },
    {
      id: 3,
      name: 'أ. سليمان بن عبدالعزيز العقيلي',
      position: 'عضو مجلس إدارة',
      image: '/assets/images/member2.jpg'
    },
    {
      id: 4,
      name: 'أ. إبراهيم بن زايد العسيري',
      position: 'عضو مجلس إدارة',
      image: '/assets/images/member3.jpg'
    },
    {
      id: 5,
      name: 'أ. يوسف بن شلاش الشمري',
      position: 'عضو مجلس إدارة',
      image: '/assets/images/member4.jpg'
    },
    {
      id: 6,
      name: 'أ. رائد بن صالح الحميد',
      position: 'عضو مجلس إدارة',
      image: '/assets/images/member5.jpg'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">أعضاء مجلس الإدارة</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {boardMembers.map((member) => (
          <div key={member.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-lg hover:scale-105">
            <div className="relative pt-[100%] overflow-hidden bg-blue-50">
              <img 
                src={member.image} 
                alt={member.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/images/default-avatar.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent opacity-60"></div>
            </div>
            <div className="p-4 text-center">
              <h3 className="text-xl font-bold mb-2 text-blue-800">{member.name}</h3>
              <p className="text-gray-700">{member.position}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
