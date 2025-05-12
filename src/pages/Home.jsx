// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import LatestPublications from '../components/LatestPublications';
import GraduatesCards from '../components/GraduatesCards';
import { Link } from 'react-router-dom';
import { buttonStyles, cardStyles, colors } from '../utils/theme';

const Home = () => {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  
  // الأخبار العاجلة للشريط المتحرك
  const breakingNews = [
    "انطلاق المؤتمر السنوي للعلوم السياسية في 15 مايو القادم",
    "افتتاح باب التسجيل في الورشة التدريبية: تحليل الأزمات الدولية",
    "صدور العدد الجديد من المجلة العلمية للجمعية",
    "توقيع اتفاقية تعاون مع جامعة هارفارد للدراسات السياسية",
    "استضافة الملتقى الخليجي للعلاقات الدولية في الرياض"
  ];

  // معلومات الفعاليات القادمة مع صور احترافية
  const upcomingEvents = [
    {
      id: 1,
      title: "المؤتمر السنوي للعلوم السياسية",
      date: "١٥ مايو ٢٠٢٤",
      time: "٠٩:٠٠ صباحاً",
      location: "قاعة المؤتمرات الكبرى - الرياض",
      description: "مناقشة أحدث التطورات في العلاقات الدولية والسياسات العالمية بمشاركة خبراء دوليين",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070",
      daysLeft: 29
    },
    {
      id: 2,
      title: "ورشة عمل: تحليل الأزمات الدولية",
      date: "٢٠ يونيو ٢٠٢٤",
      time: "١١:٠٠ صباحاً",
      location: "مركز الدراسات الاستراتيجية - جدة",
      description: "تدريب عملي على أساليب تحليل وإدارة الأزمات الدولية وتطبيق نماذج محاكاة واقعية",
      imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070",
      daysLeft: 65
    },
    {
      id: 3,
      title: "ندوة: التحولات السياسية في الشرق الأوسط",
      date: "٥ يوليو ٢٠٢٤",
      time: "٠١:٠٠ ظهراً",
      location: "قاعة الندوات الرئيسية - الدمام",
      description: "نقاش معمق حول التغيرات السياسية في المنطقة وتأثيراتها على القوى الإقليمية والعالمية",
      imageUrl: "https://images.unsplash.com/photo-1464692805480-a69dfaafdb0d?q=80&w=2070",
      daysLeft: 80
    }
  ];

  // الباحثون المميزون
  const featuredResearchers = [
    {
      id: 1,
      name: "د. سعيد الأحمدي",
      title: "أستاذ العلوم السياسية",
      university: "جامعة الملك سعود",
      specialty: "النظم السياسية والعلاقات الدولية",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=987",
      researchCount: 42,
      citations: 1850
    },
    {
      id: 2,
      name: "د. نورة المالكي",
      title: "أستاذ مشارك في العلاقات الدولية",
      university: "جامعة الملك عبدالعزيز",
      specialty: "السياسة الخارجية والأمن الإقليمي",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1288",
      researchCount: 38,
      citations: 1640
    },
    {
      id: 3,
      name: "د. فهد العتيبي",
      title: "أستاذ الدراسات الاستراتيجية",
      university: "جامعة الأمير محمد بن فهد",
      specialty: "تحليل النزاعات والوساطة الدولية",
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1738",
      researchCount: 29,
      citations: 1280
    }
  ];

  // الأبحاث الجديدة
  const latestResearch = [
    {
      id: 1,
      title: "دور القوى الناشئة في تشكيل النظام العالمي الجديد",
      field: "العلاقات الدولية",
      authors: ["د. محمد القحطاني", "د. علي الشمري"],
      date: "مارس 2024",
      abstract: "يتناول البحث دور القوى الناشئة في إعادة تشكيل النظام العالمي الجديد وتأثيرها على موازين القوى الدولية والإقليمية.",
      image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2070"
    },
    {
      id: 2,
      title: "تأثير التحولات التكنولوجية على الأمن القومي والدفاع السيبراني",
      field: "الأمن الإستراتيجي",
      authors: ["د. فاطمة العمري", "د. خالد الدوسري"],
      date: "فبراير 2024",
      abstract: "دراسة تحليلية لتأثير التطورات التكنولوجية المتسارعة على مفهوم الأمن القومي واستراتيجيات الدفاع السيبراني الحديثة.",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070"
    },
    {
      id: 3,
      title: "التحولات في مفهوم السيادة في ظل العولمة والتكامل الإقليمي",
      field: "النظرية السياسية",
      authors: ["د. عبدالله المهيري", "د. سارة الشهري"],
      date: "يناير 2024",
      abstract: "تحليل للتحولات المعاصرة في مفهوم السيادة الوطنية في ظل تنامي العولمة وتزايد التكامل الإقليمي بين الدول.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072"
    }
  ];

  // الموارد والمنشورات المهمة
  const importantResources = [
    {
      id: 1,
      title: "الدليل الشامل للتحليل السياسي",
      type: "كتاب إلكتروني",
      description: "دليل متكامل حول أساليب وأدوات التحليل السياسي المعاصر",
      downloadCount: 2850,
      image: "https://images.unsplash.com/photo-1532153259564-a5f24f254404?q=80&w=1974",
      fileSize: "8.5 MB",
      category: "منهجية البحث"
    },
    {
      id: 2,
      title: "مجموعة بيانات العلاقات الدبلوماسية العالمية",
      type: "قاعدة بيانات",
      description: "قاعدة بيانات شاملة تضم إحصائيات وبيانات عن العلاقات الدبلوماسية العالمية منذ 1950",
      downloadCount: 1240,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070",
      fileSize: "350 MB",
      category: "بيانات وإحصائيات"
    },
    {
      id: 3,
      title: "خرائط التغيرات السياسية في الشرق الأوسط",
      type: "خرائط تفاعلية",
      description: "مجموعة خرائط تفاعلية توضح التغيرات السياسية والجغرافية في منطقة الشرق الأوسط خلال العقدين الماضيين",
      downloadCount: 3150,
      image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?q=80&w=2070",
      fileSize: "120 MB",
      category: "خرائط سياسية"
    },
    {
      id: 4,
      title: "أساسيات نظريات العلاقات الدولية",
      type: "سلسلة محاضرات",
      description: "سلسلة محاضرات متكاملة عن أهم نظريات العلاقات الدولية وتطبيقاتها المعاصرة",
      downloadCount: 4280,
      image: "https://images.unsplash.com/photo-1461958508236-9a742665a0d5?q=80&w=2033",
      fileSize: "250 MB",
      category: "محاضرات تعليمية"
    }
  ];

  // مزايا العضوية
  const membershipBenefits = [
    {
      title: "وصول كامل للأبحاث",
      description: "الوصول الكامل إلى جميع الأبحاث والدراسات الحصرية في المكتبة العلمية الرقمية",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: "حضور الفعاليات",
      description: "أولوية التسجيل وخصومات حصرية تصل إلى 50% على حضور المؤتمرات والفعاليات العلمية",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "فرص النشر العلمي",
      description: "فرص متميزة لنشر الأبحاث في المجلات العلمية المعتمدة والمشاركة في الإصدارات الدورية مع دعم تحريري",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      title: "شبكة تواصل واسعة",
      description: "التواصل المباشر مع شبكة نخبوية من الباحثين والأكاديميين والخبراء في المجال عبر منصاتنا الخاصة",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  // إنجازات الرابطة
  const achievements = [
    {
      number: "٥٠٠+",
      title: "بحث علمي منشور",
      description: "أبحاث في مختلف مجالات العلوم السياسية والعلاقات الدولية"
    },
    {
      number: "١٢٥+",
      title: "مؤتمر وندوة علمية",
      description: "فعاليات علمية متخصصة على المستوى المحلي والدولي"
    },
    {
      number: "٤٥+",
      title: "شراكة دولية",
      description: "تعاون استراتيجي مع مؤسسات أكاديمية عالمية مرموقة"
    },
    {
      number: "١٥٠٠+",
      title: "عضو وباحث",
      description: "شبكة من الباحثين والأكاديميين من مختلف أنحاء العالم"
    }
  ];
  
  // آراء الخبراء
  const expertOpinions = [
    {
      id: 1,
      expertName: "د. عبدالرحمن السديس",
      position: "أستاذ العلاقات الدولية - جامعة الملك سعود",
      opinion: "أصبحت التحولات في موازين القوى العالمية تشكل تحدياً للنظام الدولي القائم، مما يستدعي إعادة النظر في هياكل صنع القرار الدولي",
      image: "https://images.unsplash.com/photo-1519085360753-af613a6e2200?q=80&w=987",
      topic: "النظام العالمي الجديد",
      date: "أبريل 2024"
    },
    {
      id: 2,
      expertName: "د. هدى المنصور",
      position: "خبيرة الدراسات الأمنية والإستراتيجية",
      opinion: "باتت التهديدات السيبرانية تشكل خطراً متزايداً على الأمن القومي للدول، مما يستلزم تطوير استراتيجيات دفاعية متقدمة",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=987",
      topic: "الأمن السيبراني",
      date: "مارس 2024"
    },
    {
      id: 3,
      expertName: "د. فيصل البقمي",
      position: "مستشار سياسي وأستاذ العلوم السياسية",
      opinion: "تشهد منطقة الشرق الأوسط تحولات استراتيجية عميقة تؤسس لمرحلة جديدة من التوازنات الإقليمية والتعاون الاقتصادي",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=987",
      topic: "الشرق الأوسط",
      date: "فبراير 2024"
    }
  ];
  
  // الجدول الزمني للإنجازات
  const timelineAchievements = [
    {
      year: "2010",
      title: "تأسيس الرابطة",
      description: "تأسيس رابطة العلوم السياسية كمنظمة علمية مستقلة"
    },
    {
      year: "2013",
      title: "إطلاق المجلة العلمية",
      description: "إصدار أول عدد من المجلة العلمية المحكمة للرابطة"
    },
    {
      year: "2015",
      title: "المؤتمر الدولي الأول",
      description: "تنظيم أول مؤتمر دولي للعلوم السياسية بمشاركة خبراء دوليين"
    },
    {
      year: "2018",
      title: "الشراكات الدولية",
      description: "توقيع اتفاقيات تعاون مع جامعات ومراكز بحثية عالمية"
    },
    {
      year: "2020",
      title: "المنصة الرقمية",
      description: "إطلاق المنصة الرقمية للرابطة وتطوير خدمات الأعضاء"
    },
    {
      year: "2023",
      title: "التصنيف الدولي",
      description: "حصول الرابطة على تصنيف متقدم بين الجمعيات العلمية العالمية"
    }
  ];
  
  // شهادات الأعضاء
  const memberTestimonials = [
    {
      id: 1,
      name: "د. أحمد الغامدي",
      position: "أستاذ مساعد - جامعة الملك فهد للبترول والمعادن",
      testimonial: "ساهمت عضوية الرابطة في توسيع شبكة علاقاتي الأكاديمية وإثراء أبحاثي من خلال الوصول إلى موارد علمية استثنائية",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070",
      memberSince: "2015"
    },
    {
      id: 2,
      name: "د. سارة العتيبي",
      position: "باحثة في العلاقات الدولية",
      testimonial: "أتاحت لي الرابطة فرصاً ثمينة للمشاركة في مؤتمرات دولية ونشر أبحاثي في مجلات مرموقة، مما عزز مسيرتي الأكاديمية",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070",
      memberSince: "2018"
    },
    {
      id: 3,
      name: "د. عمر السلمي",
      position: "أستاذ العلوم السياسية - جامعة أم القرى",
      testimonial: "توفر الرابطة بيئة أكاديمية محفزة للبحث والتطوير من خلال شبكة واسعة من الباحثين المتميزين وموارد علمية قيّمة",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=987",
      memberSince: "2016"
    }
  ];

  // Effect for news ticker
  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setCurrentNewsIndex(prevIndex => 
        prevIndex === breakingNews.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(tickerInterval);
  }, [breakingNews.length]);

  return (
    <div className="min-h-screen" dir="rtl">
      {/* شريط الأخبار المتحرك */}
      <div className="bg-primary-700 text-white py-2 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="bg-secondary-500 text-white rounded-md px-3 py-1 text-sm font-bold ml-4 whitespace-nowrap">
              أخبار عاجلة
            </div>
            <div className="relative overflow-hidden flex-1" style={{ height: '24px' }}>
              {breakingNews.map((news, index) => (
                <div 
                  key={index}
                  className={`absolute transition-all duration-500 ease-in-out whitespace-nowrap ${currentNewsIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                  {news}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* قسم العرض الرئيسي */}
      <Hero />

      {/* قسم الأخبار والتحديثات الرئيسية */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">أحدث الأخبار والتحديثات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 rounded-xl overflow-hidden shadow-lg bg-white transition-all hover:shadow-xl">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=2070" 
                  alt="مؤتمر العلوم السياسية" 
                  className="w-full h-72 object-cover"
                />
                <div className="absolute top-4 right-4 bg-secondary-500 text-white rounded-md px-3 py-1">
                  خبر رئيسي
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>١٥ أبريل ٢٠٢٤</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">افتتاح التسجيل في المؤتمر السنوي للعلوم السياسية</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">أعلنت رابطة العلوم السياسية عن فتح باب التسجيل في المؤتمر السنوي الذي سيعقد في الرياض بمشاركة نخبة من الخبراء والأكاديميين من مختلف أنحاء العالم لمناقشة أبرز التطورات في الساحة السياسية الإقليمية والدولية.</p>
                <Link to="/news/1" className="text-primary-600 hover:text-primary-800 font-medium inline-flex items-center">
                  اقرأ المزيد <span className="mr-2">←</span>
                </Link>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg">
                <div className="flex flex-col sm:flex-row">
                  <img 
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070"
                    alt="ورشة عمل"
                    className="w-full sm:w-24 h-24 object-cover"
                  />
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">١٠ أبريل ٢٠٢٤</div>
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">ورشة عمل: التحولات الجيوسياسية في المنطقة العربية</h3>
                    <Link to="/news/2" className="text-primary-600 hover:text-primary-800 text-sm inline-flex items-center">
                      التفاصيل <span className="mr-1">←</span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg">
                <div className="flex flex-col sm:flex-row">
                  <img 
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070"
                    alt="إصدار جديد"
                    className="w-full sm:w-24 h-24 object-cover"
                  />
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">٥ أبريل ٢٠٢٤</div>
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">صدور العدد الجديد من مجلة الدراسات السياسية</h3>
                    <Link to="/news/3" className="text-primary-600 hover:text-primary-800 text-sm inline-flex items-center">
                      التفاصيل <span className="mr-1">←</span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg">
                <div className="flex flex-col sm:flex-row">
                  <img 
                    src="https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070"
                    alt="مذكرة تفاهم"
                    className="w-full sm:w-24 h-24 object-cover"
                  />
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">١ أبريل ٢٠٢٤</div>
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">توقيع مذكرة تفاهم مع مركز الدراسات الدولية</h3>
                    <Link to="/news/4" className="text-primary-600 hover:text-primary-800 text-sm inline-flex items-center">
                      التفاصيل <span className="mr-1">←</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link to="/news" className={`${buttonStyles.outline} inline-block`}>
              عرض جميع الأخبار
            </Link>
          </div>
        </div>
      </section>
      
      {/* قسم بطاقات خريجون قسم العلوم السياسية */}
      <GraduatesCards />

      {/* قسم الرؤية والأهداف الاستراتيجية */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">رؤيتنا وأهدافنا الاستراتيجية</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mb-6 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">رؤيتنا</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">نسعى لأن نكون المرجع الأول في مجال العلوم السياسية في العالم العربي، وأن نساهم في تطوير البحث العلمي وصناعة القرار السياسي من خلال بناء جسور التواصل بين الباحثين وصناع القرار.</p>
              
              {/* الجدول الزمني للإنجازات */}
              <h4 className="text-lg font-bold mb-4">إنجازاتنا عبر السنوات</h4>
              <div className="space-y-4">
                {timelineAchievements.map((item, index) => (
                  <div key={index} className="flex">
                    <div className="ml-4">
                      <div className="bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        {item.year}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-bold">{item.title}</h5>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mb-6 bg-secondary-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">أهدافنا الاستراتيجية</h3>
              <ul className="space-y-4">
                <li className="flex">
                  <span className="ml-3 text-primary-600">✓</span>
                  <p className="text-gray-600">تعزيز البحث العلمي في مجال العلوم السياسية وتوفير البيئة المحفزة للباحثين</p>
                </li>
                <li className="flex">
                  <span className="ml-3 text-primary-600">✓</span>
                  <p className="text-gray-600">بناء شبكة من العلاقات الأكاديمية مع المؤسسات البحثية العالمية</p>
                </li>
                <li className="flex">
                  <span className="ml-3 text-primary-600">✓</span>
                  <p className="text-gray-600">نشر المعرفة السياسية وتعزيز الوعي بالقضايا الدولية والإقليمية</p>
                </li>
                <li className="flex">
                  <span className="ml-3 text-primary-600">✓</span>
                  <p className="text-gray-600">دعم صنّاع القرار بالدراسات والتحليلات السياسية الموضوعية</p>
                </li>
                <li className="flex">
                  <span className="ml-3 text-primary-600">✓</span>
                  <p className="text-gray-600">استقطاب الكفاءات الوطنية المتخصصة وتطوير قدراتهم البحثية</p>
                </li>
                <li className="flex">
                  <span className="ml-3 text-primary-600">✓</span>
                  <p className="text-gray-600">تنظيم الفعاليات العلمية المتخصصة لمناقشة القضايا السياسية المعاصرة</p>
                </li>
              </ul>
              
              {/* إحصائيات تأثير الرابطة */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">85%</div>
                  <div className="text-gray-600 text-sm">من الباحثين أشادوا بتأثير الرابطة على البحث العلمي</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">120+</div>
                  <div className="text-gray-600 text-sm">دراسة علمية تم الاستشهاد بها في صناعة القرار</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* قسم الفعاليات القادمة */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">الفعاليات القادمة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                <div className="relative">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 right-0 left-0 p-4 text-white">
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{event.date}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-primary-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{event.time}</span>
                    </div>
                    <div className="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full font-medium">
                      متبقي {event.daysLeft} يوم
                    </div>
                  </div>
                  <div className="mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-600">{event.location}</span>
                  </div>
                  <p className="text-gray-600 mb-6 line-clamp-2">{event.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to={`/events/register/${event.id}`}>
                      <button className={`${buttonStyles.primary} w-full`}>التسجيل الآن</button>
                    </Link>
                    <Link to={`/events/${event.id}`}>
                      <button className={`${buttonStyles.outline} w-full`}>التفاصيل</button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* صور من فعاليات سابقة */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-8">من فعالياتنا السابقة</h3>
            <div className="flex overflow-x-auto space-x-4 space-x-reverse pb-6 scrollbar-hide">
              <div className="flex-shrink-0 w-72 h-48 rounded-lg overflow-hidden shadow-md">
                <img src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=2070" alt="فعالية سابقة" className="w-full h-full object-cover transition-transform hover:scale-110" />
              </div>
              <div className="flex-shrink-0 w-72 h-48 rounded-lg overflow-hidden shadow-md">
                <img src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=2070" alt="فعالية سابقة" className="w-full h-full object-cover transition-transform hover:scale-110" />
              </div>
              <div className="flex-shrink-0 w-72 h-48 rounded-lg overflow-hidden shadow-md">
                <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069" alt="فعالية سابقة" className="w-full h-full object-cover transition-transform hover:scale-110" />
              </div>
              <div className="flex-shrink-0 w-72 h-48 rounded-lg overflow-hidden shadow-md">
                <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012" alt="فعالية سابقة" className="w-full h-full object-cover transition-transform hover:scale-110" />
              </div>
              <div className="flex-shrink-0 w-72 h-48 rounded-lg overflow-hidden shadow-md">
                <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070" alt="فعالية سابقة" className="w-full h-full object-cover transition-transform hover:scale-110" />
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link to="/events" className={`${buttonStyles.secondary} inline-block`}>
              استكشاف جميع الفعاليات
            </Link>
          </div>
        </div>
      </section>
      
      {/* قسم منصة البحث العلمي */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">منصة البحث العلمي</h2>
          
          <div className="mb-12 bg-white rounded-xl p-6 md:p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6">أحدث الأبحاث العلمية</h3>
            <div className="flex mb-6 border-b border-gray-200 pb-4 overflow-x-auto whitespace-nowrap">
              <button className="mx-2 px-4 py-2 bg-primary-600 text-white rounded-md">جميع المجالات</button>
              <button className="mx-2 px-4 py-2 hover:bg-gray-100 rounded-md">العلاقات الدولية</button>
              <button className="mx-2 px-4 py-2 hover:bg-gray-100 rounded-md">النظرية السياسية</button>
              <button className="mx-2 px-4 py-2 hover:bg-gray-100 rounded-md">الأمن الإستراتيجي</button>
              <button className="mx-2 px-4 py-2 hover:bg-gray-100 rounded-md">السياسات العامة</button>
              <button className="mx-2 px-4 py-2 hover:bg-gray-100 rounded-md">الدراسات الإقليمية</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {latestResearch.map(research => (
                <div key={research.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <img src={research.image} alt={research.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <div className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-md mb-3">
                      {research.field}
                    </div>
                    <h4 className="font-bold mb-2 line-clamp-2">{research.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{research.abstract}</p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-gray-600">{research.date}</div>
                      <Link to={`/research/${research.id}`} className="text-primary-600 hover:text-primary-800">قراءة المزيد</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* الباحثون المميزون */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-8 text-center">باحثون متميزون</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredResearchers.map(researcher => (
                <div key={researcher.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                    <img src={researcher.image} alt={researcher.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xl font-bold mb-1">{researcher.name}</h4>
                  <div className="text-primary-600 mb-1">{researcher.title}</div>
                  <div className="text-sm text-gray-600 mb-4">{researcher.university}</div>
                  <p className="mb-4 text-sm">متخصص في {researcher.specialty}</p>
                  <div className="flex justify-center space-x-8 space-x-reverse text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary-600">{researcher.researchCount}</div>
                      <div className="text-xs text-gray-600">بحث منشور</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-600">{researcher.citations}</div>
                      <div className="text-xs text-gray-600">اقتباس علمي</div>
                    </div>
                  </div>
                  <Link to={`/researchers/${researcher.id}`} className="mt-4 inline-block text-primary-600 hover:text-primary-800 text-sm">عرض الملف الشخصي</Link>
                </div>
              ))}
            </div>
          </div>
          
          {/* إحصائيات البحث العلمي */}
          <div className="bg-primary-700 text-white rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-8 text-center">تأثير الرابطة في البحث العلمي</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center p-6 bg-primary-800 bg-opacity-50 rounded-lg transform hover:-translate-y-1 transition-transform">
                  <div className="text-4xl font-bold mb-2 text-secondary-300">{achievement.number}</div>
                  <h3 className="text-xl font-semibold mb-2">{achievement.title}</h3>
                  <p className="text-secondary-200 text-sm">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* قسم المكتبة التفاعلية والموارد */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">المكتبة التفاعلية</h2>
          
          <div className="mb-8 bg-gray-50 rounded-xl p-8">
            <div className="flex flex-wrap justify-center mb-8">
              <button className="m-2 px-5 py-2 bg-primary-600 text-white rounded-md">جميع الموارد</button>
              <button className="m-2 px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-md">كتب ودراسات</button>
              <button className="m-2 px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-md">تقارير وإحصائيات</button>
              <button className="m-2 px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-md">خرائط ووثائق</button>
              <button className="m-2 px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-md">محاضرات وندوات</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {importantResources.map(resource => (
                <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
                  <div className="relative">
                    <img src={resource.image} alt={resource.title} className="w-full h-40 object-cover" />
                    <div className="absolute top-3 right-3 bg-white text-primary-700 text-xs px-2 py-1 rounded-md font-medium">
                      {resource.type}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold mb-2 line-clamp-2">{resource.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                    
                    <div className="flex justify-between items-center text-sm mb-3">
                      <div className="text-gray-500">
                        <span className="ml-1">{resource.fileSize}</span>
                        <span className="mr-2 text-xs bg-gray-100 px-2 py-1 rounded-full">{resource.category}</span>
                      </div>
                      <div className="text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {resource.downloadCount}
                      </div>
                    </div>
                    
                    <Link to={`/resources/${resource.id}`}>
                      <button className={`${buttonStyles.primary} w-full`}>تحميل الملف</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-6 mb-12">
            <Link to="/library" className="inline-flex items-center px-6 py-3 bg-primary-50 border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors">
              استعراض المكتبة الكاملة
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* الإصدارات الجديدة */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-8">أحدث الإصدارات</h3>
            <LatestPublications />
          </div>
        </div>
      </section>

      {/* قسم الخبراء والآراء */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">آراء الخبراء</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {expertOpinions.map(expert => (
              <div key={expert.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col">
                <div className="p-6 border-b">
                  <div className="flex items-center mb-4">
                    <img src={expert.image} alt={expert.expertName} className="w-16 h-16 rounded-full object-cover ml-4" />
                    <div>
                      <h4 className="font-bold text-lg">{expert.expertName}</h4>
                      <p className="text-sm text-gray-600">{expert.position}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">"{expert.opinion}"</p>
                  </div>
                </div>
                <div className="px-6 py-4 border-t mt-auto">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-md">{expert.topic}</span>
                    </div>
                    <div className="text-gray-500 text-sm">{expert.date}</div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Link to={`/opinions/${expert.id}`} className="text-primary-600 hover:text-primary-800 text-sm inline-flex items-center">
                      قراءة المقال كاملاً <span className="mr-1">←</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/expert-opinions" className={`${buttonStyles.outline} inline-block`}>عرض المزيد من آراء الخبراء</Link>
          </div>
        </div>
      </section>

      {/* قسم العضوية والمشاركة */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">انضم إلى رابطة العلوم السياسية</h2>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                كن جزءاً من مجتمع علمي متخصص يجمع نخبة من الباحثين والأكاديميين في مجال العلوم السياسية
              </p>
            </div>
            
            {/* عداد الأعضاء */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-xl mb-12">
              <div className="flex flex-wrap justify-center items-center gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">1500+</div>
                  <div className="text-primary-200">عضو نشط</div>
                </div>
                <div className="h-16 w-0.5 bg-white bg-opacity-30 hidden md:block"></div>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">120+</div>
                  <div className="text-primary-200">جامعة ومؤسسة</div>
                </div>
                <div className="h-16 w-0.5 bg-white bg-opacity-30 hidden md:block"></div>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">35+</div>
                  <div className="text-primary-200">دولة حول العالم</div>
                </div>
              </div>
            </div>
            
            {/* مزايا العضوية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {membershipBenefits.map((benefit, index) => (
                <div key={index} className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg transform hover:-translate-y-1 transition-all duration-300">
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-primary-100 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
            
            {/* شهادات الأعضاء */}
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-center mb-6">ماذا يقول أعضاؤنا</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {memberTestimonials.map(testimonial => (
                  <div key={testimonial.id} className="bg-white bg-opacity-5 backdrop-blur-lg p-6 rounded-lg">
                    <div className="mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary-300 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <p className="text-primary-100 mb-4 italic">"{testimonial.testimonial}"</p>
                    <div className="flex items-center">
                      <img src={testimonial.image} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover ml-3" />
                      <div>
                        <div className="font-bold">{testimonial.name}</div>
                        <div className="text-xs text-primary-200">{testimonial.position} | عضو منذ {testimonial.memberSince}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* نموذج العضوية المبسط */}
            <div className="text-center mt-8">
              <h3 className="text-2xl font-bold mb-8">ابدأ رحلتك الأكاديمية معنا</h3>
              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-xl max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <input type="text" placeholder="الاسم الكامل" className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-40" />
                  </div>
                  <div>
                    <input type="email" placeholder="البريد الإلكتروني" className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-40" />
                  </div>
                </div>
                <button className="w-full bg-white text-primary-700 hover:bg-primary-50 px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105">
                  طلب العضوية الآن
                </button>
              </div>
              <div className="mt-6 text-primary-200 text-sm">
                <Link to="/membership" className="underline hover:text-white">استعراض خطط العضوية والأسعار</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* قسم النشرة الإخبارية */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">اشترك في النشرة الإخبارية</h2>
              <p className="text-gray-600 mb-6">كن على اطلاع دائم بأحدث الفعاليات والإصدارات العلمية من رابطة العلوم السياسية</p>
              <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all duration-300"
                />
                <button className={`${buttonStyles.primary} px-8 py-3 whitespace-nowrap hover:bg-primary-700 transform hover:scale-105 transition-all duration-300`}>
                  اشتراك
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
