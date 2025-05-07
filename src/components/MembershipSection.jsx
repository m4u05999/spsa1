// src/components/MembershipSection.jsx
import React from 'react';

const MembershipSection = () => {
  const membershipTypes = [
    {
      id: 1,
      title: "عضوية عاملة",
      icon: "👨‍🎓",
      features: [
        "مشاركة كاملة في أنشطة الجمعية",
        "حق التصويت في اجتماعات الجمعية العمومية",
        "الحصول على المطبوعات والإصدارات العلمية",
        "خصومات على البرامج التدريبية والورش",
        "الانضمام إلى اللجان المتخصصة"
      ],
      target: "للأكاديميين والباحثين في مجال العلوم السياسية"
    },
    {
      id: 2,
      title: "عضوية منتسبة",
      icon: "📚",
      features: [
        "مشاركة في أنشطة الجمعية المفتوحة",
        "الحصول على المطبوعات والإصدارات العلمية",
        "خصومات على البرامج التدريبية والورش",
        "فرص التشبيك المهني"
      ],
      target: "للمهتمين من غير المتخصصين"
    },
    {
      id: 3,
      title: "عضوية طلابية",
      icon: "🎓",
      features: [
        "المشاركة في الأنشطة الطلابية",
        "الإرشاد الأكاديمي والمهني",
        "خصومات على البرامج التدريبية والورش",
        "فرص التطوع والمشاركة في الفعاليات"
      ],
      target: "لطلاب العلوم السياسية والعلاقات الدولية"
    }
  ];

  return (
    <section id="memberships" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-blue-800">عضويات الجمعية</h2>
        <p className="text-center mb-12 text-gray-600 max-w-3xl mx-auto">
          انضم إلى شبكة واسعة من الباحثين والمتخصصين في مجال العلوم السياسية واستفد من الموارد والفرص المتاحة لتطوير معارفك ومهاراتك
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {membershipTypes.map(membership => (
            <div
              key={membership.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="bg-blue-700 text-white p-4 text-center">
                <div className="text-4xl mb-2">{membership.icon}</div>
                <h3 className="text-xl font-bold">{membership.title}</h3>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-6 text-center">{membership.target}</p>
                
                <ul className="space-y-3 mb-8">
                  {membership.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 ml-2 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-center">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    طلب العضوية
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;