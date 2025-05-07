// src/pages/news/NewsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const mockNews = [
  {
    id: 1,
    title: 'المؤتمر السنوي للعلوم السياسية 2025',
    date: '2025-01-15',
    description: 'يسر جمعية العلوم السياسية أن تعلن عن انطلاق فعاليات المؤتمر السنوي للعام 2025 تحت عنوان "التحولات السياسية في العالم العربي".',
    image: '/assets/images/conference.jpg'
  },
  {
    id: 2,
    title: 'دورة تدريبية في التحليل السياسي',
    date: '2025-02-01',
    description: 'تنظم الجمعية دورة تدريبية متخصصة في مجال التحليل السياسي للباحثين والمهتمين في المجال السياسي.',
    image: '/assets/images/training.jpg'
  },
  {
    id: 3,
    title: 'إصدار العدد الجديد من المجلة العلمية',
    date: '2025-03-10',
    description: 'صدر العدد الجديد من المجلة العلمية للجمعية متضمناً مجموعة من البحوث والدراسات المتميزة.',
    image: '/assets/images/journal.jpg'
  }
];

const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('ar-SA', options);
};

const NewsCard = ({ news }) => (
  <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="relative overflow-hidden">
      <img
        src={news.image}
        alt={news.title}
        className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="p-4 sm:p-6">
      <div className="text-sm text-gray-500 mb-2">
        {formatDate(news.date)}
      </div>
      <h2 className="text-lg sm:text-xl font-bold mb-3 text-blue-900 hover:text-blue-700 transition-colors">
        {news.title}
      </h2>
      <p className="text-gray-600 mb-4 text-sm sm:text-base line-clamp-3">
        {news.description}
      </p>
      <Link
        to={`/news/${news.id}`}
        className="inline-block bg-blue-900 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-blue-800 transition-colors duration-300 text-sm sm:text-base"
      >
        اقرأ المزيد
      </Link>
    </div>
  </article>
);

const NewsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">أخبار الجمعية</h1>
          <p className="text-base sm:text-xl text-blue-200">
            آخر الأخبار والمستجدات في مجال العلوم السياسية
          </p>
        </div>
      </div>

      {/* News Grid */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {mockNews.map((newsItem) => (
            <NewsCard key={newsItem.id} news={newsItem} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 sm:mt-12 flex justify-center">
          <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="التنقل بين الصفحات">
            <button 
              className="px-3 sm:px-4 py-2 border rounded-md hover:bg-gray-50 text-sm sm:text-base"
              aria-label="الصفحة السابقة"
            >
              السابق
            </button>
            <button className="px-3 sm:px-4 py-2 bg-blue-900 text-white rounded-md text-sm sm:text-base">
              1
            </button>
            <button className="px-3 sm:px-4 py-2 border rounded-md hover:bg-gray-50 text-sm sm:text-base">
              2
            </button>
            <button className="px-3 sm:px-4 py-2 border rounded-md hover:bg-gray-50 text-sm sm:text-base">
              3
            </button>
            <button 
              className="px-3 sm:px-4 py-2 border rounded-md hover:bg-gray-50 text-sm sm:text-base"
              aria-label="الصفحة التالية"
            >
              التالي
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;