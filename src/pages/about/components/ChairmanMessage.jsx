// src/pages/about/components/ChairmanMessage.jsx
import React from 'react';

const ChairmanMessage = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">كلمة رئيس مجلس الإدارة</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="text-center">
            <img
              src="/assets/images/chairman.jpg"
              alt="رئيس مجلس الإدارة"
              className="rounded-full w-48 h-48 mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold mb-1">د. عبدالله العتيبي</h3>
            <p className="text-gray-600">رئيس مجلس الإدارة</p>
          </div>
        </div>
        <div className="md:w-2/3">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              بسم الله الرحمن الرحيم
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              يسرني أن أرحب بكم في جمعية العلوم السياسية، التي تأسست بهدف المساهمة في تطوير وتعزيز مجال العلوم السياسية في المملكة العربية السعودية والعالم العربي.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              نحن في الجمعية نؤمن بأهمية الدور الذي تلعبه العلوم السياسية في فهم وتحليل التحولات السياسية والاجتماعية والاقتصادية على المستويين المحلي والدولي.
            </p>
            <p className="text-gray-700 leading-relaxed">
              نتطلع إلى تعاونكم ومشاركتكم في تحقيق رسالة الجمعية وأهدافها، وندعوكم للانضمام إلى عضويتها والمشاركة في أنشطتها وفعالياتها المختلفة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChairmanMessage;