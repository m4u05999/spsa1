import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ExpertOpinionsPage = () => {
  const [opinions, setOpinions] = useState([]);
  const [filteredOpinions, setFilteredOpinions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Button styles
  const buttonStyles = {
    primary: "bg-primary-600 text-white rounded-md px-4 py-2 hover:bg-primary-700 transition-colors",
    outline: "border border-primary-600 text-primary-600 rounded-md px-4 py-2 hover:bg-primary-50 transition-colors",
  };

  useEffect(() => {
    // Mock data - in a real application, this would be fetched from an API
    const mockOpinions = [
      {
        id: 1,
        expertName: "د. عبدالرحمن السديس",
        position: "أستاذ العلاقات الدولية - جامعة الملك سعود",
        opinion: "أصبحت التحولات في موازين القوى العالمية تشكل تحدياً للنظام الدولي القائم، مما يستدعي إعادة النظر في هياكل صنع القرار الدولي",
        fullArticle: "في ظل التحولات الراهنة في النظام الدولي، نشهد تغيرات عميقة في موازين القوى العالمية وصعود قوى جديدة تطالب بدور أكبر في صناعة القرار الدولي. هذه التحولات تضع النظام الدولي القائم منذ نهاية الحرب العالمية الثانية أمام تحديات غير مسبوقة، خاصة مع تراجع الهيمنة الأحادية التي سادت بعد انتهاء الحرب الباردة.\n\nإن هذه التغيرات تستدعي إعادة النظر في هياكل صنع القرار الدولي، بما في ذلك مؤسسات بريتون وودز والأمم المتحدة، لتعكس الواقع الجديد للعلاقات الدولية. فنظام الحوكمة العالمي الحالي لا يعكس بدقة توزيع القوة الاقتصادية والسياسية في العالم المعاصر، مما يؤدي إلى تآكل شرعية هذه المؤسسات وقدرتها على التعامل مع التحديات العالمية المعاصرة.",
        image: "https://images.unsplash.com/photo-1519085360753-af613a6e2200?q=80&w=987",
        topic: "النظام العالمي الجديد",
        date: "أبريل 2024",
        readTime: "5 دقائق"
      },
      {
        id: 2,
        expertName: "د. هدى المنصور",
        position: "خبيرة الدراسات الأمنية والإستراتيجية",
        opinion: "باتت التهديدات السيبرانية تشكل خطراً متزايداً على الأمن القومي للدول، مما يستلزم تطوير استراتيجيات دفاعية متقدمة",
        fullArticle: "في عصر الثورة الرقمية، أصبحت التهديدات السيبرانية من أخطر التحديات التي تواجه الأمن القومي للدول. فمع تزايد الاعتماد على تقنيات المعلومات والاتصالات في إدارة البنى التحتية الحيوية، من شبكات الطاقة وأنظمة النقل إلى المنشآت العسكرية والخدمات الحكومية، أصبحت هذه الأنظمة عرضة للاختراق والتجسس والتخريب.",
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=987",
        topic: "الأمن السيبراني",
        date: "مارس 2024",
        readTime: "4 دقائق"
      },
      {
        id: 3,
        expertName: "د. خالد العتيبي",
        position: "أستاذ الاقتصاد السياسي - جامعة القصيم",
        opinion: "تقود التكنولوجيا المالية تحولاً عميقاً في بنية النظام المالي العالمي، مع ظهور العملات الرقمية للبنوك المركزية كلاعب جديد",
        fullArticle: "يشهد النظام المالي العالمي تحولاً عميقاً بفعل التطورات المتسارعة في مجال التكنولوجيا المالية، التي باتت تعيد تشكيل أسس هذا النظام وآليات عمله.",
        image: "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?q=80&w=1074",
        topic: "الاقتصاد الرقمي",
        date: "مارس 2024",
        readTime: "6 دقائق"
      },
      {
        id: 4,
        expertName: "د. نوف القحطاني",
        position: "أستاذة العلوم السياسية - جامعة الأميرة نورة",
        opinion: "تتطلب التحديات الجيوسياسية المعاصرة تحولاً نوعياً في التفكير الاستراتيجي وبناء الشراكات المستدامة القائمة على المصالح المشتركة",
        fullArticle: "يشهد العالم المعاصر تحولات جيوسياسية عميقة تعيد تشكيل خريطة القوى العالمية والتحالفات الإقليمية.",
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1074",
        topic: "العلاقات الدولية",
        date: "فبراير 2024",
        readTime: "5 دقائق"
      },
      {
        id: 5,
        expertName: "د. سلطان الشمري",
        position: "مستشار في الشؤون القانونية الدولية",
        opinion: "يواجه القانون الدولي تحديات غير مسبوقة في ظل التطورات التكنولوجية والتحولات الجيوسياسية، مما يستدعي تطوير أطر قانونية جديدة",
        fullArticle: "في عصر يشهد تحولات تكنولوجية وجيوسياسية متسارعة، يواجه القانون الدولي تحديات غير مسبوقة تختبر مرونته وقدرته على التكيف.",
        image: "https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?q=80&w=1089",
        topic: "القانون الدولي",
        date: "فبراير 2024",
        readTime: "7 دقائق"
      },
      {
        id: 6,
        expertName: "د. منى العتيبي",
        position: "باحثة في الإعلام السياسي - جامعة الملك عبدالعزيز",
        opinion: "تلعب وسائل التواصل الاجتماعي دوراً محورياً في تشكيل الرأي العام وصياغة الخطاب السياسي، مع تأثيرات مختلطة على الديمقراطية والمشاركة السياسية",
        fullArticle: "لقد أحدثت وسائل التواصل الاجتماعي ثورة في طريقة تفاعل الجمهور مع القضايا السياسية، وكيفية صياغة الخطاب السياسي ونشره.",
        image: "https://images.unsplash.com/photo-1687089014954-2f62b3508546?q=80&w=987",
        topic: "الإعلام السياسي",
        date: "يناير 2024",
        readTime: "5 دقائق"
      }
    ];

    setOpinions(mockOpinions);
    setFilteredOpinions(mockOpinions);
  }, []);

  // Categories/topics for filtering
  const topics = [
    { id: 'all', name: 'جميع المواضيع' },
    { id: 'النظام العالمي الجديد', name: 'النظام العالمي الجديد' },
    { id: 'الأمن السيبراني', name: 'الأمن السيبراني' },
    { id: 'الاقتصاد الرقمي', name: 'الاقتصاد الرقمي' },
    { id: 'العلاقات الدولية', name: 'العلاقات الدولية' },
    { id: 'القانون الدولي', name: 'القانون الدولي' },
    { id: 'الإعلام السياسي', name: 'الإعلام السياسي' },
  ];

  useEffect(() => {
    filterOpinions(activeFilter, searchQuery);
  }, [activeFilter, searchQuery, opinions]);

  const filterOpinions = (filter, query) => {
    let filtered = [...opinions];
    
    if (filter !== 'all') {
      filtered = filtered.filter(opinion => opinion.topic === filter);
    }
    
    if (query) {
      filtered = filtered.filter(opinion => 
        opinion.expertName.toLowerCase().includes(query.toLowerCase()) || 
        opinion.opinion.toLowerCase().includes(query.toLowerCase()) ||
        opinion.topic.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    setFilteredOpinions(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">آراء الخبراء</h1>
            <p className="text-lg mb-8">
              تحليلات وآراء متخصصة حول أبرز القضايا السياسية المعاصرة من نخبة من المفكرين والباحثين
            </p>

            {/* Search bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="ابحث عن موضوع أو كاتب..."
                className="w-full px-5 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="container mx-auto px-4 py-12">
        {/* Topics filter */}
        <div className="flex flex-wrap justify-center mb-10 gap-2">
          {topics.map(topic => (
            <button
              key={topic.id}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeFilter === topic.id 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white border border-gray-300 hover:bg-gray-100'
              }`}
              onClick={() => setActiveFilter(topic.id)}
            >
              {topic.name}
            </button>
          ))}
        </div>

        {/* Opinions grid */}
        {filteredOpinions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {filteredOpinions.map(expert => (
              <div 
                key={expert.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col"
              >
                <div className="p-6 border-b">
                  <div className="flex items-center mb-4">
                    <img 
                      src={expert.image} 
                      alt={expert.expertName} 
                      className="w-16 h-16 rounded-full object-cover ml-4" 
                    />
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
                      <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-md">
                        {expert.topic}
                      </span>
                    </div>
                    <div className="text-gray-500 text-sm">{expert.date}</div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Link 
                      to={`/opinions/${expert.id}`} 
                      className="text-primary-600 hover:text-primary-800 text-sm inline-flex items-center"
                    >
                      قراءة المقال كاملاً <span className="mr-1">←</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-4xl text-gray-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-400">لم يتم العثور على نتائج</h3>
            <p className="text-gray-500 mt-2">حاول استخدام كلمات بحث مختلفة أو تصفية أخرى</p>
          </div>
        )}

        {/* Featured experts */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-md">
          <h3 className="text-2xl font-bold mb-6 text-center">اشترك في نشرة آراء الخبراء</h3>
          <p className="text-center text-gray-600 mb-8">احصل على أحدث التحليلات والآراء مباشرة على بريدك الإلكتروني</p>
          <div className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              <button className={`${buttonStyles.primary} px-6 py-3 whitespace-nowrap`}>
                اشتراك
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertOpinionsPage;