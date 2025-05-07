// src/pages/committees/units/CurriculumUnit.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import CommitteeNav from '../../../components/committees/CommitteeNav';
import MembersList from '../../../components/committees/MembersList';
import CommitteeContact from '../../../components/committees/CommitteeContact';

const CurriculumUnit = () => {
  const members = [
    { name: 'د. سارة المحمود', role: 'رئيس الوحدة', title: 'أستاذ مناهج وطرق تدريس العلوم السياسية' },
    { name: 'د. عبدالله الحارثي', role: 'باحث أول', title: 'متخصص في الإحصاء السياسي' },
    { name: 'أ. نورة الشمري', role: 'باحث مساعد', title: 'متخصصة في تحليل البيانات' }
  ];

  const responsibilities = [
    'إعداد وتطوير المناهج التعليمية في مجال العلوم السياسية',
    'إصدار تقارير إحصائية دورية عن الأوضاع السياسية',
    'تحليل البيانات الكمية والنوعية في مجال العلوم السياسية',
    'تقديم توصيات لتطوير أساليب التدريس والبحث'
  ];

  const projects = [
    {
      title: 'تقرير مؤشرات الديمقراطية في الشرق الأوسط 2023',
      description: 'تقرير سنوي يرصد مؤشرات الديمقراطية وحقوق الإنسان في منطقة الشرق الأوسط',
      status: 'مكتمل',
      year: '2023'
    },
    {
      title: 'تطوير منهج النظم السياسية المقارنة',
      description: 'مشروع لتحديث منهج النظم السياسية المقارنة ليتناسب مع التطورات السياسية المعاصرة',
      status: 'قيد التنفيذ',
      year: '2023-2024'
    },
    {
      title: 'دراسة إحصائية: اتجاهات الرأي العام نحو المشاركة السياسية',
      description: 'دراسة مسحية لقياس اتجاهات الرأي العام نحو المشاركة في الحياة السياسية',
      status: 'قيد الإعداد',
      year: '2024'
    }
  ];

  const publications = [
    'كتاب "أساليب القياس في العلوم السياسية" - 2022',
    'تقرير "مؤشرات الديمقراطية في العالم العربي 2021-2022"',
    'دراسة "تحليل محتوى مناهج العلوم السياسية في الجامعات العربية"'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <Link to="/committees" className="text-gray-700 hover:text-blue-600">
              اللجان
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link to="/committees/scientific" className="text-gray-700 hover:text-blue-600">
                اللجنة العلمية والاستشارية
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-blue-600">وحدة المناهج والتقارير الإحصائية</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-8 rounded-lg mb-8">
        <div className="flex items-center mb-4">
          <span className="text-4xl bg-white text-blue-800 p-3 rounded-full mr-4">📊</span>
          <h2 className="text-2xl font-bold">وحدة المناهج والتقارير الإحصائية</h2>
        </div>
        <p className="text-blue-100 text-lg">
          وحدة متخصصة في تطوير المناهج التعليمية وإعداد التقارير الإحصائية في مجال العلوم السياسية، تهدف إلى تحسين جودة التعليم والبحث العلمي في المجال.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">المهام والمسؤوليات</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {responsibilities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <MembersList members={members} />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">المشاريع الحالية</h3>
        <div className="space-y-6">
          {projects.map((project, index) => (
            <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
              <h4 className="font-semibold text-lg">{project.title}</h4>
              <div className="flex justify-between items-center my-1">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  project.status === 'مكتمل' 
                    ? 'bg-green-100 text-green-700' 
                    : project.status === 'قيد التنفيذ'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                }`}>
                  {project.status}
                </span>
                <span className="text-sm text-gray-500">{project.year}</span>
              </div>
              <p className="text-gray-600">{project.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">إصدارات الوحدة</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {publications.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <CommitteeContact committee="curriculum" />
    </div>
  );
};

export default CurriculumUnit;