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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">خريجو قسم العلوم السياسية</h2>
      
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