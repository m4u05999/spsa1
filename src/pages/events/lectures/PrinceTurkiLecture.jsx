// src/pages/events/lectures/PrinceTurkiLecture.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../../../utils/theme';

const PrinceTurkiLecture = () => {
  // حالة لعرض الصور في معرض الصور
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // بيانات المحاضرة
  const lectureDetails = {
    title: "مستقبل العالم العربي في ضوء المتغيرات الراهنة",
    speaker: "صاحب السمو الملكي الأمير تركي الفيصل",
    position: "رئيس مجلس إدارة مركز الملك فيصل للبحوث والدراسات الإسلامية",
    date: "٢٤ مايو ٢٠٢٥",
    time: "١٠:٠٠ صباحاً",
    location: "قاعة رقم (٨٨) بكلية الحقوق والعلوم السياسية - جامعة الملك سعود",
    description: [
      "استضافت الجمعية السعودية للعلوم السياسية محاضرة بعنوان \"مستقبل العالم العربي في ضوء المتغيرات الراهنة\" ألقاها صاحب السمو الملكي الأمير تركي الفيصل، رئيس مجلس إدارة مركز الملك فيصل للبحوث والدراسات الإسلامية.",
      "تناول سموه في المحاضرة أبرز التحولات الجيوسياسية في المنطقة العربية وتأثيراتها على المستويين الإقليمي والدولي، مع تحليل معمق للتحديات الراهنة والفرص المستقبلية أمام دول المنطقة.",
      "وأكد سموه على أهمية تعزيز التعاون العربي المشترك ومواكبة المتغيرات العالمية للحفاظ على الأمن والاستقرار في المنطقة، مشيراً إلى الدور المحوري للمملكة العربية السعودية في دعم القضايا العربية والإسلامية.",
      "حضر المحاضرة نخبة من المسؤولين والدبلوماسيين والأكاديميين والمهتمين بالشأن السياسي، وشهدت تفاعلاً كبيراً من الحضور خلال جلسة النقاش التي أعقبت المحاضرة."
    ],
    mainPoints: [
      "التحديات الجيوسياسية في المنطقة العربية وتأثيراتها على الأمن الإقليمي",
      "مستقبل العلاقات العربية-العربية في ظل المتغيرات الدولية",
      "دور المملكة العربية السعودية في تعزيز الاستقرار الإقليمي",
      "آفاق التعاون الاقتصادي والتنموي بين الدول العربية",
      "تأثير الصراعات الإقليمية على مستقبل المنطقة العربية"
    ],
    quotes: [
      "إن مستقبل العالم العربي يعتمد على قدرتنا على التكاتف والعمل المشترك لمواجهة التحديات الراهنة.",
      "التحولات الجيوسياسية الحالية تتطلب رؤية استراتيجية جديدة للتعامل مع المتغيرات العالمية.",
      "تمتلك المنطقة العربية إمكانات هائلة يمكن استثمارها لتحقيق التنمية المستدامة وبناء مستقبل أفضل."
    ],
    // صور المحاضرة - الصور المتاحة فقط
    images: [
      "/assets/images/prince-turki-lecture/lecture1.jpeg",
      "/assets/images/prince-turki-lecture/lecture2.jpeg",
      "/assets/images/prince-turki-lecture/lecture3.jpeg",
      "/assets/images/prince-turki-lecture/lecture4.jpeg",
      "/assets/images/prince-turki-lecture/lecture5.jpeg",
      "/assets/images/prince-turki-lecture/lecture6.jpeg",
      "/assets/images/prince-turki-lecture/lecture7.jpeg",
      "/assets/images/prince-turki-lecture/lecture8.jpeg",
      "/assets/images/prince-turki-lecture/lecture9.jpeg"
    ],
    organizers: [
      {
        name: "الجمعية السعودية للعلوم السياسية",
        logo: "/assets/images/logos/spsa-logo.png"
      },
      {
        name: "جامعة الملك سعود",
        logo: "/assets/images/logos/ksu-logo.png"
      }
    ],
    keywords: ["العالم العربي", "المتغيرات الراهنة", "العلاقات الدولية", "الأمير تركي الفيصل", "الجمعية السعودية للعلوم السياسية"]
  };

  // وظيفة للتنقل بين الصور
  const navigateGallery = (direction) => {
    if (direction === 'next') {
      setActiveImageIndex((prev) => 
        prev === lectureDetails.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setActiveImageIndex((prev) => 
        prev === 0 ? lectureDetails.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10" dir="rtl">
      <div className="container mx-auto px-4">
        {/* شريط التنقل */}
        <div className="mb-8">
          <div className="text-sm breadcrumbs">
            <ul className="flex items-center text-gray-500">
              <li><Link to="/" className="hover:text-primary-600">الرئيسية</Link></li>
              <li className="mx-2">/</li>
              <li><Link to="/events" className="hover:text-primary-600">الفعاليات</Link></li>
              <li className="mx-2">/</li>
              <li className="text-primary-600">محاضرة الأمير تركي الفيصل</li>
            </ul>
          </div>
        </div>

        {/* العنوان والتفاصيل الرئيسية */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
          <div className="relative">
            <img 
              src="/assets/images/prince-turki.jpeg" 
              alt="الأمير تركي الفيصل" 
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center mb-3">
                <span className="bg-primary-600 text-white text-sm px-3 py-1 rounded-full mr-3">محاضرة</span>
                <span className="text-sm">تاريخ النشر: ٣٠ مايو ٢٠٢٥</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{lectureDetails.title}</h1>
              <div className="flex flex-wrap items-center text-lg">
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
                  <span>{lectureDetails.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل المحاضرة */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6 border-r-4 border-primary-600 pr-4">نبذة عن المحاضرة</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  {lectureDetails.description.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                {/* المحاور الرئيسية */}
                <div className="mt-10">
                  <h3 className="text-xl font-bold mb-4">المحاور الرئيسية للمحاضرة</h3>
                  <ul className="space-y-3">
                    {lectureDetails.mainPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <div className="bg-primary-100 text-primary-800 w-6 h-6 rounded-full flex items-center justify-center ml-3 mt-0.5">
                          {index + 1}
                        </div>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* اقتباسات من المحاضرة */}
                <div className="mt-10">
                  <h3 className="text-xl font-bold mb-6">اقتباسات من المحاضرة</h3>
                  <div className="space-y-6">
                    {lectureDetails.quotes.map((quote, index) => (
                      <div key={index} className="bg-gray-50 border-r-4 border-primary-600 p-4 rounded-md italic text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400 mb-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                        <p>"{quote}"</p>
                        <div className="text-left mt-2 text-primary-600">- الأمير تركي الفيصل</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* معلومات المتحدث والجهات المنظمة */}
              <div>
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold mb-4">عن المتحدث</h3>
                  <div className="flex flex-col items-center mb-4">
                    <img 
                      src="/assets/images/prince-turki-profile.jpg" 
                      alt="الأمير تركي الفيصل" 
                      className="w-32 h-32 rounded-full object-cover mb-4"
                    />
                    <h4 className="text-lg font-bold">{lectureDetails.speaker}</h4>
                    <p className="text-gray-600 text-center">{lectureDetails.position}</p>
                  </div>
                  <p className="text-gray-700 text-sm">
                    صاحب السمو الملكي الأمير تركي الفيصل هو رئيس مجلس إدارة مركز الملك فيصل للبحوث والدراسات الإسلامية، وشغل منصب رئيس الاستخبارات العامة في المملكة العربية السعودية سابقاً، كما عمل سفيراً للمملكة في الولايات المتحدة الأمريكية والمملكة المتحدة. يُعد من أبرز المحللين السياسيين والخبراء في شؤون الشرق الأوسط.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">الجهات المنظمة</h3>
                  <div className="space-y-4">
                    {lectureDetails.organizers.map((org, index) => (
                      <div key={index} className="flex items-center">
                        <img 
                          src={org.logo} 
                          alt={org.name} 
                          className="w-20 h-20 object-contain ml-3"
                        />
                        <div className="font-medium text-lg">{org.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">كلمات مفتاحية</h3>
                  <div className="flex flex-wrap">
                    {lectureDetails.keywords.map((keyword, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm ml-2 mb-2">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* معرض الصور */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">معرض الصور</h2>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="relative h-96 overflow-hidden rounded-lg mb-4">
              {lectureDetails.images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`صورة المحاضرة ${index + 1}`} 
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${index === activeImageIndex ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
              <button 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                onClick={() => navigateGallery('prev')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                onClick={() => navigateGallery('next')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 space-x-reverse">
                {lectureDetails.images.map((_, index) => (
                  <button 
                    key={index}
                    className={`w-3 h-3 rounded-full ${index === activeImageIndex ? 'bg-primary-600' : 'bg-gray-300'}`}
                    onClick={() => setActiveImageIndex(index)}
                  />
                ))}
              </div>
            </div>
            <div className="flex overflow-x-auto py-2 space-x-4 space-x-reverse">
              {lectureDetails.images.map((image, index) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 w-24 h-24 cursor-pointer ${index === activeImageIndex ? 'ring-2 ring-primary-600' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img 
                    src={image} 
                    alt={`صورة مصغرة ${index + 1}`} 
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>



        {/* المحاضرات ذات الصلة */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">محاضرات ذات صلة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2070" 
                alt="محاضرة ذات صلة" 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold mb-2">محاضرة: الأمن السيبراني والعلاقات الدولية</h3>
                <p className="text-gray-600 text-sm mb-3">تاريخ: ١٠ أبريل ٢٠٢٥</p>
                <Link to="#" className="text-primary-600 hover:text-primary-800 text-sm inline-flex items-center">
                  عرض التفاصيل <span className="mr-1">←</span>
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070" 
                alt="محاضرة ذات صلة" 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold mb-2">المؤتمر السنوي للعلوم السياسية</h3>
                <p className="text-gray-600 text-sm mb-3">تاريخ: ١٥ مايو ٢٠٢٤</p>
                <Link to="#" className="text-primary-600 hover:text-primary-800 text-sm inline-flex items-center">
                  عرض التفاصيل <span className="mr-1">←</span>
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070" 
                alt="محاضرة ذات صلة" 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold mb-2">ندوة: التحولات الدولية في ظل التحولات العالمية</h3>
                <p className="text-gray-600 text-sm mb-3">تاريخ: ١٥ يناير ٢٠٢٤</p>
                <Link to="#" className="text-primary-600 hover:text-primary-800 text-sm inline-flex items-center">
                  عرض التفاصيل <span className="mr-1">←</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* زر العودة */}
        <div className="text-center">
          <Link to="/events" className={`${buttonStyles.primary} inline-flex items-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            العودة إلى صفحة الفعاليات
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrinceTurkiLecture;
