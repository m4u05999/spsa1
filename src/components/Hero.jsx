// src/components/Hero.jsx
import React, { useState, useEffect } from 'react';
import { buttonStyles, colors } from '../utils/theme';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const events = [
    {
      id: 1,
      title: "المؤتمر السنوي للعلوم السياسية 2024",
      date: "15 مايو 2024",
      description: "انضموا إلينا في المؤتمر السنوي لمناقشة أحدث التطورات في مجال العلوم السياسية والعلاقات الدولية",
      imageUrl: "/assets/images/hero/image (11).png",
      gradient: "from-blue-900/85 to-blue-800/70"
    },
    {
      id: 2,
      title: "ندوة: تحليل الأزمات الدولية المعاصرة",
      date: "20 يونيو 2024",
      description: "ندوة متخصصة في طرق تحليل وإدارة الأزمات الدولية في ظل المتغيرات العالمية الحالية",
      imageUrl: "/assets/images/hero/image (10).png",
      gradient: "from-green-900/85 to-green-800/70"
    },
    {
      id: 3,
      title: "عضوية الجمعية السعودية للعلوم السياسية",
      date: "متاحة الآن",
      description: "انضم إلى مجتمع الباحثين والأكاديميين في مجال العلوم السياسية واستفد من المزايا الحصرية للأعضاء",
      imageUrl: "/assets/images/hero/image (11).png",
      gradient: "from-purple-900/85 to-purple-800/70"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === events.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative overflow-hidden" style={{ height: '600px' }}>
      <div className="absolute inset-0 overflow-hidden">
        {events.map((event, index) => (
          <div 
            key={event.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* خلفية الصورة مع طبقة التدرج */}
            <div 
              className={`absolute inset-0 bg-cover bg-center`} 
              style={{ backgroundImage: `url(${event.imageUrl})` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${event.gradient}`}></div>
            </div>
            
            {/* محتوى الشريحة */}
            <div className="absolute inset-0 flex items-center justify-start">
              <div className="container mx-auto px-6 md:px-8 z-10 flex flex-col items-start text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h2>
                <div className="flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg">{event.date}</span>
                </div>
                <p className="mb-6 max-w-xl text-lg">{event.description}</p>
                <div className="flex space-x-4 space-x-reverse">
                  <Link to={index === 2 ? "/membership" : `/events/${event.id}`}>
                    <button className={`${buttonStyles.primary} px-6 py-3`}>
                      {index === 2 ? "انضم الآن" : "المزيد من التفاصيل"}
                    </button>
                  </Link>
                  {index !== 2 && (
                    <Link to={`/events/register/${event.id}`}>
                      <button className="border border-white text-white hover:bg-white hover:bg-opacity-20 font-medium rounded-md px-4 py-2 transition-colors duration-300">
                        التسجيل في الفعالية
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* أزرار التنقل بين الشرائح */}
      <div className="absolute bottom-8 right-8 flex space-x-3 space-x-reverse bg-black/30 rounded-full px-4 py-2">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 w-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
            }`}
            aria-label={`انتقال إلى الشريحة ${index + 1}`}
          />
        ))}
      </div>
      
      {/* أزرار السابق والتالي */}
      <div className="absolute inset-y-0 right-4 flex items-center">
        <button 
          onClick={() => setCurrentSlide(currentSlide > 0 ? currentSlide - 1 : events.length - 1)}
          className="rounded-full p-2 bg-black/20 hover:bg-black/40 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div className="absolute inset-y-0 left-4 flex items-center">
        <button 
          onClick={() => setCurrentSlide((currentSlide + 1) % events.length)}
          className="rounded-full p-2 bg-black/20 hover:bg-black/40 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Hero;