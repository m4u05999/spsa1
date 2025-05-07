// src/pages/committees/units/PoliticalMediaUnit.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import CommitteeNav from '../../../components/committees/CommitteeNav';
import MembersList from '../../../components/committees/MembersList';
import CommitteeContact from '../../../components/committees/CommitteeContact';

const PoliticalMediaUnit = () => {
  const members = [
    { name: 'د. عبدالرحمن القحطاني', role: 'رئيس الوحدة', title: 'أستاذ مشارك في الإعلام السياسي' },
    { name: 'د. هند الشمري', role: 'باحثة رئيسية', title: 'خبيرة في وسائل التواصل الاجتماعي والسياسة' },
    { name: 'أ. عادل المالكي', role: 'باحث', title: 'محلل استراتيجيات الاتصال السياسي' }
  ];

  const responsibilities = [
    'دراسة العلاقة بين الإعلام والسياسة والتأثير المتبادل بينهما',
    'تحليل الخطاب الإعلامي السياسي في وسائل الإعلام التقليدية والجديدة',
    'رصد دور مواقع التواصل الاجتماعي في تشكيل الرأي العام السياسي',
    'تقديم الاستشارات في مجال الإعلام السياسي للمؤسسات والهيئات'
  ];

  const projects = [
    {
      title: 'تأثير منصات التواصل الاجتماعي على المشاركة السياسية',
      description: 'دراسة تحليلية حول دور منصات التواصل الاجتماعي في تعزيز المشاركة السياسية للشباب',
      status: 'مكتمل',
      year: '2023'
    },
    {
      title: 'صورة القرارات السياسية في الإعلام المحلي والدولي',
      description: 'دراسة مقارنة لتغطية القرارات السياسية في وسائل الإعلام المحلية والإعلام الدولي',
      status: 'قيد التنفيذ',
      year: '2023-2024'
    },
    {
      title: 'استراتيجيات الاتصال السياسي الرقمي',
      description: 'بحث حول أحدث استراتيجيات الاتصال السياسي في العصر الرقمي وتأثيرها على صناعة القرار',
      status: 'قيد الإعداد',
      year: '2024'
    }
  ];

  const publications = [
    'كتاب "الإعلام السياسي في العصر الرقمي" - 2022',
    'دراسة "دور مواقع التواصل الاجتماعي في تشكيل الرأي العام خلال الأزمات السياسية"',
    'تقرير "استراتيجيات التأثير الإعلامي على القرارات السياسية: دراسة حالة"'
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
              <span className="text-blue-600">وحدة علم الإعلام السياسي</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-8 rounded-lg mb-8">
        <div className="flex items-center mb-4">
          <span className="text-4xl bg-white text-blue-800 p-3 rounded-full mr-4">📱</span>
          <h2 className="text-2xl font-bold">وحدة علم الإعلام السياسي</h2>
        </div>
        <p className="text-blue-100 text-lg">
          وحدة بحثية متخصصة في دراسة العلاقة بين الإعلام والسياسة، وتأثير وسائل الإعلام المختلفة على العمليات والقرارات السياسية وتشكيل الرأي العام.
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

      <CommitteeContact committee="political-media" />
    </div>
  );
};

export default PoliticalMediaUnit;