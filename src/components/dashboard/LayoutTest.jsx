// src/components/dashboard/LayoutTest.jsx
import React from 'react';

const LayoutTest = () => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🧪 اختبار تخطيط لوحة التحكم
        </h1>
        <p className="text-gray-600 mb-4">
          هذه الصفحة لاختبار أن التخطيط يعمل بشكل صحيح وأن القائمة الجانبية لا تتداخل مع المحتوى.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">✅ التخطيط الصحيح</h3>
            <p className="text-blue-700 text-sm">
              القائمة الجانبية يجب أن تكون على اليمين والمحتوى على اليسار بدون تداخل
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">📱 التصميم المتجاوب</h3>
            <p className="text-green-700 text-sm">
              على الشاشات الصغيرة، القائمة الجانبية يجب أن تظهر كـ overlay
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">🎨 Z-Index صحيح</h3>
            <p className="text-purple-700 text-sm">
              الترتيب: Header (50) > Sidebar (40) > Overlay (30) > Content (10)
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ اختبارات مطلوبة:</h3>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• تحقق من أن المحتوى لا يختفي خلف القائمة الجانبية</li>
            <li>• اختبر فتح وإغلاق القائمة الجانبية على الهاتف</li>
            <li>• تأكد من أن الـ overlay يعمل بشكل صحيح</li>
            <li>• اختبر التبديل بين الوضع العادي والمطوي</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">محتوى اختبار إضافي</h3>
          
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">
                عنصر اختبار رقم {i + 1}
              </h4>
              <p className="text-gray-600 text-sm">
                هذا نص تجريبي للتأكد من أن المحتوى يظهر بشكل صحيح ولا يتداخل مع القائمة الجانبية. 
                يجب أن يكون هذا النص مقروءاً بوضوح ولا يختفي خلف أي عنصر آخر في الواجهة.
              </p>
              <div className="mt-2 flex space-x-2 space-x-reverse">
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  زر اختبار
                </button>
                <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300">
                  زر ثانوي
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LayoutTest;
