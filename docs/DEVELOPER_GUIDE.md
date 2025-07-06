# دليل المطور - الجمعية السعودية للعلوم السياسية
# Developer Guide - Saudi Political Science Association

## 🎯 نظرة عامة للمطورين

هذا الدليل مخصص للمطورين الذين يريدون فهم بنية النظام والمساهمة في تطويره.

---

## 🏗️ معمارية النظام

### البنية العامة

```
Frontend (React) ↔ Supabase (PostgreSQL + Auth + Storage)
```

### المكونات الرئيسية

1. **Frontend Layer**
   - React 18 مع Hooks
   - Material-UI للواجهة
   - Redux Toolkit لإدارة الحالة
   - React Router للتوجيه

2. **Backend Layer**
   - Supabase PostgreSQL
   - Row Level Security (RLS)
   - Real-time subscriptions
   - File storage

3. **Integration Layer**
   - خدمات API مخصصة
   - أدوات الترحيل
   - أدوات المراقبة والتشخيص

---

## 📁 بنية الكود

### تنظيم المجلدات

```
src/
├── components/          # مكونات React
│   ├── ui/             # مكونات واجهة أساسية
│   ├── forms/          # مكونات النماذج
│   ├── admin/          # مكونات الإدارة
│   └── dashboard/      # مكونات لوحة التحكم
├── pages/              # صفحات التطبيق
├── services/           # خدمات API
├── utils/              # أدوات مساعدة
├── hooks/              # خطافات مخصصة
├── context/            # سياقات React
└── tests/              # اختبارات
```

### معايير التسمية

- **المكونات:** PascalCase (مثل `UserProfile.jsx`)
- **الخدمات:** camelCase (مثل `userService.js`)
- **الأدوات:** camelCase (مثل `dateUtils.js`)
- **الثوابت:** UPPER_SNAKE_CASE (مثل `API_ENDPOINTS`)

---

## 🔧 خدمات النظام

### 1. خدمة Supabase (`supabaseService.js`)

```javascript
// الاستخدام الأساسي
import supabaseService from '../services/supabaseService.js';

// اختبار الاتصال
const isConnected = await supabaseService.testConnection();

// عمليات قاعدة البيانات
const users = await supabaseService.db.select('users', {
  filters: [{ column: 'is_active', operator: 'eq', value: true }],
  limit: 10
});

// المصادقة
const user = await supabaseService.signIn(email, password);
const currentUser = await supabaseService.getCurrentUser();
```

### 2. خدمة المحتوى (`contentService.js`)

```javascript
import contentService from '../services/contentService.js';

// الحصول على المحتوى
const articles = await contentService.getAll();
const article = await contentService.getById(id);

// البحث
const results = await contentService.search('keyword');

// إدارة المحتوى
const newArticle = await contentService.create(articleData);
const updated = await contentService.update(id, updateData);
```

### 3. خدمة الواجهة الخلفية (`backendService.js`)

```javascript
import backendService from '../services/backendService.js';

// تهيئة الخدمة
const status = await backendService.initialize();

// التحقق من الحالة
const isOnline = backendService.isOnline();
```

---

## 🛠️ أدوات التطوير

### 1. أداة ترحيل البيانات

```javascript
import dataMigration from '../utils/dataMigration.js';

// بدء الترحيل
const result = await dataMigration.migrate();

// مراقبة التقدم
const status = dataMigration.getStatus();
console.log(`Progress: ${status.progress}%`);

// التحقق من النتائج
const verification = await dataMigration.verify();
```

### 2. أداة فحص قاعدة البيانات

```javascript
import databaseChecker from '../utils/databaseChecker.js';

// فحص شامل
const check = await databaseChecker.check();
console.log(`Database Score: ${check.results.overall.score}/100`);

// تقرير مفصل
const report = await databaseChecker.generateReport();
```

### 3. أداة اختبار الاتصال

