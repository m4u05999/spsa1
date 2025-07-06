-- =====================================================
-- Row Level Security (RLS) Policies
-- سياسات أمان مستوى الصف
-- =====================================================

-- تفعيل RLS على جميع الجداول
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- سياسات جدول المستخدمين - Users Table Policies
-- =====================================================

-- المستخدمون يمكنهم قراءة ملفاتهم الشخصية فقط
-- Users can read their own profiles only
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- المستخدمون يمكنهم تحديث ملفاتهم الشخصية فقط
-- Users can update their own profiles only
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- الإداريون يمكنهم قراءة جميع المستخدمين
-- Admins can read all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- الإداريون يمكنهم تحديث جميع المستخدمين
-- Admins can update all users
CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- الملفات العامة للمستخدمين (للعرض العام)
-- Public user profiles (for public display)
CREATE POLICY "Public user profiles" ON public.users
    FOR SELECT USING (
        is_active = true AND 
        (role = 'admin' OR role = 'staff' OR membership_status = 'active')
    );

-- =====================================================
-- سياسات جدول الفئات - Categories Table Policies
-- =====================================================

-- الجميع يمكنهم قراءة الفئات النشطة
-- Everyone can read active categories
CREATE POLICY "Anyone can view active categories" ON public.categories
    FOR SELECT USING (is_active = true);

-- الإداريون والموظفون يمكنهم إدارة الفئات
-- Admins and staff can manage categories
CREATE POLICY "Admins and staff can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- =====================================================
-- سياسات جدول العلامات - Tags Table Policies
-- =====================================================

-- الجميع يمكنهم قراءة العلامات النشطة
-- Everyone can read active tags
CREATE POLICY "Anyone can view active tags" ON public.tags
    FOR SELECT USING (is_active = true);

-- الإداريون والموظفون يمكنهم إدارة العلامات
-- Admins and staff can manage tags
CREATE POLICY "Admins and staff can manage tags" ON public.tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- =====================================================
-- سياسات جدول المحتوى - Content Table Policies
-- =====================================================

-- الجميع يمكنهم قراءة المحتوى المنشور
-- Everyone can read published content
CREATE POLICY "Anyone can view published content" ON public.content
    FOR SELECT USING (status = 'published');

-- المؤلفون يمكنهم قراءة محتواهم الخاص
-- Authors can read their own content
CREATE POLICY "Authors can view own content" ON public.content
    FOR SELECT USING (auth.uid() = author_id);

-- المؤلفون يمكنهم تحديث محتواهم الخاص
-- Authors can update their own content
CREATE POLICY "Authors can update own content" ON public.content
    FOR UPDATE USING (auth.uid() = author_id);

-- المؤلفون يمكنهم إنشاء محتوى جديد
-- Authors can create new content
CREATE POLICY "Authors can create content" ON public.content
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- الإداريون والموظفون يمكنهم إدارة جميع المحتوى
-- Admins and staff can manage all content
CREATE POLICY "Admins and staff can manage all content" ON public.content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- =====================================================
-- سياسات جدول علاقة المحتوى بالعلامات
-- Content Tags Junction Policies
-- =====================================================

-- الجميع يمكنهم قراءة علاقات المحتوى المنشور
-- Everyone can read published content tags
CREATE POLICY "Anyone can view published content tags" ON public.content_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.content 
            WHERE id = content_id AND status = 'published'
        )
    );

-- المؤلفون والإداريون يمكنهم إدارة علاقات المحتوى
-- Authors and admins can manage content tags
CREATE POLICY "Authors and admins can manage content tags" ON public.content_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.content 
            WHERE id = content_id AND author_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- =====================================================
-- سياسات جدول الأحداث - Events Table Policies
-- =====================================================

-- الجميع يمكنهم قراءة الأحداث القادمة والجارية
-- Everyone can read upcoming and ongoing events
CREATE POLICY "Anyone can view public events" ON public.events
    FOR SELECT USING (status IN ('upcoming', 'ongoing'));

-- المنظمون يمكنهم قراءة أحداثهم
-- Organizers can read their own events
CREATE POLICY "Organizers can view own events" ON public.events
    FOR SELECT USING (auth.uid() = organizer_id);

-- المنظمون يمكنهم تحديث أحداثهم
-- Organizers can update their own events
CREATE POLICY "Organizers can update own events" ON public.events
    FOR UPDATE USING (auth.uid() = organizer_id);

