// src/pages/about/BoardPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

const BoardPage = () => {
  const boardMembers = [
    {
      name: 'د. محمد بن عبدالله الأحمد',
      position: 'رئيس مجلس الإدارة',
      bio: 'أستاذ العلوم السياسية بجامعة الملك سعود، متخصص في العلاقات الدولية والسياسة الخارجية السعودية.',
      image: '/assets/images/board/chairman.jpg'
    },
    {
      name: 'د. فاطمة بنت سعد الغامدي',
      position: 'نائب رئيس مجلس الإدارة',
      bio: 'أستاذة مشاركة في العلوم السياسية، متخصصة في السياسات العامة والحكم الرشيد.',
      image: '/assets/images/board/vice-chairman.jpg'
    },
    {
      name: 'د. أحمد بن علي الزهراني',
      position: 'أمين الصندوق',
      bio: 'أستاذ مساعد في العلوم السياسية، متخصص في الاقتصاد السياسي والتنمية.',
      image: '/assets/images/board/treasurer.jpg'
    },
    {
      name: 'د. نورا بنت خالد العتيبي',
      position: 'الأمين العام',
      bio: 'أستاذة مساعدة في العلوم السياسية، متخصصة في الفكر السياسي والنظريات السياسية.',
      image: '/assets/images/board/secretary.jpg'
    }
  ];

  return (
    <>
      <Helmet>
        <title>مجلس الإدارة - الجمعية السعودية للعلوم السياسية</title>
        <meta name="description" content="تعرف على أعضاء مجلس إدارة الجمعية السعودية للعلوم السياسية وخبراتهم الأكاديمية والمهنية." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              مجلس الإدارة
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              يضم مجلس إدارة الجمعية نخبة من الأكاديميين والخبراء في مجال العلوم السياسية
              الذين يعملون على تحقيق أهداف الجمعية ورؤيتها المستقبلية
            </p>
          </div>

          {/* Board Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {boardMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {member.name.split(' ')[1]?.charAt(0) || member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {member.name}
                      </h3>
                      <p className="text-blue-600 font-medium">
                        {member.position}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              مهام مجلس الإدارة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  المهام الإستراتيجية
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• وضع الخطط الإستراتيجية للجمعية</li>
                  <li>• الإشراف على تنفيذ البرامج والأنشطة</li>
                  <li>• تطوير الشراكات الأكاديمية والمهنية</li>
                  <li>• مراجعة وتقييم الأداء المؤسسي</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  المهام التنفيذية
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• إدارة الموارد المالية والبشرية</li>
                  <li>• اتخاذ القرارات المؤسسية المهمة</li>
                  <li>• تمثيل الجمعية في المحافل العلمية</li>
                  <li>• ضمان جودة الخدمات المقدمة للأعضاء</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BoardPage;