```javascript
import connectionTester from '../utils/connectionTester.js';

// اختبار شامل
const test = await connectionTester.runTest();
console.log(`System Ready: ${test.ready}`);

// فحص سريع
const quickStatus = await connectionTester.getStatus();
```

---

## 🗄️ العمل مع قاعدة البيانات

### استعلامات أساسية

```javascript
// SELECT
const data = await supabaseService.db.select('table_name', {
  filters: [
    { column: 'status', operator: 'eq', value: 'active' },
    { column: 'created_at', operator: 'gte', value: '2024-01-01' }
  ],
  orderBy: [{ column: 'created_at', ascending: false }],
  limit: 20
});

// INSERT
const newRecord = await supabaseService.db.insert('table_name', {
  name: 'Test',
  status: 'active'
});

// UPDATE
const updated = await supabaseService.db.update('table_name', 
  { status: 'inactive' },
  [{ column: 'id', operator: 'eq', value: recordId }]
);

// DELETE
const deleted = await supabaseService.db.delete('table_name',
  [{ column: 'id', operator: 'eq', value: recordId }]
);
```

### استعلامات متقدمة

```javascript
// البحث النصي
const searchResults = await supabaseService.client()
  .from('content')
  .select('*')
  .textSearch('title', 'politics', { type: 'websearch' });

// الانضمام للجداول
const contentWithCategories = await supabaseService.client()
  .from('content')
  .select(`
    *,
    categories (
      id,
      name
    )
  `);

// التجميع والإحصائيات
const stats = await supabaseService.client()
  .from('content')
  .select('status')
  .eq('type', 'article');
```

---

## 🔐 إدارة الأمان

### Row Level Security (RLS)

```sql
-- مثال: سياسة للمحتوى
CREATE POLICY "Users can view published content" ON content
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can manage own content" ON content
    FOR ALL USING (auth.uid() = author_id);
```

### التحقق من الصلاحيات

```javascript
// في المكونات
const { user } = useAuth();
const canEdit = user?.role === 'admin' || user?.id === content.author_id;

// في الخدمات
const hasPermission = (user, action, resource) => {
  const permissions = {
    admin: ['*'],
    staff: ['content.read', 'content.write', 'events.manage'],
    member: ['content.read', 'profile.edit']
  };
  
  return permissions[user.role]?.includes(action) || 
         permissions[user.role]?.includes('*');
};
```

---

## 🧪 الاختبارات

### اختبارات الوحدة

```javascript
// مثال: اختبار خدمة المحتوى
import { describe, it, expect } from 'vitest';
import contentService from '../services/contentService.js';

describe('Content Service', () => {
  it('should fetch all content', async () => {
    const content = await contentService.getAll();
    expect(Array.isArray(content)).toBe(true);
  });

  it('should search content', async () => {
    const results = await contentService.search('test');
    expect(Array.isArray(results)).toBe(true);
  });
});
```

### اختبارات التكامل

```javascript
// مثال: اختبار تكامل Supabase
import { describe, it, expect } from 'vitest';
import supabaseService from '../services/supabaseService.js';

describe('Supabase Integration', () => {
  it('should connect to database', async () => {
    const result = await supabaseService.testConnection();
    expect(result.success).toBe(true);
  });

  it('should handle CRUD operations', async () => {
    // اختبار العمليات الأساسية
    const testData = { name: 'Test', status: 'active' };
    
    // إنشاء
    const created = await supabaseService.db.insert('test_table', testData);
    expect(created.success).toBe(true);
    
    // قراءة
    const read = await supabaseService.db.select('test_table', {
      filters: [{ column: 'id', operator: 'eq', value: created.data.id }]
    });
    expect(read.success).toBe(true);
    
    // تحديث
    const updated = await supabaseService.db.update('test_table',
      { status: 'inactive' },
      [{ column: 'id', operator: 'eq', value: created.data.id }]
    );
    expect(updated.success).toBe(true);
    
    // حذف
    const deleted = await supabaseService.db.delete('test_table',
      [{ column: 'id', operator: 'eq', value: created.data.id }]
    );
    expect(deleted.success).toBe(true);
  });
});
```

