// src/pages/research/units/PoliticalThought.jsx
import React from 'react';
import ResearchUnitLayout from '../components/ResearchUnitLayout';
import ResearchSubGroup from '../components/ResearchSubGroup';

const PoliticalThought = () => {
  const unitData = {
    title: 'وحدة الفكر السياسي والنظرية السياسية',
    description: 'تختص وحدة الفكر السياسي بدراسة النظريات والأفكار السياسية وتطورها التاريخي وتأثيرها على الواقع السياسي المعاصر، وتحليل الاتجاهات الفكرية المختلفة.',
    members: [
      {
        name: 'د. عبدالرحمن الشهري',
        role: 'رئيس الوحدة',
        image: '/assets/images/members/abdulrahman.jpg'
      },
      {
        name: 'د. منيرة السبيعي',
        role: 'باحث رئيسي',
        image: '/assets/images/members/munira.jpg'
      },
      {
        name: 'د. سلمان الحربي',
        role: 'باحث مشارك',
        image: '/assets/images/members/salman.jpg'
      }
    ],
    currentProjects: [
      {
        title: 'تجديد الفكر السياسي الإسلامي المعاصر',
        description: 'دراسة تحليلية لاتجاهات التجديد في الفكر السياسي الإسلامي'
      },
      {
        title: 'الليبرالية والديمقراطية في العالم العربي',
        description: 'تحليل نقدي للأطروحات الليبرالية وتطبيقاتها في السياق العربي'
      }
    ],
    publications: [
      {
        title: 'الفكر السياسي الإسلامي المعاصر: اتجاهات ومدارس',
        authors: ['د. عبدالرحمن الشهري', 'د. منيرة السبيعي'],
        date: '2022'
      },
      {
        title: 'نقد النظريات الغربية في العلوم السياسية من منظور حضاري',
        authors: ['د. سلمان الحربي'],
        date: '2023'
      }
    ]
  };

  const researchGroups = [
    {
      title: 'الفكر السياسي الغربي',
      description: 'تختص بدراسة تطور الأفكار والنظريات السياسية في الحضارة الغربية وتأثيرها على الفكر السياسي العالمي.',
      topics: ['النظريات الليبرالية المعاصرة', 'الديمقراطية ومدارسها الفكرية', 'ما بعد الحداثة والنظرية السياسية']
    },
    {
      title: 'الفكر السياسي الإسلامي',
      description: 'تهتم بدراسة التراث السياسي الإسلامي وتطوراته المعاصرة والإسهامات الفكرية للمفكرين المسلمين.',
      topics: ['نظريات الحكم في الفكر الإسلامي', 'اتجاهات التجديد في الفكر السياسي الإسلامي', 'قضايا المواطنة والعدالة في الفكر الإسلامي']
    },
    {
      title: 'العقائد الشمولية والمتطرفة',
      description: 'تتناول بالدراسة النظريات والأيديولوجيات الشمولية وتأثيرها السياسي والاجتماعي.',
      topics: ['الفاشية والنازية', 'الشيوعية والماركسية', 'الأصولية والتطرف الديني']
    },
    {
      title: 'الحركات الإسلامية والاخوان المسلمين',
      description: 'تختص بتحليل الحركات الإسلامية وفكرها السياسي وتطوره التاريخي وتأثيرها في الواقع المعاصر.',
      topics: ['الفكر السياسي لجماعة الإخوان المسلمين', 'تطور الحركات الإسلامية المعاصرة', 'الإسلام السياسي ومابعد الإسلاموية']
    },
    {
      title: 'الدين والدولة',
      description: 'تبحث في العلاقة بين الدين والدولة ونماذجها المختلفة وتطبيقاتها المعاصرة.',
      topics: ['العلمانية والدين في السياسة', 'نماذج العلاقة بين الدين والدولة', 'الدين والسياسات العامة']
    },
    {
      title: 'الأمن الفكري',
      description: 'تركز على قضايا الأمن الفكري وحماية المجتمع من الأفكار المتطرفة وتعزيز الوسطية والاعتدال.',
      topics: ['استراتيجيات مواجهة التطرف الفكري', 'تعزيز الأمن الفكري في المجتمع', 'الخطاب الديني المعتدل']
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

export default PoliticalThought;