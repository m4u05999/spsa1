import React from 'react';
import CommitteeNav from '../../components/committees/CommitteeNav';
import MembersList from '../../components/committees/MembersList';
import CommitteeContact from '../../components/committees/CommitteeContact';

const LegalCommittee = () => {
  const members = [
    { name: 'د. عبدالله المالكي', role: 'رئيس اللجنة', title: 'مستشار قانوني وأستاذ القانون الدولي' },
    { name: 'د. سارة العتيبي', role: 'نائب الرئيس', title: 'متخصصة في القانون الدستوري' },
    { name: 'أ. فهد الدوسري', role: 'عضو', title: 'باحث قانوني' },
    { name: 'أ. منى الشهري', role: 'عضو', title: 'متخصصة في القوانين المنظمة للجمعيات المهنية' }
  ];

  const responsibilities = [
    'صياغة ومراجعة اللوائح والأنظمة الداخلية للجمعية',
    'تقديم الاستشارات القانونية لمجلس الإدارة واللجان المختلفة',
    'دراسة العقود والاتفاقيات التي تبرمها الجمعية مع الجهات الأخرى',
    'متابعة الامتثال للأنظمة واللوائح الحكومية المنظمة لعمل الجمعيات المهنية',
    'حماية الملكية الفكرية للجمعية ومطبوعاتها'
  ];

  const achievements = [
    'تحديث النظام الأساسي للجمعية بما يتوافق مع أحدث الأنظمة واللوائح',
    'إعداد دليل الحوكمة الداخلية للجمعية',
    'صياغة 12 عقداً واتفاقية شراكة مع جهات محلية ودولية',
    'تنظيم ورشة عمل قانونية حول الأطر التنظيمية للعمل الأكاديمي والبحثي',
    'تسجيل حقوق الملكية الفكرية لإصدارات الجمعية العلمية'
  ];

  const projects = [
    {
      title: 'مراجعة وتحديث اللوائح الداخلية',
      description: 'مشروع شامل لمراجعة وتحديث جميع اللوائح الداخلية للجمعية لمواكبة التطورات التنظيمية',
      status: 'مكتمل',
      year: '2023'
    },
    {
      title: 'دليل حوكمة الجمعيات العلمية',
      description: 'إعداد دليل استرشادي لحوكمة الجمعيات العلمية المتخصصة في العلوم الإنسانية والاجتماعية',
      status: 'قيد التنفيذ',
      year: '2023-2024'
    },
    {
      title: 'مبادرة "الوعي القانوني الأكاديمي"',
      description: 'برنامج توعوي للباحثين والأكاديميين حول الجوانب القانونية في النشر العلمي وحقوق الملكية الفكرية',
      status: 'قيد الإعداد',
      year: '2024'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <CommitteeNav />
      <h2 className="text-2xl font-bold mb-6">اللجنة القانونية</h2>
      
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-8 rounded-lg mb-8">
        <div className="flex items-center mb-4">
          <span className="text-4xl bg-white text-blue-800 p-3 rounded-full mr-4">⚖️</span>
          <h2 className="text-2xl font-bold">اللجنة القانونية</h2>
        </div>
        <p className="text-blue-100 text-lg">
          تختص اللجنة القانونية بتقديم الاستشارات القانونية وصياغة اللوائح والأنظمة الداخلية وضمان توافق أنشطة الجمعية مع الأنظمة واللوائح المعمول بها في المملكة.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">إنجازات اللجنة</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {achievements.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
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
      </div>

      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 text-blue-800">الخدمات القانونية</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-700 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2">صياغة العقود</h4>
            </div>
            <p className="text-gray-600 text-center">إعداد ومراجعة العقود والاتفاقيات بما يضمن حقوق الجمعية</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-700 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2">الاستشارات القانونية</h4>
            </div>
            <p className="text-gray-600 text-center">تقديم المشورة القانونية في مختلف القضايا المتعلقة بنشاط الجمعية</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-700 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2">حماية الملكية الفكرية</h4>
            </div>
            <p className="text-gray-600 text-center">تسجيل وحماية حقوق الملكية الفكرية لإصدارات ومنشورات الجمعية</p>
          </div>
        </div>
      </div>

      <CommitteeContact committee="legal" />
    </div>
  );
};

export default LegalCommittee;