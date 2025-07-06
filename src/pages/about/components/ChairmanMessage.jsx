// src/pages/about/components/ChairmanMessage.jsx
import React from 'react';
import ImageComponent from '../../../components/ImageComponent';

const ChairmanMessage = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">كلمة رئيس الجمعية</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="text-center">
            <ImageComponent
              src="/assets/images/chairman.jpg"
              alt="رئيس الجمعية"
              className="rounded-full w-48 h-48 mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold mb-1">د. عبدالغني بن شمس الدين الكندي</h3>
            <p className="text-gray-600">رئيس الجمعية</p>
          </div>
        </div>
        <div className="md:w-2/3">
          <div className="prose max-w-none">
            <h3 className="text-xl font-bold mb-4">خطاب ترحيبي من رئيس الجمعية</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              الإخوة والأخوات الكرام،،،
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              أعضاء الجمعية السعودية للعلوم السياسية الأعزاء، شركاؤنا في التقدم والنجاح، يسرني أن أرحب بكم باسمي وباسم أعضاء مجلس الإدارة. كما أود أن أعبر عن خالص شكري وامتناني لكل من ساهم في دعم مسيرتنا وتعزيز رؤية ورسالة وأهداف الجمعية.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              لقد تأسست الجمعية برؤية واضحة تهدف إلى تعزيز التميز المؤسسي، والابتكار العلمي، والعمل الجماعي. ومن أجل تحقيق هذه الرؤية، حرصت الجمعية على أن تكون في طليعة الجمعيات العلمية من حيث الإنتاج البحثي والتواصل المعرفي مع جميع الجهات المختصة في مجالات العلوم السياسية على مستوى العالم. كما تسعى الجمعية إلى المساهمة في رفع مستوى الوعي السياسي، الذي يعزز قيم المواطنة الصالحة والإيجابية، باعتبارها من الروافد والركائز الأساسية للاستقرار الأمني الداخلي.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              وكرئيس لهذه الجمعية أؤمن بأن سر قوتنا يكمن في تعاوننا المشترك وثقتنا المتبادلة لتحقيق هذه الرؤية، والإسهام بالنهوض بالجمعية، وإحداث تغييرات إيجابية تنعكس على ازدهار ونمو هذا الوطن في كل مجال من مجالات الحياة، وأن تترك الجمعية بصمة خالدة ومستدامة تتقفى مسيرتها جميع الأجيال المتعاقبة، ويتعقب أثرها كل من انتسب لها من خلال منتوجاتنا البحثية، وبرامجنا المعرفية، ورسالتنا العلمية الخالدة. فنحن في هذه الجمعية نتعهد بأن نكون صوتاً لهذا المجتمع العلمي، ومنارة للإزدهار والتقدم الوطني، وجسراً صلباً يربط بين الأجيال المتعاقبة، وبين الحاضر والمستقبل، والإنجاز والطموح.
            </p>
            <p className="text-gray-700 leading-relaxed text-left mt-8">
              د. عبدالغني بن شمس الدين الكندي - رئيس الجمعية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChairmanMessage;