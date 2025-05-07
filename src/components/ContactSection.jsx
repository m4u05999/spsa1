// src/components/ContactSection.jsx
import React from 'react';

const ContactSection = () => {
  const socialLinks = [
    { id: 1, name: "تويتر", icon: "twitter", url: "#" },
    { id: 2, name: "فيسبوك", icon: "facebook", url: "#" },
    { id: 3, name: "يوتيوب", icon: "youtube", url: "#" },
    { id: 4, name: "لينكد إن", icon: "linkedin", url: "#" },
  ];

  const contactInfo = [
    { id: 1, type: "عنوان", value: "الرياض - المملكة العربية السعودية - حي الجامعة", icon: "location" },
    { id: 2, type: "هاتف", value: "966112345678+", icon: "phone" },
    { id: 3, type: "بريد إلكتروني", value: "info@political-science.org", icon: "mail" },
  ];

  const externalLinks = [
    { id: 1, name: "وزارة التعليم", url: "#" },
    { id: 2, name: "الجمعيات العلمية", url: "#" },
    { id: 3, name: "المكتبة الرقمية", url: "#" },
    { id: 4, name: "مركز البحوث", url: "#" },
  ];

  // SVG Icons
  const icons = {
    twitter: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
    facebook: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
      </svg>
    ),
    youtube: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
      </svg>
    ),
    linkedin: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    location: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    phone: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    mail: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    podcast: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* وسائل التواصل الاجتماعي */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-blue-700 pb-2 border-b border-gray-200">
              تابعنا على مواقع التواصل
            </h3>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  className="bg-gray-100 hover:bg-blue-100 text-blue-700 p-3 rounded-full transition-colors"
                  aria-label={`تابعنا على ${link.name}`}
                >
                  {icons[link.icon]}
                </a>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="font-bold text-gray-800 mb-2">بودكاست الجمعية</h4>
              <a href="#" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                <span className="ml-2">{icons.podcast}</span>
                <span>استمع للحلقات على منصات البث</span>
              </a>
            </div>
          </div>

          {/* معلومات الاتصال */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-blue-700 pb-2 border-b border-gray-200">
              معلومات الاتصال
            </h3>
            <ul className="space-y-4">
              {contactInfo.map(info => (
                <li key={info.id} className="flex">
                  <span className="ml-3 text-blue-600">{icons[info.icon]}</span>
                  <div>
                    <strong className="block text-gray-800">{info.type}:</strong>
                    <span className="text-gray-600">{info.value}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* روابط خارجية */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-blue-700 pb-2 border-b border-gray-200">
              روابط مهمة
            </h3>
            <ul className="space-y-3">
              {externalLinks.map(link => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    className="flex items-center text-gray-700 hover:text-blue-700 hover:underline"
                  >
                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* نموذج الاتصال */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-blue-700 pb-2 border-b border-gray-200">
              تواصل معنا
            </h3>
            <form>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="الاسم"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <textarea
                  placeholder="الرسالة"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>
              <button type="submit" className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800 transition-colors">
                إرسال
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;