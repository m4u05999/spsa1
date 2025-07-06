# دليل أمان Supabase
# Supabase Security Guide

## 🔒 إعدادات الأمان الأساسية

### 1. إعدادات المصادقة (Authentication)

#### تكوين مقدمي الخدمة:
```sql
-- تمكين مقدمي خدمة آمنين فقط
-- Enable only secure providers
UPDATE auth.providers 
SET enabled = false 
WHERE name NOT IN ('email', 'google', 'github');
```

#### إعدادات كلمة المرور:
```json
{
  "password_min_length": 8,
  "password_require_uppercase": true,
  "password_require_lowercase": true,
  "password_require_numbers": true,
  "password_require_special_chars": true
}
```

### 2. Row Level Security (RLS)

#### تمكين RLS على جميع الجداول:
```sql
-- تمكين RLS على جدول المستخدمين
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- سياسة للمستخدمين لرؤية بياناتهم فقط
CREATE POLICY "Users can view own data" ON public.users
FOR SELECT USING (auth.uid() = id);

-- سياسة لتحديث البيانات الشخصية
CREATE POLICY "Users can update own data" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- سياسة للمحتوى العام
CREATE POLICY "Public content is viewable by all" ON public.content
FOR SELECT USING (status = 'published');

-- سياسة للمحتوى المحمي
CREATE POLICY "Protected content for members only" ON public.content
FOR SELECT USING (
  status = 'published' AND 
  (visibility = 'public' OR 
   (visibility = 'members' AND auth.role() = 'authenticated'))
);
```

### 3. إعدادات قاعدة البيانات

#### إنشاء أدوار آمنة:
```sql
-- إنشاء دور للقراءة فقط
CREATE ROLE readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- إنشاء دور للمحررين
CREATE ROLE editor_user;
GRANT readonly_user TO editor_user;
GRANT INSERT, UPDATE ON public.content TO editor_user;
GRANT INSERT, UPDATE ON public.events TO editor_user;

-- إنشاء دور للمديرين
CREATE ROLE admin_user;
GRANT editor_user TO admin_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_user;
```

### 4. إعدادات API

#### تحديد معدل الطلبات:
```json
{
  "rate_limits": {
    "anonymous": {
      "requests_per_minute": 60,
      "requests_per_hour": 1000
    },
    "authenticated": {
      "requests_per_minute": 300,
      "requests_per_hour": 10000
    }
  }
}
```

## 🛡️ أفضل الممارسات الأمنية

### 1. إدارة المفاتيح

#### مفاتيح البيئة:
- **SUPABASE_URL**: عام - يمكن كشفه
- **SUPABASE_ANON_KEY**: عام - محدود الصلاحيات
- **SUPABASE_SERVICE_KEY**: سري - للخادم فقط

#### تدوير المفاتيح:
```bash
# تدوير مفتاح الخدمة كل 90 يوم
# Rotate service key every 90 days
```

### 2. مراقبة الأمان

#### تسجيل الأحداث الأمنية:
```sql
-- إنشاء جدول لتسجيل الأحداث الأمنية
CREATE TABLE security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تمكين RLS على جدول الأمان
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- سياسة للمديرين فقط
CREATE POLICY "Only admins can view security logs" ON security_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 3. النسخ الاحتياطي والاستعادة

#### إعدادات النسخ الاحتياطي:
```json
{
  "backup_schedule": "daily",
  "retention_period": "30_days",
  "encryption": "enabled",
  "point_in_time_recovery": "enabled"
}
```

## 🔧 إعدادات الإنتاج

### 1. متغيرات البيئة الآمنة

```bash
# Production Environment Variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_KEY=your_production_service_key

# Security Settings
SUPABASE_JWT_SECRET=your_jwt_secret
SUPABASE_DB_PASSWORD=strong_database_password
```

### 2. إعدادات الشبكة

#### قائمة IP المسموحة:
```json
{
  "allowed_ips": [
    "your.server.ip.address",
    "your.cdn.ip.range"
  ],
  "blocked_countries": ["CN", "RU"],
  "enable_ddos_protection": true
}
```

### 3. إعدادات SSL/TLS

```json
{
  "ssl_enforcement": "required",
  "tls_version": "1.3",
  "certificate_transparency": "enabled",
  "hsts_enabled": true
}
```

## 📊 مراقبة الأمان

### 1. تنبيهات الأمان

```sql
-- إنشاء دالة للتنبيه من محاولات الدخول المشبوهة
CREATE OR REPLACE FUNCTION notify_suspicious_login()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.failed_attempts > 5 THEN
    INSERT INTO security_alerts (
      alert_type,
      user_id,
      details,
      severity
    ) VALUES (
      'suspicious_login',
      NEW.user_id,
      jsonb_build_object(
        'failed_attempts', NEW.failed_attempts,
        'ip_address', NEW.ip_address,
        'timestamp', NOW()
      ),
      'high'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. تقارير الأمان

```sql
-- تقرير محاولات الدخول الفاشلة
SELECT 
  user_id,
  ip_address,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_attempt
FROM auth.audit_log_entries
WHERE event_type = 'login_failed'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, ip_address
HAVING COUNT(*) > 3
ORDER BY failed_attempts DESC;
```

## 🚨 خطة الاستجابة للحوادث

### 1. اكتشاف التهديد

- مراقبة محاولات الدخول المشبوهة
- تتبع الاستعلامات غير العادية
- مراقبة استخدام الموارد

### 2. الاستجابة الفورية

```sql
-- حظر مستخدم مشبوه
UPDATE auth.users 
SET banned_until = NOW() + INTERVAL '24 hours'
WHERE id = 'suspicious_user_id';

-- إلغاء جميع جلسات المستخدم
DELETE FROM auth.sessions 
WHERE user_id = 'suspicious_user_id';
```

### 3. التحقيق والتعافي

- تحليل سجلات الأمان
- تقييم الأضرار
- استعادة البيانات إذا لزم الأمر
- تحديث إجراءات الأمان

## ✅ قائمة مراجعة الأمان

### إعدادات أساسية:
- [ ] تمكين RLS على جميع الجداول
- [ ] إعداد سياسات الأمان المناسبة
- [ ] تكوين مقدمي المصادقة الآمنين
- [ ] تعيين كلمات مرور قوية

### مراقبة:
- [ ] إعداد تسجيل الأحداث الأمنية
- [ ] تكوين التنبيهات
- [ ] مراجعة السجلات بانتظام

### النسخ الاحتياطي:
- [ ] تمكين النسخ الاحتياطي التلقائي
- [ ] اختبار استعادة البيانات
- [ ] تشفير النسخ الاحتياطية

### الشبكة:
- [ ] تكوين قائمة IP المسموحة
- [ ] تمكين حماية DDoS
- [ ] إعداد SSL/TLS

---

**ملاحظة**: يجب مراجعة وتحديث إعدادات الأمان بانتظام وفقاً لأحدث التهديدات والممارسات الأمنية.
