// src/pages/about/components/Graduates.jsx
import React from 'react';

const Graduates = () => {
  const graduates = [
    {
      year: '2023',
      count: 45,
      specializations: ['العلاقات الدولية', 'السياسات المقارنة', 'الفكر السياسي']
    },
    {
      year: '2022',
      count: 38,
      specializations: ['العلاقات الدولية', 'الدراسات الإقليمية', 'النظم السياسية']
    },
    {
      year: '2021',
      count: 42,
      specializations: ['السياسات المقارنة', 'العلاقات الدولية', 'الفكر السياسي']
    }
  ];

  const leaders = [
    {
      name: 'صاحب السمو الملكي الامير فيصل بن سلمان آل سعود',
      position: 'أمير منطقة',
      image: '/assets/images/graduate1.jpg'
    },
    {
      name: 'الامير محمد بن عبد الرحمن',
      position: 'نائب أمير الرياض',
      image: '/assets/images/graduate2.jpg'
    },
    {
      name: 'الامير تركي بن طلال',
      position: 'أمير عسير',
      image: '/assets/images/graduate3.jpg'
    },
    {
      name: 'الامير بندر بن سلطان',
      position: 'نائب أمير مكة السابق',
      image: '/assets/images/graduate4.jpg'
    },
    {
      name: 'رائد قرملي',
      position: 'سفير سابق في روسيا ومدير عام تخطيط السياسات بوزارة الخارجية',
      image: '/assets/images/graduate5.jpg'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">خريجو قسم العلوم السياسية</h2>
      
      {/* قسم القيادات من خريجوا القسم */}
      <div className="mb-12">
        <h3 className="text-xl font-bold mb-6 text-center bg-blue-800 text-white py-3 rounded-lg shadow-md">القيادات من خريجوا القسم</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.map((leader, index) => (
            <div 
              key={index} 
              className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={leader.image} 
                  alt={leader.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/images/default-avatar.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent opacity-60"></div>
              </div>
              <div className="p-4 text-center">
                <h4 className="text-lg font-bold mb-2 text-blue-800">{leader.name}</h4>
                <p className="text-gray-700">{leader.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* جدول الخريجين */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">السنة</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">عدد الخريجين</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">التخصصات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {graduates.map((grad, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{grad.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{grad.count}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {grad.specializations.map((spec, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* إحصائيات */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">125+</div>
          <div className="text-gray-700">إجمالي الخريجين</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
          <div className="text-gray-700">نسبة التوظيف</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">6</div>
          <div className="text-gray-700">تخصصات رئيسية</div>
        </div>
      </div>
    </div>
  );
};

export default Graduates;