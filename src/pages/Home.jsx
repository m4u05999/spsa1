// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import LatestPublications from '../components/LatestPublications';
import { Link } from 'react-router-dom';
import ImageComponent from '../components/ImageComponent';
import { buttonStyles, cardStyles, colors } from '../utils/theme';
import { getImageWithFallback } from '../assets/images/placeholders';
import { useUnifiedContent } from '../hooks/useUnifiedContent.js';
import { CONTENT_TYPES } from '../schemas/contentManagementSchema.js';

// Helper function to replace Unsplash URLs with local placeholders
const replaceUnsplashUrl = (url, contentType = 'default') => {
  if (url && url.includes('images.unsplash.com')) {
    return getImageWithFallback(url, contentType);
  }
  return url;
};

const Home = () => {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  // استخدام النظام الموحد للمحتوى - مع معالجة للأخطاء
  const {
    content: allContent,
    loading,
    error,
    getFeaturedContent,
    getLatestContent
  } = useUnifiedContent({ 
    autoLoad: false, 
    enableRealtime: true 
  });

  const [breakingNews, setBreakingNews] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [featuredResearchers, setFeaturedResearchers] = useState([]);
  const [latestResearch, setLatestResearch] = useState([]);
  const [importantResources, setImportantResources] = useState([]);
  const [membershipBenefits, setMembershipBenefits] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [expertOpinions, setExpertOpinions] = useState([]);
  const [timelineAchievements, setTimelineAchievements] = useState([]);
  const [memberTestimonials, setMemberTestimonials] = useState([]);

  // جلب البيانات من MasterDataService
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // استخدام البيانات الثابتة مؤقتاً حتى يتم إصلاح MasterDataService
        setBreakingNews([
          "انطلاق المؤتمر السنوي للعلوم السياسية في 15 مايو القادم",
          "افتتاح باب التسجيل في الورشة التدريبية: تحليل الأزمات الدولية",
          "صدور العدد الجديد من المجلة العلمية للجمعية"
        ]);

        // بيانات الفعاليات القادمة
        setUpcomingEvents([
          {
            id: 1,
            title: "المؤتمر السنوي للعلوم السياسية",
            date: "15 مايو 2024",
            time: "09:00 صباحاً",
            location: "جامعة الملك سعود",
            description: "مؤتمر علمي متخصص يناقش أحدث التطورات في مجال العلوم السياسية",
            imageUrl: "/assets/images/conference.jpg",
            daysLeft: 45
          },
          {
            id: 2,
            title: "ورشة تحليل الأزمات الدولية",
            date: "20 أبريل 2024",
            time: "02:00 مساءً",
            location: "مركز الملك فيصل للبحوث",
            description: "ورشة تدريبية متخصصة في تحليل الأزمات الدولية والإقليمية",
            imageUrl: "/assets/images/workshop.jpg",
            daysLeft: 20
          },
          {
            id: 3,
            title: "ندوة مستقبل الشرق الأوسط",
            date: "10 يونيو 2024",
            time: "07:00 مساءً",
            location: "فندق الريتز كارلتون",
            description: "ندوة علمية حول مستقبل المنطقة في ضوء التطورات الراهنة",
            imageUrl: "/assets/images/seminar.jpg",
            daysLeft: 70
          }
        ]);

        // بيانات الباحثين المميزين
        setFeaturedResearchers([
          {
            id: 1,
            name: "د. محمد العبدالله",
            title: "أستاذ العلوم السياسية",
            university: "جامعة الملك سعود",
            specialty: "العلاقات الدولية",
            image: "/assets/images/researcher1.jpg",
            researchCount: 45,
            citations: 1250
          },
          {
            id: 2,
            name: "د. فاطمة الزهراني",
            title: "أستاذ مشارك",
            university: "جامعة الملك عبدالعزيز",
            specialty: "السياسات العامة",
            image: "/assets/images/researcher2.jpg",
            researchCount: 32,
            citations: 890
          },
          {
            id: 3,
            name: "د. أحمد القحطاني",
            title: "أستاذ مساعد",
            university: "جامعة الإمام محمد بن سعود",
            specialty: "الأمن الإستراتيجي",
            image: "/assets/images/researcher3.jpg",
            researchCount: 28,
            citations: 675
          }
        ]);

        // بيانات الأبحاث الجديدة
        setLatestResearch([
          {
            id: 1,
            title: "تأثير التحولات الجيوسياسية على المنطقة العربية",
            abstract: "دراسة تحليلية للتغيرات الجيوسياسية وتأثيرها على الاستقرار الإقليمي",
            field: "العلاقات الدولية",
            date: "مارس 2024",
            image: "/assets/images/research1.jpg"
          },
          {
            id: 2,
            title: "السياسات العامة في المملكة العربية السعودية",
            abstract: "تحليل شامل لتطور السياسات العامة في إطار رؤية 2030",
            field: "السياسات العامة",
            date: "فبراير 2024",
            image: "/assets/images/research2.jpg"
          },
          {
            id: 3,
            title: "الأمن السيبراني والأمن القومي",
            abstract: "دراسة العلاقة بين الأمن السيبراني والأمن القومي في العصر الرقمي",
            field: "الأمن الإستراتيجي",
            date: "يناير 2024",
            image: "/assets/images/research3.jpg"
          }
        ]);

        // بيانات الموارد المهمة
        setImportantResources([
          {
            id: 1,
            title: "دليل البحث في العلوم السياسية",
            description: "دليل شامل لمناهج البحث في العلوم السياسية",
            type: "كتاب",
            category: "مناهج البحث",
            fileSize: "2.5 MB",
            downloadCount: 1250,
            image: "/assets/images/book1.jpg"
          },
          {
            id: 2,
            title: "تقرير الأمن الإقليمي 2024",
            description: "تقرير سنوي حول الأوضاع الأمنية في المنطقة",
            type: "تقرير",
            category: "الأمن",
            fileSize: "1.8 MB",
            downloadCount: 890,
            image: "/assets/images/report1.jpg"
          },
          {
            id: 3,
            title: "خريطة القوى الإقليمية",
            description: "خريطة تفاعلية للقوى السياسية في المنطقة",
            type: "خريطة",
            category: "جغرافيا سياسية",
            fileSize: "3.2 MB",
            downloadCount: 675,
            image: "/assets/images/map1.jpg"
          },
          {
            id: 4,
            title: "محاضرات النظرية السياسية",
            description: "مجموعة محاضرات في النظرية السياسية المعاصرة",
            type: "فيديو",
            category: "نظرية سياسية",
            fileSize: "450 MB",
            downloadCount: 1100,
            image: "/assets/images/video1.jpg"
          }
        ]);

        // بيانات مزايا العضوية
        setMembershipBenefits([
          {
            icon: "📚",
            title: "الوصول للمكتبة الرقمية",
            description: "وصول كامل لجميع الإصدارات والدراسات العلمية"
          },
          {
            icon: "🎓",
            title: "الفعاليات العلمية",
            description: "حضور المؤتمرات والندوات بأسعار مخفضة"
          },
          {
            icon: "🤝",
            title: "شبكة التواصل",
            description: "التواصل مع نخبة من الباحثين والأكاديميين"
          },
          {
            icon: "📊",
            title: "التقارير الحصرية",
            description: "الحصول على التقارير والتحليلات الحصرية"
          }
        ]);

        // بيانات الإنجازات
        setAchievements([
          {
            number: "500+",
            title: "بحث علمي",
            description: "منشور في مجلات محكمة"
          },
          {
            number: "50+",
            title: "مؤتمر علمي",
            description: "نظمته الجمعية منذ تأسيسها"
          },
          {
            number: "1500+",
            title: "عضو نشط",
            description: "من مختلف الجامعات والمؤسسات"
          },
          {
            number: "25+",
            title: "شراكة دولية",
            description: "مع مؤسسات بحثية عالمية"
          }
        ]);

        // بيانات آراء الخبراء
        setExpertOpinions([
          {
            id: 1,
            title: "مستقبل النظام الدولي",
            expert: "د. محمد العبدالله",
            summary: "تحليل للتغيرات في النظام الدولي وتأثيرها على المنطقة"
          },
          {
            id: 2,
            title: "التحديات الأمنية المعاصرة",
            expert: "د. أحمد القحطاني",
            summary: "نظرة على التحديات الأمنية الجديدة في القرن الحادي والعشرين"
          },
          {
            id: 3,
            title: "السياسات العامة ورؤية 2030",
            expert: "د. فاطمة الزهراني",
            summary: "تحليل لدور السياسات العامة في تحقيق رؤية المملكة 2030"
          }
        ]);

        // بيانات الجدول الزمني للإنجازات
        setTimelineAchievements([
          {
            year: "2010",
            title: "تأسيس الجمعية",
            description: "تأسيس الجمعية السعودية للعلوم السياسية"
          },
          {
            year: "2015",
            title: "أول مؤتمر دولي",
            description: "تنظيم أول مؤتمر دولي للعلوم السياسية"
          },
          {
            year: "2020",
            title: "المكتبة الرقمية",
            description: "إطلاق المكتبة الرقمية التفاعلية"
          },
          {
            year: "2024",
            title: "الشراكات الدولية",
            description: "توسيع الشراكات مع الجامعات العالمية"
          }
        ]);

        // بيانات شهادات الأعضاء
        setMemberTestimonials([
          {
            id: 1,
            name: "د. سارة الأحمد",
            position: "أستاذ مساعد",
            memberSince: "2018",
            testimonial: "الجمعية وفرت لي منصة ممتازة للتواصل مع الباحثين وتطوير مهاراتي البحثية",
            image: "/assets/images/member1.jpg"
          },
          {
            id: 2,
            name: "د. خالد المطيري",
            position: "باحث دكتوراه",
            memberSince: "2020",
            testimonial: "المكتبة الرقمية والفعاليات العلمية ساهمت بشكل كبير في إثراء بحثي",
            image: "/assets/images/member2.jpg"
          },
          {
            id: 3,
            name: "د. نورا السلمان",
            position: "أستاذ مشارك",
            memberSince: "2016",
            testimonial: "الشبكة العلمية للجمعية فتحت لي آفاق جديدة للتعاون البحثي",
            image: "/assets/images/member3.jpg"
          }
        ]);

      } catch (err) {
        console.error('خطأ في جلب بيانات الصفحة الرئيسية:', err);
      }
    };

    fetchHomeData();
  }, []); // إزالة dependencies لتجنب infinite loop

  // معالجة حالات التحميل والأخطاء
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>خطأ في تحميل البيانات: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <ImageComponent 
                  src="/assets/images/prince-turki.jpeg" 
                  alt="الأمير تركي الفيصل" 
                  className="w-full h-72 object-cover"
                />
                <div className="absolute top-4 right-4 bg-secondary-500 text-white rounded-md px-3 py-1">
                  محاضرة استثنائية
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>٢٤ مايو ٢٠٢٥</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">الجمعية السعودية للعلوم السياسية تستضيف الأمير تركي الفيصل</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">محاضرة يلقيها صاحب السمو الملكي الأمير تركي الفيصل حول "مستقبل العالم العربي في ضوء المتغيرات الراهنة" في قاعة رقم (٨٨) بكلية الحقوق والعلوم السياسية بجامعة الملك سعود.</p>
                <Link to="/events/lecture/prince-turki" className="text-primary-600 hover:text-primary-800 font-medium inline-flex items-center">
                  التفاصيل الكاملة <span className="mr-2">←</span>
                </Link>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg">
                <div className="flex flex-col sm:flex-row">
                  <img 
                    src={replaceUnsplashUrl("https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070", "default")}
                    alt="ورشة عمل"
                    className="w-full sm:w-24 h-24 object-cover"
                  />
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">١٠ أبريل ٢٠٢٤</div>
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">ورشة عمل: التحولات الجيوسياسية في المنطقة العربية</h3>
                    <Link to="/news" className="text-primary-600 hover:text-primary-800 text-sm inline-flex items-center">
                      التفاصيل <span className="mr-1">←</span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg">
                <div className="flex flex-col sm:flex-row">
                  <img 
                    src={replaceUnsplashUrl("https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070", "default")}
                    alt="إصدار جديد"
                    className="w-full sm:w-24 h-24 object-cover"
                  />
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">٥ أبريل ٢٠٢٤</div>
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">صدور العدد الجديد من مجلة الدراسات السياسية</h3>
                    <Link to="/news" className="text-primary-600 hover:text-primary-800 text-sm inline-flex items-center">
                      التفاصيل <span className="mr-1">←</span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg">
                <div className="flex flex-col sm:flex-row">
                  <img 
                    src={replaceUnsplashUrl("https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070", "default")}
                    alt="مذكرة تفاهم"
                    className="w-full sm:w-24 h-24 object-cover"
                  />
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">١ أبريل ٢٠٢٤</div>
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">توقيع مذكرة تفاهم مع مركز الدراسات الدولية</h3>
                    <Link to="/news" className="text-primary-600 hover:text-primary-800 text-sm inline-flex items-center">
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
              
              {/* إحصائيات تأثير الجمعية */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">85%</div>
                  <div className="text-gray-600 text-sm">من الباحثين أشادوا بتأثير الجمعية السعودية للعلوم السياسية على البحث العلمي</div>
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
                    <Link to="/events">
                      <button className={`${buttonStyles.primary} w-full`}>التسجيل الآن</button>
                    </Link>
                    <Link to="/events">
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
                <img src={replaceUnsplashUrl("https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=2070", "event")} alt="فعالية سابقة" className="w-full h-full object-cover transition-transform hover:scale-110" />
              </div>
              <div className="flex-shrink-0 w-72 h-48 rounded-lg overflow-hidden shadow-md">
                <img src={replaceUnsplashUrl("https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=2070", "event")} alt="فعالية سابقة" className="w-full h-full object-cover transition-transform hover:scale-110" />
              </div>
              <div className="flex-shrink-0 w-72 h-48 rounded-lg overflow-hidden shadow-md">
                <img src={replaceUnsplashUrl("https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069", "event")} alt="فعالية سابقة" className="w-full h-full object-cover transition-transform hover:scale-110" />
              </div>
              <div className="flex-shrink-0 w-72 h-48 rounded-lg overflow-hidden shadow-md">
                <img src={replaceUnsplashUrl("https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012", "event")} alt="فعالية سابقة" className="w-full h-full object-cover transition-transform hover:scale-110" />
              </div>
              <div className="flex-shrink-0 w-72 h-48 rounded-lg overflow-hidden shadow-md">
                <img src={replaceUnsplashUrl("https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070", "event")} alt="فعالية سابقة" className="w-full h-full object-cover transition-transform hover:scale-110" />
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
                      <Link to="/research" className="text-primary-600 hover:text-primary-800">قراءة المزيد</Link>
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
                  <Link to="/research" className="mt-4 inline-block text-primary-600 hover:text-primary-800 text-sm">عرض الملف الشخصي</Link>
                </div>
              ))}
            </div>
          </div>
          
          {/* إحصائيات البحث العلمي */}
          <div className="bg-primary-700 text-white rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-8 text-center">تأثير الجمعية السعودية للعلوم السياسية في البحث العلمي</h3>
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
                    
                    <Link to="/resources/1">
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



      {/* قسم العضوية والمشاركة */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">انضم إلى الجمعية السعودية للعلوم السياسية</h2>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                كن جزءاً من مجتمع علمي متخصص يجمع نخبة من الباحثين والأكاديميين السعوديين والمهتمين بمجال العلوم السياسية
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
              <p className="text-gray-600 mb-6">كن على اطلاع دائم بأحدث الفعاليات والإصدارات العلمية من الجمعية السعودية للعلوم السياسية</p>
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
