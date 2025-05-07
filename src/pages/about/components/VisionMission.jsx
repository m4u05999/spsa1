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
        <h3 className="text-xl font-semibold mb-4">أهدافنا</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-3xl mb-2 text-blue-600">1</div>
            <p className="text-gray-700">تطوير البحث العلمي في مجال العلوم السياسية</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-3xl mb-2 text-blue-600">2</div>
            <p className="text-gray-700">تعزيز التعاون مع المؤسسات الأكاديمية والبحثية</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-3xl mb-2 text-blue-600">3</div>
            <p className="text-gray-700">تقديم الاستشارات للجهات الحكومية والخاصة</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-3xl mb-2 text-blue-600">4</div>
            <p className="text-gray-700">تنظيم المؤتمرات والندوات العلمية</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-3xl mb-2 text-blue-600">5</div>
            <p className="text-gray-700">نشر الوعي السياسي في المجتمع</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-3xl mb-2 text-blue-600">6</div>
            <p className="text-gray-700">تطوير المهارات المهنية للمختصين</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionMission;