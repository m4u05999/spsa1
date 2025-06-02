import React from 'react';
import { Link } from 'react-router-dom';

/**
 * صفحة مؤقتة لمحاضرة الأمير تركي الفيصل
 * تحتوي على معلومات أساسية عن المحاضرة مع زر للتسجيل
 */
const TempPrinceTurkiPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:shrink-0">
            <img
              className="h-64 w-full object-cover md:w-96"
              src="/assets/images/prince-turki.jpeg"
              alt="صورة الأمير تركي الفيصل"
            />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">محاضرة خاصة</div>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">محاضرة الأمير تركي الفيصل</h1>
            <p className="mt-4 text-gray-600">
              يسر الجمعية السعودية للعلوم السياسية استضافة صاحب السمو الملكي الأمير تركي الفيصل
              في محاضرة خاصة حول "التحولات الجيوسياسية في الشرق الأوسط وتأثيرها على المملكة العربية السعودية"
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="mr-3 text-gray-700">25 يونيو 2023</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="mr-3 text-gray-700">7:00 مساءً</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="mr-3 text-gray-700">قاعة الملك فيصل للمؤتمرات، الرياض</span>
              </div>
            </div>
            
            <div className="mt-8 flex">
              <Link
                to="/events/lecture/prince-turki"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out"
              >
                التفاصيل الكاملة
              </Link>
              <button
                className="mr-4 px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition duration-150 ease-in-out"
              >
                التسجيل في المحاضرة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempPrinceTurkiPage;
