# سكريبت الاختبار التلقائي - SPSA

## 🚀 تشغيل الاختبارات من Browser Console

افتح Developer Tools (F12) وانسخ والصق الأكواد التالية في Console:

### 1. الاختبار السريع (Quick Test)
```javascript
// اختبار سريع للتحقق من عمل النظام
window.quickTest().then(result => {
  console.log('🎯 نتيجة الاختبار السريع:', result);
  if (result.success) {
    console.log('✅ النظام يعمل بشكل صحيح!');
  } else {
    console.log('❌ هناك مشكلة في النظام:', result.error);
  }
});
```

### 2. اختبار لوحة المدير
```javascript
// اختبار البيانات المتاحة للوحة المدير
const adminResult = window.testAdminPanel();
console.log('🏢 نتيجة اختبار لوحة المدير:', adminResult);

if (adminResult.success) {
  console.log(`✅ لوحة المدير جاهزة مع ${adminResult.userCount} مستخدم`);
  console.log('👥 المستخدمون المتاحون:');
  adminResult.users.slice(0, 5).forEach((user, index) => {
    console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
  });
} else {
  console.log('❌ مشكلة في لوحة المدير:', adminResult.error);
}
```

### 3. الاختبار الشامل (Comprehensive Test)
```javascript
// اختبار شامل لجميع وظائف النظام
console.log('🚀 بدء الاختبار الشامل...');
window.runComprehensiveTest().then(results => {
  console.log('📊 نتائج الاختبار الشامل:', results);
  
  console.log('\n📈 ملخص النتائج:');
  console.log(`✅ نجح: ${results.registrationTests.filter(t => t.success).length}/${results.registrationTests.length} تسجيلات`);
  console.log(`📦 registeredUsers: ${results.finalState?.registeredUsers?.length || 0} مستخدم`);
  console.log(`🏢 spsa_users: ${results.finalState?.spsaUsers?.length || 0} مستخدم`);
  
  if (results.success) {
    console.log('🎉 الاختبار الشامل نجح بالكامل!');
  } else {
    console.log('⚠️ الاختبار الشامل واجه مشاكل:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
});
```

### 4. فحص التخزين الحالي
```javascript
// فحص حالة localStorage الحالية
const storageState = window.inspectLocalStorage();
console.log('📊 حالة التخزين الحالية:', storageState);

console.log('\n📦 تفاصيل التخزين:');
console.log(`- registeredUsers: ${storageState.registeredUsers?.length || 0} مستخدم`);
console.log(`- spsa_users: ${storageState.spsaUsers?.length || 0} مستخدم`);
console.log(`- جميع المفاتيح: ${storageState.allKeys.length} مفتاح`);

if (storageState.registeredUsers?.length > 0) {
  console.log('\n👥 عينة من registeredUsers:');
  storageState.registeredUsers.slice(0, 3).forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email})`);
  });
}

if (storageState.spsaUsers?.length > 0) {
  console.log('\n🏢 عينة من spsa_users:');
  storageState.spsaUsers.slice(0, 3).forEach((user, index) => {
    console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
  });
}
```

### 5. مزامنة البيانات
```javascript
// مزامنة البيانات بين registeredUsers و spsa_users
const syncResult = window.syncUserData();
console.log('🔄 نتيجة مزامنة البيانات:', syncResult);

if (syncResult.success) {
  console.log('✅ تمت المزامنة بنجاح');
  console.log(`📊 تم تحويل ${syncResult.convertedCount} مستخدم`);
  console.log(`🔄 تم تحديث ${syncResult.updatedCount} مستخدم`);
} else {
  console.log('❌ فشلت المزامنة:', syncResult.error);
}
```

### 6. اختبار تسجيل مستخدم واحد
```javascript
// اختبار تسجيل مستخدم جديد
const testUser = {
  name: 'اختبار تلقائي',
  email: `auto.test.${Date.now()}@spsa.org.sa`,
  password: 'AutoTest123!',
  role: 'MEMBER'
};

console.log('🔄 اختبار تسجيل مستخدم جديد:', testUser.name);
window.testRegistrationFlow(testUser).then(result => {
  console.log('📊 نتيجة التسجيل:', result);
  
  if (result.success) {
    console.log('✅ نجح التسجيل!');
    console.log('🔍 فحص التخزين بعد التسجيل...');
    
    const newState = window.inspectLocalStorage();
    console.log(`📦 registeredUsers: ${newState.registeredUsers?.length || 0} مستخدم`);
    console.log(`🏢 spsa_users: ${newState.spsaUsers?.length || 0} مستخدم`);
  } else {
    console.log('❌ فشل التسجيل:', result.error);
  }
});
```

### 7. مسح البيانات (للاختبار)
```javascript
// مسح جميع بيانات المستخدمين (استخدم بحذر!)
console.log('⚠️ مسح جميع بيانات المستخدمين...');
localStorage.removeItem('registeredUsers');
localStorage.removeItem('spsa_users');
console.log('✅ تم مسح البيانات');

// فحص التخزين بعد المسح
const emptyState = window.inspectLocalStorage();
console.log('📊 حالة التخزين بعد المسح:', emptyState);
```

---

## 🎯 خطة الاختبار المقترحة

### المرحلة 1: التحقق من الحالة الحالية
1. شغل **فحص التخزين الحالي** (الكود رقم 4)
2. شغل **اختبار لوحة المدير** (الكود رقم 2)

### المرحلة 2: اختبار التسجيل
1. شغل **الاختبار السريع** (الكود رقم 1)
2. شغل **اختبار تسجيل مستخدم واحد** (الكود رقم 6)

### المرحلة 3: الاختبار الشامل
1. شغل **الاختبار الشامل** (الكود رقم 3)
2. راجع النتائج وتأكد من نجاح جميع التسجيلات

### المرحلة 4: التحقق النهائي
1. افتح لوحة المدير: `http://localhost:5173/admin/users`
2. تحقق من ظهور جميع المستخدمين الجدد
3. اختبر البحث والفلترة في لوحة المدير

---

## 📋 النتائج المتوقعة

### ✅ علامات النجاح:
- جميع الاختبارات تعطي نتيجة `success: true`
- المستخدمون الجدد يظهرون في كلا من `registeredUsers` و `spsa_users`
- لوحة المدير تعرض جميع المستخدمين
- لا توجد أخطاء في console
- التنقل بين الصفحات يعمل بسلاسة

### ⚠️ علامات المشاكل:
- أي اختبار يعطي `success: false`
- المستخدمون لا يظهرون في لوحة المدير
- أخطاء في console
- مشاكل في التنقل أو تحميل الصفحات

---

## 🔧 استكشاف الأخطاء

إذا واجهت مشاكل:

1. **تحديث الصفحة** وإعادة المحاولة
2. **مسح البيانات** (الكود رقم 7) وإعادة الاختبار
3. **فحص console** للأخطاء التفصيلية
4. **التأكد من تشغيل الخادم** على `localhost:5173`

---

**ملاحظة:** هذه الاختبارات تستخدم بيانات وهمية وآمنة للاختبار. جميع البيانات محفوظة في localStorage فقط.
