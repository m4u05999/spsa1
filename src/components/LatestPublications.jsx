// src/components/LatestPublications.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { buttonStyles, cardStyles } from '../utils/theme';

const LatestPublications = () => {
  const publications = [
    {
      id: 1,
      title: "تحليل تأثير الأزمات العالمية على النظم السياسية",
      author: "د. محمد أحمد",
      date: "5 أبريل 2024",
      category: "دراسات دولية",
      imageUrl: "/assets/images/publications/image (7).png",
      abstract: "دراسة تحليلية لتأثير الأزمات العالمية المعاصرة على النظم السياسية المختلفة وآليات التكيف معها."
    },
    {
      id: 2,
      title: "الاستراتيجيات الجديدة في العلاقات الدبلوماسية",
      author: "د. سارة الكاظمي",
      date: "15 مارس 2024",
      category: "العلاقات الدولية",
      imageUrl: "/assets/images/publications/image (8).png",
      abstract: "بحث في أحدث الاستراتيجيات المتبعة في العلاقات الدبلوماسية الدولية والإقليمية وتأثيرها على توازنات القوى."
    },
    {
      id: 3,
      title: "الديمقراطية وتحديات العصر الرقمي",
      author: "د. خالد العمري",
      date: "28 فبراير 2024",
      category: "نظرية سياسية",
      imageUrl: "/assets/images/publications/image (9).png",
      abstract: "دراسة تحليلية للتحديات التي تواجه الأنظمة الديمقراطية في عصر التحول الرقمي وتأثيرات التكنولوجيا على المشاركة السياسية."
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">أحدث الإصدارات والأبحاث</h2>
          <Link to="/publications" className={buttonStyles.text}>
            عرض جميع الإصدارات <span className="mr-2">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((pub) => (
            <div 
              key={pub.id} 
              className={`${cardStyles.default.shadow} ${cardStyles.default.rounded} bg-white overflow-hidden transition-transform hover:translate-y-[-5px]`}
            >
              <div className="relative h-48">
                <img 
                  src={pub.imageUrl} 
                  alt={pub.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-blue-600 text-white py-1 px-3 rounded-full text-sm">
                  {pub.category}
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2 line-clamp-2">{pub.title}</h3>
                
                <div className="flex items-center mb-3 text-gray-600 text-sm">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {pub.author}
                  </div>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {pub.date}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{pub.abstract}</p>
                
                <Link to={`/publications/${pub.id}`}>
                  <button className={`${buttonStyles.outline} w-full`}>
                    قراءة البحث
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestPublications;