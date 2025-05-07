// src/pages/events/EventsPage.jsx
import React from 'react';

const EventsPage = () => {
  const events = [
    {
      id: 1,
      title: 'ندوة: مستقبل العلاقات الدولية في ظل التحولات العالمية',
      date: '2024/01/15',
      time: '6:00 مساءً',
      location: 'قاعة المؤتمرات - جامعة الملك سعود',
      type: 'ندوة',
      status: 'قادم'
    },
    {
      id: 2,
      title: 'ورشة عمل: التحليل السياسي وكتابة التقارير',
      date: '2024/02/01',
      time: '4:00 عصراً',
      location: 'مقر الجمعية - الرياض',
      type: 'ورشة عمل',
      status: 'قادم'
    },
    {
      id: 3,
      title: 'محاضرة: الأمن السيبراني والعلاقات الدولية',
      date: '2024/01/05',
      time: '7:00 مساءً',
      location: 'عن بعد - منصة زوم',
      type: 'محاضرة',
      status: 'منتهي'
    }
  ];

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
          <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors">
            جميع الفعاليات
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm hover:bg-gray-50 transition-colors border">
            الندوات
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm hover:bg-gray-50 transition-colors border">
            ورش العمل
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm hover:bg-gray-50 transition-colors border">
            المحاضرات
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col space-y-4">
                  {/* Event Status and Type */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${event.status === 'قادم' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {event.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {event.type}
                    </span>
                  </div>

                  {/* Event Title */}
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {event.title}
                  </h2>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {/* Registration Button */}
                  {event.status === 'قادم' && (
                    <div className="pt-2">
                      <button className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base">
                        سجل الآن
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;