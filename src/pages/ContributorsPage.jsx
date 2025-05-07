// src/pages/ContributorsPage.jsx
import React, { useEffect, useState } from 'react';
import { getContributors } from '../services/userService';
import ContributorInfo from '../components/dashboard/ContributorInfo';
import { Link } from 'react-router-dom';

const ContributorsPage = () => {
  const [contributors, setContributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('الكل');

  // استرجاع قائمة المساهمين عند تحميل الصفحة
  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const contributorsData = await getContributors();
        setContributors(contributorsData);
      } catch (error) {
        console.error('خطأ في استرجاع بيانات المساهمين:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributors();
  }, []);

  // تصفية المساهمين حسب المستوى
  const filterContributors = () => {
    if (activeFilter === 'الكل') {
      return contributors;
    }
    return contributors.filter(contributor => contributor.tier === activeFilter);
  };

  // عدد المساهمين في كل فئة
  const getContributorsCount = (tier) => {
    if (tier === 'الكل') {
      return contributors.length;
    }
    return contributors.filter(contributor => contributor.tier === tier).length;
  };

  const filteredContributors = filterContributors();

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">المساهمون والمتبرعون</h1>
          <p className="text-gray-600 max-w-3xl">
            نقدم الشكر والتقدير لجميع المساهمين والداعمين لجمعية العلوم السياسية. بفضل دعمهم المستمر، تستمر الجمعية في تحقيق رسالتها وتقديم برامجها ومبادراتها.
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
            {['الكل', 'ذهبي', 'فضي', 'برونزي'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {filter} ({getContributorsCount(filter)})
              </button>
            ))}
          </div>

          <Link
            to="/donate"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            تبرع الآن
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {activeFilter === 'ذهبي' && filteredContributors.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">المساهمون الذهبيون</h2>
                <div className="bg-gradient-to-r from-yellow-50 to-white p-6 rounded-lg shadow-sm border border-yellow-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredContributors.map((contributor) => (
                      <div key={contributor.id} className="col-span-1">
                        <ContributorInfo contributor={contributor} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(activeFilter === 'الكل' || activeFilter === 'فضي') && 
             contributors.filter(c => c.tier === 'فضي').length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">المساهمون الفضيون</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contributors
                    .filter(c => c.tier === 'فضي')
                    .map((contributor) => (
                      <ContributorInfo key={contributor.id} contributor={contributor} />
                    ))}
                </div>
              </div>
            )}

            {(activeFilter === 'الكل' || activeFilter === 'برونزي') && 
             contributors.filter(c => c.tier === 'برونزي').length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">المساهمون البرونزيون</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contributors
                    .filter(c => c.tier === 'برونزي')
                    .map((contributor) => (
                      <ContributorInfo key={contributor.id} contributor={contributor} />
                    ))}
                </div>
              </div>
            )}

            {filteredContributors.length === 0 && (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد مساهمون في هذه الفئة حالياً</h3>
                <p className="text-gray-600 mb-6">
                  كن أول من يساهم في دعم الجمعية وتحقيق أهدافها
                </p>
                <Link
                  to="/donate"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  تبرع الآن
                </Link>
              </div>
            )}
          </>
        )}

        <div className="mt-16 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">كيف تصبح مساهماً؟</h2>
          <p className="text-gray-600 mb-6">
            يمكنك المساهمة في دعم جمعية العلوم السياسية من خلال تقديم تبرعات مالية أو دعم عيني. تصنف المساهمات إلى ثلاثة مستويات:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-bold text-lg mb-2 text-yellow-800">المساهم الذهبي</h3>
              <p className="text-gray-600 mb-2">للتبرعات بقيمة 10,000 ريال أو أكثر</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>عرض الشعار في الصفحة الرئيسية</li>
                <li>شهادة تقدير رسمية</li>
                <li>دعوات لجميع فعاليات الجمعية</li>
                <li>مزايا خاصة في المؤتمرات والندوات</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2 text-gray-800">المساهم الفضي</h3>
              <p className="text-gray-600 mb-2">للتبرعات بقيمة 5,000 ريال إلى 9,999 ريال</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>عرض الاسم في صفحة المساهمين</li>
                <li>شهادة تقدير رسمية</li>
                <li>دعوات للفعاليات الرئيسية</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-bold text-lg mb-2 text-orange-800">المساهم البرونزي</h3>
              <p className="text-gray-600 mb-2">للتبرعات بقيمة تصل إلى 4,999 ريال</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>عرض الاسم في صفحة المساهمين</li>
                <li>رسالة شكر إلكترونية</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/donate"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              ساهم في دعم الجمعية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorsPage;