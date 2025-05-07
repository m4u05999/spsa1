// src/components/PartnersSection.jsx
import React from 'react';

const PartnersSection = () => {
  const partners = [
    {
      id: 1,
      name: "جامعة الملك سعود",
      role: "شريك أكاديمي"
    },
    {
      id: 2,
      name: "مركز الدراسات الاستراتيجية",
      role: "شريك بحثي"
    },
    {
      id: 3,
      name: "معهد الدبلوماسية",
      role: "شريك معرفي"
    },
    {
      id: 4,
      name: "مؤسسة الفكر العربي",
      role: "شريك ثقافي"
    },
    {
      id: 5,
      name: "المنظمة العربية للعلوم السياسية",
      role: "شريك عربي"
    },
    {
      id: 6,
      name: "مركز دراسات الشرق الأوسط",
      role: "شريك إقليمي"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-blue-800">شركاؤنا</h2>
        <p className="text-center mb-12 text-gray-600 max-w-3xl mx-auto">
          تفتخر جمعية العلوم السياسية بتعاونها مع مجموعة من المؤسسات الأكاديمية والبحثية الرائدة محلياً وإقليمياً ودولياً
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          {partners.map(partner => (
            <div 
              key={partner.id} 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center h-40"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-700 font-bold text-xl">{partner.name.charAt(0)}</span>
              </div>
              <h3 className="font-bold text-gray-800">{partner.name}</h3>
              <p className="text-sm text-gray-500">{partner.role}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="bg-white text-blue-700 border border-blue-700 px-6 py-2 rounded-md hover:bg-blue-50 transition-colors">
            كافة الشراكات والتعاون
          </button>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;