---

## 🚀 أفضل الممارسات

### 1. إدارة الحالة

```javascript
// استخدام Redux Toolkit
import { createSlice } from '@reduxjs/toolkit';

const contentSlice = createSlice({
  name: 'content',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setContent: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});
```

### 2. معالجة الأخطاء

```javascript
// في الخدمات
const handleApiCall = async (apiCall) => {
  try {
    const result = await apiCall();
    return { success: true, data: result };
  } catch (error) {
    console.error('API Error:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    };
  }
};

// في المكونات
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await contentService.getAll();
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 3. تحسين الأداء

```javascript
// استخدام React.memo للمكونات
const ContentCard = React.memo(({ content }) => {
  return (
    <div>
      <h3>{content.title}</h3>
      <p>{content.excerpt}</p>
    </div>
  );
});

// استخدام useMemo للحسابات المعقدة
const filteredContent = useMemo(() => {
  return content.filter(item => 
    item.status === 'published' && 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [content, searchTerm]);

// استخدام useCallback للدوال
const handleSearch = useCallback((term) => {
  setSearchTerm(term);
}, []);
```

---

## 📦 إضافة ميزات جديدة

### 1. إنشاء مكون جديد

```javascript
// src/components/NewComponent.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const NewComponent = ({ title, children }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
    </Box>
  );
};

export default NewComponent;
```

### 2. إنشاء خدمة جديدة

```javascript
// src/services/newService.js
import supabaseService from './supabaseService.js';

class NewService {
  async getData() {
    return await supabaseService.db.select('new_table');
  }

  async createData(data) {
    return await supabaseService.db.insert('new_table', data);
  }
}

export default new NewService();
```

### 3. إضافة صفحة جديدة

```javascript
// src/pages/NewPage.jsx
import React from 'react';
import { Container, Typography } from '@mui/material';

const NewPage = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        صفحة جديدة
      </Typography>
      {/* محتوى الصفحة */}
    </Container>
  );
};

export default NewPage;
```

---

## 🔄 عملية التطوير

### 1. إعداد بيئة التطوير

```bash
# استنساخ المشروع
git clone <repository-url>
cd spsa1

# تثبيت التبعيات
npm install

# إعداد متغيرات البيئة
cp .env.example .env.development

# تشغيل خادم التطوير
npm run dev
```

### 2. سير العمل

1. **إنشاء فرع جديد:**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **التطوير والاختبار:**
   ```bash
   npm run test
   npm run lint
   ```

3. **Commit والدفع:**
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

4. **إنشاء Pull Request**

### 3. معايير الكود

- استخدام ESLint و Prettier
- كتابة اختبارات للميزات الجديدة
- توثيق الكود بالتعليقات
- اتباع معايير التسمية المحددة

---

## 📚 موارد إضافية

### الوثائق الداخلية
- [دليل إعداد Supabase](./SUPABASE_SETUP_GUIDE.md)
- [دليل إعداد قاعدة البيانات](./DATABASE_SETUP_GUIDE.md)
- [دليل استكشاف الأخطاء](./TROUBLESHOOTING.md)

### الموارد الخارجية
- [React Documentation](https://react.dev)
- [Material-UI Documentation](https://mui.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)

### أدوات التطوير
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

---

## 📞 الدعم للمطورين

### للحصول على المساعدة:
- 📧 **البريد الإلكتروني:** dev-support@sapsa.org
- 💬 **Discord:** [رابط الخادم]
- 📚 **Wiki:** [رابط الويكي الداخلي]

### المساهمة:
- 🐛 [الإبلاغ عن الأخطاء](https://github.com/sapsa/issues)
- 💡 [اقتراح ميزات](https://github.com/sapsa/feature-requests)
- 📖 [تحسين الوثائق](https://github.com/sapsa/docs)

---

**🚀 مرحباً بك في فريق تطوير الجمعية السعودية للعلوم السياسية!**
