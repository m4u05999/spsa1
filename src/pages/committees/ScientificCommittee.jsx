// src/pages/committees/ScientificCommittee.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import CommitteeNav from '../../components/committees/CommitteeNav';
import MembersList from '../../components/committees/MembersList';
import CommitteeContact from '../../components/committees/CommitteeContact';
import ResearchUnitCard from '../../components/committees/ResearchUnitCard';

const ScientificCommittee = () => {
  const members = [
    { name: 'أ.د. محمد السيد', role: 'رئيس اللجنة', title: 'أستاذ العلوم السياسية' },
    { name: 'د. أحمد العمري', role: 'نائب الرئيس', title: 'أستاذ مشارك' },
    { name: 'د. فاطمة الزهراني', role: 'عضو', title: 'أستاذ مساعد' }
  ];

  const responsibilities = [
    'تقديم الاستشارات العلمية في مجال العلوم السياسية',
    'تطوير البرامج الأكاديمية والبحثية',
    'تنظيم المؤتمرات والندوات العلمية',
    'مراجعة وتحكيم الأبحاث والدراسات',
    'الإشراف على الوحدات البحثية التابعة للجنة'
  ];

  const researchUnits = [
    {
      id: 'curriculum',
      title: 'وحدة المناهج والتقارير الإحصائية',
      description: 'تختص بتطوير المناهج التعليمية وإعداد التقارير الإحصائية في مجال العلوم السياسية',
      icon: '📊',
      link: '/committees/scientific/curriculum'
    },
    {
      id: 'political-economy',
      title: 'وحدة علم الاقتصاد السياسي',
      description: 'تهتم بدراسة العلاقة بين السياسة والاقتصاد وتأثير كل منهما على الآخر',
      icon: '💹',
      link: '/committees/scientific/political-economy'
    },
    {
      id: 'political-media',
      title: 'وحدة علم الاعلام السياسي',
      description: 'تركز على دراسة العلاقة بين وسائل الإعلام والنظم السياسية وتأثيرها على الرأي العام',
      icon: '📱',
      link: '/committees/scientific/political-media'
    },
    {
      id: 'political-psychology',
      title: 'وحدة علم النفس السياسي',
      description: 'تدرس الجوانب النفسية للسلوك السياسي والقرارات السياسية',
      icon: '🧠',
      link: '/committees/scientific/political-psychology'
    },
    {
      id: 'women-empowerment',
      title: 'وحدة دراسات تمكين المرأة',
      description: 'تختص بالقضايا المتعلقة بتمكين المرأة في المجال السياسي وصنع القرار',
      icon: '👩‍💼',
      link: '/committees/scientific/women-empowerment'
    }
  ];

  const achievements = [
    'إصدار ٥ كتب متخصصة في العلوم السياسية خلال العام الماضي',
    'تنظيم مؤتمرين دوليين بمشاركة باحثين من ١٥ دولة',
    'نشر أكثر من ٣٠ بحثًا علميًا في مجلات محلية ودولية محكمة',
    'إطلاق برنامج تدريبي لتأهيل الباحثين الشباب في مجال العلوم السياسية'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <CommitteeNav />
      <h2 className="text-2xl font-bold mb-6">اللجنة العلمية والاستشارية</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">المهام والمسؤوليات</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {responsibilities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <MembersList members={members} />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">إنجازات اللجنة</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {achievements.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-6">الوحدات البحثية التابعة للجنة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {researchUnits.map((unit) => (
            <ResearchUnitCard key={unit.id} {...unit} />
          ))}
        </div>
      </div>

      <CommitteeContact committee="scientific" />
    </div>
  );
};

export default ScientificCommittee;