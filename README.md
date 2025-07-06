# الجمعية السعودية للعلوم السياسية
# Saudi Association for Political Science

مشروع تطبيق ويب شامل للجمعية السعودية للعلوم السياسية، مبني بتقنيات React الحديثة ومتكامل مع قاعدة بيانات Supabase.

A comprehensive web application for the Saudi Association for Political Science, built with modern React technologies and integrated with Supabase database.

## 🚀 الميزات الرئيسية | Key Features

- **واجهة مستخدم حديثة** مع Material-UI وTailwind CSS | Modern UI with Material-UI and Tailwind CSS
- **قاعدة بيانات Supabase** قوية وقابلة للتوسع | Powerful and scalable Supabase database
- **نظام إدارة محتوى متقدم** للمقالات والأخبار والفعاليات | Advanced content management system
- **لوحة تحكم إدارية شاملة** لإدارة النظام | Comprehensive administrative dashboard
- **نظام عضوية متكامل** مع أنواع عضوية متعددة | Integrated membership system
- **إدارة الفعاليات والمؤتمرات** مع نظام تسجيل | Events and conferences management
- **مكتبة رقمية** للمنشورات والأبحاث | Digital library for publications and research
- **نظام أمان متقدم** مع Row Level Security (RLS) | Advanced security with RLS
- **أداة ترحيل البيانات** من التخزين المحلي إلى Supabase | Data migration tool
- **تصميم متجاوب** يعمل على جميع الأجهزة | Responsive design for all devices
- **دعم اللغة العربية** بالكامل مع RTL | Full Arabic language support with RTL
- **نظام إشعارات ذكي** للتحديثات المهمة | Smart notification system

## 🛠️ التقنيات المستخدمة | Tech Stack

### Frontend
- React 18 with Hooks
- Vite (Build Tool)
- Material-UI (MUI) v5
- Tailwind CSS
- React Router DOM v6
- Redux Toolkit (State Management)

### Backend & Database
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Real-time subscriptions
- File storage and management

### Development Tools
- Vitest (Testing)
- ESLint & Prettier
- Docker support
- GitHub Actions (CI/CD)

## 📋 المتطلبات | Prerequisites

قبل البدء، تأكد من تثبيت:
Before you begin, ensure you have installed:

- Node.js (v18 or higher)
- npm or pnpm (v7 or higher)
- Git

## 🚀 التثبيت والإعداد | Installation & Setup

### الإعداد الأساسي | Standard Setup

1. **استنساخ المستودع | Clone the repository:**
```bash
git clone <repository-url>
cd spsa1
```

2. **تثبيت التبعيات | Install dependencies:**
```bash
npm install
# أو | or
pnpm install
```

3. **إعداد متغيرات البيئة | Setup environment variables:**
```bash
cp .env.example .env.development
# قم بتحديث القيم في .env.development
# Update values in .env.development
```

4. **تشغيل خادم التطوير | Start development server:**
```bash
npm run dev
# أو | or
pnpm run dev
```

5. **بناء للإنتاج | Build for production:**
```bash
npm run build
# أو | or
pnpm run build
```

### إعداد Supabase | Supabase Setup

