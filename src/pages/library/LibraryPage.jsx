import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LibraryPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Button styles
  const buttonStyles = {
    primary: "bg-primary-600 text-white rounded-md px-4 py-2 hover:bg-primary-700 transition-colors",
    outline: "border border-primary-600 text-primary-600 rounded-md px-4 py-2 hover:bg-primary-50 transition-colors",
  };
  
  useEffect(() => {
    // Mock data - in a real application, this would be fetched from an API
    const mockResources = [
      {
        id: 1,
        title: "التحولات في النظام الدولي بعد الحرب الباردة",
        description: "تحليل شامل للتغيرات الهيكلية في النظام الدولي وتأثيرها على العلاقات بين الدول",
        image: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=1760",
        type: "كتاب",
        fileSize: "8.2 MB",
        category: "العلاقات الدولية",
        downloadCount: 243,
        author: "د. محمد العامري",
        publishDate: "2023",
        pages: 320,
        fileType: "PDF"
      },
      {
        id: 2,
        title: "المشاركة السياسية للمرأة في الخليج العربي",
        description: "دراسة تحليلية لواقع المشاركة السياسية للمرأة في دول الخليج العربي والتحديات والفرص",
        image: "https://images.unsplash.com/photo-1585184394271-4c0a47dc59c9?q=80&w=1471",
        type: "دراسة",
        fileSize: "4.7 MB",
        category: "الدراسات الإقليمية",
        downloadCount: 187,
        author: "د. نورة الكعبي",
        publishDate: "2022",
        pages: 156,
        fileType: "PDF"
      },
      {
        id: 3,
        title: "الأمن السيبراني والعلاقات الدولية",
        description: "تحليل العلاقة بين الأمن السيبراني والسياسة الدولية وتأثيرها على الأمن القومي",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1470",
        type: "تقرير",
        fileSize: "3.5 MB",
        category: "الأمن الإستراتيجي",
        downloadCount: 312,
        author: "مركز الدراسات الاستراتيجية",
        publishDate: "2023",
        pages: 78,
        fileType: "PDF"
      },
      {
        id: 4,
        title: "نظرية الاعتماد المتبادل في العلاقات الدولية",
        description: "مراجعة نقدية لنظرية الاعتماد المتبادل وتطبيقاتها على العلاقات بين الدول",
        image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=1373",
        type: "كتاب",
        fileSize: "6.8 MB",
        category: "النظرية السياسية",
        downloadCount: 176,
        author: "د. أحمد الشمري",
        publishDate: "2021",
        pages: 245,
        fileType: "PDF"
      },
      {
        id: 5,
        title: "الإصلاح السياسي والتنمية المستدامة",
        description: "دراسة تحليلية للعلاقة بين الإصلاح السياسي والتنمية المستدامة في الشرق الأوسط",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1470",
        type: "دراسة",
        fileSize: "5.1 MB",
        category: "السياسات العامة",
        downloadCount: 208,
        author: "د. فاطمة الهاشمي",
        publishDate: "2023",
        pages: 184,
        fileType: "PDF"
      },
      {
        id: 6,
        title: "تأثير وسائل الإعلام الاجتماعي على الرأي العام",
        description: "تحليل دور وسائل الإعلام الاجتماعي في تشكيل الرأي العام وتأثيره على صناعة القرار",
        image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1374",
        type: "بحث",
        fileSize: "4.3 MB",
        category: "الإعلام السياسي",
        downloadCount: 265,
        author: "د. خالد المنصوري",
        publishDate: "2022",
        pages: 142,
        fileType: "PDF"
      },
      {
        id: 7,
        title: "الخريطة السياسية للشرق الأوسط",
        description: "تحليل جيوسياسي للمتغيرات في الشرق الأوسط وتأثيرها على المصالح الإقليمية والدولية",
        image: "https://images.unsplash.com/photo-1566847438217-76e82d383f84?q=80&w=1374",
        type: "خريطة",
        fileSize: "15.2 MB",
        category: "الدراسات الإقليمية",
        downloadCount: 198,
        author: "مركز الدراسات الجيوسياسية",
        publishDate: "2023",
        pages: null,
        fileType: "PDF"
      },
      {
        id: 8,
        title: "محاضرات في الفكر السياسي الإسلامي",
        description: "سلسلة محاضرات تتناول تطور الفكر السياسي الإسلامي وتأثيره على النظم السياسية المعاصرة",
        image: "https://images.unsplash.com/photo-1592951422805-d477de31e865?q=80&w=1472",
        type: "محاضرات",
        fileSize: "120 MB",
        category: "النظرية السياسية",
        downloadCount: 321,
        author: "د. عبدالله الأنصاري",
        publishDate: "2021",
        pages: null,
        fileType: "MP4"
      }
    ];

    setResources(mockResources);
    setFilteredResources(mockResources);
  }, []);

  useEffect(() => {
    filterResources(activeCategory, searchQuery);
  }, [activeCategory, searchQuery]);

  const filterResources = (category, query) => {
    let filtered = [...resources];
    
    if (category !== 'all') {
      filtered = filtered.filter(resource => resource.category === category);
    }
    
    if (query) {
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(query.toLowerCase()) || 
        resource.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    setFilteredResources(filtered);
  };

  const categories = [
    { id: 'all', name: 'جميع الموارد' },
    { id: 'العلاقات الدولية', name: 'العلاقات الدولية' },
    { id: 'الدراسات الإقليمية', name: 'الدراسات الإقليمية' },
    { id: 'النظرية السياسية', name: 'النظرية السياسية' },
    { id: 'السياسات العامة', name: 'السياسات العامة' },
    { id: 'الأمن الإستراتيجي', name: 'الأمن الإستراتيجي' },
    { id: 'الإعلام السياسي', name: 'الإعلام السياسي' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">المكتبة التفاعلية</h1>
            <p className="text-lg mb-8">
              مجموعة متنوعة من المصادر والموارد العلمية المتخصصة في مجال العلوم السياسية والعلاقات الدولية
            </p>

            {/* Search bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="ابحث في المكتبة..."
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

      {/* Library Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeCategory === category.id 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white border border-gray-300 hover:bg-gray-100'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredResources.map(resource => (
              <div 
                key={resource.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative">
                  <img 
                    src={resource.image} 
                    alt={resource.title} 
                    className="w-full h-40 object-cover"
                  />
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
        ) : (
          <div className="text-center py-16">
            <div className="text-4xl text-gray-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-400">لم يتم العثور على نتائج</h3>
            <p className="text-gray-500 mt-2">حاول استخدام كلمات بحث مختلفة أو تصفية أخرى</p>
          </div>
        )}
        
        {/* Resource statistics */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-md">
          <h3 className="text-2xl font-bold mb-6 text-center">إحصائيات المكتبة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">{resources.length}</div>
              <div className="text-gray-600">مورد متاح</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">24+</div>
              <div className="text-gray-600">مجال بحثي</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">4500+</div>
              <div className="text-gray-600">تحميل شهريًا</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">150+</div>
              <div className="text-gray-600">باحث مساهم</div>
            </div>
          </div>
        </div>

        {/* Become a contributor */}
        <div className="mt-12 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-primary-800 mb-2">هل ترغب في المساهمة؟</h3>
              <p className="text-primary-700">
                يمكنك المشاركة في إثراء المكتبة من خلال مساهماتك البحثية والعلمية
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/membership">
                <button className={buttonStyles.primary}>انضم إلى الرابطة</button>
              </Link>
              <Link to="/contact">
                <button className={buttonStyles.outline}>تواصل معنا</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;