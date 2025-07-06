# دليل استكشاف الأخطاء وحلها
# Troubleshooting Guide

## 🎯 نظرة عامة

هذا الدليل يساعدك في حل المشاكل الشائعة التي قد تواجهها عند استخدام النظام مع Supabase.

---

## 🔧 مشاكل الإعداد والتكوين

### 1. مشاكل متغيرات البيئة

#### المشكلة: متغيرات البيئة غير محددة
```
Error: Required environment variable VITE_SUPABASE_URL is not set
```

**الحل:**
1. تأكد من وجود ملف `.env.development`
2. تحقق من صحة أسماء المتغيرات:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_ENABLE_SUPABASE=true
   ```
3. أعد تشغيل خادم التطوير

#### المشكلة: قيم خاطئة في متغيرات البيئة
```
Error: Invalid URL format for VITE_SUPABASE_URL
```

**الحل:**
- تأكد من أن URL يبدأ بـ `https://`
- تأكد من أن URL ينتهي بـ `.supabase.co`
- مثال صحيح: `https://abcdefghijklmnop.supabase.co`

---

## 🌐 مشاكل الاتصال

### 1. فشل الاتصال بـ Supabase

#### المشكلة: خطأ DNS
```
Error: getaddrinfo ENOTFOUND your-project.supabase.co
```

**الحل:**
1. تحقق من صحة URL المشروع
2. تأكد من اتصال الإنترنت
3. جرب الوصول للرابط في المتصفح
4. تحقق من إعدادات الجدار الناري

#### المشكلة: انتهاء مهلة الاتصال
```
Error: timeout of 5000ms exceeded
```

**الحل:**
1. تحقق من سرعة الإنترنت
2. جرب تغيير منطقة Supabase
3. زيادة مهلة الاتصال في الكود:
   ```javascript
   const client = createClient(url, key, {
     db: { schema: 'public' },
     auth: { persistSession: true },
     global: { headers: { 'x-my-custom-header': 'my-app-name' } },
     realtime: { timeout: 10000 }
   });
   ```

### 2. مشاكل المصادقة

#### المشكلة: مفتاح API غير صحيح
```
Error: Invalid API key
```

**الحل:**
1. تحقق من صحة `VITE_SUPABASE_ANON_KEY`
2. تأكد من نسخ المفتاح كاملاً
3. تحقق من عدم وجود مسافات إضافية
4. جرب إنشاء مفتاح جديد من Supabase Dashboard

#### المشكلة: انتهاء صلاحية الجلسة
```
Error: Auth session missing!
```

**الحل:**
1. تسجيل الدخول مرة أخرى
2. تحقق من إعدادات انتهاء الجلسة
3. مسح localStorage والمحاولة مرة أخرى:
   ```javascript
   localStorage.clear();
   window.location.reload();
   ```

---

## 🗄️ مشاكل قاعدة البيانات

### 1. مشاكل الجداول

#### المشكلة: جدول غير موجود
```
Error: relation "table_name" does not exist
```

**الحل:**
1. تأكد من تنفيذ `database/schema.sql`
2. تحقق من أسماء الجداول في SQL Editor
3. تأكد من استخدام schema الصحيح (`public`)

#### المشكلة: عمود غير موجود
```
Error: column "column_name" does not exist
```

**الحل:**
1. تحقق من مخطط الجدول
2. تأكد من تنفيذ جميع migrations
3. قارن مع `database/schema.sql`

### 2. مشاكل Row Level Security (RLS)

#### المشكلة: انتهاك سياسة الأمان
```
Error: new row violates row-level security policy
```

**الحل:**
1. تأكد من تنفيذ `database/rls_policies.sql`
2. تحقق من صلاحيات المستخدم الحالي
3. راجع سياسات RLS للجدول المحدد
4. للاختبار، يمكن تعطيل RLS مؤقتاً:
   ```sql
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```

#### المشكلة: عدم القدرة على قراءة البيانات
```
Error: permission denied for table users
```

**الحل:**
1. تحقق من وجود سياسة SELECT للجدول
2. تأكد من تسجيل الدخول بالمستخدم الصحيح
3. راجع شروط السياسة

---

## 🔄 مشاكل الترحيل

### 1. فشل ترحيل البيانات

#### المشكلة: خطأ في بدء الترحيل
```
Error: Migration is already running
```

**الحل:**
1. انتظر انتهاء الترحيل الحالي
2. أو إعادة تعيين حالة الترحيل:
   ```javascript
   // في console المتصفح
   localStorage.removeItem('migration_status');
   ```

