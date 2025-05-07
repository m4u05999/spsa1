# التفاصيل التقنية للمشروع

## هيكل قاعدة البيانات

### 1. جدول المستخدمين (users)
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member', 'guest') DEFAULT 'guest',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 2. جدول العضوية (memberships)
```sql
CREATE TABLE memberships (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    status ENUM('pending', 'active', 'expired', 'rejected'),
    membership_type ENUM('student', 'professional', 'honorary'),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. جدول المنشورات (publications)
```sql
CREATE TABLE publications (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    author_id VARCHAR(36) REFERENCES users(id),
    status ENUM('draft', 'published', 'archived'),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## إعدادات النظام

### 1. متغيرات البيئة (.env)
```env
NODE_ENV=production
PORT=3000
API_URL=https://api.political-science-assoc.com
DB_HOST=localhost
DB_PORT=5432
DB_NAME=psa_db
DB_USER=psa_user
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 2. إعدادات Nginx
```nginx
server {
    listen 80;
    server_name political-science-assoc.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## تفاصيل النشر

### 1. متطلبات النظام
- Node.js v16 أو أحدث
- PostgreSQL v13 أو أحدث
- Nginx
- PM2 لإدارة العمليات

### 2. خطوات النشر
1. تحديث الكود من Git
```bash
git pull origin main
```

2. تثبيت التبعيات
```bash
npm install --production
```

3. بناء التطبيق
```bash
npm run build
```

4. إعادة تشغيل التطبيق
```bash
pm2 restart psa-app
```

### 3. عمليات النسخ الاحتياطي
- نسخ احتياطي يومي لقاعدة البيانات
- نسخ احتياطي أسبوعي للملفات المرفوعة
- حفظ النسخ الاحتياطية لمدة 30 يوم

### 4. مراقبة الأداء
- استخدام PM2 لمراقبة أداء التطبيق
- Nginx access logs لتتبع الطلبات
- إعداد تنبيهات عند حدوث أخطاء

## أمان النظام

### 1. إجراءات الأمان
- استخدام HTTPS
- تشفير كلمات المرور
- حماية من هجمات CSRF
- تحديد معدل الطلبات

### 2. سياسات النسخ الاحتياطي
- نسخ احتياطي تلقائي يومي
- تشفير النسخ الاحتياطية
- حفظ النسخ في موقع منفصل

## الصيانة والتحديث

### 1. جدول الصيانة
- تحديثات أمنية شهرية
- تحديث المكتبات كل 3 أشهر
- مراجعة الأداء أسبوعياً

### 2. إجراءات التحديث
1. إنشاء نسخة احتياطية
2. تثبيت التحديثات في بيئة الاختبار
3. اختبار الوظائف الأساسية
4. نشر التحديثات في البيئة الإنتاجية