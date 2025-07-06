// src/pages/events/EventsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageComponent from '../../components/ImageComponent';
import { useContent } from '../../contexts/ContentContext.jsx';
import { CONTENT_TYPES, EVENT_STATUS } from '../../schemas/contentManagementSchema.js';

const EventsPage = () => {
  const [filter, setFilter] = useState('all');

  // Use Content Context for real data
  const {
    content: allContent,
    loading,
    error,
    loadContent
  } = useContent();

  // Filter events from content
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Load events when component mounts
    loadContent();
  }, []);

  useEffect(() => {
    // Filter events from all content
    const eventContent = allContent.filter(item =>
      item.contentType === CONTENT_TYPES.EVENT &&
      item.status === 'published'
    );
    setEvents(eventContent);
  }, [allContent]);

  // Helper functions
  const formatEventDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      [EVENT_STATUS.UPCOMING]: 'قادم',
      [EVENT_STATUS.ONGOING]: 'جاري',
      [EVENT_STATUS.COMPLETED]: 'منتهي',
      [EVENT_STATUS.CANCELLED]: 'ملغي',
      [EVENT_STATUS.POSTPONED]: 'مؤجل'
    };
    return statusLabels[status] || 'غير محدد';
  };

  const getEventTypeLabel = (type) => {
    const typeLabels = {
      [CONTENT_TYPES.EVENT]: 'فعالية',
      [CONTENT_TYPES.CONFERENCE]: 'مؤتمر',
      [CONTENT_TYPES.WORKSHOP]: 'ورشة عمل',
      [CONTENT_TYPES.LECTURE]: 'محاضرة'
    };
    return typeLabels[type] || 'فعالية';
  };

  // Filter events based on selected filter
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return event.eventStatus === EVENT_STATUS.UPCOMING;
    if (filter === 'ongoing') return event.eventStatus === EVENT_STATUS.ONGOING;
    if (filter === 'completed') return event.eventStatus === EVENT_STATUS.COMPLETED;
    return true;
  });

  // Loading state
  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
        <div className="bg-blue-900 text-white py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">المناسبات والفعاليات</h1>
            <p className="text-base sm:text-xl text-blue-200">
              تصفح أحدث الفعاليات والمناسبات في مجال العلوم السياسية
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل الفعاليات...</p>
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
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">المناسبات والفعاليات</h1>
            <p className="text-base sm:text-xl text-blue-200">
              تصفح أحدث الفعاليات والمناسبات في مجال العلوم السياسية
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">حدث خطأ في تحميل الفعاليات</p>
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
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">المناسبات والفعاليات</h1>
          <p className="text-base sm:text-xl text-blue-200">
            تصفح أحدث الفعاليات والمناسبات في مجال العلوم السياسية
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
          >
            جميع الفعاليات
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
          >
            الفعاليات القادمة
          </button>
          <button
            onClick={() => setFilter('ongoing')}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${filter === 'ongoing' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
          >
            الفعاليات الجارية
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
          >
            الفعاليات المنتهية
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 pb-12">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-1a4 4 0 014-4h4a4 4 0 014 4v1a4 4 0 11-8 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فعاليات</h3>
            <p className="text-gray-600">لم يتم العثور على فعاليات تطابق المعايير المحددة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Event Image */}
                <div className="relative">
                  <ImageComponent
                    src={event.featuredImage || event.image || '/assets/images/default-event.jpg'}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                    fallbackSrc="/assets/images/default-event.jpg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col space-y-4">
                    {/* Event Status and Type */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        event.eventStatus === EVENT_STATUS.UPCOMING ? 'bg-green-100 text-green-800' :
                        event.eventStatus === EVENT_STATUS.ONGOING ? 'bg-blue-100 text-blue-800' :
                        event.eventStatus === EVENT_STATUS.COMPLETED ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getStatusLabel(event.eventStatus)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {getEventTypeLabel(event.contentType)}
                      </span>
                    </div>

                    {/* Event Title */}
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2">
                      {event.title}
                    </h2>

                    {/* Event Excerpt */}
                    {event.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {event.excerpt}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Link
                        to={`/events/${event.slug}`}
                        className="flex-1 sm:flex-none inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base text-center"
                      >
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;