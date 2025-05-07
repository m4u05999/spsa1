import React from 'react';
import CommitteeNav from '../../components/committees/CommitteeNav';
import MembersList from '../../components/committees/MembersList';
import CommitteeContact from '../../components/committees/CommitteeContact';

const FinanceCommittee = () => {
  const members = [
    { name: 'أ. ماجد الحربي', role: 'رئيس اللجنة', title: 'مستشار مالي واستثماري' },
    { name: 'أ. فاطمة السلمي', role: 'نائب الرئيس', title: 'محاسبة قانونية' },
    { name: 'أ. سعود الشهراني', role: 'عضو', title: 'أخصائي الميزانية والتخطيط المالي' },
    { name: 'أ. نورة العتيبي', role: 'عضو', title: 'مراجعة حسابات' }
  ];

  const responsibilities = [
    'إعداد الميزانية السنوية للجمعية ومتابعة تنفيذها',
    'الإشراف على الموارد المالية وإدارتها بكفاءة',
    'مراجعة التقارير المالية الدورية والسنوية',
    'تطوير استراتيجيات لزيادة الموارد المالية للجمعية',
    'ضمان الامتثال للمتطلبات المالية والمحاسبية'
  ];

  const achievements = [
    'تحسين كفاءة الإنفاق وتقليل التكاليف التشغيلية بنسبة 15%',
    'تنويع مصادر الدخل من خلال برامج العضويات والرعايات',
    'تطوير نظام مالي إلكتروني متكامل',
    'إعداد دليل السياسات والإجراءات المالية',
    'الحصول على تقييم "ممتاز" في المراجعة المالية السنوية'
  ];

  const projects = [
    {
      title: 'نظام الإدارة المالية الإلكتروني',
      description: 'نظام متكامل لإدارة الشؤون المالية للجمعية بشكل إلكتروني، يشمل الميزانية والمصروفات والإيرادات والتقارير',
      status: 'مكتمل',
      year: '2023'
    },
    {
      title: 'استراتيجية تنمية الموارد المالية',
      description: 'خطة استراتيجية لتنويع مصادر الدخل وزيادة الاستدامة المالية للجمعية',
      status: 'قيد التنفيذ',
      year: '2023-2024'
    },
    {
      title: 'برنامج الشفافية المالية',
      description: 'مبادرة لتعزيز الشفافية المالية من خلال نشر تقارير دورية عن الأداء المالي للجمعية',
      status: 'قيد الإعداد',
      year: '2024'
    }
  ];

  const financialSources = [
    { source: 'رسوم العضوية', percentage: 35 },
    { source: 'الرعايات والدعم المؤسسي', percentage: 25 },
    { source: 'المؤتمرات والفعاليات', percentage: 20 },
    { source: 'الاستشارات والخدمات العلمية', percentage: 15 },
    { source: 'أوقاف الجمعية', percentage: 5 }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <CommitteeNav />
      <h2 className="text-2xl font-bold mb-6">اللجنة المالية</h2>
      
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-8 rounded-lg mb-8">
        <div className="flex items-center mb-4">
          <span className="text-4xl bg-white text-blue-800 p-3 rounded-full mr-4">💰</span>
          <h2 className="text-2xl font-bold">اللجنة المالية</h2>
        </div>
        <p className="text-blue-100 text-lg">
          تتولى اللجنة المالية مسؤولية إدارة الموارد المالية للجمعية وضمان استدامتها، وإعداد الميزانيات والتقارير المالية، وتطوير استراتيجيات لتنمية الموارد المالية.
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

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-6 text-blue-800">مصادر التمويل</h3>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-4">توزيع مصادر الدخل</h4>
              <div className="space-y-3">
                {financialSources.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">{item.source}</span>
                      <span className="text-gray-600 font-semibold">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-lg mb-4">التبرعات والدعم</h4>
              <p className="text-gray-700 mb-4">
                تعتمد الجمعية على دعم المؤسسات والأفراد المهتمين بتطوير مجال العلوم السياسية. يمكنكم المساهمة في دعم أنشطة الجمعية عبر:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>العضوية السنوية</li>
                <li>رعاية الفعاليات والمؤتمرات</li>
                <li>دعم البرامج البحثية</li>
                <li>التبرع لصندوق الجمعية</li>
              </ul>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                طرق الدعم
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 text-blue-800">الخدمات المالية</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-700 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2">التقارير المالية</h4>
            </div>
            <p className="text-gray-600 text-center">إعداد ونشر التقارير المالية الدورية والسنوية بشفافية</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-700 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2">إدارة الموارد المالية</h4>
            </div>
            <p className="text-gray-600 text-center">إدارة وتنمية الموارد المالية للجمعية بكفاءة وفاعلية</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-700 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2">المراجعة والتدقيق</h4>
            </div>
            <p className="text-gray-600 text-center">إجراء المراجعات والتدقيق المالي الدوري والسنوي</p>
          </div>
        </div>
      </div>

      <CommitteeContact committee="finance" />
    </div>
  );
};

export default FinanceCommittee;