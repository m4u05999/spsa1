-- =====================================================
-- SPSA Database Schema - Saudi Political Science Association
-- مخطط قاعدة البيانات - الجمعية السعودية للعلوم السياسية
-- =====================================================

-- تفعيل الإضافات المطلوبة
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- جدول المستخدمين - Users Table
-- =====================================================

CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    specialization VARCHAR(255),
    academic_degree VARCHAR(100),
    workplace VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'staff', 'member', 'guest')),
    membership_type VARCHAR(50) DEFAULT 'regular' CHECK (membership_type IN ('regular', 'student', 'honorary', 'associate')),
    membership_status VARCHAR(50) DEFAULT 'pending' CHECK (membership_status IN ('active', 'pending', 'suspended', 'expired')),
    membership_date DATE,
    profile_image_url TEXT,
    bio TEXT,
    social_links JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس جدول المستخدمين
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_membership_status ON public.users(membership_status);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- =====================================================
-- جدول الفئات - Categories Table
-- =====================================================

CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    description_en TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    icon VARCHAR(100),
    color VARCHAR(7) DEFAULT '#3B82F6',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس جدول الفئات
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_sort_order ON public.categories(sort_order);

-- =====================================================
-- جدول العلامات - Tags Table
-- =====================================================

CREATE TABLE public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس جدول العلامات
CREATE INDEX idx_tags_slug ON public.tags(slug);
CREATE INDEX idx_tags_usage_count ON public.tags(usage_count DESC);

-- =====================================================
-- جدول المحتوى - Content Table
-- =====================================================

CREATE TABLE public.content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    slug VARCHAR(500) UNIQUE NOT NULL,
    excerpt TEXT,
    excerpt_en TEXT,
    content TEXT NOT NULL,
    content_en TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('article', 'news', 'event', 'publication', 'opinion', 'research', 'page')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    featured_image_url TEXT,
    images JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس جدول المحتوى
CREATE INDEX idx_content_slug ON public.content(slug);
CREATE INDEX idx_content_type ON public.content(type);
CREATE INDEX idx_content_status ON public.content(status);
CREATE INDEX idx_content_author_id ON public.content(author_id);
CREATE INDEX idx_content_category_id ON public.content(category_id);
CREATE INDEX idx_content_published_at ON public.content(published_at DESC);
CREATE INDEX idx_content_featured ON public.content(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_content_search ON public.content USING gin(to_tsvector('arabic', title || ' ' || COALESCE(content, '')));

-- =====================================================
-- جدول علاقة المحتوى بالعلامات - Content Tags Junction
-- =====================================================

CREATE TABLE public.content_tags (
    content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (content_id, tag_id)
);

-- فهارس جدول علاقة المحتوى بالعلامات
CREATE INDEX idx_content_tags_content_id ON public.content_tags(content_id);
CREATE INDEX idx_content_tags_tag_id ON public.content_tags(tag_id);

-- =====================================================
-- جدول الأحداث - Events Table
-- =====================================================

CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    description_en TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('conference', 'workshop', 'seminar', 'meeting', 'lecture', 'training')),
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled', 'postponed')),
    organizer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    location VARCHAR(255),
    location_details JSONB DEFAULT '{}',
    is_online BOOLEAN DEFAULT FALSE,
    meeting_url TEXT,
    capacity INTEGER,
    registration_required BOOLEAN DEFAULT TRUE,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    featured_image_url TEXT,
    images JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    agenda JSONB DEFAULT '[]',
    speakers JSONB DEFAULT '[]',
    sponsors JSONB DEFAULT '[]',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_start TIMESTAMP WITH TIME ZONE,
    registration_end TIMESTAMP WITH TIME ZONE,
    views_count INTEGER DEFAULT 0,
    registrations_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس جدول الأحداث
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_type ON public.events(type);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX idx_events_category_id ON public.events(category_id);

-- =====================================================
-- جدول تسجيلات الأحداث - Event Registrations
-- =====================================================

CREATE TABLE public.event_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'cancelled', 'no_show')),
    registration_data JSONB DEFAULT '{}',
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_amount DECIMAL(10,2),
    payment_reference VARCHAR(255),
    notes TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    attended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- فهارس جدول تسجيلات الأحداث
CREATE INDEX idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON public.event_registrations(user_id);
CREATE INDEX idx_event_registrations_status ON public.event_registrations(status);

-- =====================================================
-- جدول العضويات - Memberships Table
-- =====================================================

CREATE TABLE public.memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    membership_number VARCHAR(50) UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('regular', 'student', 'honorary', 'associate', 'corporate')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended', 'expired', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE,
    renewal_date DATE,
    fee_amount DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'waived')),
    payment_reference VARCHAR(255),
    benefits JSONB DEFAULT '[]',
    restrictions JSONB DEFAULT '[]',
    notes TEXT,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس جدول العضويات
CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX idx_memberships_number ON public.memberships(membership_number);
CREATE INDEX idx_memberships_type ON public.memberships(type);
CREATE INDEX idx_memberships_status ON public.memberships(status);
CREATE INDEX idx_memberships_end_date ON public.memberships(end_date);

-- =====================================================
-- جدول الاستفسارات - Inquiries Table
-- =====================================================

CREATE TABLE public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('general', 'membership', 'event', 'research', 'media', 'complaint')),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    response TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس جدول الاستفسارات
CREATE INDEX idx_inquiries_email ON public.inquiries(email);
CREATE INDEX idx_inquiries_type ON public.inquiries(type);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);
CREATE INDEX idx_inquiries_priority ON public.inquiries(priority);
CREATE INDEX idx_inquiries_assigned_to ON public.inquiries(assigned_to);
CREATE INDEX idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- =====================================================
-- جدول الإعدادات - Settings Table
-- =====================================================

CREATE TABLE public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    type VARCHAR(50) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json', 'array')),
    category VARCHAR(100) DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_editable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس جدول الإعدادات
CREATE INDEX idx_settings_key ON public.settings(key);
CREATE INDEX idx_settings_category ON public.settings(category);
CREATE INDEX idx_settings_public ON public.settings(is_public) WHERE is_public = TRUE;

-- =====================================================
-- جدول السجلات - Audit Logs Table
-- =====================================================

CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس جدول السجلات
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =====================================================
-- دوال التحديث التلقائي - Auto Update Functions
-- =====================================================

-- دالة تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق الدالة على الجداول المطلوبة
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON public.event_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- دالة تحديث عداد الاستخدام للعلامات
-- =====================================================

CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.tags SET usage_count = GREATEST(usage_count - 1, 0) WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- تطبيق الدالة على جدول علاقة المحتوى بالعلامات
CREATE TRIGGER update_tag_usage_count_trigger
    AFTER INSERT OR DELETE ON public.content_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- =====================================================
-- دالة تحديث عداد التسجيلات للأحداث
-- =====================================================

CREATE OR REPLACE FUNCTION update_event_registrations_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.events SET registrations_count = registrations_count + 1 WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.events SET registrations_count = GREATEST(registrations_count - 1, 0) WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- تطبيق الدالة على جدول تسجيلات الأحداث
CREATE TRIGGER update_event_registrations_count_trigger
    AFTER INSERT OR DELETE ON public.event_registrations
    FOR EACH ROW EXECUTE FUNCTION update_event_registrations_count();

-- =====================================================
-- تم إنشاء مخطط قاعدة البيانات بنجاح
-- Database schema created successfully
-- =====================================================
