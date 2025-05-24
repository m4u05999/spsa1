// src/pages/about/components/AboutIntro.jsx
import React from 'react';

const AboutIntro = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">نبذة عن الجمعية</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <p className="text-gray-700 leading-relaxed mb-4">
            تأسست الجمعية السعودية للعلوم السياسية SPSA عام 1984، وتعد هي المنظمة الوحيدة الرائدة في دراسة العلوم السياسية. وتبذل في سبيل ذلك كل الجهود الممكنة للإسهام في تطوير هذا الحقل العلمي عبر البرامج الأكاديمية، والمؤتمرات العلمية، والأوراق البحثية، والدورات التدريبية. كما ينظر للجمعية بوصفها ملتقى معرفي لكل المهتمين والمهتمات بهذا التخصص الأكاديمي من كل أنحاء العالم، بهدف تعميق الحوار، وتبادل الأفكار، ومناقشة أخر المستجدات والقضايا الحديثة التي طرأت على تخصصات العلوم السياسية.
          </p>
          <p className="text-gray-700 leading-relaxed">
            وفي هذا الصدد، تشجع الجمعية بناء منظومة عمل حيوية ترتكز في مداولاتها وحواراتها على تنوع الأفكار، والنظريات، والمنهجيات، والمخرجات العلمية المختلفة. وانطلاقاً من هذا الهدف الاستراتيجي، تنشر الجمعية بكل شفافية عن المعلومات المرتبطة بندواتها، ومؤتمراتها، وحلقاتها النقاشية، وأوراقها البحثية، ولقاءاتها الدورية، لتسهيل التعاون بين أعضاء الجمعية، وتشجيع التفاعل الدائم بينهم للنهوض بالجمعية نحو آفاق الريادة المعرفية المستمرة. وستسخر كل الإمكانيات والموارد المتاحة لتحسين بيئة العمل لتعزيز مهارات علماء السياسة على تطوير مهاراتهم البحثية، وتحسين مخرجات استدلالاتهم الفكرية بما يتوافق مع متطلبات النزاهة والأمانة العلمية، وينسجم مع معايير وشروط البحث العلمي.
          </p>
        </div>
        <div className="flex-1">
          <img 
            src="/assets/images/association-building.jpg" 
            alt="مقر الجمعية" 
            className="rounded-lg shadow-md w-full h-auto"
          />
          <div className="mt-4 bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">إحصائيات الجمعية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <span className="block text-2xl font-bold text-blue-600">500+</span>
                <span className="text-gray-600">عضو</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-blue-600">50+</span>
                <span className="text-gray-600">دراسة منشورة</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-blue-600">30+</span>
                <span className="text-gray-600">فعالية سنوية</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-blue-600">10+</span>
                <span className="text-gray-600">شراكات دولية</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutIntro;