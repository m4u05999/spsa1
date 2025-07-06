# دليل إعداد Supabase للجمعية السعودية للعلوم السياسية
# Supabase Setup Guide for Saudi Political Science Association

## 🎯 الهدف
إنشاء مشروع Supabase حقيقي وتكوين قاعدة البيانات للمشروع.

---

## 📋 الخطوة 1: إنشاء حساب Supabase

### **1.1 زيارة الموقع الرسمي:**
```
🌐 الرابط: https://supabase.com
```

### **1.2 إنشاء حساب جديد:**
- انقر على "Start your project"
- اختر "Sign up" إذا لم يكن لديك حساب
- يمكنك التسجيل باستخدام:
  - GitHub (مُوصى به للمطورين)
  - Google
  - البريد الإلكتروني

### **1.3 تأكيد البريد الإلكتروني:**
- تحقق من بريدك الإلكتروني
- انقر على رابط التأكيد

---

## 🏗️ الخطوة 2: إنشاء مشروع جديد

### **2.1 إنشاء المشروع:**
```
📝 اسم المشروع: SPSA - Saudi Political Science Association
📝 اسم قاعدة البيانات: spsa_database
🔐 كلمة مرور قاعدة البيانات: [اختر كلمة مرور قوية]
```

### **2.2 اختيار المنطقة الجغرافية:**
```
🌍 المنطقة المُوصى بها:
- الخيار الأول: Middle East (Bahrain) - me-central-1
- الخيار الثاني: Europe (Frankfurt) - eu-central-1
- الخيار الثالث: Asia Pacific (Singapore) - ap-southeast-1
```

### **2.3 اختيار الخطة:**
```
💰 الخطة المُوصى بها:
- للتطوير: Free Plan (مجاني)
- للإنتاج: Pro Plan ($25/شهر)
```

---

## 🔑 الخطوة 3: الحصول على المفاتيح

### **3.1 الوصول لإعدادات المشروع:**
1. انتقل إلى Dashboard
2. اختر مشروعك
3. انقر على "Settings" في الشريط الجانبي
4. اختر "API"

### **3.2 نسخ المفاتيح المطلوبة:**
```javascript
// ستحتاج هذه القيم:
Project URL: https://[project-id].supabase.co
anon public key: eyJ... (مفتاح عام)
service_role key: eyJ... (مفتاح الخدمة - سري)
```

### **3.3 حفظ المفاتيح بأمان:**
⚠️ **تحذير مهم:**
- لا تشارك `service_role key` أبداً
- استخدم `anon public key` في Frontend فقط
- احفظ المفاتيح في مكان آمن

---

## 🗄️ الخطوة 4: إعداد قاعدة البيانات الأولي

### **4.1 الوصول لمحرر SQL:**
1. في Dashboard، انقر على "SQL Editor"
2. ستجد محرر SQL جاهز للاستخدام

### **4.2 تفعيل الإضافات المطلوبة:**
```sql
-- تفعيل إضافة UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- تفعيل إضافة التشفير
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- تفعيل إضافة البحث النصي
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

---

## 🔐 الخطوة 5: إعداد المصادقة

### **5.1 إعدادات المصادقة:**
1. انتقل إلى "Authentication" > "Settings"
2. تأكد من تفعيل:
   - Email confirmations
   - Secure email change
   - Double confirm email changes

### **5.2 إعداد عناوين URL المسموحة:**
```
Site URL: http://localhost:5173
Additional redirect URLs:
- http://localhost:5174
- https://your-domain.com (للإنتاج)
```

### **5.3 إعداد مقدمي المصادقة (اختياري):**
- يمكنك تفعيل Google, GitHub, إلخ
- للمرحلة الأولى، Email/Password كافي

---

## 📊 الخطوة 6: إعداد Row Level Security

### **6.1 تفعيل RLS:**
```sql
-- سيتم تطبيق هذا لاحقاً مع إنشاء الجداول
-- Row Level Security يضمن أمان البيانات
```

---

## ✅ قائمة التحقق

### **قبل المتابعة، تأكد من:**
- [ ] تم إنشاء المشروع بنجاح
- [ ] تم الحصول على Project URL
- [ ] تم الحصول على anon public key
- [ ] تم الحصول على service_role key (احتفظ به سرياً)
- [ ] تم تفعيل الإضافات المطلوبة
- [ ] تم إعداد إعدادات المصادقة الأساسية

---

## 🔄 الخطوات التالية

بعد إكمال هذه الخطوات:

1. **أرسل لي المعلومات التالية:**
   ```
   Project URL: https://[project-id].supabase.co
   anon public key: eyJ... (الجزء الأول فقط للتأكيد)
   ```

2. **لا ترسل service_role key** - احتفظ به سرياً

3. **سأقوم بتحديث إعدادات المشروع** تلقائياً

---

## 🆘 المساعدة والدعم

### **إذا واجهت مشاكل:**
1. **مشاكل التسجيل:**
   - تأكد من تأكيد البريد الإلكتروني
   - جرب متصفح مختلف
   - امسح cache المتصفح

2. **مشاكل إنشاء المشروع:**
   - تأكد من اختيار منطقة قريبة
   - تأكد من قوة كلمة مرور قاعدة البيانات
   - انتظر بضع دقائق للمعالجة

3. **مشاكل الوصول للمفاتيح:**
   - تأكد من اكتمال إنشاء المشروع
   - حدث الصفحة
   - تحقق من إعدادات المشروع

### **روابط مفيدة:**
- 📚 [Supabase Documentation](https://supabase.com/docs)
- 🎥 [Supabase YouTube Channel](https://www.youtube.com/c/Supabase)
- 💬 [Supabase Discord Community](https://discord.supabase.com)

---

## 📞 التواصل

إذا احتجت مساعدة إضافية:
- 📧 **البريد الإلكتروني:** dev-support@sapsa.org
- 📱 **الدعم الفني:** +966-11-xxx-xxxx

---

**بعد إكمال هذه الخطوات، سنكون جاهزين للانتقال لتكوين قاعدة البيانات! 🚀**