#### المشكلة: فشل في ترحيل جدول معين
```
Error: Failed to migrate categories: duplicate key value
```

**الحل:**
1. تحقق من وجود بيانات مكررة
2. مسح البيانات الموجودة:
   ```sql
   DELETE FROM categories WHERE id IN (SELECT id FROM categories);
   ```
3. إعادة تشغيل الترحيل

### 2. مشاكل التحقق من الترحيل

#### المشكلة: عدم تطابق عدد السجلات
```
Warning: Expected 50 records, found 45
```

**الحل:**
1. تحقق من سجلات الأخطاء في الترحيل
2. راجع البيانات المصدر
3. أعد تشغيل الترحيل للسجلات المفقودة

---

## 🧪 مشاكل الاختبارات

### 1. فشل الاختبارات

#### المشكلة: اختبارات Supabase تفشل
```
Error: Supabase is not available
```

**الحل:**
1. تأكد من تفعيل Supabase في البيئة:
   ```env
   VITE_ENABLE_SUPABASE=true
   ```
2. تحقق من متغيرات البيئة للاختبارات
3. استخدم بيانات وهمية للاختبارات إذا لزم الأمر

#### المشكلة: اختبارات بطيئة
```
Timeout: Test exceeded 5000ms
```

**الحل:**
1. زيادة مهلة الاختبارات:
   ```javascript
   // في ملف الاختبار
   it('should work', async () => {
     // test code
   }, 10000); // 10 seconds timeout
   ```
2. استخدام mock data للاختبارات السريعة

---

## 🚀 مشاكل الأداء

### 1. بطء في تحميل البيانات

#### المشكلة: استعلامات بطيئة
```
Warning: Query took 3000ms to complete
```

**الحل:**
1. إضافة فهارس للأعمدة المستخدمة في البحث:
   ```sql
   CREATE INDEX idx_content_status ON content(status);
   ```
2. تحسين الاستعلامات:
   ```javascript
   // بدلاً من
   const data = await supabase.from('content').select('*');
   
   // استخدم
   const data = await supabase
     .from('content')
     .select('id, title, excerpt')
     .limit(10);
   ```

### 2. استهلاك عالي للذاكرة

#### المشكلة: تحميل بيانات كثيرة
```
Warning: Large dataset detected
```

**الحل:**
1. استخدام pagination:
   ```javascript
   const { data, error } = await supabase
     .from('content')
     .select('*')
     .range(0, 9); // أول 10 سجلات
   ```
2. تحميل البيانات عند الحاجة (lazy loading)

---

## 🔍 أدوات التشخيص

### 1. فحص حالة النظام

```javascript
// في console المتصفح
import('./src/utils/connectionTester.js').then(async (module) => {
  const result = await module.default.runTest();
  console.log('System Status:', result);
});
```

### 2. فحص قاعدة البيانات

```javascript
// في console المتصفح
import('./src/utils/databaseChecker.js').then(async (module) => {
  const result = await module.default.check();
  console.log('Database Status:', result);
});
```

### 3. فحص الترحيل

```javascript
// في console المتصفح
import('./src/utils/dataMigration.js').then((module) => {
  const status = module.default.getStatus();
  console.log('Migration Status:', status);
});
```

---

## 📞 الحصول على المساعدة

### إذا لم تجد الحل هنا:

1. **تحقق من الوثائق:**
   - [دليل إعداد Supabase](./SUPABASE_SETUP_GUIDE.md)
   - [دليل إعداد قاعدة البيانات](./DATABASE_SETUP_GUIDE.md)

2. **تشغيل التشخيص الشامل:**
   ```bash
   npm run test:run src/tests/system-integration.test.js
   ```

3. **التواصل مع الدعم:**
   - 📧 dev-support@sapsa.org
   - 📱 +966-11-xxx-xxxx

4. **الموارد الخارجية:**
   - [Supabase Documentation](https://supabase.com/docs)
   - [Supabase Discord](https://discord.supabase.com)

---

## 📝 تسجيل المشاكل

عند الإبلاغ عن مشكلة، يرجى تضمين:

1. **وصف المشكلة**
2. **خطوات إعادة الإنتاج**
3. **رسائل الخطأ الكاملة**
4. **معلومات البيئة:**
   ```bash
   node --version
   npm --version
   # متصفح ونظام التشغيل
   ```
5. **نتائج التشخيص**

---

**💡 نصيحة: احتفظ بهذا الدليل مرجعاً سريعاً لحل المشاكل الشائعة!**
