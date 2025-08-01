// src/pages/news/NewsDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ImageComponent from '../../components/ImageComponent';
import { useMasterData } from '../../hooks/useMasterData';



const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('ar-SA', options);
};

const NewsDetailsPage = () => {
  const { id } = useParams();

  // استخدام MasterDataService للحصول على البيانات
  const {
    data: allNews,
    loading,
    error,
    getContentById,
    searchContent
  } = useMasterData('news');

  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);

  // جلب بيانات الخبر المحدد والأخبار ذات الصلة
  useEffect(() => {
    const fetchNewsData = async () => {
      if (id) {
        try {
          // جلب الخبر المحدد
          const newsItem = await getContentById(id);

          if (newsItem) {
            setNews(newsItem);

            // جلب الأخبار ذات الصلة (نفس الفئة أو الكلمات المفتاحية)
            if (newsItem.category || newsItem.tags) {
              const relatedResults = await searchContent('', {
                contentType: 'news',
                category: newsItem.category,
                tags: newsItem.tags,
                limit: 3,
                excludeId: id
              });
              setRelatedNews(relatedResults || []);
            }
          }
        } catch (err) {
          console.error('خطأ في جلب بيانات الخبر:', err);
        }
      }
    };

    fetchNewsData();
  }, [id, getContentById, searchContent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 rtl py-12" dir="rtl">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded w-full"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 rtl py-12" dir="rtl">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            <p>{error}</p>
          </div>
          <div className="text-center">
            <Link to="/news" className="inline-block bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-colors">
              العودة إلى صفحة الأخبار
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return news && (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Link to="/news" className="text-blue-200 hover:text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                العودة إلى الأخبار
              </Link>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">{news.title}</h1>
            <div className="flex items-center text-blue-200 text-sm sm:text-base">
              <span>{formatDate(news.date)}</span>
              <span className="mx-2">•</span>
              <span>{news.author}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* صورة الخبر */}
        <div className="mb-8">
          <ImageComponent
            src={news.image}
            alt={news.title}
            className="w-full rounded-lg shadow-md"
            fallbackSrc="/assets/images/default-article.jpg"
          />
        </div>

        {/* محتوى الخبر */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div 
            className="prose prose-blue max-w-none"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>

        {/* أخبار ذات صلة */}
        {relatedNews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6 border-r-4 border-blue-900 pr-4">أخبار ذات صلة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedNews.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/news/${item.id}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md overflow-hidden border border-gray-100 transition-all duration-300"
                >
                  <div className="relative overflow-hidden h-40">
                    <ImageComponent
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackSrc="/assets/images/default-article.jpg"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-gray-500 mb-1">
                      {formatDate(item.date)}
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link 
            to="/news" 
            className="inline-block border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-6 py-2 rounded-md transition-colors"
          >
            العودة إلى جميع الأخبار
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailsPage;