1. **إنشاء مشروع Supabase:**
   - زيارة [supabase.com](https://supabase.com)
   - إنشاء مشروع جديد
   - نسخ URL والمفاتيح

2. **تحديث متغيرات البيئة:**
```env
VITE_SUPABASE_URL=https://dufvobubfjicrkygwyll.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENABLE_SUPABASE=true
```

3. **إعداد قاعدة البيانات:**
   - تنفيذ `database/schema.sql`
   - تنفيذ `database/rls_policies.sql`
   - تنفيذ `database/seed_data.sql`

### إعداد Docker | Docker Setup

```bash
# باستخدام Docker Compose | Using Docker Compose
docker-compose up --build

# أو باستخدام Docker مباشرة | Or using Docker directly
docker build -t spsa-app .
docker run -p 5173:5173 spsa-app
```

التطبيق سيكون متاحاً على | The application will be available at:
**http://localhost:5173**

## 📁 هيكل المشروع | Project Structure

```
spsa1/
├── 📁 src/
│   ├── 📁 components/          # مكونات React القابلة لإعادة الاستخدام
│   │   ├── 📁 admin/          # مكونات لوحة الإدارة
│   │   ├── 📁 dashboard/      # مكونات لوحة التحكم
│   │   ├── 📁 ui/             # مكونات واجهة المستخدم الأساسية
│   │   └── 📁 forms/          # مكونات النماذج
│   ├── 📁 pages/              # صفحات التطبيق
│   │   ├── 📁 admin/          # صفحات الإدارة
│   │   ├── 📁 dashboard/      # صفحات لوحة التحكم
│   │   ├── 📁 auth/           # صفحات المصادقة
│   │   └── 📁 public/         # الصفحات العامة
│   ├── 📁 services/           # خدمات API والبيانات
│   │   ├── 📄 supabaseService.js    # خدمة Supabase الرئيسية
│   │   ├── 📄 contentService.js     # خدمة إدارة المحتوى
│   │   └── 📄 backendService.js     # خدمة الواجهة الخلفية
│   ├── 📁 utils/              # أدوات مساعدة
│   │   ├── 📄 dataMigration.js      # أداة ترحيل البيانات
│   │   ├── 📄 databaseChecker.js    # أداة فحص قاعدة البيانات
│   │   └── 📄 connectionTester.js   # أداة اختبار الاتصال
│   ├── 📁 context/            # سياقات React
│   ├── 📁 hooks/              # خطافات مخصصة
│   └── 📁 tests/              # اختبارات الوحدة والتكامل
├── 📁 database/               # ملفات قاعدة البيانات
│   ├── 📄 schema.sql          # مخطط قاعدة البيانات
│   ├── 📄 rls_policies.sql    # سياسات الأمان
│   └── 📄 seed_data.sql       # البيانات الأولية
├── 📁 docs/                   # الوثائق
│   ├── 📄 SUPABASE_SETUP_GUIDE.md
│   ├── 📄 DATABASE_SETUP_GUIDE.md
│   └── 📄 SUPABASE_IMPLEMENTATION_GUIDE.md
└── 📁 public/                 # الملفات العامة
```

## 🧪 الاختبارات | Testing

```bash
# تشغيل جميع الاختبارات | Run all tests
npm run test

# تشغيل اختبارات محددة | Run specific tests
npm run test:run src/tests/supabase-integration.test.js
npm run test:run src/tests/system-integration.test.js

# تشغيل الاختبارات مع المراقبة | Run tests in watch mode
npm run test:watch

# تقرير التغطية | Coverage report
npm run test:coverage
```

## 🔧 الأوامر المتاحة | Available Scripts

| الأمر | الوصف | Command | Description |
|-------|--------|---------|-------------|
| `npm run dev` | تشغيل خادم التطوير | Start development server |
| `npm run build` | بناء للإنتاج | Build for production |
| `npm run preview` | معاينة البناء | Preview production build |
| `npm run test` | تشغيل الاختبارات | Run tests |
| `npm run lint` | فحص الكود | Lint code |
| `npm run format` | تنسيق الكود | Format code |

## 🗄️ قاعدة البيانات | Database

### الجداول الرئيسية | Main Tables

- **users** - بيانات المستخدمين والأعضاء
- **content** - المقالات والأخبار والمحتوى
- **categories** - فئات المحتوى
- **tags** - العلامات والكلمات المفتاحية
- **events** - الفعاليات والمؤتمرات
- **memberships** - عضويات الجمعية
- **inquiries** - الاستفسارات والرسائل

### الميزات المتقدمة | Advanced Features

- **Row Level Security (RLS)** - أمان على مستوى الصف
- **Real-time subscriptions** - اشتراكات الوقت الفعلي
- **Full-text search** - البحث النصي الكامل
- **Automatic backups** - النسخ الاحتياطية التلقائية

## 🔐 الأمان | Security

- **Row Level Security** على جميع الجداول
- **تشفير البيانات** الحساسة
- **مصادقة متعددة العوامل** (اختياري)
- **سجلات العمليات** لجميع الإجراءات المهمة
- **حماية CSRF** و **XSS**

## 📱 الاستجابة | Responsiveness

التطبيق مُحسن للعمل على:
- 🖥️ أجهزة الكمبيوتر المكتبية
- 💻 أجهزة الكمبيوتر المحمولة
- 📱 الهواتف الذكية
- 📟 الأجهزة اللوحية

## 🌐 دعم اللغات | Language Support

- **العربية** - اللغة الأساسية مع دعم RTL كامل
- **الإنجليزية** - لغة ثانوية للمحتوى الدولي

## 🚀 ترحيل البيانات | Data Migration

### الوصول لواجهة الترحيل | Access Migration Interface

1. **تسجيل الدخول كمدير:**
   ```
   البريد الإلكتروني: admin@sapsa.org
   كلمة المرور: [كما هو محدد في النظام]
   ```

2. **الانتقال لصفحة الترحيل:**
   ```
   /dashboard/admin/migration
   ```

3. **خطوات الترحيل:**
   - فحص حالة النظام
   - التحقق من الاتصال بـ Supabase
   - بدء عملية الترحيل
   - مراقبة التقدم
   - التحقق من النتائج

### أدوات الترحيل المتاحة | Available Migration Tools

```javascript
// فحص حالة النظام
import connectionTester from './src/utils/connectionTester.js';
const status = await connectionTester.runTest();

// ترحيل البيانات
import dataMigration from './src/utils/dataMigration.js';
const result = await dataMigration.migrate();

// فحص قاعدة البيانات
import databaseChecker from './src/utils/databaseChecker.js';
const check = await databaseChecker.check();
```

## 🔧 استكشاف الأخطاء | Troubleshooting

### مشاكل شائعة | Common Issues

#### 1. فشل الاتصال بـ Supabase
```bash
Error: getaddrinfo ENOTFOUND your-project.supabase.co
```
**الحل:** تحقق من `VITE_SUPABASE_URL` في `.env.development`

#### 2. خطأ في المفاتيح
```bash
Error: Invalid API key
```
**الحل:** تحقق من `VITE_SUPABASE_ANON_KEY`

#### 3. مشاكل RLS
```bash
Error: new row violates row-level security policy
```
**الحل:** تأكد من تنفيذ `database/rls_policies.sql`

#### 4. فشل الترحيل
```bash
Error: relation "table_name" does not exist
```
**الحل:** تنفيذ `database/schema.sql` أولاً

### أدوات التشخيص | Diagnostic Tools

```bash
# فحص شامل للنظام
npm run test:run src/tests/system-integration.test.js

# فحص تكامل Supabase
npm run test:run src/tests/supabase-integration.test.js

# فحص الاتصال
node -e "
import('./src/utils/connectionTester.js').then(async (module) => {
  const result = await module.default.runTest();
  console.log('System Status:', result);
});
"
```

## 📖 الوثائق الإضافية | Additional Documentation

- 📄 [دليل إعداد Supabase](./docs/SUPABASE_SETUP_GUIDE.md)
- 📄 [دليل إعداد قاعدة البيانات](./docs/DATABASE_SETUP_GUIDE.md)
- 📄 [دليل التنفيذ الشامل](./docs/SUPABASE_IMPLEMENTATION_GUIDE.md)
- 📄 [دليل استكشاف الأخطاء](./docs/TROUBLESHOOTING.md)
- 📄 [دليل المطور](./docs/DEVELOPER_GUIDE.md)

## 🤝 المساهمة | Contributing

1. **Fork المشروع**
2. **إنشاء فرع للميزة** (`git checkout -b feature/amazing-feature`)
3. **Commit التغييرات** (`git commit -m 'Add amazing feature'`)
4. **Push للفرع** (`git push origin feature/amazing-feature`)
5. **فتح Pull Request**

## 📄 الترخيص | License

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 الدعم والتواصل | Support & Contact

### الدعم الفني | Technical Support
- 📧 **البريد الإلكتروني:** dev-support@sapsa.org
- 📱 **الهاتف:** +966-11-xxx-xxxx
- 🌐 **الموقع:** https://sapsa.org

### روابط مهمة | Important Links
- 🏠 [الموقع الرسمي](https://sapsa.org)
- 📚 [الوثائق](./docs/)
- 🐛 [الإبلاغ عن مشكلة](https://github.com/sapsa/issues)
- 💡 [طلب ميزة](https://github.com/sapsa/feature-requests)

### وسائل التواصل الاجتماعي | Social Media
- 🐦 [تويتر](https://twitter.com/sapsa_org)
- 💼 [لينكد إن](https://linkedin.com/company/sapsa)
- 📺 [يوتيوب](https://youtube.com/c/sapsa)

---

## ✅ حالة المشروع | Project Status

**🎉 المشروع جاهز للاستخدام مع Supabase!**

### ما تم إنجازه | What's Completed
- ✅ تكامل كامل مع Supabase
- ✅ مخطط قاعدة البيانات (11 جدول)
- ✅ سياسات الأمان (RLS)
- ✅ أدوات الترحيل والفحص
- ✅ واجهة إدارة الترحيل
- ✅ اختبارات شاملة
- ✅ وثائق مفصلة

### الخطوات التالية | Next Steps
1. إنشاء مشروع Supabase حقيقي
2. تحديث متغيرات البيئة
3. تنفيذ مخطط قاعدة البيانات
4. ترحيل البيانات
5. اختبار النظام
6. النشر للإنتاج

---

**تم تطوير هذا المشروع بواسطة فريق تطوير الجمعية السعودية للعلوم السياسية 🇸🇦**
