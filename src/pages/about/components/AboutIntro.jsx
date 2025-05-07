// src/pages/about/components/AboutIntro.jsx
import React from 'react';

const AboutIntro = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">نبذة عن الجمعية</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <p className="text-gray-700 leading-relaxed mb-4">
            تأسست جمعية العلوم السياسية في المملكة العربية السعودية عام 2020م، كمؤسسة علمية مهنية غير ربحية، تهدف إلى تطوير وتعزيز مجال العلوم السياسية في المملكة والعالم العربي.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            تضم الجمعية نخبة من الأكاديميين والباحثين والممارسين في مجال العلوم السياسية والعلاقات الدولية، وتعمل على تحقيق التكامل بين الجانب الأكاديمي والممارسة العملية.
          </p>
          <p className="text-gray-700 leading-relaxed">
            تسعى الجمعية إلى تقديم إسهامات علمية ومهنية في مجال تخصصها، من خلال تنظيم المؤتمرات والندوات وورش العمل، وإصدار المجلات العلمية المحكمة، وتقديم الاستشارات للجهات المختلفة.
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