-- المنظمون يمكنهم إنشاء أحداث جديدة
-- Organizers can create new events
CREATE POLICY "Organizers can create events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- الإداريون والموظفون يمكنهم إدارة جميع الأحداث
-- Admins and staff can manage all events
CREATE POLICY "Admins and staff can manage all events" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- =====================================================
-- سياسات جدول تسجيلات الأحداث
-- Event Registrations Policies
-- =====================================================

-- المستخدمون يمكنهم قراءة تسجيلاتهم فقط
-- Users can read their own registrations only
CREATE POLICY "Users can view own registrations" ON public.event_registrations
    FOR SELECT USING (auth.uid() = user_id);

-- المستخدمون يمكنهم تحديث تسجيلاتهم فقط
-- Users can update their own registrations only
CREATE POLICY "Users can update own registrations" ON public.event_registrations
    FOR UPDATE USING (auth.uid() = user_id);

-- المستخدمون يمكنهم إنشاء تسجيلات جديدة
-- Users can create new registrations
CREATE POLICY "Users can create registrations" ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- منظمو الأحداث يمكنهم قراءة تسجيلات أحداثهم
-- Event organizers can read their event registrations
CREATE POLICY "Organizers can view event registrations" ON public.event_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND organizer_id = auth.uid()
        )
    );

-- الإداريون والموظفون يمكنهم إدارة جميع التسجيلات
-- Admins and staff can manage all registrations
CREATE POLICY "Admins and staff can manage all registrations" ON public.event_registrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- =====================================================
-- سياسات جدول العضويات - Memberships Policies
-- =====================================================

-- المستخدمون يمكنهم قراءة عضوياتهم فقط
-- Users can read their own memberships only
CREATE POLICY "Users can view own memberships" ON public.memberships
    FOR SELECT USING (auth.uid() = user_id);

-- الإداريون والموظفون يمكنهم إدارة جميع العضويات
-- Admins and staff can manage all memberships
CREATE POLICY "Admins and staff can manage all memberships" ON public.memberships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- =====================================================
-- سياسات جدول الاستفسارات - Inquiries Policies
-- =====================================================

-- المستخدمون يمكنهم إنشاء استفسارات جديدة
-- Users can create new inquiries
CREATE POLICY "Anyone can create inquiries" ON public.inquiries
    FOR INSERT WITH CHECK (true);

-- الإداريون والموظفون يمكنهم قراءة جميع الاستفسارات
-- Admins and staff can read all inquiries
CREATE POLICY "Admins and staff can view all inquiries" ON public.inquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- الإداريون والموظفون يمكنهم تحديث الاستفسارات
-- Admins and staff can update inquiries
CREATE POLICY "Admins and staff can update inquiries" ON public.inquiries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- =====================================================
-- سياسات جدول الإعدادات - Settings Policies
-- =====================================================

-- الجميع يمكنهم قراءة الإعدادات العامة
-- Everyone can read public settings
CREATE POLICY "Anyone can view public settings" ON public.settings
    FOR SELECT USING (is_public = true);

-- الإداريون فقط يمكنهم إدارة الإعدادات
-- Only admins can manage settings
CREATE POLICY "Only admins can manage settings" ON public.settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- سياسات جدول السجلات - Audit Logs Policies
-- =====================================================

-- الإداريون فقط يمكنهم قراءة السجلات
-- Only admins can read audit logs
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- النظام يمكنه إنشاء سجلات جديدة
-- System can create new audit logs
CREATE POLICY "System can create audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- دالة مساعدة للتحقق من الأدوار
-- Helper function for role checking
-- =====================================================

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM public.users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- دالة مساعدة للتحقق من حالة العضوية
-- Helper function for membership status checking
-- =====================================================

CREATE OR REPLACE FUNCTION auth.user_membership_status()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT membership_status FROM public.users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- سياسات إضافية للأمان المتقدم
-- Additional policies for advanced security
-- =====================================================

-- منع الحذف للمستخدمين العاديين
-- Prevent deletion for regular users
CREATE POLICY "Prevent user deletion" ON public.users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- منع الحذف للمحتوى المنشور
-- Prevent deletion of published content
CREATE POLICY "Prevent published content deletion" ON public.content
    FOR DELETE USING (
        status != 'published' OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- تم إنشاء سياسات الأمان بنجاح
-- Security policies created successfully
-- =====================================================
