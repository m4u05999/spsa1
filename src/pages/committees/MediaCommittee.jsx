import React from 'react';
import CommitteeNav from '../../components/committees/CommitteeNav';
import MembersList from '../../components/committees/MembersList';
import CommitteeContact from '../../components/committees/CommitteeContact';

const MediaCommittee = () => {
  const members = [
    { name: 'أ. فهد العنزي', role: 'رئيس اللجنة', title: 'أخصائي إعلام وعلاقات عامة' },
    { name: 'أ. سارة الدوسري', role: 'نائب الرئيس', title: 'مسؤولة المحتوى الرقمي' },
    { name: 'أ. محمد القحطاني', role: 'عضو', title: 'مصور ومخرج وثائقي' },
    { name: 'أ. أحمد السعدي', role: 'عضو', title: 'مسؤول منصات التواصل الاجتماعي' }
  ];

  const responsibilities = [
    'إدارة التواصل الإعلامي للجمعية مع وسائل الإعلام المختلفة',
    'التغطية الإعلامية للفعاليات والأنشطة التي تنظمها الجمعية',
    'إدارة المنصات الرقمية ومواقع التواصل الاجتماعي للجمعية',
    'إعداد النشرات والبيانات الصحفية',
    'توثيق فعاليات الجمعية وأرشفتها'
  ];

  const achievements = [
    'تطوير استراتيجية إعلامية متكاملة للجمعية',
    'زيادة متابعي منصات التواصل الاجتماعي بنسبة 65% خلال العام الماضي',
    'تنظيم 4 دورات تدريبية في مهارات الاتصال والإعلام السياسي',
    'إنتاج سلسلة وثائقية عن تاريخ العلوم السياسية في المملكة',
    'تطوير النشرة الإخبارية الشهرية للجمعية وزيادة عدد المشتركين'
  ];

  const projects = [
    {
      title: 'استراتيجية التواصل الاجتماعي 2023-2024',
      description: 'خطة شاملة لإدارة منصات التواصل الاجتماعي وتعزيز حضور الجمعية الرقمي',
      status: 'مكتمل',
      year: '2023'
    },
    {
      title: 'بودكاست "آفاق سياسية"',
      description: 'سلسلة حلقات صوتية حوارية تتناول أبرز القضايا والمستجدات في مجال العلوم السياسية',
      status: 'مستمر',
      year: '2023-2024'
    },
    {
      title: 'منصة المحتوى الرقمي التفاعلي',
      description: 'منصة إلكترونية لعرض المحتوى التفاعلي حول المفاهيم والنظريات السياسية بطريقة مبسطة',
      status: 'قيد التطوير',
      year: '2024'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <CommitteeNav />
      <h2 className="text-2xl font-bold mb-6">اللجنة الإعلامية</h2>
      
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-8 rounded-lg mb-8">
        <div className="flex items-center mb-4">
          <span className="text-4xl bg-white text-blue-800 p-3 rounded-full mr-4">📱</span>
          <h2 className="text-2xl font-bold">اللجنة الإعلامية</h2>
        </div>
        <p className="text-blue-100 text-lg">
          تتولى اللجنة الإعلامية مسؤولية إدارة التواصل والإعلام للجمعية، وتعزيز حضورها الإعلامي، وتسويق أنشطتها وفعالياتها، وإبراز دورها في خدمة المجتمع وتطوير مجال العلوم السياسية.
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
                      : project.status === 'مستمر'
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

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-6 text-blue-800">أنشطة اللجنة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4">
              <h4 className="font-semibold text-lg mb-2">تغطية المؤتمر السنوي</h4>
              <p className="text-gray-600">تغطية شاملة لفعاليات المؤتمر السنوي للعلوم السياسية 2023</p>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4">
              <h4 className="font-semibold text-lg mb-2">حملة "#العلوم_السياسية_للجميع"</h4>
              <p className="text-gray-600">حملة توعوية لتبسيط مفاهيم العلوم السياسية للجمهور العام</p>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4">
              <h4 className="font-semibold text-lg mb-2">لقاءات مع خبراء</h4>
              <p className="text-gray-600">سلسلة لقاءات مع خبراء وأكاديميين في مجال العلوم السياسية</p>
            </div>
          </div>
        </div>
      </div>

      <CommitteeContact committee="media" />
    </div>
  );
};

export default MediaCommittee;