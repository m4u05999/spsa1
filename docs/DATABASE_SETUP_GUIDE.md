# دليل تكوين قاعدة البيانات - Supabase Database Setup
# الجمعية السعودية للعلوم السياسية

## 🎯 الهدف
تكوين قاعدة البيانات الكاملة للمشروع في Supabase مع جميع الجداول والعلاقات والسياسات الأمنية.

---

## 📋 الخطوة 1: تنفيذ مخطط قاعدة البيانات

### **1.1 الوصول لمحرر SQL:**
1. في Supabase Dashboard، انقر على "SQL Editor"
2. انقر على "New query" لإنشاء استعلام جديد

### **1.2 تنفيذ ملف المخطط الأساسي:**
```sql
-- انسخ والصق محتوى ملف database/schema.sql
-- أو قم بتحميل الملف مباشرة
```

**📁 الملف:** `database/schema.sql`

**⚠️ مهم:** تأكد من تنفيذ الملف بالكامل دون أخطاء.

### **1.3 التحقق من إنشاء الجداول:**
```sql
-- التحقق من الجداول المنشأة
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**✅ يجب أن تظهر الجداول التالية:**
- users
- categories  
- tags
- content
- content_tags
- events
- event_registrations
- memberships
- inquiries
- settings
- audit_logs

---

## 🔐 الخطوة 2: تطبيق سياسات الأمان (RLS)

### **2.1 تنفيذ سياسات RLS:**
```sql
-- انسخ والصق محتوى ملف database/rls_policies.sql
```

**📁 الملف:** `database/rls_policies.sql`

### **2.2 التحقق من تفعيل RLS:**
```sql
-- التحقق من تفعيل RLS على الجداول
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

### **2.3 التحقق من السياسات:**
```sql
-- عرض جميع السياسات المطبقة
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 📊 الخطوة 3: إدراج البيانات الأولية

### **3.1 تنفيذ البيانات الأولية:**
```sql
-- انسخ والصق محتوى ملف database/seed_data.sql
```

**📁 الملف:** `database/seed_data.sql`

### **3.2 التحقق من البيانات:**
```sql
-- التحقق من الفئات
SELECT id, name, slug FROM public.categories ORDER BY sort_order;

-- التحقق من العلامات
SELECT id, name, slug, usage_count FROM public.tags ORDER BY name;

-- التحقق من المحتوى
SELECT id, title, type, status FROM public.content ORDER BY created_at;

-- التحقق من الإعدادات
SELECT key, value, category FROM public.settings ORDER BY category, key;
```

---

## 🔧 الخطوة 4: إعداد المصادقة

### **4.1 إعداد جدول المستخدمين مع Auth:**
```sql
-- ربط جدول المستخدمين مع نظام المصادقة
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, membership_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'member',
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تطبيق الدالة عند إنشاء مستخدم جديد
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### **4.2 إعداد تحديث المستخدمين:**
```sql
-- دالة تحديث بيانات المستخدم
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    email = NEW.email,
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تطبيق الدالة عند تحديث المستخدم
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
```

---

## 📈 الخطوة 5: إعداد الفهارس للأداء

### **5.1 فهارس البحث:**
```sql
-- فهرس البحث النصي للمحتوى
CREATE INDEX IF NOT EXISTS idx_content_search 
ON public.content USING gin(
  to_tsvector('arabic', title || ' ' || COALESCE(content, ''))
);

-- فهرس البحث النصي للأحداث
CREATE INDEX IF NOT EXISTS idx_events_search 
ON public.events USING gin(
  to_tsvector('arabic', title || ' ' || COALESCE(description, ''))
);
```

### **5.2 فهارس الأداء:**
```sql
-- فهارس التواريخ
CREATE INDEX IF NOT EXISTS idx_content_published_date 
ON public.content(published_at DESC) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_events_date_range 
ON public.events(start_date, end_date);

-- فهارس الحالة
CREATE INDEX IF NOT EXISTS idx_users_active 
ON public.users(is_active, role) 
WHERE is_active = true;
```

