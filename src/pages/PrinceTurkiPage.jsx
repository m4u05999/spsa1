// src/pages/PrinceTurkiPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../utils/theme';

const PrinceTurkiPage = () => {
  // حالة لعرض الصور في معرض الصور
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // بيانات المحاضرة
  const lectureDetails = {
    title: "مستقبل العالم العربي في ضوء المتغيرات الراهنة",
    speaker: "صاحب السمو الملكي الأمير تركي الفيصل",
    date: "٢٤ مايو ٢٠٢٥",
    time: "١٠:٠٠ صباحاً",
    venue: "قاعة رقم (٨٨) بكلية الحقوق والعلوم السياسية - جامعة الملك سعود",
    organizer: "الجمعية السعودية للعلوم السياسية",
    description: "محاضرة قيمة يستعرض فيها سموه رؤيته لمستقبل العالم العربي في ظل التحديات والمتغيرات الراهنة على الساحة الدولية والإقليمية، مع التركيز على دور المملكة العربية السعودية في قيادة التحول والتنمية في المنطقة.",
    mainPoints: [
      "التحديات الجيوسياسية التي تواجه العالم العربي",
      "تأثير المتغيرات الاقتصادية العالمية على المنطقة",
      "دور الشباب في صناعة مستقبل العالم العربي",
      "رؤية المملكة 2030 وتأثيرها على المنطقة",
      "مستقبل العلاقات العربية-العربية وأهميتها في مواجهة التحديات"
    ],
    quotes: [
      "لا يمكن تحقيق الاستقرار في المنطقة دون تعاون وتكامل حقيقي بين الدول العربية",
      "الشباب العربي هو الثروة الحقيقية التي يجب استثمارها لبناء مستقبل مشرق",
      "رؤية المملكة 2030 ليست مجرد خطة اقتصادية، بل هي مشروع حضاري متكامل"
    ],
    gallery: [
      "/assets/images/prince-turki-lecture/image1.jpg",
      "/assets/images/prince-turki-lecture/image2.jpg",
      "/assets/images/prince-turki-lecture/image3.jpg",
      "/assets/images/prince-turki-lecture/image4.jpg"
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white pt-16 pb-20 md:pt-20 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-800"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: 'url("/assets/images/pattern-bg.png")',
            backgroundRepeat: 'repeat',
            backgroundSize: '300px'
          }}></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-2/3">
              <div className="inline-block bg-blue-700 text-white text-sm font-semibold rounded-full px-4 py-1 mb-4">
                محاضرة خاصة
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{lectureDetails.title}</h1>
              <div className="flex flex-wrap text-blue-200 mb-6">
                <div className="flex items-center ml-6 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{lectureDetails.speaker}</span>
                </div>
                <div className="flex items-center ml-6 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{lectureDetails.date}</span>
                </div>
                <div className="flex items-center ml-6 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{lectureDetails.time}</span>
                </div>
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{lectureDetails.venue}</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/3 mt-8 md:mt-0 flex justify-center">
              <img 
                src="/assets/images/prince-turki-profile.jpeg" 
                alt={lectureDetails.speaker}
                className="w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-blue-700 shadow-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">عن المحاضرة</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {lectureDetails.description}
            </p>
            
            <h3 className="text-xl font-bold text-gray-800 mb-4">المحاور الرئيسية:</h3>
            <ul className="space-y-2 mb-6">
              {lectureDetails.mainPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mt-1 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Quotes Section */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl shadow-md overflow-hidden text-white p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6">اقتباسات من المحاضرة</h2>
          <div className="space-y-6">
            {lectureDetails.quotes.map((quote, index) => (
              <blockquote key={index} className="border-r-4 border-blue-300 pl-4 py-1">
                <p className="text-lg italic">{quote}</p>
              </blockquote>
            ))}
          </div>
        </div>
        
        {/* Gallery Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">صور من المحاضرة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lectureDetails.gallery.map((image, index) => (
                <div 
                  key={index} 
                  className={`rounded-lg overflow-hidden cursor-pointer ${activeImageIndex === index ? 'ring-4 ring-blue-500' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img 
                    src={image} 
                    alt={`صورة من المحاضرة ${index + 1}`}
                    className="w-full h-24 md:h-36 object-cover hover:opacity-90 transition-opacity" 
                  />
                </div>
              ))}
            </div>
            {/* Large Preview */}
            <div className="mt-6">
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={lectureDetails.gallery[activeImageIndex]} 
                  alt={`صورة من المحاضرة ${activeImageIndex + 1}`}
                  className="w-full max-h-96 object-contain" 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Organizer Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">الجهة المنظمة</h2>
            <div className="flex flex-col md:flex-row items-center">
              <img 
                src="/assets/images/logo.png" 
                alt="شعار الجمعية السعودية للعلوم السياسية" 
                className="w-32 h-32 object-contain mb-4 md:mb-0 md:ml-6"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{lectureDetails.organizer}</h3>
                <p className="text-gray-600 mb-4">
                  جمعية علمية تهدف إلى تطوير البحث العلمي في مجال العلوم السياسية والعلاقات الدولية في المملكة العربية السعودية.
                </p>
                <Link to="/about" className={`${buttonStyles.primary} inline-block`}>
                  تعرف على الجمعية
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrinceTurkiPage;
