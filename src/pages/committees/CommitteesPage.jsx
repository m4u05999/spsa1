// src/pages/committees/CommitteesPage.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import CommitteeCard from '../../components/committees/CommitteeCard';
import CommitteeNav from '../../components/committees/CommitteeNav';
import ScientificCommittee from './ScientificCommittee';
import MediaCommittee from './MediaCommittee';
import LegalCommittee from './LegalCommittee';
import CorporateCommittee from './CorporateCommittee';
import FinanceCommittee from './FinanceCommittee';

const CommitteesPage = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // تحديد المكون المناسب حسب المسار
  const renderCommitteeContent = () => {
    switch (currentPath) {
      case '/committees/scientific':
        return <ScientificCommittee />;
      case '/committees/media':
        return <MediaCommittee />;
      case '/committees/legal':
        return <LegalCommittee />;
      case '/committees/corporate':
        return <CorporateCommittee />;
      case '/committees/finance':
        return <FinanceCommittee />;
      default:
        // الصفحة الرئيسية للجان
        return <CommitteesMainPage />;
    }
  };

  return renderCommitteeContent();
};

// مكون الصفحة الرئيسية للجان
const CommitteesMainPage = () => {
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