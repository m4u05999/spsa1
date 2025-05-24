// src/pages/about/components/VisionMission.jsx
import React from 'react';

const VisionMission = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">الرؤية والرسالة والأهداف</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">رؤيتنا</h3>
          <p className="text-gray-700 leading-relaxed">
            أن نكون المرجع الأكاديمي والمهني الرائد في مجال العلوم السياسية والعلاقات الدولية في المملكة العربية السعودية والعالم العربي.
          </p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-green-800">رسالتنا</h3>
          <p className="text-gray-700 leading-relaxed">
            تطوير وتعزيز البحث العلمي في مجال العلوم السياسية، وبناء جسور التواصل بين الأكاديميين والممارسين، وتقديم الاستشارات المهنية للجهات المختصة.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-6 text-center bg-blue-800 text-white py-3 rounded-lg shadow-md">أهدافنا</h3>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border-r-4 border-blue-600">
            <h4 className="text-lg font-bold mb-2 text-blue-800 flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">1</span>
              التواصل المستمر والفعال
            </h4>
            <p className="text-gray-700 leading-relaxed mr-10">
              التواصل المستمر والفعال مع أعضاء الجمعية وتزويدهم بالنشرات العلمية الحديثة، وملتقى المؤتمرات والفعاليات العلمية التي تنظمها الجمعية عبر كل وسائل التواصل المتاحة للجمعية.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border-r-4 border-blue-600">
            <h4 className="text-lg font-bold mb-2 text-blue-800 flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">2</span>
              تحسين نشاط الجمعية
            </h4>
            <p className="text-gray-700 leading-relaxed mr-10">
              تحسين نشاط الجمعية عبر وسائل التواصل الاجتماعي.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border-r-4 border-blue-600">
            <h4 className="text-lg font-bold mb-2 text-blue-800 flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">3</span>
              دمج المجتمع برسالة وأهداف الجمعية
            </h4>
            <p className="text-gray-700 leading-relaxed mr-10">
              دمج المجتمع برسالة وأهداف الجمعية، والاسهام برفع مستوى الوعي السياسي الوطني في المجتمع، ورفع مصادر إيرادات الجمعية.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border-r-4 border-blue-600">
            <h4 className="text-lg font-bold mb-2 text-blue-800 flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">4</span>
              توسيع برامج وأنشطة الجمعية
            </h4>
            <p className="text-gray-700 leading-relaxed mr-10">
              توسيع برامج وأنشطة الجمعية من حيث إقامة المؤتمرات والفعاليات التي تناقش القضايا السياسية الراهنة، وإقامة برامج تدريبية للمهتمين بالموضوعات والقضايا السياسية.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border-r-4 border-blue-600">
            <h4 className="text-lg font-bold mb-2 text-blue-800 flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">5</span>
              فتح قنوات اتصال مع المؤسسات السيادية
            </h4>
            <p className="text-gray-700 leading-relaxed mr-10">
              فتح قنوات اتصال مع المؤسسات السيادية التي تتقاطع أنشطتها وأعمالها مع تخصصات العلوم السياسية كالديوان الملكي، ووزارة الخارجية، والاستخبارات، وأمن الدولة. وتقديم بعض الدورات الأساسية التي تسهم في تطوير الأداء الوظيفي لمنتسبيها، والتي ستسهم في تحسين الإيرادات المالية للجمعية.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border-r-4 border-blue-600">
            <h4 className="text-lg font-bold mb-2 text-blue-800 flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">6</span>
              تكثيف نشاط الإنتاج البحثي والعلمي
            </h4>
            <p className="text-gray-700 leading-relaxed mr-10">
              تكثيف نشاط الإنتاج البحثي والعلمي للجمعية، وتوسيع نطاق العضوية للمهتمين بالعلوم السياسية بهدف الاسهام برفع مستوى الوعي السياسي الوطني في المجتمع، ورفع مصادر إيرادات الجمعية.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border-r-4 border-blue-600">
            <h4 className="text-lg font-bold mb-2 text-blue-800 flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">7</span>
              فتح قنوات اتصال مع جمعيات العلوم السياسية
            </h4>
            <p className="text-gray-700 leading-relaxed mr-10">
              فتح قنوات اتصال مع جمعيات العلوم السياسية والمراكز البحثية المهتمة بموضوعات العلوم السياسية، والاشتراك في مجلاتها العلمية، ومتابعة أهم أنشطتها وبرامجها وفعاليتها.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border-r-4 border-blue-600">
            <h4 className="text-lg font-bold mb-2 text-blue-800 flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">8</span>
              استضافة المتخصصين والقيادات السياسية
            </h4>
            <p className="text-gray-700 leading-relaxed mr-10">
              استضافة بعض المتخصصين في العلوم السياسية المؤثرين بالعالم والقيادات السياسية العاملين بالنشاط الدبلوماسي والسياسي، والذين يحظون بمكانة رفيعة ومكانة عالمية على صعيد الإنتاج الأكاديمي والبحثي.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionMission;