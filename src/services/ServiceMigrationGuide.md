# دليل ترحيل الخدمات إلى MasterDataService
# Service Migration Guide to MasterDataService

## 📋 نظرة عامة | Overview

تم إنشاء `MasterDataService.js` كخدمة موحدة لحل جميع مشاكل التضارب في إدارة البيانات. هذا الدليل يوضح كيفية ترحيل المكونات من الخدمات القديمة إلى الخدمة الجديدة.

## 🔄 الخدمات المستبدلة | Replaced Services

### الخدمات التي يجب استبدالها:
1. `contentService.js` ❌
2. `enhancedContentService.js` ❌  
3. `unifiedContentService.js` ❌
4. `contentApiService.js` ❌
5. `categoriesApiService.js` ❌
6. `userApiService.js` ❌ (جزئياً)
7. `dashboardStatsService.js` ❌ (جزئياً)

### الخدمة الجديدة:
- `MasterDataService.js` ✅

## 📝 أمثلة الترحيل | Migration Examples

### 1. استبدال contentService

#### قبل (Before):
```javascript
import { contentService } from '../services/contentService.js';

// Get content
const content = await contentService.getAll();
const news = await contentService.getByType('news');

// Create content
const newContent = await contentService.create(data);

// Update content
const updated = await contentService.update(id, data);
```

#### بعد (After):
```javascript
import MasterDataService from '../services/MasterDataService.js';

// Get content
const content = await MasterDataService.getContent('content');
const news = await MasterDataService.getContent('news');

// Create content
const newContent = await MasterDataService.createContent(data);

// Update content
const updated = await MasterDataService.updateContent(id, data);
```

### 2. استبدال enhancedContentService

#### قبل (Before):
```javascript
import { enhancedContentService } from '../services/enhancedContentService.js';

const content = await enhancedContentService.getEnhancedContent(filters);
```

#### بعد (After):
```javascript
import MasterDataService from '../services/MasterDataService.js';

const content = await MasterDataService.getContent('content', filters);
```

### 3. استبدال unifiedContentService

#### قبل (Before):
```javascript
import { unifiedContentService } from '../services/unifiedContentService.js';

const defaultContent = unifiedContentService.getDefaultContent();
```

#### بعد (After):
```javascript
import MasterDataService from '../services/MasterDataService.js';

// البيانات الافتراضية متوفرة تلقائياً في حالة عدم الاتصال
const content = await MasterDataService.getContent('content');
```

## 🎯 ترحيل المكونات | Component Migration

### 1. ترحيل NewsPage.jsx

#### قبل:
```javascript
import { useContent } from '../../contexts/ContentContext.jsx';

const { content, loading, error, loadContent } = useContent();
```

#### بعد:
```javascript
import { useState, useEffect } from 'react';
import MasterDataService from '../../services/MasterDataService.js';

const [content, setContent] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const loadNews = async () => {
    try {
      setLoading(true);
      const news = await MasterDataService.getContent('news', { 
        status: 'published',
        sortBy: 'published_at',
        sortOrder: 'desc'
      });
      setContent(news);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  loadNews();
}, []);
```

### 2. ترحيل ContentManagement.jsx

#### قبل:
```javascript
import { useContentManagement } from '../../hooks/useContentManagement.js';

const {
  selectedItems,
  performBulkAction,
  createFromTemplate
} = useContentManagement();
```

#### بعد:
```javascript
import { useState, useEffect } from 'react';
import MasterDataService from '../../services/MasterDataService.js';

const [content, setContent] = useState([]);
const [selectedItems, setSelectedItems] = useState([]);

// Create content
const createContent = async (data) => {
  const newContent = await MasterDataService.createContent(data);
  setContent(prev => [newContent, ...prev]);
};

// Update content
const updateContent = async (id, data) => {
  const updated = await MasterDataService.updateContent(id, data);
  setContent(prev => prev.map(item => 
    item.id === id ? updated : item
  ));
};

// Delete content
const deleteContent = async (id) => {
  await MasterDataService.deleteContent(id);
  setContent(prev => prev.filter(item => item.id !== id));
};
```

## 🔄 ترحيل Real-time Updates

