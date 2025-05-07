// src/components/EventsSection.jsx
import React, { useState } from 'react';

const EventsSection = () => {
  const [activeEvent, setActiveEvent] = useState(null);
  
  const events = [
    {
      id: 1,
      title: "المؤتمر السنوي للعلوم السياسية",
      date: "15 - 16 ديسمبر 2023",
      location: "قاعة المؤتمرات الرئيسية",
      description: "المؤتمر السنوي للجمعية يناقش أهم القضايا السياسية المعاصرة بمشاركة نخبة من الخبراء والأكاديميين من مختلف الدول، ويتضمن جلسات حوارية وأوراق بحثية متخصصة.",
      imageColor: "bg-blue-200"
    },
    {
      id: 2,
      title: "ندوة: العلاقات الدولية في عصر التحولات الجيوسياسية",
      date: "20 نوفمبر 2023",
      location: "قاعة المحاضرات المركزية",
      description: "تناقش الندوة التغيرات في النظام الدولي وأثرها على العلاقات بين الدول في ظل التحديات الحالية، بمشاركة خبراء في العلاقات الدولية.",
      imageColor: "bg-green-200"
    },
    {
      id: 3,
      title: "ورشة عمل: مناهج البحث في العلوم السياسية",
      date: "5 - 7 نوفمبر 2023",
      location: "مختبر البحوث السياسية",
      description: "ورشة عمل تدريبية للباحثين الشباب حول أحدث مناهج وأدوات البحث العلمي في مجال العلوم السياسية والعلاقات الدولية.",
      imageColor: "bg-yellow-200"
    },
    {
      id: 4,
      title: "منتدى السياسات العامة",
      date: "18 أكتوبر 2023",
      location: "مركز الدراسات الاستراتيجية",
      description: "يناقش المنتدى قضايا السياسات العامة وصناعة القرار وتقييم السياسات بمشاركة مسؤولين وصناع قرار وأكاديميين متخصصين.",
      imageColor: "bg-purple-200"
    }
  ];

  const toggleEvent = (id) => {
    setActiveEvent(activeEvent === id ? null : id);
  };

  return (
    <section id="events" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-blue-800">مناسبات وفعاليات</h2>
        <p className="text-center mb-12 text-gray-600 max-w-3xl mx-auto">
          تنظم الجمعية العديد من الفعاليات والمناسبات العلمية على مدار العام بمشاركة نخبة من الخبراء والمختصين في مجال العلوم السياسية
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map(event => (
            <div 
              key={event.id} 
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`h-48 ${event.imageColor} flex items-center justify-center p-6 text-center`}>
                <h3 className="text-2xl font-bold text-gray-800">{event.title}</h3>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">{event.date}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-600">{event.location}</span>
                  </div>
                </div>
                
                <div className={activeEvent === event.id ? 'block' : 'line-clamp-2'}>
                  <p className="text-gray-700">{event.description}</p>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <button 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => toggleEvent(event.id)}
                  >
                    {activeEvent === event.id ? 'عرض أقل' : 'عرض المزيد'}
                  </button>
                  
                  <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors">
                    التسجيل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <button className="bg-white text-blue-700 border border-blue-700 px-6 py-2 rounded-md hover:bg-blue-50 transition-colors">
            عرض جميع الفعاليات
          </button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;