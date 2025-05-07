// src/components/committees/CommitteeContact.jsx
import React, { useState } from 'react';

const CommitteeContact = ({ committee }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">تواصل مع اللجنة</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">الاسم</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
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
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">الموضوع</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">الرسالة</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            className="w-full border rounded-md px-3 py-2"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          إرسال
        </button>
      </form>
    </div>
  );
};

export default CommitteeContact;