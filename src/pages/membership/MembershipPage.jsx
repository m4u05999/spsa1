// src/pages/membership/MembershipPage.jsx
import React, { useState } from 'react';
import MembershipPlan from '../../components/membership/MembershipPlan';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../../utils/theme';

const MembershipPage = () => {
  // حالة لتبديل عرض الأسعار شهرياً/سنوياً
  const [isAnnual, setIsAnnual] = useState(true);

  // تفاصيل خطط العضوية
  const membershipPlans = [
    {
      id: 'basic',
      title: 'العضوية الأساسية',
      monthlyPrice: '٩٩ ريال',
      annualPrice: '٩٩٠ ريال',
      features: [
        'الوصول إلى المكتبة العلمية',
        'النشرة الإخبارية الشهرية',
        'حضور الفعاليات العامة',
        'شهادة عضوية',
        'بطاقة عضوية رقمية',
      ],
      isPopular: false,
      isPro: false
    },
    {
      id: 'standard',
      title: 'العضوية المحترفة',
      monthlyPrice: '١٩٩ ريال',
      annualPrice: '١,٩٩٠ ريال',
      features: [
        'جميع مزايا العضوية الأساسية',
        'الوصول إلى الدراسات الحصرية',
        'خصومات على المؤتمرات والدورات',
        'المشاركة في ورش العمل المتخصصة',
        'الاشتراك في المجلة العلمية',
        'إمكانية نشر المقالات والأبحاث',
      ],
      isPopular: true,
      isPro: false
    },
    {
      id: 'premium',
      title: 'العضوية المتميزة',
      monthlyPrice: '٢٩٩ ريال',
      annualPrice: '٢,٩٩٠ ريال',
      features: [
        'جميع مزايا العضوية المحترفة',
        'الوصول إلى قاعدة بيانات الأبحاث الدولية',
        'حضور مجاني للمؤتمرات السنوية',
        'الاشتراك في برنامج الإرشاد الأكاديمي',
        'فرص نشر في المجلات الدولية المعتمدة',
        'الوصول المبكر للتقارير والدراسات',
        'الاستشارات البحثية المتخصصة',
      ],
      isPopular: false,
      isPro: true
    }
  ];

  // الأسئلة الشائعة
  const faqs = [
    {
      question: 'ما هي مزايا العضوية في رابطة العلوم السياسية؟',
      answer: 'تتيح العضوية في الرابطة الوصول إلى مكتبة متخصصة من الأبحاث والدراسات، وحضور الفعاليات العلمية، والمشاركة في المؤتمرات والندوات، وفرص النشر في المجلات العلمية المعتمدة، بالإضافة إلى التواصل مع شبكة واسعة من الباحثين والأكاديميين في مجال العلوم السياسية.'
    },
    {
      question: 'كيف يمكنني الترقية إلى مستوى عضوية أعلى؟',
      answer: 'يمكنك ترقية عضويتك في أي وقت من خلال الدخول إلى حسابك الشخصي، والانتقال إلى صفحة العضوية، ثم اختيار خطة العضوية الجديدة التي ترغب فيها وإتمام عملية الدفع.'
    },
    {
      question: 'هل يمكن إلغاء العضوية واسترداد المبلغ المدفوع؟',
      answer: 'يمكن إلغاء العضوية في أي وقت، ولكن سياسة استرداد المبلغ المدفوع تعتمد على نوع العضوية والمدة المتبقية. بالنسبة للعضوية السنوية، يمكن استرداد جزء من المبلغ المدفوع إذا تم الإلغاء خلال الشهر الأول. للمزيد من التفاصيل، يرجى الاطلاع على سياسة الاسترداد في شروط العضوية.'
    },
    {
      question: 'هل هناك خصومات للطلاب أو الأكاديميين؟',
      answer: 'نعم، توفر الرابطة خصومات خاصة للطلاب والأكاديميين والباحثين. يمكن الحصول على تفاصيل الخصومات المتاحة وكيفية التحقق من الأهلية عن طريق التواصل مع فريق دعم العضوية.'
    },
    {
      question: 'ما هي مدة العضوية وكيف يتم التجديد؟',
      answer: 'مدة العضوية إما شهرية أو سنوية حسب الخطة المختارة. يتم تجديد العضوية تلقائياً ما لم يتم إلغاؤها قبل موعد التجديد. يمكن إدارة إعدادات التجديد من خلال حسابك الشخصي في قسم العضوية.'
    },
    {
      question: 'هل يمكن تحويل العضوية إلى شخص آخر؟',
      answer: 'العضوية شخصية ولا يمكن تحويلها إلى شخص آخر. في حالة الرغبة في عضوية مؤسسية لعدة أشخاص، يرجى التواصل مع قسم العضويات للحصول على معلومات حول العضويات المؤسسية الخاصة.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* قسم العنوان */}
      <section className="relative py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">عضوية رابطة العلوم السياسية</h1>
            <p className="text-xl text-blue-100 mb-6">
              انضم إلى مجتمع متخصص من الباحثين والأكاديميين في مجال العلوم السياسية واستفد من مزايا حصرية
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#pricing" className={`${buttonStyles.primary.replace('bg-blue-600', 'bg-white').replace('text-white', 'text-blue-700')} px-6 py-3 rounded-md shadow-lg`}>
                عرض خطط العضوية
              </a>
              <Link to="/about" className="border border-white hover:bg-blue-800 px-6 py-3 rounded-md transition">
                تعرف على الرابطة
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#f8fafc" fillOpacity="1" d="M0,160L48,165.3C96,171,192,181,288,165.3C384,149,480,107,576,90.7C672,75,768,85,864,112C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* قسم مميزات العضوية */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">مميزات العضوية في رابطة العلوم السياسية</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">مكتبة علمية متخصصة</h3>
              <p className="text-gray-600">
                الوصول إلى أرشيف من الأبحاث والدراسات العلمية المتخصصة في مجال العلوم السياسية
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">حضور الفعاليات العلمية</h3>
              <p className="text-gray-600">
                إمكانية حضور المؤتمرات والندوات وورش العمل التي تنظمها الرابطة
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">فرص النشر العلمي</h3>
              <p className="text-gray-600">
                فرص لنشر الأبحاث والدراسات في المجلات العلمية المعتمدة والإصدارات الدورية
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">شبكة تواصل أكاديمية</h3>
              <p className="text-gray-600">
                التواصل مع نخبة من الباحثين والأكاديميين والخبراء في مجال العلوم السياسية
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* قسم خطط العضوية */}
      <section id="pricing" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">خطط العضوية</h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            اختر خطة العضوية التي تناسب احتياجاتك واستمتع بمزايا حصرية من رابطة العلوم السياسية
          </p>

          {/* تبديل الدفع شهري/سنوي */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                className={`px-4 py-2 rounded-md transition ${
                  !isAnnual ? 'bg-white shadow-sm' : 'bg-transparent'
                }`}
                onClick={() => setIsAnnual(false)}
              >
                دفع شهري
              </button>
              <button
                className={`px-4 py-2 rounded-md transition ${
                  isAnnual ? 'bg-white shadow-sm' : 'bg-transparent'
                }`}
                onClick={() => setIsAnnual(true)}
              >
                دفع سنوي <span className="text-xs text-green-600 mr-1">(خصم ١٦٪)</span>
              </button>
            </div>
          </div>

          {/* خطط العضوية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {membershipPlans.map(plan => (
              <MembershipPlan
                key={plan.id}
                title={plan.title}
                price={isAnnual ? plan.annualPrice : plan.monthlyPrice}
                duration={isAnnual ? "سنوياً" : "شهرياً"}
                features={plan.features}
                isPopular={plan.isPopular}
                isPro={plan.isPro}
              />
            ))}
          </div>
        </div>
      </section>

      {/* قسم الأسئلة الشائعة */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">الأسئلة الشائعة</h2>
          
          <div className="max-w-3xl mx-auto divide-y">
            {faqs.map((faq, index) => (
              <div key={index} className="py-6">
                <h3 className="text-xl font-bold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* قسم الدعوة للعمل */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">استعد للانضمام إلى مجتمع العلوم السياسية</h2>
          <p className="max-w-2xl mx-auto mb-8 text-blue-100">
            انضم إلى أكثر من 5,000 باحث وأكاديمي في مجال العلوم السياسية واستفد من المكتبة العلمية وفرص النشر والفعاليات المتخصصة
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/register">
              <button className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-md shadow-lg font-medium transition">
                إنشاء حساب جديد
              </button>
            </Link>
            <Link to="/contact">
              <button className="border border-white hover:bg-blue-700 px-6 py-3 rounded-md font-medium transition">
                استفسار عن العضوية
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MembershipPage;