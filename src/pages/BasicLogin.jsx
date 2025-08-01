// Basic Login - تسجيل دخول أساسي بدون AuthContext
import React, { useState } from 'react';

const BasicLogin = () => {
  const [email, setEmail] = useState('admin@saudips.org');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      // محاكاة تسجيل الدخول
      console.log('تجربة تسجيل الدخول:', { email, password });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@saudips.org' && password === 'Admin@123') {
        setMessage('✅ تم تسجيل الدخول بنجاح!');
        console.log('✅ نجح تسجيل الدخول');
        
        // محاكاة إعادة التوجيه
        setTimeout(() => {
          alert('سيتم توجيهك للوحة التحكم الآن');
          window.location.href = '/dashboard/admin';
        }, 2000);
      } else {
        setMessage('❌ البيانات غير صحيحة');
        console.log('❌ فشل تسجيل الدخول');
      }
    } catch (err) {
      console.error('خطأ:', err);
      setMessage('❌ حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

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
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#1f2937', 
          marginBottom: '1.5rem',
          fontSize: '1.5rem'
        }}>
          🔐 تسجيل الدخول الأساسي
        </h1>
        
        {message && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#991b1b',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: '#374151',
              fontWeight: 'bold'
            }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: '#374151',
              fontWeight: 'bold'
            }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '4px',
              border: 'none',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ جاري تسجيل الدخول...' : '🚀 تسجيل الدخول'}
          </button>
        </form>
        
        <div style={{ 
          marginTop: '1rem', 
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <p>البيانات الافتراضية:</p>
          <p>admin@saudips.org / Admin@123</p>
        </div>
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a 
            href="/"
            style={{
              color: '#3b82f6',
              textDecoration: 'none'
            }}
          >
            ← العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
};

export default BasicLogin;