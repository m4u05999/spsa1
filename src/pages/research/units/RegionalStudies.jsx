// src/pages/research/units/RegionalStudies.jsx
import React from 'react';
import ResearchUnitLayout from '../components/ResearchUnitLayout';
import ResearchSubGroup from '../components/ResearchSubGroup';

const RegionalStudies = () => {
  const unitData = {
    title: 'وحدة الدراسات الإقليمية',
    description: 'تختص وحدة الدراسات الإقليمية بدراسة وتحليل التطورات السياسية والاقتصادية والاجتماعية في مناطق مختلفة من العالم، مع التركيز على منطقة الشرق الأوسط والخليج العربي.',
    members: [
      {
        name: 'د. محمد العمري',
        role: 'رئيس الوحدة',
        image: '/assets/images/members/omar.jpg'
      },
      {
        name: 'د. فاطمة الزهراني',
        role: 'باحث رئيسي',
        image: '/assets/images/members/fatima.jpg'
      },
      {
        name: 'د. عبدالله القحطاني',
        role: 'باحث مشارك',
        image: '/assets/images/members/abdullah.jpg'
      }
    ],
    currentProjects: [
      {
        title: 'التحولات الجيوسياسية في الشرق الأوسط',
        description: 'دراسة تحليلية للمتغيرات الإقليمية وتأثيراتها على المنطقة'
      },
      {
        title: 'العلاقات الخليجية-الآسيوية',
        description: 'دراسة العلاقات الاقتصادية والسياسية بين دول الخليج وآسيا'
      }
    ],
    publications: [
      {
        title: 'الاستثنائية التنموية الأوروبية «الحروب نموذجاً»',
        authors: ['أ.د. عبد الله بن جمعان الغامدي'],
        date: '2023',
        group: 'مجموعة الدراسات الأوروبية',
        pdfUrl: '/assets/documents/publications/european-development-exceptionalism-wars.pdf'
      },
      {
        title: 'السياسة الخارجية السعودية: نحو صياغة جديدة',
        authors: ['أ.د. صالح محمد الخثلان'],
        date: '2022',
        group: 'مجموعة دراسات المملكة',
        pdfUrl: '/assets/documents/publications/saudi-foreign-policy-new-formulation.pdf'
      },
      {
        title: 'السياسة الخارجية التركية تجاه منطقة الشرق الأوسط',
        authors: ['د. أحمد محمد وهبان'],
        date: 'يونيو 2013',
        group: 'مجموعة دراسات الشرق الأوسط (تركيا)',
        pdfUrl: '/assets/documents/publications/turkish-foreign-policy-middle-east.pdf'
      }
    ]
  };

  const researchGroups = [
    {
      title: 'مجموعة دراسات المملكة',
      description: 'تتناول الدراسات المتعلقة بالمملكة العربية السعودية وتطورها السياسي والاقتصادي والاجتماعي.',
      topics: ['رؤية المملكة 2030', 'التنمية الاقتصادية والاستدامة', 'السياسة الخارجية السعودية']
    },
    {
      title: 'مجموعة الدراسات الأوروبية',
      description: 'تهتم بدراسة التطورات السياسية والاقتصادية في القارة الأوروبية والاتحاد الأوروبي.',
      topics: ['مستقبل الاتحاد الأوروبي', 'العلاقات الأوروبية العربية', 'السياسات الأوروبية تجاه الشرق الأوسط']
    },
    {
      title: 'مجموعة دراسات أمريكا اللاتينية',
      description: 'تركز على دراسة ديناميات السياسة والاقتصاد في دول أمريكا اللاتينية.',
      topics: ['التحولات السياسية في أمريكا اللاتينية', 'العلاقات العربية اللاتينية', 'قضايا التنمية والتحديات الاقتصادية']
    },
    {
      title: 'مجموعة الدراسات الاسيوية',
      description: 'تهتم بدراسة القوى الصاعدة في آسيا والتحولات الاقتصادية والسياسية في المنطقة.',
      topics: ['التنافس الاقتصادي في آسيا', 'التكتلات الاقتصادية الآسيوية', 'العلاقات الخليجية الآسيوية']
    },
    {
      title: 'مجموعة الدراسات الافريقية',
      description: 'تتناول التطورات السياسية والاقتصادية في القارة الأفريقية والفرص والتحديات التي تواجهها.',
      topics: ['التنمية المستدامة في أفريقيا', 'الصراعات والاستقرار السياسي', 'العلاقات العربية الأفريقية']
    },
    {
      title: 'مجموعة دراسات الشرق الأوسط',
      description: 'تتخصص في دراسة القضايا الاستراتيجية والأمنية والسياسية في منطقة الشرق الأوسط.',
      subtopics: [
        {
          title: 'إيران',
          description: 'دراسة السياسات الإيرانية في المنطقة وعلاقاتها الإقليمية والدولية.',
          topics: ['السياسة الخارجية الإيرانية', 'الملف النووي الإيراني', 'إيران والأمن الإقليمي']
        },
        {
          title: 'تركيا',
          description: 'تحليل الدور التركي في المنطقة والسياسات التركية تجاه القضايا الإقليمية.',
          topics: ['السياسة الخارجية التركية', 'تركيا والاتحاد الأوروبي', 'الدور التركي في الأزمات الإقليمية']
        },
        {
          title: 'دول الخليج',
          description: 'دراسة العلاقات بين دول مجلس التعاون الخليجي والتحديات المشتركة.',
          topics: ['التكامل الاقتصادي الخليجي', 'الأمن الإقليمي الخليجي', 'العلاقات الخليجية الدولية']
        },
        {
          title: 'الدول العربية',
          description: 'تحليل التطورات السياسية والاقتصادية في الدول العربية غير الخليجية.',
          topics: ['التحولات السياسية في العالم العربي', 'التحديات الاقتصادية والاجتماعية', 'العلاقات العربية البينية']
        },
        {
          title: 'القضية الفلسطينية',
          description: 'دراسة تطورات القضية الفلسطينية والمواقف الإقليمية والدولية منها.',
          topics: ['مسار التسوية السلمية', 'المواقف الدولية من القضية الفلسطينية', 'مستقبل القضية الفلسطينية']
        }
      ]
    },
    {
      title: 'مجموعة الدراسات الامريكية والكندية',
      description: 'تهتم بتحليل السياسات الأمريكية والكندية وتأثيرها على النظام الدولي والمنطقة.',
      topics: ['السياسة الخارجية الأمريكية تجاه الشرق الأوسط', 'العلاقات الأمريكية الخليجية', 'السياسات الكندية الدولية']
    },
    {
      title: 'مجموعة الدراسات الصينية',
      description: 'تتناول صعود الصين كقوة عالمية وسياساتها الاقتصادية والخارجية.',
      topics: ['مبادرة الحزام والطريق', 'العلاقات الصينية العربية', 'التنافس الصيني الأمريكي']
    },
    {
      title: 'مجموعة الدراسات الروسية',
      description: 'تركز على تحليل السياسات الروسية ودورها في القضايا الدولية والإقليمية.',
      topics: ['الدور الروسي في الشرق الأوسط', 'العلاقات الروسية العربية', 'روسيا والنظام الدولي']
    }
  ];

  // فلترة المنشورات حسب المجموعة البحثية
  const getPublicationsForGroup = (groupTitle) => {
    // حالة خاصة لمعالجة منشورات "مجموعة دراسات الشرق الأوسط" وعناصرها الفرعية
    if (groupTitle === "مجموعة دراسات الشرق الأوسط") {
      // إرجاع المنشورات التي تحتوي على "مجموعة دراسات الشرق الأوسط" في اسم المجموعة
      // ولكن استثناء تلك التي تحتوي على أقواس، لأنها مخصصة للفروع
      return unitData.publications.filter(pub => 
        pub.group.includes("مجموعة دراسات الشرق الأوسط") && 
        !pub.group.includes("(") // استثناء المنشورات التي تنتمي للفروع
      );
    }
    
    // للمجموعات الأخرى، نستخدم التطابق الدقيق
    return unitData.publications.filter(pub => pub.group === groupTitle);
  };
  
  // الحصول على جميع المنشورات لمجموعة معينة بما في ذلك الفروع - يستخدم لتمرير جميع المنشورات للمكون
  const getAllPublicationsForGroup = (groupTitle) => {
    if (groupTitle === "مجموعة دراسات الشرق الأوسط") {
      return unitData.publications.filter(pub => 
        pub.group.includes("مجموعة دراسات الشرق الأوسط")
      );
    }
    
    return unitData.publications.filter(pub => pub.group === groupTitle);
  };

  // إنشاء نسخة من وحدة البحث بدون المنشورات لعرضها في الصفحة الرئيسية
  const unitDataWithoutPublications = {
    ...unitData,
    publications: [] // إزالة المنشورات من الصفحة الرئيسية
  };

  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <ResearchUnitLayout {...unitDataWithoutPublications} />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">المجموعات البحثية</h2>
          <div className="space-y-6">
            {researchGroups.map((group, index) => (
              <ResearchSubGroup 
                key={index} 
                group={group} 
                publications={getAllPublicationsForGroup(group.title)} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionalStudies;