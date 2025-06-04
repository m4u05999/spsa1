// src/pages/research/units/InternationalRelations.jsx
import React from 'react';
import ResearchUnitLayout from '../components/ResearchUnitLayout';
import ResearchSubGroup from '../components/ResearchSubGroup';

const InternationalRelations = () => {
  const unitData = {
    title: 'وحدة العلاقات الدولية',
    description: 'تختص وحدة العلاقات الدولية بدراسة التفاعلات بين الدول والمنظمات الدولية، وتحليل السياسات الخارجية والقضايا العالمية مثل الأمن والسلام والتعاون الدولي.',
    members: [
      {
        name: 'د. خالد المنصور',
        role: 'رئيس الوحدة',
        image: '/assets/images/members/khaled.jpg'
      },
      {
        name: 'د. سارة العتيبي',
        role: 'باحث رئيسي',
        image: '/assets/images/members/sara.jpg'
      },
      {
        name: 'د. فيصل الشمري',
        role: 'باحث مشارك',
        image: '/assets/images/members/faisal.jpg'
      }
    ],
    currentProjects: [
      {
        title: 'تحولات النظام الدولي في ظل الأزمات العالمية',
        description: 'دراسة تحليلية للمتغيرات في بنية النظام الدولي وأثر الأزمات العالمية عليه'
      },
      {
        title: 'دور المنظمات الدولية في حل النزاعات',
        description: 'تقييم فعالية المنظمات الدولية في التعامل مع النزاعات الإقليمية والدولية'
      }
    ],
    publications: [
      {
        title: 'مستقبل النظام الدولي متعدد الأقطاب',
        authors: ['د. خالد المنصور', 'د. سارة العتيبي'],
        date: '2023',
        pdfUrl: '/assets/documents/publications/multipolar-international-system.pdf'
      },
      {
        title: 'تحديات الحوكمة العالمية في القرن الحادي والعشرين',
        authors: ['د. فيصل الشمري'],
        date: '2022',
        pdfUrl: '/assets/documents/publications/global-governance-challenges.pdf'
      }
    ]
  };

  const researchGroups = [
    {
      title: 'مجموعة دراسات الحرب والسلام',
      description: 'تتناول دراسة النزاعات المسلحة وقضايا الأمن العالمي وجهود السلام وحل النزاعات.',
      topics: ['نظريات السلام والنزاع', 'المنظمات الدولية وحفظ السلام', 'أنماط الحروب المعاصرة وتأثيراتها']
    },
    {
      title: 'مجموعة السياسات الخارجية',
      description: 'تهتم بتحليل السياسات الخارجية للدول وعمليات صنع القرار في العلاقات الدولية.',
      topics: ['السياسة الخارجية للقوى الكبرى', 'السياسات الخارجية العربية', 'أدوات تنفيذ السياسة الخارجية']
    },
    {
      title: 'مجموعة دراسة المنظمات الدولية',
      description: 'تركز على دراسة المنظمات الدولية والإقليمية ودورها في النظام الدولي.',
      topics: ['الأمم المتحدة ومستقبلها', 'المنظمات الإقليمية وفعاليتها', 'إصلاح المؤسسات الدولية']
    },
    {
      title: 'مجموعة الدراسات الدبلوماسية',
      description: 'تبحث في تطور الدبلوماسية وأساليبها ووسائلها المختلفة في العلاقات الدولية.',
      topics: ['الدبلوماسية متعددة الأطراف', 'الدبلوماسية الرقمية', 'الدبلوماسية الثقافية والعامة']
    },
    {
      title: 'مجموعة دراسات إدارة الأزمات والمخاطر الدولية',
      description: 'تختص بدراسة أساليب التعامل مع الأزمات الدولية والمخاطر العابرة للحدود.',
      topics: ['نماذج إدارة الأزمات الدولية', 'الأوبئة والكوارث كتهديدات عالمية', 'التعاون الدولي في مواجهة المخاطر']
    },
    {
      title: 'مجموعة دراسات الأمن الدولي',
      description: 'تتناول قضايا الأمن بمفهومه الشامل والتهديدات الأمنية المعاصرة.',
      topics: ['الأمن السيبراني والحروب الإلكترونية', 'مكافحة الإرهاب والتطرف', 'الأمن الإنساني والبيئي']
    },
    {
      title: 'مجموعة دراسات المشكلات الدولية المعاصرة',
      description: 'تركز على تحليل القضايا والتحديات العالمية المعاصرة وسبل معالجتها.',
      topics: ['التغير المناخي والأمن البيئي', 'الهجرة غير النظامية واللاجئين', 'الفقر وعدم المساواة العالمية']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <ResearchUnitLayout {...unitData} />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">المجموعات البحثية</h2>
          <div className="space-y-6">
            {researchGroups.map((group, index) => (
              <ResearchSubGroup key={index} group={group} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternationalRelations;