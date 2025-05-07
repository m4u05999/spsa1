// src/components/AboutSection.jsx
import React from 'react';

const AboutSection = () => {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-800">من نحن</h2>
        
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-blue-700">نبذة تعريفية عن الجمعية</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              تعد الجمعية السعودية للعلوم السياسية منظمة علمية رائدة تهدف إلى تطوير وتعزيز مجال العلوم السياسية من خلال البحث العلمي والدراسات المتخصصة والفعاليات الأكاديمية. تأسست الجمعية عام 2005 وتضم نخبة من الأكاديميين والباحثين والمتخصصين في مجال العلوم السياسية والعلاقات الدولية.
            </p>
            <p className="text-gray-700 leading-relaxed">
              تعمل الجمعية على توفير منصة للحوار العلمي وتبادل الخبرات والمعارف بين المهتمين والمتخصصين في المجال، كما تسعى إلى المساهمة في صناعة القرار من خلال تقديم الاستشارات والدراسات للجهات المعنية.
            </p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg shadow-md">
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3 text-blue-700">رؤيتنا</h3>
              <p className="text-gray-700">
                أن تكون الجمعية السعودية للعلوم السياسية مرجعاً علمياً موثوقاً وشريكاً فاعلاً في تطوير الفكر السياسي والممارسات السياسية على المستويين المحلي والدولي.
              </p>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3 text-blue-700">رسالتنا</h3>
              <p className="text-gray-700">
                توفير بيئة علمية محفزة للبحث والإبداع في مجال العلوم السياسية والعلاقات الدولية، وتقديم معرفة علمية رصينة تسهم في فهم وتحليل القضايا السياسية المعاصرة.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3 text-blue-700">أهدافنا</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 pr-4">
                <li>تشجيع البحث العلمي في مجال العلوم السياسية والعلاقات الدولية</li>
                <li>تنظيم المؤتمرات والندوات وورش العمل المتخصصة</li>
                <li>نشر الوعي السياسي وثقافة المشاركة المجتمعية</li>
                <li>توفير منصة للتواصل بين الباحثين والأكاديميين والممارسين</li>
                <li>تقديم الاستشارات والدراسات للجهات المعنية</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-semibold mb-6 text-center text-blue-700">كلمة رئيس مجلس الإدارة</h3>
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-32 h-32 rounded-full bg-gray-300 mb-4 md:mb-0 md:ml-6 flex-shrink-0"></div>
            <div className="text-gray-700">
              <h4 className="font-bold mb-2 text-lg">د. أحمد العبدالله</h4>
              <p className="italic mb-4">رئيس مجلس إدارة الجمعية السعودية للعلوم السياسية</p>
              <p className="leading-relaxed">
                أرحب بكم في الموقع الإلكتروني للجمعية السعودية للعلوم السياسية، هذه المنصة العلمية التي نسعى من خلالها إلى بناء جسور التواصل مع المهتمين والباحثين في مجال العلوم السياسية والعلاقات الدولية. نحن في الجمعية نعمل على تطوير البحث العلمي والمعرفة السياسية من خلال برامجنا ومبادراتنا المختلفة التي تهدف إلى مواكبة المتغيرات المتسارعة في البيئة السياسية المحلية والإقليمية والدولية.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;