### قبل:
```javascript
import { useRealtimeSync } from '../../hooks/useRealtimeSync.js';

const { isConnected, lastUpdate } = useRealtimeSync({
  autoConnect: true,
  onUpdate: handleUpdate
});
```

### بعد:
```javascript
import { useState, useEffect } from 'react';
import MasterDataService from '../../services/MasterDataService.js';

const [isConnected, setIsConnected] = useState(false);
const [lastUpdate, setLastUpdate] = useState(null);

useEffect(() => {
  // Subscribe to real-time updates
  const unsubscribeCreated = MasterDataService.subscribeToRealtime(
    'content_created', 
    (data) => {
      setLastUpdate({ type: 'created', data, timestamp: Date.now() });
      // Update local state
      setContent(prev => [data, ...prev]);
    }
  );

  const unsubscribeUpdated = MasterDataService.subscribeToRealtime(
    'content_updated',
    (data) => {
      setLastUpdate({ type: 'updated', data, timestamp: Date.now() });
      // Update local state
      setContent(prev => prev.map(item => 
        item.id === data.id ? data : item
      ));
    }
  );

  const unsubscribeDeleted = MasterDataService.subscribeToRealtime(
    'content_deleted',
    (data) => {
      setLastUpdate({ type: 'deleted', data, timestamp: Date.now() });
      // Update local state
      setContent(prev => prev.filter(item => item.id !== data.id));
    }
  );

  // Check connection status
  const status = MasterDataService.getStatus();
  setIsConnected(status.isOnline && status.hasSupabase);

  return () => {
    unsubscribeCreated();
    unsubscribeUpdated();
    unsubscribeDeleted();
  };
}, []);
```

## 📋 خطوات الترحيل | Migration Steps

### المرحلة 1: تحديث الواردات
1. استبدال جميع واردات الخدمات القديمة
2. استيراد `MasterDataService` بدلاً منها

### المرحلة 2: تحديث استدعاءات API
1. استبدال `getAll()` بـ `getContent('content')`
2. استبدال `getByType(type)` بـ `getContent(type)`
3. استبدال `create()` بـ `createContent()`
4. استبدال `update()` بـ `updateContent()`
5. استبدال `delete()` بـ `deleteContent()`

### المرحلة 3: تحديث Real-time
1. استبدال `useRealtimeSync` بـ `subscribeToRealtime`
2. تحديث معالجات الأحداث

### المرحلة 4: إزالة البيانات المُدمجة
1. حذف جميع `mockData` و `initialData`
2. الاعتماد على `MasterDataService` للبيانات البديلة

### المرحلة 5: اختبار وتحقق
1. اختبار جميع المكونات المحدثة
2. التحقق من عمل الـ caching
3. اختبار الوضع غير المتصل
4. اختبار Real-time updates

## ⚠️ ملاحظات مهمة | Important Notes

1. **التوافق مع الإصدارات السابقة**: الخدمة الجديدة متوافقة مع جميع أنواع المحتوى الموجودة
2. **الأداء**: تحسين كبير في الأداء بسبب الـ caching الذكي
3. **الوضع غير المتصل**: دعم كامل للعمل بدون اتصال إنترنت
4. **PDPL Compliance**: الخدمة متوافقة مع قانون حماية البيانات السعودي

## 🧪 اختبار الترحيل | Testing Migration

```javascript
// اختبار الخدمة الجديدة
import MasterDataService from '../services/MasterDataService.js';

// Test basic functionality
const testMasterDataService = async () => {
  try {
    // Test get content
    const content = await MasterDataService.getContent('content');
    console.log('✅ Get content works:', content.length);

    // Test create content
    const newContent = await MasterDataService.createContent({
      title: 'Test Content',
      contentType: 'article',
      content: 'Test content body'
    });
    console.log('✅ Create content works:', newContent.id);

    // Test real-time subscription
    const unsubscribe = MasterDataService.subscribeToRealtime(
      'content_created',
      (data) => console.log('✅ Real-time works:', data.id)
    );

    // Test service status
    const status = MasterDataService.getStatus();
    console.log('✅ Service status:', status);

    return true;
  } catch (error) {
    console.error('❌ Migration test failed:', error);
    return false;
  }
};

// Run test
testMasterDataService();
```
