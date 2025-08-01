// Test Page - صفحة اختبار أساسية
import React from 'react';

const TestPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>
          🟢 صفحة الاختبار تعمل!
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          إذا ترى هذه الرسالة، فإن React يعمل بشكل صحيح
        </p>
        <p style={{ color: '#059669', fontWeight: 'bold' }}>
          ✅ المشروع يعمل بنجاح
        </p>
        <div style={{ marginTop: '1rem' }}>
          <a 
            href="/" 
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestPage;