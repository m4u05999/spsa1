// src/pages/conference/ConferencePage.jsx
import React, { useState } from 'react';

const ConferencePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    paperTitle: '',
    abstract: '',
    participationType: 'حضور'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-right">المؤتمر السنوي</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">المؤتمر السنوي 2024</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">الموضوع</h3>
              <p className="text-gray-700">
                "التحولات الجيوسياسية في الشرق الأوسط: تحديات وفرص"
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">التاريخ</h3>
              <p className="text-gray-700">15-17 أبريل 2024</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">المكان</h3>
              <p className="text-gray-700">فندق الريتز كارلتون، الرياض</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">المحاور الرئيسية</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>التحولات في النظام الدولي وتأثيراتها على المنطقة</li>
                <li>التعاون الإقليمي والتكامل الاقتصادي</li>
                <li>الأمن الإقليمي والتحديات المعاصرة</li>
                <li>التحول الرقمي والدبلوماسية الرقمية</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">نموذج التسجيل</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">الاسم الكامل</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">المؤسسة</label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">نوع المشاركة</label>
              <select
                name="participationType"
                value={formData.participationType}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="حضور">حضور</option>
                <option value="تقديم ورقة">تقديم ورقة بحثية</option>
                <option value="متحدث">متحدث</option>
              </select>
            </div>
            {formData.participationType === 'تقديم ورقة' && (
              <>
                <div>
                  <label className="block text-gray-700 mb-2">عنوان الورقة</label>
                  <input
                    type="text"
                    name="paperTitle"
                    value={formData.paperTitle}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">ملخص الورقة</label>
                  <textarea
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md h-32"
                  ></textarea>
                </div>
              </>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              تسجيل
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConferencePage;