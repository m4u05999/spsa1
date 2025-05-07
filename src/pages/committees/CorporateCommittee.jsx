import React from 'react';
import CommitteeNav from '../../components/committees/CommitteeNav';
import MembersList from '../../components/committees/MembersList';
import CommitteeContact from '../../components/committees/CommitteeContact';

const CorporateCommittee = () => {
  const members = [
    { name: 'أ. خالد العمري', role: 'رئيس اللجنة', title: 'خبير العلاقات العامة والاتصال المؤسسي' },
    { name: 'أ. منال الغامدي', role: 'نائب الرئيس', title: 'متخصصة في الشراكات الاستراتيجية' },
    { name: 'أ. عبدالرحمن السلمي', role: 'عضو', title: 'مسؤول التواصل مع القطاع الخاص' },
    { name: 'أ. عبير القرشي', role: 'عضو', title: 'منسقة الفعاليات والعلاقات الخارجية' }
  ];

  const responsibilities = [
    'إدارة العلاقات مع المؤسسات والهيئات الحكومية والأكاديمية',
    'بناء وتطوير شراكات استراتيجية مع القطاعين العام والخاص',
    'تمثيل الجمعية في المحافل والمناسبات الرسمية',
    'تنظيم اللقاءات والاجتماعات مع الجهات ذات العلاقة',
    'تعزيز الصورة المؤسسية للجمعية وزيادة التعريف بها'
  ];

  const achievements = [
    'توقيع 8 اتفاقيات تعاون مع مؤسسات أكاديمية محلية ودولية',
    'إقامة شراكات استراتيجية مع 5 جهات حكومية',
    'تنظيم 3 ملتقيات للتواصل مع القطاع الخاص',
    'إطلاق برنامج "سفراء الجمعية" للتعريف بنشاط الجمعية محلياً ودولياً',
    'الحصول على رعاية ودعم لأنشطة الجمعية من مؤسسات القطاع الخاص'
  ];

  const partners = [
    { name: 'وزارة التعليم', category: 'حكومي' },
    { name: 'معهد الإدارة العامة', category: 'حكومي' },
    { name: 'مركز الملك فيصل للبحوث والدراسات الإسلامية', category: 'بحثي' },
    { name: 'جامعة الملك سعود', category: 'أكاديمي' },
    { name: 'جامعة الأميرة نورة', category: 'أكاديمي' },
    { name: 'شركة أرامكو السعودية', category: 'خاص' },
    { name: 'البنك السعودي للاستثمار', category: 'خاص' },
    { name: 'مؤسسة محمد وعبدالله إبراهيم السبيعي الخيرية', category: 'خيري' }
  ];

  const projects = [
    {
      title: 'برنامج الشراكات الاستراتيجية',
      description: 'خطة متكاملة لتطوير شراكات استراتيجية مع المؤسسات الرائدة في القطاعين العام والخاص',
      status: 'مستمر',
      year: '2023-2024'
    },
    {
      title: 'ملتقى الجهات الداعمة للعلوم السياسية',
      description: 'ملتقى سنوي يجمع الجهات الداعمة لتخصصات العلوم السياسية لتعزيز التكامل وتبادل الخبرات',
      status: 'قيد التنفيذ',
      year: '2024'
    },
    {
      title: 'مبادرة التوأمة المؤسسية',
      description: 'برنامج للتوأمة مع جمعيات علمية دولية مماثلة لتبادل المعرفة والتجارب',
      status: 'قيد التخطيط',
      year: '2024-2025'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <CommitteeNav />
      <h2 className="text-2xl font-bold mb-6">لجنة الاتصال المؤسسي والعلاقات العامة</h2>
      
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-8 rounded-lg mb-8">
        <div className="flex items-center mb-4">
          <span className="text-4xl bg-white text-blue-800 p-3 rounded-full mr-4">🤝</span>
          <h2 className="text-2xl font-bold">الاتصال المؤسسي والعلاقات العامة</h2>
        </div>
        <p className="text-blue-100 text-lg">
          تعمل اللجنة على بناء وتعزيز العلاقات مع المؤسسات والهيئات ذات العلاقة، وتطوير الشراكات الاستراتيجية، وتمثيل الجمعية في المحافل المختلفة، بما يسهم في تحقيق رسالة الجمعية وأهدافها.
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
                      : project.status === 'مستمر' || project.status === 'قيد التنفيذ'
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
        <h3 className="text-xl font-semibold mb-6 text-blue-800">شركاؤنا</h3>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {partners.map((partner, index) => (
              <div key={index} className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <p className="font-semibold mb-1">{partner.name}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  partner.category === 'حكومي' 
                    ? 'bg-blue-100 text-blue-700' 
                    : partner.category === 'أكاديمي'
                      ? 'bg-green-100 text-green-700'
                      : partner.category === 'بحثي'
                        ? 'bg-purple-100 text-purple-700'
                        : partner.category === 'خاص'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                }`}>
                  {partner.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 text-blue-800">خدمات العلاقات المؤسسية</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-700 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2">بناء الشراكات</h4>
            </div>
            <p className="text-gray-600 text-center">تطوير شراكات استراتيجية مع المؤسسات المختلفة في القطاعين العام والخاص</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-700 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2">تنظيم الفعاليات</h4>
            </div>
            <p className="text-gray-600 text-center">تنظيم الملتقيات واللقاءات مع الشركاء والجهات ذات العلاقة</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-700 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2">بناء السمعة المؤسسية</h4>
            </div>
            <p className="text-gray-600 text-center">تعزيز سمعة الجمعية وبناء صورتها الإيجابية لدى المجتمع والمؤسسات</p>
          </div>
        </div>
      </div>

      <CommitteeContact committee="corporate" />
    </div>
  );
};

export default CorporateCommittee;