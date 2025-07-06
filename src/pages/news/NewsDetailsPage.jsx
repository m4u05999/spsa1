// src/pages/news/NewsDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ImageComponent from '../../components/ImageComponent';

// قائمة بيانات مؤقتة (ستُستبدل بالبيانات من قاعدة البيانات لاحقًا)
const mockNews = [
  {
    id: 1,
    title: 'المؤتمر السنوي للعلوم السياسية 2025',
    date: '2025-01-15',
    description: 'يسر جمعية العلوم السياسية أن تعلن عن انطلاق فعاليات المؤتمر السنوي للعام 2025 تحت عنوان "التحولات السياسية في العالم العربي".',
    content: `<p>يسر جمعية العلوم السياسية أن تعلن عن انطلاق فعاليات المؤتمر السنوي للعام 2025 تحت عنوان "التحولات السياسية في العالم العربي". وسيتضمن المؤتمر العديد من الجلسات وورش العمل وحلقات النقاش حول مختلف القضايا السياسية المعاصرة في المنطقة العربية.</p>
    <p>من أهم محاور المؤتمر:</p>
    <ul>
      <li>التحول الديمقراطي في دول الربيع العربي</li>
      <li>أثر التقنيات الحديثة على التحولات السياسية</li>
      <li>دور الشباب في التغيير السياسي</li>
      <li>مستقبل النظام الإقليمي العربي في ظل المتغيرات الدولية</li>
    </ul>
    <p>سيشارك في المؤتمر نخبة من الباحثين والأكاديميين والخبراء من مختلف الدول العربية والأجنبية. وستُنشر أوراق العمل المقدمة في المؤتمر في عدد خاص من المجلة العلمية للجمعية.</p>
    <p>يُقام المؤتمر خلال الفترة من 15 إلى 17 يناير 2025 في مقر الجمعية بمدينة الرياض. ويمكن للراغبين في المشاركة التسجيل عبر الموقع الإلكتروني للجمعية.</p>`,
    image: '/assets/images/conference.jpg',
    author: 'إدارة الأخبار والفعاليات',
    relatedNews: [2, 3]
  },
  {
    id: 2,
    title: 'دورة تدريبية في التحليل السياسي',
    date: '2025-02-01',
    description: 'تنظم الجمعية دورة تدريبية متخصصة في مجال التحليل السياسي للباحثين والمهتمين في المجال السياسي.',
    content: `<p>تنظم الجمعية دورة تدريبية متخصصة في مجال التحليل السياسي للباحثين والمهتمين في المجال السياسي. تهدف الدورة إلى تطوير مهارات المشاركين في تحليل الأحداث والظواهر السياسية باستخدام المناهج العلمية الحديثة.</p>
    <p>تتناول الدورة الموضوعات التالية:</p>
    <ul>
      <li>أسس ومناهج التحليل السياسي</li>
      <li>تحليل الخطاب السياسي</li>
      <li>دراسة الرأي العام وقياسه</li>
      <li>التحليل الإحصائي للبيانات السياسية</li>
      <li>كتابة التقارير والدراسات السياسية</li>
    </ul>
    <p>يقدم الدورة نخبة من الأكاديميين والخبراء المتخصصين في مجال العلوم السياسية. وستُقام على مدى أسبوعين بواقع 4 ساعات يومياً.</p>
    <p>تبدأ الدورة في 1 فبراير 2025 وتنتهي في 14 فبراير 2025. وسيحصل المشاركون على شهادات معتمدة من الجمعية.</p>`,
    image: '/assets/images/training.jpg',
    author: 'وحدة التدريب والتطوير',
    relatedNews: [1, 3]
  },
  {
    id: 3,
    title: 'إصدار العدد الجديد من المجلة العلمية',
    date: '2025-03-10',
    description: 'صدر العدد الجديد من المجلة العلمية للجمعية متضمناً مجموعة من البحوث والدراسات المتميزة.',
    content: `<p>صدر العدد الجديد من المجلة العلمية للجمعية متضمناً مجموعة من البحوث والدراسات المتميزة في مجال العلوم السياسية والعلاقات الدولية. يأتي هذا العدد ضمن سلسلة الإصدارات العلمية التي تحرص الجمعية على نشرها بشكل دوري لإثراء المكتبة العربية في مجال التخصص.</p>
    <p>من أبرز البحوث المنشورة في العدد الجديد:</p>
    <ul>
      <li>التحولات في النظام الدولي ما بعد جائحة كورونا</li>
      <li>البعد السياسي للأمن السيبراني في الدول العربية</li>
      <li>دور المنظمات الدولية في حل النزاعات الإقليمية</li>
      <li>مستقبل العلاقات الخليجية-الأمريكية في ضوء المتغيرات الإقليمية</li>
      <li>التحديات السياسية للانتقال إلى الطاقة المستدامة في المنطقة العربية</li>
    </ul>
    <p>المجلة متاحة للقراءة والتحميل عبر الموقع الإلكتروني للجمعية. كما يمكن للباحثين الراغبين في النشر في الأعداد القادمة الاطلاع على شروط وقواعد النشر على الموقع.</p>`,
    image: '/assets/images/journal.jpg',
    author: 'هيئة تحرير المجلة العلمية',
    relatedNews: [1, 2]
  }
];

const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('ar-SA', options);
};

const NewsDetailsPage = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // محاكاة الحصول على بيانات الخبر من API
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    try {
      // محاكاة تأخير الشبكة
      const timer = setTimeout(() => {
        const newsItem = mockNews.find(n => n.id === parseInt(id, 10));
        
        if (newsItem) {
          setNews(newsItem);
          
          // جلب الأخبار ذات الصلة
          if (newsItem.relatedNews && newsItem.relatedNews.length > 0) {
            const related = mockNews.filter(n => newsItem.relatedNews.includes(n.id));
            setRelatedNews(related);
          }
          
          setLoading(false);
        } else {
          setError('الخبر غير موجود');
          setLoading(false);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل البيانات');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 rtl py-12" dir="rtl">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded w-full"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 rtl py-12" dir="rtl">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            <p>{error}</p>
          </div>
          <div className="text-center">
            <Link to="/news" className="inline-block bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-colors">
              العودة إلى صفحة الأخبار
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return news && (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Link to="/news" className="text-blue-200 hover:text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                العودة إلى الأخبار
              </Link>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">{news.title}</h1>
            <div className="flex items-center text-blue-200 text-sm sm:text-base">
              <span>{formatDate(news.date)}</span>
              <span className="mx-2">•</span>
              <span>{news.author}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* صورة الخبر */}
        <div className="mb-8">
          <ImageComponent
            src={news.image}
            alt={news.title}
            className="w-full rounded-lg shadow-md"
            fallbackSrc="/assets/images/default-article.jpg"
          />
        </div>

        {/* محتوى الخبر */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div 
            className="prose prose-blue max-w-none"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>

        {/* أخبار ذات صلة */}
        {relatedNews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6 border-r-4 border-blue-900 pr-4">أخبار ذات صلة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedNews.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/news/${item.id}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md overflow-hidden border border-gray-100 transition-all duration-300"
                >
                  <div className="relative overflow-hidden h-40">
                    <ImageComponent
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackSrc="/assets/images/default-article.jpg"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-gray-500 mb-1">
                      {formatDate(item.date)}
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link 
            to="/news" 
            className="inline-block border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-6 py-2 rounded-md transition-colors"
          >
            العودة إلى جميع الأخبار
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailsPage;
