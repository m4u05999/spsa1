// src/pages/about/GraduatesPage.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const GraduatesPage = () => {
  const [selectedYear, setSelectedYear] = useState('all');

  const graduates = [
    {
      year: '2023',
      count: 45,
      achievements: [
        'حصول 15 خريج على منح دراسات عليا',
        'التحاق 20 خريج بوظائف حكومية',
        'إنشاء 5 مشاريع ريادية في مجال الاستشارات السياسية'
      ]
    },
    {
      year: '2022',
      count: 38,
      achievements: [
        'حصول 12 خريج على منح دراسات عليا',
        'التحاق 18 خريج بوظائف حكومية',
        'نشر 8 أبحاث علمية في مجلات محكمة'
      ]
    },
    {
      year: '2021',
      count: 42,
      achievements: [
        'حصول 18 خريج على منح دراسات عليا',
        'التحاق 22 خريج بوظائف حكومية',
        'تأسيس مركز للدراسات السياسية'
      ]
    }
  ];

  const notableAlumni = [
    {
      name: 'د. سارة بنت محمد الأحمد',
      position: 'مستشارة في وزارة الخارجية',
      achievement: 'حاصلة على دكتوراه من جامعة هارفارد في العلاقات الدولية',
      year: '2018'
    },
    {
      name: 'أ. خالد بن عبدالله الزهراني',
      position: 'محلل سياسي في مركز الملك فيصل للبحوث',
      achievement: 'خبير في الشؤون الإقليمية والسياسة الخارجية',
      year: '2019'
    },
    {
      name: 'د. نورا بنت أحمد العتيبي',
      position: 'أستاذة مساعدة في جامعة الملك سعود',
      achievement: 'متخصصة في السياسات العامة والحكم الرشيد',
      year: '2017'
    }
  ];

  const filteredGraduates = selectedYear === 'all' 
    ? graduates 
    : graduates.filter(grad => grad.year === selectedYear);

  return (
    <>
      <Helmet>
        <title>خريجو قسم العلوم السياسية - الجمعية السعودية للعلوم السياسية</title>
        <meta name="description" content="تعرف على خريجي قسم العلوم السياسية وإنجازاتهم المهنية والأكاديمية في مختلف المجالات." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              خريجو قسم العلوم السياسية
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نفخر بخريجينا الذين يساهمون في تطوير المجتمع السعودي في مختلف القطاعات
              الحكومية والأكاديمية والخاصة
            </p>
          </div>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">إجمالي الخريجين</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
              <div className="text-gray-600">معدل التوظيف</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">120+</div>
              <div className="text-gray-600">حاصلون على دراسات عليا</div>
            </div>
          </div>

          {/* Year Filter */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختر السنة:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white"
            >
              <option value="all">جميع السنوات</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
          </div>

          {/* Graduates by Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredGraduates.map((grad, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    دفعة {grad.year}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {grad.count} خريج
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">الإنجازات:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {grad.achievements.map((achievement, idx) => (
                      <li key={idx}>• {achievement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Notable Alumni */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              خريجون متميزون
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notableAlumni.map((alumni, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {alumni.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-2">
                      {alumni.position}
                    </p>
                    <span className="text-sm text-gray-500">
                      خريج {alumni.year}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {alumni.achievement}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Career Paths */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              المسارات المهنية للخريجين
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">القطاع الحكومي</h3>
                <p className="text-sm text-gray-600">45% من الخريجين</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">الأكاديمي</h3>
                <p className="text-sm text-gray-600">25% من الخريجين</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💼</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">القطاع الخاص</h3>
                <p className="text-sm text-gray-600">20% من الخريجين</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">ريادة الأعمال</h3>
                <p className="text-sm text-gray-600">10% من الخريجين</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GraduatesPage;
