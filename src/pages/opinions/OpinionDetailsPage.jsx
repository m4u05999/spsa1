import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const OpinionDetailsPage = () => {
  const { id } = useParams();
  const [opinion, setOpinion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedOpinions, setRelatedOpinions] = useState([]);

  // Button styles
  const buttonStyles = {
    primary: "bg-primary-600 text-white rounded-md px-4 py-2 hover:bg-primary-700 transition-colors",
    outline: "border border-primary-600 text-primary-600 rounded-md px-4 py-2 hover:bg-primary-50 transition-colors",
  };

  useEffect(() => {
    // Simulate loading data from API
    setLoading(true);
    
    // Mock data - in a real application, this would be fetched from an API
    const mockOpinions = [
      {
        id: 1,
        expertName: "د. عبدالرحمن السديس",
        position: "أستاذ العلاقات الدولية - جامعة الملك سعود",
        opinion: "أصبحت التحولات في موازين القوى العالمية تشكل تحدياً للنظام الدولي القائم، مما يستدعي إعادة النظر في هياكل صنع القرار الدولي",
        fullArticle: "في ظل التحولات الراهنة في النظام الدولي، نشهد تغيرات عميقة في موازين القوى العالمية وصعود قوى جديدة تطالب بدور أكبر في صناعة القرار الدولي. هذه التحولات تضع النظام الدولي القائم منذ نهاية الحرب العالمية الثانية أمام تحديات غير مسبوقة، خاصة مع تراجع الهيمنة الأحادية التي سادت بعد انتهاء الحرب الباردة.\n\nإن هذه التغيرات تستدعي إعادة النظر في هياكل صنع القرار الدولي، بما في ذلك مؤسسات بريتون وودز والأمم المتحدة، لتعكس الواقع الجديد للعلاقات الدولية. فنظام الحوكمة العالمي الحالي لا يعكس بدقة توزيع القوة الاقتصادية والسياسية في العالم المعاصر، مما يؤدي إلى تآكل شرعية هذه المؤسسات وقدرتها على التعامل مع التحديات العالمية المعاصرة.\n\nكما أن التحديات العابرة للحدود، مثل تغير المناخ والإرهاب والأوبئة والجريمة المنظمة، تتطلب استجابات جماعية منسقة لا يمكن لأي دولة بمفردها، مهما كانت قوتها، أن تتصدى لها بفعالية. وهذا يستدعي تطوير آليات جديدة للتعاون الدولي، تقوم على أساس من المصالح المشتركة والمسؤولية الجماعية.\n\nإن إصلاح نظام الحوكمة العالمي ليس ترفاً فكرياً، بل ضرورة استراتيجية لضمان استقرار وفعالية النظام الدولي في مواجهة التحديات المعاصرة. ويتطلب ذلك حواراً جادّاً بين القوى الصاعدة والقوى التقليدية، للتوصل إلى صيغة توافقية تعكس الواقع الجديد للعلاقات الدولية، وتضمن مشاركة أوسع في صناعة القرار العالمي.",
        image: "https://images.unsplash.com/photo-1519085360753-af613a6e2200?q=80&w=987",
        coverImage: "https://images.unsplash.com/photo-1516834474-48c0abc2a902?q=80&w=1473",
        topic: "النظام العالمي الجديد",
        date: "أبريل 2024",
        readTime: "5 دقائق",
        articleSections: [
          {
            title: "مقدمة",
            content: "في ظل التحولات الراهنة في النظام الدولي، نشهد تغيرات عميقة في موازين القوى العالمية وصعود قوى جديدة تطالب بدور أكبر في صناعة القرار الدولي. هذه التحولات تضع النظام الدولي القائم منذ نهاية الحرب العالمية الثانية أمام تحديات غير مسبوقة."
          },
          {
            title: "إعادة هيكلة المؤسسات الدولية",
            content: "إن هذه التغيرات تستدعي إعادة النظر في هياكل صنع القرار الدولي، بما في ذلك مؤسسات بريتون وودز والأمم المتحدة، لتعكس الواقع الجديد للعلاقات الدولية. فنظام الحوكمة العالمي الحالي لا يعكس بدقة توزيع القوة الاقتصادية والسياسية في العالم المعاصر."
          },
          {
            title: "التحديات العالمية المشتركة",
            content: "التحديات العابرة للحدود، مثل تغير المناخ والإرهاب والأوبئة والجريمة المنظمة، تتطلب استجابات جماعية منسقة لا يمكن لأي دولة بمفردها، مهما كانت قوتها، أن تتصدى لها بفعالية. وهذا يستدعي تطوير آليات جديدة للتعاون الدولي."
          },
          {
            title: "نحو نظام دولي أكثر عدالة",
            content: "إن إصلاح نظام الحوكمة العالمي ليس ترفاً فكرياً، بل ضرورة استراتيجية لضمان استقرار وفعالية النظام الدولي في مواجهة التحديات المعاصرة. ويتطلب ذلك حواراً جادّاً بين القوى الصاعدة والقوى التقليدية."
          }
        ]
      },
      {
        id: 2,
        expertName: "د. هدى المنصور",
        position: "خبيرة الدراسات الأمنية والإستراتيجية",
        opinion: "باتت التهديدات السيبرانية تشكل خطراً متزايداً على الأمن القومي للدول، مما يستلزم تطوير استراتيجيات دفاعية متقدمة",
        fullArticle: "في عصر الثورة الرقمية، أصبحت التهديدات السيبرانية من أخطر التحديات التي تواجه الأمن القومي للدول. فمع تزايد الاعتماد على تقنيات المعلومات والاتصالات في إدارة البنى التحتية الحيوية، من شبكات الطاقة وأنظمة النقل إلى المنشآت العسكرية والخدمات الحكومية، أصبحت هذه الأنظمة عرضة للاختراق والتجسس والتخريب.",
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=987",
        coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1470",
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
        coverImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1472",
        topic: "الاقتصاد الرقمي",
        date: "مارس 2024",
        readTime: "6 دقائق"
      }
    ];

    // Find the opinion by ID
    const foundOpinion = mockOpinions.find(op => op.id === parseInt(id));
    
    if (foundOpinion) {
      setOpinion(foundOpinion);
      
      // Set related opinions (same topic but different ID)
      const related = mockOpinions
        .filter(op => op.topic === foundOpinion.topic && op.id !== foundOpinion.id)
        .slice(0, 2); // Get max 2 related opinions
      setRelatedOpinions(related);
    }
    
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-3 mb-6">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!opinion) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">لم يتم العثور على المقال</h2>
          <p className="text-gray-600 mb-6">عذرًا، المقال الذي تبحث عنه غير موجود أو تم حذفه</p>
          <Link to="/expert-opinions" className={buttonStyles.primary}>
            العودة إلى قائمة المقالات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section with cover image */}
      <div 
        className="relative h-80 md:h-96 bg-cover bg-center" 
        style={{ backgroundImage: `url(${opinion.coverImage || opinion.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40"></div>
        <div className="container mx-auto px-4 relative h-full">
          <div className="flex flex-col justify-end h-full pb-10 text-white max-w-4xl mx-auto">
            <div className="flex items-center mb-4">
              <img 
                src={opinion.image} 
                alt={opinion.expertName} 
                className="w-16 h-16 rounded-full object-cover border-2 border-white ml-4" 
              />
              <div>
                <h4 className="font-bold text-lg">{opinion.expertName}</h4>
                <p className="text-sm text-gray-200">{opinion.position}</p>
              </div>
            </div>
            <div className="flex items-center text-sm mb-6">
              <span className="bg-primary-600 text-white px-3 py-1 rounded-full ml-3">{opinion.topic}</span>
              <div className="flex items-center ml-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{opinion.date}</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{opinion.readTime}</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{opinion.opinion}</h1>
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-10">
          {opinion.articleSections ? (
            // Render structured article if available
            <div className="space-y-8">
              {opinion.articleSections.map((section, index) => (
                <section key={index}>
                  <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </section>
              ))}
            </div>
          ) : (
            // Otherwise just render the full article text
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {opinion.fullArticle}
            </p>
          )}

          {/* Author bio */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-start">
              <img 
                src={opinion.image} 
                alt={opinion.expertName} 
                className="w-20 h-20 rounded-full object-cover ml-6" 
              />
              <div>
                <h4 className="text-xl font-bold mb-1">{opinion.expertName}</h4>
                <p className="text-gray-600 mb-3">{opinion.position}</p>
                <p className="text-gray-700">
                  باحث متخصص في {opinion.topic} مع خبرة تمتد لأكثر من 15 عاماً في المجال الأكاديمي والبحثي. نُشرت له العديد من الدراسات في دوريات علمية محكمة.
                </p>
              </div>
            </div>
          </div>

          {/* Share buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-gray-700 font-medium">مشاركة المقال:</div>
              <div className="flex space-x-3 space-x-reverse">
                <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                </button>
                <button className="p-2 bg-blue-800 text-white rounded-full hover:bg-blue-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
                </button>
                <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                </button>
                <button className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related opinions */}
        {relatedOpinions.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12">
            <h3 className="text-2xl font-bold mb-6">مقالات ذات صلة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedOpinions.map(related => (
                <div 
                  key={related.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <img 
                        src={related.image} 
                        alt={related.expertName} 
                        className="w-12 h-12 rounded-full object-cover ml-3" 
                      />
                      <div>
                        <h4 className="font-bold text-base">{related.expertName}</h4>
                        <p className="text-xs text-gray-600">{related.position}</p>
                      </div>
                    </div>
                    <p className="text-gray-800 mb-3 line-clamp-2 font-medium">"{related.opinion}"</p>
                    <div className="flex justify-between items-center">
                      <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-md">
                        {related.topic}
                      </span>
                      <Link 
                        to={`/opinions/${related.id}`} 
                        className="text-primary-600 hover:text-primary-800 text-sm inline-flex items-center"
                      >
                        قراءة المقال
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to opinions */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <Link 
            to="/expert-opinions" 
            className="inline-flex items-center text-primary-600 hover:text-primary-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة إلى قائمة آراء الخبراء
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OpinionDetailsPage;