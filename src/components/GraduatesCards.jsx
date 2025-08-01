// src/components/GraduatesCards.jsx
import React, { useState, useEffect } from 'react';

const graduates = [
  {
    id: 1,
    name: 'صاحب السمو الملكي الامير فيصل بن سلمان آل سعود',
    job: 'أمير منطقة',
    image: '/assets/images/graduate1.jpg',
    description: 'من أبرز خريجي قسم العلوم السياسية ومن القيادات البارزة في المملكة.'
  },
  {
    id: 2,
    name: 'الامير محمد بن عبد الرحمن',
    job: 'نائب أمير الرياض',
    image: '/assets/images/graduate2.jpg',
    description: 'من القيادات الشابة البارزة وخريج قسم العلوم السياسية.'
  },
  {
    id: 3,
    name: 'الامير تركي بن طلال',
    job: 'أمير عسير',
    image: '/assets/images/graduate3.jpg',
    description: 'من القيادات المتميزة وخريج قسم العلوم السياسية.'
  },
  {
    id: 4,
    name: 'الامير بندر بن سلطان',
    job: 'نائب أمير مكة السابق',
    image: '/assets/images/graduate4.jpg',
    description: 'من أبرز القيادات السعودية وخريج قسم العلوم السياسية.'
  },
  {
    id: 5,
    name: 'رائد قرملي',
    job: 'سفير سابق في روسيا ومدير عام تخطيط السياسات بوزارة الخارجية',
    image: '/assets/images/graduate5.jpg',
    description: 'من القيادات الدبلوماسية المتميزة وخريج قسم العلوم السياسية.'
  }
];


const GraduatesCards = () => {
  const [sliderIndex, setSliderIndex] = useState(0);
  const cardsToShow = 3; // عدد البطاقات التي تظهر في كل مرة

  // تغيير السلايدر كل 5 ثوانٍ
  useEffect(() => {
    const interval = setInterval(() => {
      setSliderIndex((prevIndex) => (prevIndex + 1) % graduates.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [graduates.length]);

  const getVisibleCards = () => {
    let cards = [];
    for (let i = 0; i < cardsToShow; i++) {
      const index = (sliderIndex + i) % graduates.length;
      cards.push(graduates[index]);
    }
    return cards;
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">القيادات من خريجوا القسم</h2>
        
        <div className="relative max-w-6xl mx-auto">
          {/* السلايدر الرئيسي */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 transition-all duration-700 mx-auto" 
            style={{transform: `translateX(${sliderIndex * 0}%)`, transition: 'transform 0.5s ease-in-out'}}
          >
            {getVisibleCards().map((graduate, idx) => (
              <div
                key={`${graduate.id}-${idx}`}
                className="relative bg-white rounded-2xl shadow-lg overflow-hidden group transform transition-all duration-500 hover:scale-105"
              >
                <div className="overflow-hidden h-52 flex items-center justify-center bg-gray-100">
                  <img
                    src={graduate.image}
                    alt={graduate.name}
                    className="object-cover h-52 w-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2 text-primary-700">{graduate.name}</h3>
                  <div className="text-gray-500 mb-2">{graduate.job}</div>
                  <p className="text-gray-700 mb-4 min-h-[48px]">{graduate.description}</p>
                </div>
                <div className="absolute inset-0 bg-primary-600 bg-opacity-0 group-hover:bg-opacity-10 transition duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
          
          {/* أزرار التنقل */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 md:px-8 z-10">
            <button 
              onClick={() => setSliderIndex((prevIndex) => (prevIndex - 1 + graduates.length) % graduates.length)}
              className="bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="السابق"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => setSliderIndex((prevIndex) => (prevIndex + 1) % graduates.length)}
              className="bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="التالي"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* مؤشرات السلايدر */}
          <div className="absolute -bottom-12 md:-bottom-14 left-0 right-0 flex flex-wrap justify-center gap-2 md:gap-3 px-4">
            {graduates.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSliderIndex(idx)}
                className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-colors duration-300 ${
                  idx === sliderIndex % graduates.length ? 'bg-primary-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`الشريحة ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GraduatesCards;
