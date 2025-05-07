// src/pages/publications/PublicationsPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PublicationsPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  const publications = [
    {
      id: 1,
      title: 'مجلة العلوم السياسية - العدد الرابع والعشرون',
      type: 'دورية',
      category: 'journal',
      date: '2023-12-01',
      description: 'مجلة علمية محكمة تصدر كل ثلاثة أشهر تتضمن أبحاث في العلاقات الدولية والنظم السياسية',
      image: '/assets/images/journal.png',
      featured: true
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
    },
    {
      id: 4,
      title: 'التحولات الجيوسياسية في القرن الحادي والعشرين',
      type: 'كتاب',
      category: 'book',
      date: '2023-06-20',
      description: 'دراسة شاملة للتغيرات في موازين القوى العالمية وظهور أقطاب جديدة في النظام الدولي',
      image: '/assets/images/books.png'
    },
    {
      id: 5,
      title: 'تقرير الحالة السياسية في الشرق الأوسط - الربع الثالث 2023',
      type: 'تقرير',
      category: 'report',
      date: '2023-11-01',
      description: 'تحليل موسع للأوضاع السياسية في منطقة الشرق الأوسط وتأثيرها على الاستقرار الإقليمي',
      image: '/assets/images/reports.png',
      featured: true
    },
    {
      id: 6,
      title: 'تقرير العلاقات الدولية - الاتجاهات المستقبلية',
      type: 'تقرير',
      category: 'report',
      date: '2023-08-15',
      description: 'رصد وتحليل لأهم التوجهات في العلاقات الدولية والتنبؤ بمساراتها المستقبلية',
      image: '/assets/images/reports.png'
    },
    {
      id: 7,
      title: 'نشرة الأخبار السياسية - نوفمبر 2023',
      type: 'نشرة',
      category: 'newsletter',
      date: '2023-11-30',
      description: 'نشرة شهرية تلخص أهم الأحداث السياسية والتطورات في مجال العلوم السياسية والعلاقات الدولية',
      image: '/assets/images/newsletter.png'
    },
    {
      id: 8,
      title: 'كتاب أوراق المؤتمر السنوي للعلوم السياسية 2023',
      type: 'أوراق مؤتمر',
      category: 'proceedings',
      date: '2023-07-10',
      description: 'مجموعة الأوراق البحثية المقدمة في المؤتمر السنوي للجمعية للعام 2023',
      image: '/assets/images/conference.png'
    },
  ];

  const filteredPublications = activeTab === 'all' ? 
    publications : 
    publications.filter(pub => pub.category === activeTab);

  const featuredPublications = publications.filter(pub => pub.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* قسم العنوان */}
      <section className="relative py-16 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">مطبوعات الجمعية</h1>
            <p className="text-xl text-blue-100 mb-6">
              مجموعة متنوعة من الإصدارات العلمية والتقارير والدوريات المتخصصة في مجال العلوم السياسية
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#f8fafc" fillOpacity="1" d="M0,160L48,165.3C96,171,192,181,288,165.3C384,149,480,107,576,90.7C672,75,768,85,864,112C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* إصدارات مميزة */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8">إصدارات مميزة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPublications.map((pub) => (
                <div key={pub.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                  <div className="relative">
                    <img
                      src={pub.image}
                      alt={pub.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-sm py-1 px-3">
                      إصدار مميز
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                        {pub.type}
                      </span>
                      <span className="text-sm text-gray-500">{pub.date}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{pub.title}</h3>
                    <p className="text-gray-600 mb-4">{pub.description}</p>
                    <Link to={`/publications/${pub.id}`} className="block text-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      تصفح المحتوى
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* تصنيف المطبوعات */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">جميع المطبوعات</h2>
            
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                className={`px-4 py-2 rounded-md transition ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => setActiveTab('all')}
              >
                جميع المطبوعات
              </button>
              <button
                className={`px-4 py-2 rounded-md transition ${activeTab === 'journal' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => setActiveTab('journal')}
              >
                المجلة العلمية
              </button>
              <button
                className={`px-4 py-2 rounded-md transition ${activeTab === 'book' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => setActiveTab('book')}
              >
                الكتب
              </button>
              <button
                className={`px-4 py-2 rounded-md transition ${activeTab === 'report' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => setActiveTab('report')}
              >
                التقارير
              </button>
              <button
                className={`px-4 py-2 rounded-md transition ${activeTab === 'newsletter' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => setActiveTab('newsletter')}
              >
                النشرات
              </button>
              <button
                className={`px-4 py-2 rounded-md transition ${activeTab === 'proceedings' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => setActiveTab('proceedings')}
              >
                أوراق المؤتمرات
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublications.map((pub) => (
                <div key={pub.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                  <img
                    src={pub.image}
                    alt={pub.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                        {pub.type}
                      </span>
                      <span className="text-sm text-gray-500">{pub.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{pub.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{pub.description}</p>
                    <Link to={`/publications/${pub.id}`} className="block text-center w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                      تصفح المحتوى
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* النشرة الإخبارية */}
          <div className="mt-16 bg-blue-50 p-8 rounded-lg">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">اشترك في النشرة البريدية</h3>
              <p className="text-gray-600 mb-6">
                احصل على آخر الإصدارات والمستجدات في مجال العلوم السياسية مباشرة إلى بريدك الإلكتروني
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  className="flex-1 px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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

export default PublicationsPage;