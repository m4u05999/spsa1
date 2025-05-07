// src/pages/programs/ProgramsPage.jsx
import React from 'react';

const ProgramsPage = () => {
  const programs = [
    {
      title: 'دبلوم الدراسات الدبلوماسية',
      duration: '6 أشهر',
      startDate: '2024/03/01',
      type: 'دبلوم مهني',
      description: 'برنامج متخصص في العمل الدبلوماسي والعلاقات الدولية'
    },
    {
      title: 'دورة التحليل السياسي',
      duration: '3 أشهر',
      startDate: '2024/02/15',
      type: 'دورة تدريبية',
      description: 'تطوير مهارات التحليل السياسي وكتابة التقارير'
    },
    {
      title: 'ورشة صناعة القرار السياسي',
      duration: 'أسبوع',
      startDate: '2024/01/20',
      type: 'ورشة عمل',
      description: 'فهم آليات صناعة القرار السياسي وتحليل السياسات العامة'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-right">البرامج والدورات</h1>

      <div className="space-y-6">
        {programs.map((program, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-semibold mb-2">{program.title}</h2>
                <p className="text-gray-600 mb-4">{program.description}</p>
                <div className="flex flex-wrap gap-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    المدة: {program.duration}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    تاريخ البدء: {program.startDate}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {program.type}
                  </span>
                </div>
              </div>
              <button className="mt-4 md:mt-0 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                سجل الآن
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramsPage;