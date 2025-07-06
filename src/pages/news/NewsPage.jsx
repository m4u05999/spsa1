// src/pages/news/NewsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageComponent from '../../components/ImageComponent';
import { useContent } from '../../contexts/ContentContext.jsx';
import { CONTENT_TYPES, CONTENT_STATUS } from '../../schemas/contentManagementSchema.js';

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
      <ImageComponent
        src={news.featuredImage || news.image || '/assets/images/default-article.jpg'}
        alt={news.title}
        className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
        fallbackSrc="/assets/images/default-article.jpg"
      />
      {/* Featured Badge */}
      {news.isFeatured && (
        <div className="absolute top-4 right-4">
          <span className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm font-medium">
            مميز
          </span>
        </div>
      )}

      {/* Category Badge */}
      {news.category && (
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium">
            {news.category}
          </span>
        </div>
      )}
    </div>

    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <time dateTime={news.publishedAt || news.createdAt}>
          {formatDate(news.publishedAt || news.createdAt)}
        </time>

        {news.author && (
          <>
            <span className="mx-2">•</span>
            <span>{news.author}</span>
          </>
        )}
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
        <Link to={`/news/${news.slug || news.id}`}>
          {news.title}
        </Link>
      </h2>

      {news.excerpt && (
        <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-3">
          {news.excerpt}
        </p>
      )}

      <Link
        to={`/news/${news.slug || news.id}`}
        className="inline-block bg-blue-900 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-blue-800 transition-colors duration-300 text-sm sm:text-base"
      >
        اقرأ المزيد
      </Link>
    </div>
  </article>
);

const NewsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedNews, setDisplayedNews] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  // Use Content Context for real data
  const {
    content: allContent,
    loading,
    error,
    loadContent
  } = useContent();

  // Filter news from content
  const [allNews, setAllNews] = useState([]);

  useEffect(() => {
    // Load news when component mounts
    loadContent();
  }, []);

  useEffect(() => {
    // Filter news and articles from all content
    const newsContent = allContent.filter(item =>
      [CONTENT_TYPES.NEWS, CONTENT_TYPES.ARTICLE].includes(item.contentType) &&
      item.status === CONTENT_STATUS.PUBLISHED
    );

    // Sort by publication date (newest first)
    const sortedNews = newsContent.sort((a, b) =>
      new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
    );

    setAllNews(sortedNews);
    setTotalPages(Math.ceil(sortedNews.length / itemsPerPage));
  }, [allContent]);

  // تحديث الأخبار المعروضة عند تغيير الصفحة
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, allNews.length);
    setDisplayedNews(allNews.slice(startIndex, endIndex));
  }, [currentPage, allNews]);

  // التنقل بين الصفحات
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // انتقال للصفحة السابقة
  const goToPrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // انتقال للصفحة التالية
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Loading state
  if (loading && allNews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
        <div className="bg-blue-900 text-white py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">الأخبار والمقالات</h1>
            <p className="text-base sm:text-xl text-blue-200">
              تابع آخر الأخبار والمقالات في مجال العلوم السياسية
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل الأخبار...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
        <div className="bg-blue-900 text-white py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">الأخبار والمقالات</h1>
            <p className="text-base sm:text-xl text-blue-200">
              تابع آخر الأخبار والمقالات في مجال العلوم السياسية
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">حدث خطأ في تحميل الأخبار</p>
            <button
              onClick={() => loadContent()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">الأخبار والمقالات</h1>
          <p className="text-base sm:text-xl text-blue-200">
            تابع آخر الأخبار والمقالات في مجال العلوم السياسية
          </p>
        </div>
      </div>

      {/* News Grid */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {displayedNews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أخبار</h3>
            <p className="text-gray-600">لم يتم العثور على أخبار أو مقالات منشورة</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedNews.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPage;