import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageComponent from '../../components/ImageComponent';

const LibraryPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  
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
        downloadCount: 209,
        author: "د. فاطمة الزهراني",
        publishDate: "2022",
        pages: 182,
        fileType: "PDF"
      },
      {
        id: 6,
        title: "دور وسائل التواصل الاجتماعي في الثورات العربية",
        description: "تحليل تأثير وسائل التواصل الاجتماعي على الحركات الاحتجاجية والتغيير السياسي في العالم العربي",
        image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1374",
        type: "تقرير",
        fileSize: "4.3 MB",
        category: "الإعلام السياسي",
        downloadCount: 258,
        author: "د. خالد المنصور",
        publishDate: "2023",
        pages: 95,
        fileType: "PDF"
      },
      {
        id: 7,
        title: "الأمن الإقليمي في الخليج العربي: التحديات والفرص",
        description: "دراسة استراتيجية شاملة للتحديات الأمنية في منطقة الخليج العربي وآفاق التعاون الأمني الإقليمي",
        image: "https://images.unsplash.com/photo-1566838318639-b7e8ef9f4400?q=80&w=1470",
        type: "كتاب",
        fileSize: "7.5 MB",
        category: "الدراسات الإقليمية",
        downloadCount: 193,
        author: "د. سلطان القحطاني",
        publishDate: "2022",
        pages: 268,
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
      },
      {
        id: 9,
        title: "الثقافة السياسية",
        description: "تعريف الثقافة السياسية ومفهومها باعتبارها النمط العام لتوجهات الأفراد في المجتمع نحو الموضوعات السياسية",
        image: "/assets/images/social-posts/1.jpeg",
        type: "انفوجرافيك",
        fileSize: "1.2 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 152,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 10,
        title: "توحيد المملكة العربية السعودية",
        description: "نبذة تاريخية عن توحيد المملكة العربية السعودية على يد الملك عبدالعزيز واليوم الوطني السعودي",
        image: "/assets/images/social-posts/2.jpeg",
        type: "انفوجرافيك",
        fileSize: "1.5 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 187,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 11,
        title: "مبادئ العلاقات الدولية",
        description: "شرح مبسط لأهم مبادئ العلاقات الدولية والنظريات المؤثرة فيها",
        image: "/assets/images/social-posts/3.jpeg",
        type: "انفوجرافيك",
        fileSize: "1.8 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 135,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 12,
        title: "النظام السياسي السعودي",
        description: "نظرة عامة على النظام السياسي في المملكة العربية السعودية ومؤسساته",
        image: "/assets/images/social-posts/4.jpeg",
        type: "انفوجرافيك",
        fileSize: "2.1 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 198,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 13,
        title: "السياسة الخارجية السعودية",
        description: "أهم مبادئ وأسس السياسة الخارجية للمملكة العربية السعودية",
        image: "/assets/images/social-posts/5.jpeg",
        type: "انفوجرافيك",
        fileSize: "1.7 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 165,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 14,
        title: "المنظمات الدولية وعضوية المملكة",
        description: "المنظمات الدولية التي تشارك فيها المملكة العربية السعودية ودورها",
        image: "/assets/images/social-posts/6.jpeg",
        type: "انفوجرافيك",
        fileSize: "1.8 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 142,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 15,
        title: "أسس العلاقات الدبلوماسية",
        description: "شرح لأهم المبادئ والمفاهيم في العلاقات الدبلوماسية بين الدول",
        image: "/assets/images/social-posts/7.jpeg",
        type: "انفوجرافيك",
        fileSize: "1.9 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 178,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 16,
        title: "مجلس التعاون الخليجي",
        description: "لمحة عن مجلس التعاون لدول الخليج العربية وإنجازاته وتحدياته",
        image: "/assets/images/social-posts/8.jpeg",
        type: "انفوجرافيك",
        fileSize: "2.0 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 190,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 17,
        title: "المشاركة السياسية للمرأة",
        description: "تطور المشاركة السياسية للمرأة في المملكة العربية السعودية",
        image: "/assets/images/social-posts/9.jpeg",
        type: "انفوجرافيك",
        fileSize: "1.6 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 210,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 18,
        title: "الأمن السيبراني",
        description: "مفاهيم أساسية في الأمن السيبراني وأهميته للأمن القومي",
        image: "/assets/images/social-posts/10.jpeg",
        type: "انفوجرافيك",
        fileSize: "1.7 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 175,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 19,
        title: "الحرب الإلكترونية",
        description: "أساليب وأدوات الحرب الإلكترونية وتأثيرها على العلاقات الدولية",
        image: "/assets/images/social-posts/11.jpeg",
        type: "انفوجرافيك",
        fileSize: "1.8 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 160,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 20,
        title: "الدبلوماسية الرقمية",
        description: "مفهوم الدبلوماسية الرقمية وتطبيقاتها في العصر الحديث",
        image: "/assets/images/social-posts/12.jpeg",
        type: "انفوجرافيك",
        fileSize: "1.9 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 145,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 21,
        title: "المنظمات غير الحكومية",
        description: "دور المنظمات غير الحكومية في السياسة الدولية وتأثيرها",
        image: "/assets/images/social-posts/13.jpeg",
        type: "انفوجرافيك",
        fileSize: "2.0 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 130,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 22,
        title: "التحولات الجيوسياسية",
        description: "أهم التحولات الجيوسياسية في منطقة الشرق الأوسط وتأثيراتها",
        image: "/assets/images/social-posts/14.jpeg",
        type: "انفوجرافيك",
        fileSize: "1.7 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 155,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 23,
        title: "الاقتصاد السياسي الدولي",
        description: "مفاهيم أساسية في الاقتصاد السياسي الدولي والعلاقات الاقتصادية بين الدول",
        image: "/assets/images/social-posts/15.jpeg",
        type: "انفوجرافيك",
        fileSize: "1.8 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 140,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      },
      {
        id: 24,
        title: "نظريات العلاقات الدولية",
        description: "أهم نظريات العلاقات الدولية وتطبيقاتها في تحليل السياسة الدولية",
        image: "/assets/images/social-posts/16.jpeg",
        type: "انفوجرافيك",
        fileSize: "1.9 MB",
        category: "انفوجرافيك تعليمي",
        downloadCount: 165,
        author: "الجمعية السعودية للعلوم السياسية",
        publishDate: "2025",
        pages: 1,
        fileType: "JPEG"
      }
    ];

    setResources(mockResources);
    setFilteredResources(mockResources);
  }, []);

  useEffect(() => {
    filterResources(activeCategory, searchQuery);
  }, [activeCategory, searchQuery, resources]);

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
    { id: 'انفوجرافيك تعليمي', name: 'انفوجرافيك تعليمي' },
  ];

  // Function to get infographics from filtered resources
  const getFilteredInfographics = () => {
    return filteredResources.filter(resource => resource.type === 'انفوجرافيك');
  };

  // Function to get non-infographics from filtered resources
  const getFilteredNonInfographics = () => {
    return filteredResources.filter(resource => resource.type !== 'انفوجرافيك');
  };

  // Function to open image in a new tab
  const openInNewTab = (url) => {
    window.open(url, '_blank');
  };
  
  // التحقق من صحة البريد الإلكتروني
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // معالج الاشتراك في النشرة البريدية
  const handleSubscribe = (e) => {
    e.preventDefault();
    
    // التحقق من صحة البريد الإلكتروني
    if (!email.trim()) {
      setEmailError('يرجى إدخال بريدك الإلكتروني');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    
    // بدء عملية الاشتراك
    setIsSubscribing(true);
    
    // محاكاة الاتصال بالخادم (سيتم استبدالها بطلب API حقيقي عند ربط الواجهة الخلفية)
    setTimeout(() => {
      console.log('تم الاشتراك بالبريد الإلكتروني في المكتبة:', email);
      setIsSubscribing(false);
      setSubscribeSuccess(true);
      setEmail('');
      
      // إعادة تعيين رسالة النجاح بعد 5 ثوانٍ
      setTimeout(() => {
        setSubscribeSuccess(false);
      }, 5000);
    }, 1500);
  };

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

        {/* Resources Display */}
        {filteredResources.length > 0 ? (
          <div>
            {/* Display Infographics in a gallery view (if any exist in the filtered results) */}
            {getFilteredInfographics().length > 0 && (
              <div className="mb-12">
                {/* Only show the section title if we're not exclusively viewing infographics */}
                {activeCategory !== 'انفوجرافيك تعليمي' && (
                  <h2 className="text-2xl font-bold mb-6 text-center">المنشورات التعليمية</h2>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {getFilteredInfographics().map(infographic => (
                    <div 
                      key={infographic.id}
                      className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => openInNewTab(infographic.image)}
                    >
                      {/* Image */}
                      <ImageComponent 
                        src={infographic.image} 
                        alt={infographic.title}
                        className="w-full aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <div className="bg-white rounded-full p-2 transform scale-0 group-hover:scale-100 transition-all duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Display other resources with full details */}
            {getFilteredNonInfographics().length > 0 && (
              <div>
                {/* Only show the section title if we're displaying both types */}
                {getFilteredInfographics().length > 0 && activeCategory === 'all' && (
                  <h2 className="text-2xl font-bold mb-6 text-center">الكتب والدراسات والتقارير</h2>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {getFilteredNonInfographics().map(resource => (
                    <div 
                      key={resource.id} 
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="relative">
                        <ImageComponent 
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
              </div>
            )}
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
              <div className="text-4xl font-bold text-primary-600 mb-2">75+</div>
              <div className="text-gray-600">باحث مساهم</div>
            </div>
          </div>
        </div>
        
        {/* قسم النشرة البريدية */}
        <div className="mt-16 bg-primary-50 p-8 rounded-xl shadow-sm">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">اشترك في نشرة المكتبة</h3>
            <p className="text-gray-600 mb-6">
              احصل على أحدث الإضافات والموارد التعليمية في مجال العلوم السياسية مباشرة إلى بريدك الإلكتروني
            </p>

            {subscribeSuccess ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p>تم تسجيل اشتراكك بنجاح! شكرًا لك.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="w-full">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      placeholder="أدخل بريدك الإلكتروني"
                      className={`w-full px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-500 ${emailError ? 'border-red-500' : ''}`}
                      disabled={isSubscribing}
                    />
                    {emailError && (
                      <p className="mt-1 text-red-500 text-sm text-right">{emailError}</p>
                    )}
                  </div>
                  <button 
                    type="submit" 
                    className={`px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors ${isSubscribing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isSubscribing}
                  >
                    {isSubscribing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        جاري الاشتراك...
                      </span>
                    ) : 'اشتراك'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
