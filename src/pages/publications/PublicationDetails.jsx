// src/pages/publications/PublicationDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const PublicationDetails = () => {
  const { id } = useParams();
  const [publication, setPublication] = useState(null);
  const [relatedPublications, setRelatedPublications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // نموذج لبيانات المنشورات (في التطبيق الحقيقي ستأتي من قاعدة البيانات)
  const publicationsData = [
    {
      id: 1,
      title: 'مجلة العلوم السياسية - العدد الرابع والعشرون',
      type: 'دورية',
      category: 'journal',
      date: '2023-12-01',
      description: 'مجلة علمية محكمة تصدر كل ثلاثة أشهر تتضمن أبحاث في العلاقات الدولية والنظم السياسية',
      image: '/assets/images/journal.png',
      featured: true,
      price: '٥٠ ريال',
      authors: ['د. عبدالله محمد', 'د. سارة أحمد', 'د. فهد العمري'],
      pages: 120,
      issn: '1234-5678',
      abstract: 'يتناول هذا العدد من المجلة مجموعة متنوعة من الأبحاث التي تغطي موضوعات مهمة في مجال العلوم السياسية والعلاقات الدولية، بما في ذلك تحليل للتحولات الجيوسياسية في منطقة الشرق الأوسط، ودراسة للسياسات الخارجية للقوى الكبرى، وتقييم للأنظمة السياسية الناشئة في المنطقة.',
      tableOfContents: [
        {
          title: 'كلمة العدد',
          author: 'رئيس التحرير',
          pages: '3-5'
        },
        {
          title: 'التحولات الجيوسياسية في منطقة الشرق الأوسط',
          author: 'د. عبدالله محمد',
          pages: '7-28'
        },
        {
          title: 'السياسة الخارجية الأمريكية تجاه الصين',
          author: 'د. سارة أحمد',
          pages: '29-52'
        },
        {
          title: 'مستقبل التكامل الإقليمي في مجلس التعاون الخليجي',
          author: 'د. فهد العمري',
          pages: '53-78'
        },
        {
          title: 'الأمن الإقليمي في ظل المتغيرات الدولية',
          author: 'د. نورة الشمري',
          pages: '79-100'
        },
        {
          title: 'مراجعات كتب حديثة',
          author: 'هيئة التحرير',
          pages: '101-120'
        }
      ],
      sampleContent: `
## التحولات الجيوسياسية في منطقة الشرق الأوسط
**د. عبدالله محمد**

### ملخص البحث
تتناول هذه الدراسة التحولات الجيوسياسية التي طرأت على منطقة الشرق الأوسط خلال العقد الأخير، وتحليل تأثيراتها على موازين القوى الإقليمية والدولية. كما تستعرض الدراسة الأبعاد المختلفة لهذه التحولات من النواحي السياسية والاقتصادية والأمنية، وتقدم رؤية استشرافية لمستقبل المنطقة في ضوء المتغيرات الحالية.

### المقدمة
شهدت منطقة الشرق الأوسط خلال العقد الماضي تحولات عميقة في بنية النظم السياسية وطبيعة العلاقات بين القوى الإقليمية والدولية. وقد أسهمت مجموعة من العوامل في تشكيل هذه التحولات، من بينها الثورات والاحتجاجات التي اجتاحت المنطقة منذ عام 2011، والصراعات المسلحة في عدد من الدول، فضلًا عن التدخلات الخارجية والتنافس الدولي على النفوذ في المنطقة.

وتحاول هذه الدراسة الإجابة على عدة تساؤلات محورية: ما هي أبرز التحولات الجيوسياسية في المنطقة؟ وكيف أثرت على موازين القوى الإقليمية؟ وما هي انعكاساتها على الأمن والاستقرار في الشرق الأوسط؟ وما هي السيناريوهات المحتملة لمستقبل المنطقة في ظل هذه التحولات؟`
    },
    {
      id: 2,
      title: 'مجلة العلوم السياسية - العدد الثالث والعشرون',
      type: 'دورية',
      category: 'journal',
      date: '2023-09-01',
      description: 'تتضمن دراسات حول التحولات السياسية في الشرق الأوسط وتأثير الجائحة على العلاقات الدولية',
      image: '/assets/images/journal.png'
    },
    {
      id: 3,
      title: 'النظم السياسية المقارنة',
      type: 'كتاب',
      category: 'book',
      date: '2023-10-15',
      description: 'كتاب يتناول مقارنة النظم السياسية العالمية ويحلل أوجه التشابه والاختلاف بين الأنظمة الديمقراطية',
      image: '/assets/images/books.png',
      featured: true
    }
  ];

  useEffect(() => {
    // محاكاة جلب البيانات من الخادم
    setIsLoading(true);
    setTimeout(() => {
      const foundPublication = publicationsData.find(pub => pub.id === parseInt(id));
      setPublication(foundPublication);
      
      // جلب المنشورات المرتبطة (نفس الفئة ولكن ليست نفس المنشور)
      if (foundPublication) {
        const related = publicationsData
          .filter(pub => pub.category === foundPublication.category && pub.id !== foundPublication.id)
          .slice(0, 3);
        setRelatedPublications(related);
      }
      
      setIsLoading(false);
    }, 800);
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل تفاصيل المنشور...</p>
        </div>
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">خطأ! </strong>
          <span className="block sm:inline">لم يتم العثور على المنشور المطلوب.</span>
          <Link to="/publications" className="block mt-4 text-blue-600 hover:underline">العودة إلى صفحة المنشورات</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* رأس الصفحة */}
      <section className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3 rtl:space-x-reverse">
              <li className="inline-flex items-center">
                <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  الرئيسية
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <Link to="/publications" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">المنشورات</Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 line-clamp-1">{publication.title}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* معلومات المنشور */}
          <div className="md:flex">
            <div className="md:w-1/3 p-6">
              <div className="bg-gray-100 p-4 rounded-lg flex justify-center">
                <img 
                  src={publication.image} 
                  alt={publication.title} 
                  className="h-auto max-h-96 rounded-md shadow-sm"
                />
              </div>
              
              {/* معلومات إضافية */}
              <div className="mt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع المنشور:</span>
                  <span className="font-medium">{publication.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ النشر:</span>
                  <span className="font-medium">{publication.date}</span>
                </div>
                {publication.pages && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">عدد الصفحات:</span>
                    <span className="font-medium">{publication.pages}</span>
                  </div>
                )}
                {publication.issn && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ISSN:</span>
                    <span className="font-medium">{publication.issn}</span>
                  </div>
                )}
                {publication.authors && (
                  <div className="flex flex-col">
                    <span className="text-gray-600 mb-1">المؤلفون:</span>
                    <ul className="list-disc list-inside space-y-1">
                      {publication.authors.map((author, index) => (
                        <li key={index} className="font-medium">{author}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* أزرار الشراء والتحميل */}
                <div className="mt-8 space-y-3">
                  {publication.price && (
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                      شراء النسخة الإلكترونية ({publication.price})
                    </button>
                  )}
                  <button className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors">
                    تحميل ملخص المنشور (PDF)
                  </button>
                  {publication.type === 'دورية' && (
                    <button className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                      طلب نسخة ورقية
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3 p-6">
              <h1 className="text-2xl font-bold mb-4">{publication.title}</h1>
              
              {/* تبويبات لعرض محتويات مختلفة */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex flex-wrap -mb-px">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700 hover:border-gray-300'} inline-flex items-center py-4 px-4 border-b-2 font-medium text-sm`}
                  >
                    نظرة عامة
                  </button>
                  {publication.tableOfContents && (
                    <button
                      onClick={() => setActiveTab('contents')}
                      className={`${activeTab === 'contents' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700 hover:border-gray-300'} inline-flex items-center py-4 px-4 border-b-2 font-medium text-sm`}
                    >
                      جدول المحتويات
                    </button>
                  )}
                  {publication.sampleContent && (
                    <button
                      onClick={() => setActiveTab('sample')}
                      className={`${activeTab === 'sample' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700 hover:border-gray-300'} inline-flex items-center py-4 px-4 border-b-2 font-medium text-sm`}
                    >
                      نموذج من المحتوى
                    </button>
                  )}
                </nav>
              </div>
              
              {/* محتوى التبويبات */}
              <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-2">الملخص</h2>
                    <p className="text-gray-700 leading-relaxed">{publication.abstract || publication.description}</p>
                    
                    {publication.type === 'دورية' && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">عن المجلة</h3>
                        <p className="text-gray-700">
                          مجلة العلوم السياسية هي مجلة علمية محكمة تصدر عن رابطة العلوم السياسية. تنشر المجلة الأبحاث والدراسات المتخصصة في مجالات العلوم السياسية والعلاقات الدولية والسياسات العامة. تخضع جميع البحوث للتحكيم العلمي وفقاً للمعايير الأكاديمية المعتمدة.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'contents' && publication.tableOfContents && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">جدول المحتويات</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              عنوان المقال
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              المؤلف/المؤلفون
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              الصفحات
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {publication.tableOfContents.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.author}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.pages}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {activeTab === 'sample' && publication.sampleContent && (
                  <div className="prose prose-sm max-w-none">
                    <h2 className="text-xl font-semibold mb-4">نموذج من المحتوى</h2>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      {publication.sampleContent.split('\n').map((line, index) => {
                        if (line.startsWith('## ')) {
                          return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.replace('## ', '')}</h2>;
                        }
                        if (line.startsWith('### ')) {
                          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>;
                        }
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={index} className="font-bold my-2">{line.replace(/^\*\*|\*\*$/g, '')}</p>;
                        }
                        return line ? <p key={index} className="my-2">{line}</p> : <br key={index} />;
                      })}

                      <div className="mt-6 border-t pt-4 text-center">
                        <span className="text-gray-600 text-sm">
                          لقراءة المزيد، يرجى شراء النسخة الكاملة من المنشور
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* منشورات ذات صلة */}
        {relatedPublications.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">منشورات ذات صلة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPublications.map((pub) => (
                <Link key={pub.id} to={`/publications/${pub.id}`} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
                  <img
                    src={pub.image}
                    alt={pub.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                        {pub.type}
                      </span>
                      <span className="text-xs text-gray-500">{pub.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{pub.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{pub.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* قسم التواصل */}
      <section className="bg-gray-50 border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">هل لديك استفسارات حول هذا المنشور؟</h3>
            <p className="text-gray-600 mb-4">يمكنك التواصل مع فريق المنشورات للمزيد من المعلومات</p>
            <Link to="/contact" className="inline-block px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicationDetails;