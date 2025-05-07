import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ResourceDetailsPage = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedResources, setRelatedResources] = useState([]);

  // Button styles
  const buttonStyles = {
    primary: "bg-primary-600 text-white rounded-md px-4 py-2 hover:bg-primary-700 transition-colors",
    outline: "border border-primary-600 text-primary-600 rounded-md px-4 py-2 hover:bg-primary-50 transition-colors",
  };

  useEffect(() => {
    // Simulate loading data from API
    setLoading(true);
    
    // Mock data - in a real application, this would be fetched from an API
    const mockResources = [
      {
        id: 1,
        title: "تحولات النظام العالمي بعد الحرب الباردة",
        author: "د. أحمد المنصور",
        type: "كتاب",
        year: "2023",
        abstract: "يتناول هذا الكتاب التحولات البنيوية في النظام الدولي منذ انتهاء الحرب الباردة، مع تحليل للاتجاهات المستقبلية لهذا النظام في ظل صعود القوى الآسيوية.",
        keywords: ["النظام العالمي", "الحرب الباردة", "توازن القوى", "القوى الصاعدة"],
        coverImage: "https://images.unsplash.com/photo-1516834474-48c0abc2a902?q=80&w=1473",
        publisher: "دار الشروق للنشر والتوزيع",
        pages: 324,
        downloadLink: "#",
        readOnlineLink: "#",
        chapters: [
          {
            title: "الفصل الأول: أسس النظام العالمي القديم",
            pages: "1-28"
          },
          {
            title: "الفصل الثاني: انهيار الاتحاد السوفيتي وتداعياته",
            pages: "29-54"
          },
          {
            title: "الفصل الثالث: الهيمنة الأمريكية وتحدياتها",
            pages: "55-82"
          },
          {
            title: "الفصل الرابع: صعود الصين وتحولات التوازن العالمي",
            pages: "83-110"
          },
          {
            title: "الفصل الخامس: الاتحاد الأوروبي كقطب مستقل",
            pages: "111-138"  
          },
          {
            title: "الفصل السادس: روسيا والعودة إلى الساحة الدولية",
            pages: "139-166"
          },
          {
            title: "الفصل السابع: دول الجنوب العالمي وقضايا التنمية",
            pages: "167-194"
          },
          {
            title: "الفصل الثامن: الشرق الأوسط في النظام العالمي",
            pages: "195-222"
          },
          {
            title: "الفصل التاسع: النظام الاقتصادي العالمي",
            pages: "223-250"
          },
          {
            title: "الفصل العاشر: القضايا العالمية المشتركة",
            pages: "251-278"
          },
          {
            title: "الفصل الحادي عشر: نحو نظام عالمي متعدد الأقطاب",
            pages: "279-306"
          },
          {
            title: "الفصل الثاني عشر: سيناريوهات مستقبلية",
            pages: "307-324"
          }
        ],
        category: "العلاقات الدولية"
      },
      {
        id: 2,
        title: "التحولات الديمقراطية في العالم العربي",
        author: "د. نورة الشمري",
        type: "دراسة بحثية",
        year: "2022",
        abstract: "تستعرض هذه الدراسة تجارب التحول الديمقراطي في المنطقة العربية، مع تحليل للعوامل المؤثرة والتحديات التي تواجهها، وآفاق المستقبل.",
        keywords: ["الديمقراطية", "التحول السياسي", "الإصلاح", "المشاركة السياسية"],
        coverImage: "https://images.unsplash.com/photo-1575320181282-9afab399332c?q=80&w=1470",
        publisher: "مركز دراسات الوحدة العربية",
        pages: 156,
        downloadLink: "#",
        readOnlineLink: "#",
        category: "النظم السياسية"
      },
      {
        id: 3,
        title: "الاقتصاد السياسي للنفط",
        author: "د. عبدالرحمن القحطاني",
        type: "كتاب",
        year: "2021",
        abstract: "يناقش هذا الكتاب العلاقة المتداخلة بين النفط والاقتصاد والسياسة، مع التركيز على تأثيرات النفط في العلاقات الدولية ومستقبل الطاقة العالمي.",
        keywords: ["النفط", "الاقتصاد السياسي", "الطاقة", "الجيوسياسية"],
        coverImage: "https://images.unsplash.com/photo-1582282735499-ee19cce20419?q=80&w=1548",
        publisher: "دار الفكر العربي",
        pages: 268,
        downloadLink: "#",
        readOnlineLink: "#",
        category: "الاقتصاد السياسي"
      }
    ];

    // Find the resource by ID
    const foundResource = mockResources.find(res => res.id === parseInt(id));
    
    if (foundResource) {
      setResource(foundResource);
      
      // Set related resources (same category but different ID)
      const related = mockResources
        .filter(res => res.category === foundResource.category && res.id !== foundResource.id)
        .slice(0, 2); // Get max 2 related resources
      setRelatedResources(related);
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

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">لم يتم العثور على المرجع</h2>
          <p className="text-gray-600 mb-6">عذرًا، المرجع الذي تبحث عنه غير موجود أو تم حذفه</p>
          <Link to="/library" className={buttonStyles.primary}>
            العودة إلى المكتبة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 space-x-reverse text-sm">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">الرئيسية</Link>
              </li>
              <li>
                <span className="mx-2 text-gray-400">/</span>
                <Link to="/library" className="text-gray-500 hover:text-gray-700">المكتبة</Link>
              </li>
              <li>
                <span className="mx-2 text-gray-400">/</span>
                <Link to="#" className="text-gray-500 hover:text-gray-700">{resource.category}</Link>
              </li>
              <li>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-700 font-medium" aria-current="page">{resource.title}</span>
              </li>
            </ol>
          </nav>

          {/* Main content */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <img 
                    src={resource.coverImage} 
                    alt={resource.title} 
                    className="w-full h-auto rounded-lg shadow-md" 
                  />
                </div>
                <div className="md:w-2/3">
                  <h1 className="text-3xl font-bold mb-4">{resource.title}</h1>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-gray-600 mb-1">المؤلف:</p>
                      <p className="font-medium">{resource.author}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">النوع:</p>
                      <p className="font-medium">{resource.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">سنة النشر:</p>
                      <p className="font-medium">{resource.year}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">الناشر:</p>
                      <p className="font-medium">{resource.publisher}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">عدد الصفحات:</p>
                      <p className="font-medium">{resource.pages}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">التصنيف:</p>
                      <p className="font-medium">{resource.category}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-8">
                    <a 
                      href={resource.downloadLink} 
                      className={`${buttonStyles.primary} inline-flex items-center`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      تحميل المرجع
                    </a>
                    <a 
                      href={resource.readOnlineLink} 
                      className={`${buttonStyles.outline} inline-flex items-center`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      قراءة أونلاين
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Abstract and keywords */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">نبذة عن المرجع</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {resource.abstract}
              </p>

              <h3 className="text-lg font-medium mb-3">الكلمات المفتاحية:</h3>
              <div className="flex flex-wrap gap-2">
                {resource.keywords.map((keyword, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Table of contents */}
            {resource.chapters && (
              <div className="p-8 border-b border-gray-200">
                <h2 className="text-2xl font-bold mb-6">محتويات المرجع</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <ul className="divide-y divide-gray-200">
                    {resource.chapters.map((chapter, index) => (
                      <li key={index} className="py-3 flex justify-between">
                        <span className="font-medium">{chapter.title}</span>
                        <span className="text-gray-600">صفحات: {chapter.pages}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Citation info */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">الاقتباس المرجعي</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-3">APA Format:</h3>
                <p className="text-gray-700 mb-4 bg-white p-4 rounded border border-gray-200">
                  {resource.author.split('. ')[1]}, {resource.author.split('. ')[0]}. ({resource.year}). <em>{resource.title}</em>. {resource.publisher}.
                </p>

                <h3 className="text-lg font-medium mb-3">MLA Format:</h3>
                <p className="text-gray-700 bg-white p-4 rounded border border-gray-200">
                  {resource.author}. <em>{resource.title}</em>. {resource.publisher}, {resource.year}.
                </p>
              </div>
            </div>
          </div>

          {/* Related resources */}
          {relatedResources.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">مراجع ذات صلة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedResources.map(related => (
                  <div 
                    key={related.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all flex"
                  >
                    <img 
                      src={related.coverImage} 
                      alt={related.title} 
                      className="w-24 h-32 object-cover" 
                    />
                    <div className="p-4 flex flex-col flex-1">
                      <h4 className="font-bold text-lg mb-2">{related.title}</h4>
                      <p className="text-gray-600 text-sm mb-1">{related.author}</p>
                      <p className="text-gray-500 text-sm">{related.type} · {related.year}</p>
                      <div className="mt-auto pt-2">
                        <Link 
                          to={`/resources/${related.id}`} 
                          className="text-primary-600 hover:text-primary-800 text-sm inline-flex items-center"
                        >
                          عرض المرجع
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back to library */}
          <div className="mt-8 text-center">
            <Link 
              to="/library" 
              className="inline-flex items-center text-primary-600 hover:text-primary-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              العودة إلى المكتبة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailsPage;