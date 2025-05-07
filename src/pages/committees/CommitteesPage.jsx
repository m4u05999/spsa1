// src/pages/committees/CommitteesPage.jsx
import React from 'react';
import CommitteeCard from '../../components/committees/CommitteeCard';
import CommitteeNav from '../../components/committees/CommitteeNav';

const CommitteesPage = () => {
  const committees = [
    {
      title: 'اللجنة العلمية والاستشارية',
      description: 'تقديم الاستشارات العلمية وتطوير البرامج الأكاديمية',
      link: '/committees/scientific',
      icon: '🎓'
    },
    {
      title: 'اللجنة الإعلامية',
      description: 'إدارة التواصل الإعلامي والتغطية الإخبارية للفعاليات',
      link: '/committees/media',
      icon: '📱'
    },
    {
      title: 'اللجنة القانونية',
      description: 'تقديم الاستشارات القانونية وصياغة اللوائح',
      link: '/committees/legal',
      icon: '⚖️'
    },
    {
      title: 'الاتصال المؤسسي',
      description: 'إدارة العلاقات مع المؤسسات والجهات ذات العلاقة',
      link: '/committees/corporate',
      icon: '🤝'
    },
    {
      title: 'اللجنة المالية',
      description: 'إدارة الشؤون المالية والميزانية',
      link: '/committees/finance',
      icon: '💰'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">لجان الجمعية</h1>
      <CommitteeNav />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {committees.map((committee, index) => (
          <CommitteeCard key={index} {...committee} />
        ))}
      </div>
    </div>
  );
};

export default CommitteesPage;