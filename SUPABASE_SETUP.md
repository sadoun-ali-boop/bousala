# إعداد Supabase - دليل الهجرة من Firebase

## نظرة عامة
تم تحويل المشروع من Firebase إلى Supabase. يتطلب الإعداد خطوات قليلة بسيطة.

## خطوات الإعداد

### 1. إنشاء حساب Supabase
- زيارة https://supabase.com
- إنشاء حساب جديد
- إنشاء مشروع جديد

### 2. الحصول على بيانات المشروع
بعد إنشاء المشروع:
- انسخ **Project URL**
- انسخ **Anon Public Key**
- حفظهما في `supabase-config.json`

### 3. تحديث ملف الإعدادات
قم بتحديث `supabase-config.json`:

```json
{
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseKey": "your-anon-key",
  "projectId": "your-project"
}
```

### 4. إنشاء الجداول
قم بتشغيل الأوامر التالية في Supabase SQL Editor:

#### جدول المستخدمين
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL,
  displayName VARCHAR,
  photoURL VARCHAR,
  role VARCHAR DEFAULT 'undetermined',
  createdAt TIMESTAMP DEFAULT NOW(),
  lastLogin TIMESTAMP,
  
  -- Student fields
  studentId VARCHAR,
  faculty VARCHAR,
  department VARCHAR,
  academicLevel VARCHAR,
  phoneNumber VARCHAR,
  specialization VARCHAR,
  officeNumber VARCHAR,
  academicYear VARCHAR,
  supervisorUid UUID,
  supervisorName VARCHAR,
  supervisorStatus VARCHAR DEFAULT 'pending',
  
  UNIQUE(email)
);
```

#### جدول المحادثات
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  messages JSONB DEFAULT '[]',
  analysis JSONB,
  archived BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);
```

#### جدول الإخطارات
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fromUid UUID,
  fromName VARCHAR,
  title VARCHAR NOT NULL,
  message VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  read BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);
```

#### جدول الرسائل الثنائية
```sql
CREATE TABLE p2p_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatID VARCHAR NOT NULL,
  senderId UUID NOT NULL,
  receiverId UUID NOT NULL,
  senderName VARCHAR,
  content VARCHAR NOT NULL,
  read BOOLEAN DEFAULT false,
  timestamp TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY(senderId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(receiverId) REFERENCES users(id) ON DELETE CASCADE
);
```

#### جدول سجل الدخول
```sql
CREATE TABLE login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL,
  email VARCHAR NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  role VARCHAR,
  
  FOREIGN KEY(uid) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5. تكوين المصادقة (OAuth مع Google)

1. انتقل إلى **Authentication** > **Providers**
2. فعّل **Google**
3. أضف معرّف العميل (Client ID) وسر العميل (Client Secret) من Google Cloud
4. أضف الـ Redirect URLs:
   - `http://localhost:5173/auth/callback`
   - `https://your-domain.com/auth/callback`

### 6. تثبيت المكتبات
```bash
npm install @supabase/supabase-js
npm remove firebase
```

### 7. متغيرات البيئة (اختياري)
إذا كنت تستخدم متغيرات البيئة:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

## ملفات تم تحديثها

- ✅ `src/lib/supabase.ts` - استبدل `firebase.ts`
- ✅ `src/App.tsx` - تحديث جميع استخدامات Firebase
- ✅ `src/components/dialogs/CommunityChatDialog.tsx`
- ✅ `src/components/dialogs/NotificationsDialog.tsx`
- ✅ `src/components/dialogs/P2PChatDialog.tsx`
- ✅ `src/components/dialogs/ProfileDialog.tsx`
- ✅ `src/components/dialogs/SupervisorDashboardDialog.tsx`
- ✅ `package.json` - استبدال dependency

## اختبار

1. شغّل المشروع:
```bash
npm run dev
```

2. جرّب تسجيل الدخول عبر Google
3. تحقق من تخزين البيانات في Supabase
4. اختبر الرسائل والإخطارات

## استكشاف الأخطاء

### خطأ في المصادقة
- تأكد من إضافة Redirect URLs الصحيحة
- تحقق من صحة Google OAuth credentials

### خطأ في الاتصال بقاعدة البيانات
- تحقق من `supabase-config.json`
- تأكد من إنشاء الجداول

### الاشتراكات الفعلية لا تعمل
- تحقق من Row Level Security (RLS) إذا كنت تستخدمه
- تأكد من صحة أسماء الجداول والأعمدة

## الميزات الإضافية في Supabase

### Row Level Security (RLS)
لتحسين الأمان، يمكنك تفعيل RLS:

```sql
-- مثال: السماح للمستخدمين برؤية إخطاراتهم فقط
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
USING (auth.uid() = userId);
```

### الدوال المخصصة
يمكنك كتابة دوال PL/pgSQL في Supabase لتحسين الأداء.

## الموارد الإضافية

- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client Library](https://supabase.com/docs/reference/javascript)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

للدعم أو الأسئلة، يرجى مراجعة توثيق Supabase الرسمية.
