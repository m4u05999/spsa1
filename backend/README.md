# SPSA Backend API

Backend API للجمعية السعودية للعلوم السياسية - متوافق مع قانون حماية البيانات الشخصية السعودي (PDPL)

## 🚀 البدء السريع

### المتطلبات الأساسية

- Node.js 18+ 
- PostgreSQL 13+
- Redis (اختياري للجلسات)

### التثبيت

1. **تثبيت التبعيات:**
```bash
cd backend
npm install
```

2. **إعداد قاعدة البيانات:**
```bash
# إنشاء قاعدة بيانات PostgreSQL
createdb spsa_db

# تنفيذ المخطط
psql -d spsa_db -f database/schema.sql
```

3. **إعداد متغيرات البيئة:**
```bash
cp .env.example .env
# قم بتحديث القيم في ملف .env
```

4. **تشغيل الخادم:**
```bash
# للتطوير
npm run dev

# للإنتاج
npm start
```

## 📁 هيكل المشروع

```
backend/
├── src/
│   ├── config/           # إعدادات التطبيق
│   ├── database/         # اتصال قاعدة البيانات
│   ├── middleware/       # Middleware functions
│   ├── routes/           # API routes
│   ├── utils/            # أدوات مساعدة
│   └── server.js         # نقطة دخول التطبيق
├── database/
│   └── schema.sql        # مخطط قاعدة البيانات
├── logs/                 # ملفات السجلات
└── tests/                # الاختبارات
```

## 🔐 الأمان والامتثال

### ميزات الأمان المطبقة

- **تشفير كلمات المرور:** bcrypt مع 12 rounds
- **JWT Authentication:** مع refresh tokens
- **Rate Limiting:** حماية من الهجمات
- **Input Validation:** تنظيف وتحقق من المدخلات
- **SQL Injection Protection:** استخدام parameterized queries
- **XSS Protection:** تنظيف HTML والـ scripts
- **CSRF Protection:** حماية من هجمات CSRF
- **Security Headers:** Helmet.js للحماية
- **Audit Logging:** تسجيل شامل لجميع العمليات

### الامتثال لـ PDPL

- **تخزين البيانات محلياً:** جميع البيانات مخزنة داخل السعودية
- **تشفير البيانات:** AES-256 للبيانات الحساسة
- **سجلات المراجعة:** تتبع جميع عمليات الوصول والتعديل
- **حقوق المستخدمين:** إمكانية الوصول والتصحيح والحذف
- **الموافقة:** تسجيل موافقة المستخدمين على معالجة البيانات

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
تسجيل دخول المستخدم

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "member"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": "24h"
  }
}
```

#### POST /api/auth/register
تسجيل مستخدم جديد

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "phone": "+966501234567",
  "specialization": "Political Science",
  "workplace": "University",
  "consentToDataProcessing": true
}
```

#### POST /api/auth/logout
تسجيل خروج المستخدم (يتطلب authentication)

#### GET /api/auth/me
الحصول على معلومات المستخدم الحالي (يتطلب authentication)

### User Management

#### GET /api/users
قائمة المستخدمين (يتطلب صلاحيات admin)

#### GET /api/users/:id
تفاصيل مستخدم محدد

#### PUT /api/users/:id
تحديث بيانات المستخدم

#### DELETE /api/users/:id
حذف المستخدم (يتطلب صلاحيات admin)

## 🧪 الاختبارات

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل الاختبارات مع التغطية
npm run test:coverage

# تشغيل اختبارات التكامل
npm run test:integration
```

## 📊 المراقبة والسجلات

### مستويات السجلات

- **error:** أخطاء النظام والتطبيق
- **warn:** تحذيرات وأحداث مشبوهة
- **info:** معلومات عامة عن العمليات
- **debug:** معلومات تفصيلية للتطوير

### أنواع السجلات

1. **Application Logs:** سجلات التطبيق العامة
2. **Security Logs:** سجلات الأمان والمصادقة
3. **Audit Logs:** سجلات المراجعة للامتثال
4. **Performance Logs:** سجلات الأداء

### مراقبة الأداء

```bash
# عرض إحصائيات قاعدة البيانات
curl http://localhost:3001/health

# عرض سجلات الأمان
npm run logs:security

# تقرير المراجعة
npm run logs:audit
```

## 🔧 التكوين

### متغيرات البيئة الأساسية

```env
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/spsa_db

# Security
JWT_SECRET=your-super-secure-jwt-secret-32-chars
SESSION_SECRET=your-session-secret-32-chars
ENCRYPTION_KEY=your-32-character-encryption-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### إعدادات الأمان

```env
# Security Headers
ENABLE_HELMET=true
ENABLE_HSTS=true
HSTS_MAX_AGE=31536000

# CORS
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# Audit
AUDIT_LOG_RETENTION_DAYS=2555  # 7 years for PDPL compliance
```

## 🚀 النشر

### إعداد الإنتاج

1. **تحديث متغيرات البيئة:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/spsa_prod
REDIS_URL=redis://prod_redis:6379
```

2. **بناء التطبيق:**
```bash
npm run build
```

3. **تشغيل في الإنتاج:**
```bash
npm start
```

### Docker

```bash
# بناء الصورة
docker build -t spsa-backend .

# تشغيل الحاوية
docker run -p 3001:3001 --env-file .env spsa-backend
```

## 🔍 استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ اتصال قاعدة البيانات:**
```bash
# تحقق من حالة PostgreSQL
pg_isready -h localhost -p 5432

# تحقق من صحة DATABASE_URL
echo $DATABASE_URL
```

2. **خطأ JWT:**
```bash
# تحقق من طول JWT_SECRET
echo ${#JWT_SECRET}  # يجب أن يكون 32 حرف على الأقل
```

3. **مشاكل الصلاحيات:**
```bash
# تحقق من دور المستخدم
psql -d spsa_db -c "SELECT email, role FROM users WHERE email = 'user@example.com';"
```

## 📞 الدعم

للحصول على المساعدة:

- 📧 Email: dev-support@sapsa.org
- 📚 Documentation: `/docs`
- 🐛 Issues: GitHub Issues

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

**تم تطوير هذا المشروع وفقاً لأعلى معايير الأمان والامتثال لقانون حماية البيانات الشخصية السعودي (PDPL) 🇸🇦**