---

## 🧪 الخطوة 6: اختبار قاعدة البيانات

### **6.1 اختبار العمليات الأساسية:**
```sql
-- اختبار إدراج فئة جديدة
INSERT INTO public.categories (name, slug, description) 
VALUES ('اختبار', 'test', 'فئة اختبار');

-- اختبار البحث
SELECT * FROM search_content('الديمقراطية');

-- اختبار العلاقات
SELECT c.title, cat.name as category, array_agg(t.name) as tags
FROM public.content c
LEFT JOIN public.categories cat ON c.category_id = cat.id
LEFT JOIN public.content_tags ct ON c.id = ct.content_id
LEFT JOIN public.tags t ON ct.tag_id = t.id
GROUP BY c.id, c.title, cat.name;
```

### **6.2 اختبار الأمان:**
```sql
-- اختبار RLS (يجب تنفيذه كمستخدم مصادق)
SELECT * FROM public.users; -- يجب أن يظهر المستخدم الحالي فقط
SELECT * FROM public.content WHERE status = 'published'; -- يجب أن يظهر المحتوى المنشور
```

---

## 📊 الخطوة 7: مراقبة الأداء

### **7.1 إعداد مراقبة الاستعلامات:**
```sql
-- تفعيل إحصائيات الاستعلامات
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### **7.2 استعلامات المراقبة:**
```sql
-- أبطأ الاستعلامات
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- حجم الجداول
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔄 الخطوة 8: النسخ الاحتياطي والاستعادة

### **8.1 إعداد النسخ الاحتياطي التلقائي:**
1. في Supabase Dashboard، انتقل إلى "Settings" > "Database"
2. في قسم "Backups"، تأكد من تفعيل النسخ الاحتياطي التلقائي

### **8.2 إنشاء نسخة احتياطية يدوية:**
```bash
# استخدام pg_dump (يتطلب تثبيت PostgreSQL محلياً)
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" > backup.sql
```

---

## ✅ قائمة التحقق النهائية

### **تأكد من إكمال جميع الخطوات:**
- [ ] تم إنشاء جميع الجداول (11 جدول)
- [ ] تم تفعيل RLS على جميع الجداول
- [ ] تم تطبيق جميع السياسات الأمنية
- [ ] تم إدراج البيانات الأولية
- [ ] تم ربط نظام المصادقة
- [ ] تم إنشاء الفهارس المطلوبة
- [ ] تم اختبار العمليات الأساسية
- [ ] تم اختبار الأمان
- [ ] تم إعداد المراقبة
- [ ] تم إعداد النسخ الاحتياطي

---

## 🚨 استكشاف الأخطاء

### **مشاكل شائعة وحلولها:**

#### **1. خطأ في إنشاء الجداول:**
```
ERROR: relation "table_name" already exists
```
**الحل:** تحقق من وجود الجداول مسبقاً أو استخدم `CREATE TABLE IF NOT EXISTS`

#### **2. خطأ في RLS:**
```
ERROR: new row violates row-level security policy
```
**الحل:** تحقق من السياسات المطبقة وتأكد من صحة الصلاحيات

#### **3. خطأ في الفهارس:**
```
ERROR: index "index_name" already exists
```
**الحل:** استخدم `CREATE INDEX IF NOT EXISTS`

#### **4. مشاكل الأداء:**
- تحقق من الفهارس المطلوبة
- راجع استعلامات pg_stat_statements
- تأكد من تحسين الاستعلامات

---

## 📞 الدعم والمساعدة

### **للحصول على مساعدة:**
- 📚 [Supabase Documentation](https://supabase.com/docs/guides/database)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 📧 **الدعم المحلي:** database-support@sapsa.org

---

**بعد إكمال هذه الخطوات، ستكون قاعدة البيانات جاهزة للاستخدام! 🎉**
