-- =====================================================
-- SPSA 2FA Database Schema
-- مخطط قاعدة بيانات المصادقة الثنائية - الجمعية السعودية للعلوم السياسية
-- =====================================================

-- =====================================================
-- جدول إعدادات المصادقة الثنائية - 2FA Settings Table
-- =====================================================

CREATE TABLE public.user_2fa_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT FALSE,
    method VARCHAR(20) DEFAULT 'app' CHECK (method IN ('app', 'sms', 'email')),
    
    -- TOTP settings for authenticator apps
    secret_key VARCHAR(255), -- مشفر بـ AES-256
    issuer VARCHAR(100) DEFAULT 'SPSA',
    algorithm VARCHAR(10) DEFAULT 'SHA1',
    digits INTEGER DEFAULT 6,
    period INTEGER DEFAULT 30,
    
    -- SMS settings
    phone_number VARCHAR(20),
    phone_country_code VARCHAR(5) DEFAULT '+966',
    sms_last_sent_at TIMESTAMP WITH TIME ZONE,
    sms_attempts_count INTEGER DEFAULT 0,
    sms_attempts_reset_at TIMESTAMP WITH TIME ZONE,
    
    -- Security settings
    last_verified_at TIMESTAMP WITH TIME ZONE,
    failed_attempts_count INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    last_modified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT unique_user_2fa UNIQUE (user_id),
    CONSTRAINT valid_phone_with_sms CHECK (
        method != 'sms' OR (method = 'sms' AND phone_number IS NOT NULL)
    )
);

-- فهارس جدول إعدادات 2FA
CREATE INDEX idx_user_2fa_settings_user_id ON public.user_2fa_settings(user_id);
CREATE INDEX idx_user_2fa_settings_enabled ON public.user_2fa_settings(is_enabled) WHERE is_enabled = TRUE;
CREATE INDEX idx_user_2fa_settings_method ON public.user_2fa_settings(method);
CREATE INDEX idx_user_2fa_settings_phone ON public.user_2fa_settings(phone_number) WHERE method = 'sms';

-- =====================================================
-- جدول رموز النسخ الاحتياطي - Backup Codes Table
-- =====================================================

CREATE TABLE public.user_2fa_backup_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL, -- مُشفر بـ bcrypt
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    used_ip INET,
    used_user_agent TEXT,
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year'),
    
    -- Constraints
    CONSTRAINT unique_user_backup_code UNIQUE (user_id, code_hash)
);

-- فهارس جدول رموز النسخ الاحتياطي
CREATE INDEX idx_user_2fa_backup_codes_user_id ON public.user_2fa_backup_codes(user_id);
CREATE INDEX idx_user_2fa_backup_codes_unused ON public.user_2fa_backup_codes(user_id, is_used) WHERE is_used = FALSE;
CREATE INDEX idx_user_2fa_backup_codes_expires ON public.user_2fa_backup_codes(expires_at);

-- =====================================================
-- جدول محاولات التحقق - Verification Attempts Table
-- =====================================================

CREATE TABLE public.user_2fa_verification_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    method VARCHAR(20) NOT NULL, -- 'app', 'sms', 'backup'
    attempted_code VARCHAR(10), -- الرمز المُدخل (مُشفر)
    is_successful BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(100), -- 'invalid_code', 'expired', 'rate_limited', etc.
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Timing
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Security context
    risk_score INTEGER DEFAULT 0, -- 0-100 للمخاطر
    location_data JSONB DEFAULT '{}',
    device_fingerprint VARCHAR(255)
);

-- فهارس جدول محاولات التحقق
CREATE INDEX idx_user_2fa_verification_user_id ON public.user_2fa_verification_attempts(user_id);
CREATE INDEX idx_user_2fa_verification_attempted_at ON public.user_2fa_verification_attempts(attempted_at DESC);
CREATE INDEX idx_user_2fa_verification_ip ON public.user_2fa_verification_attempts(ip_address, attempted_at DESC);
CREATE INDEX idx_user_2fa_verification_success ON public.user_2fa_verification_attempts(is_successful, attempted_at DESC);

-- =====================================================
-- جدول جلسات 2FA المؤقتة - Temporary 2FA Sessions Table
-- =====================================================

CREATE TABLE public.user_2fa_temp_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    
    -- Session data
    login_data JSONB NOT NULL, -- بيانات تسجيل الدخول مؤقتاً
    verification_method VARCHAR(20) NOT NULL,
    attempts_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Security context
    ip_address INET,
    user_agent TEXT,
    is_completed BOOLEAN DEFAULT FALSE
);

-- فهارس جدول جلسات 2FA المؤقتة
CREATE INDEX idx_user_2fa_temp_sessions_user_id ON public.user_2fa_temp_sessions(user_id);
CREATE INDEX idx_user_2fa_temp_sessions_token ON public.user_2fa_temp_sessions(session_token);
CREATE INDEX idx_user_2fa_temp_sessions_expires ON public.user_2fa_temp_sessions(expires_at);
CREATE INDEX idx_user_2fa_temp_sessions_active ON public.user_2fa_temp_sessions(user_id, is_completed) WHERE is_completed = FALSE;

-- =====================================================
-- تحديث جدول المستخدمين - Update Users Table
-- =====================================================

-- إضافة حقول 2FA لجدول المستخدمين الحالي
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS require_2fa BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_2fa_setup_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS force_2fa_setup BOOLEAN DEFAULT FALSE;

-- فهرس للمستخدمين الذين يتطلبون 2FA
CREATE INDEX idx_users_require_2fa ON public.users(require_2fa) WHERE require_2fa = TRUE;

-- =====================================================
-- دوال مساعدة للـ 2FA - Helper Functions
-- =====================================================

-- دالة تنظيف جلسات 2FA منتهية الصلاحية
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_2fa_temp_sessions 
    WHERE expires_at < NOW() AND is_completed = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- دالة تنظيف محاولات التحقق القديمة
CREATE OR REPLACE FUNCTION cleanup_old_verification_attempts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_2fa_verification_attempts 
    WHERE attempted_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- دالة تنظيف رموز النسخ الاحتياطي منتهية الصلاحية
CREATE OR REPLACE FUNCTION cleanup_expired_backup_codes()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_2fa_backup_codes 
    WHERE expires_at < NOW() OR is_used = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- دالة إعادة تعيين محاولات SMS
CREATE OR REPLACE FUNCTION reset_sms_attempts()
RETURNS INTEGER AS $$
DECLARE
    reset_count INTEGER;
BEGIN
    UPDATE public.user_2fa_settings 
    SET sms_attempts_count = 0,
        sms_attempts_reset_at = NOW()
    WHERE sms_attempts_reset_at < NOW() - INTERVAL '1 hour';
    
    GET DIAGNOSTICS reset_count = ROW_COUNT;
    
    RETURN reset_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- المحفزات - Triggers
-- =====================================================

-- محفز تحديث updated_at في جدول إعدادات 2FA
CREATE TRIGGER update_user_2fa_settings_updated_at 
    BEFORE UPDATE ON public.user_2fa_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- محفز تسجيل تفعيل/إلغاء 2FA في سجل المراجعة
CREATE OR REPLACE FUNCTION log_2fa_settings_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- تسجيل تغيير إعدادات 2FA
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, 
            old_values, new_values, 
            ip_address, user_agent, created_at
        ) VALUES (
            NEW.user_id, 
            CASE 
                WHEN OLD.is_enabled != NEW.is_enabled THEN
                    CASE WHEN NEW.is_enabled THEN '2fa_enabled' ELSE '2fa_disabled' END
                ELSE '2fa_settings_updated'
            END,
            'user_2fa_settings', 
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW),
            NULL, -- سيتم تعيينه من التطبيق
            NULL, -- سيتم تعيينه من التطبيق
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_2fa_settings_changes_trigger
    AFTER UPDATE ON public.user_2fa_settings
    FOR EACH ROW EXECUTE FUNCTION log_2fa_settings_changes();

-- =====================================================
-- جدولة المهام التنظيفية - Cleanup Jobs
-- =====================================================

-- مهمة تنظيف يومية (يمكن تشغيلها via cron)
CREATE OR REPLACE FUNCTION daily_2fa_cleanup()
RETURNS JSON AS $$
DECLARE
    result JSON;
    expired_sessions INTEGER;
    old_attempts INTEGER;
    expired_codes INTEGER;
    reset_sms INTEGER;
BEGIN
    -- تنظيف الجلسات منتهية الصلاحية
    expired_sessions := cleanup_expired_2fa_sessions();
    
    -- تنظيف محاولات التحقق القديمة
    old_attempts := cleanup_old_verification_attempts();
    
    -- تنظيف رموز النسخ الاحتياطي منتهية الصلاحية
    expired_codes := cleanup_expired_backup_codes();
    
    -- إعادة تعيين محاولات SMS
    reset_sms := reset_sms_attempts();
    
    -- إرجاع النتائج
    result := json_build_object(
        'cleanup_date', NOW(),
        'expired_sessions_cleaned', expired_sessions,
        'old_attempts_cleaned', old_attempts,
        'expired_codes_cleaned', expired_codes,
        'sms_attempts_reset', reset_sms
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- أمان إضافي - Additional Security
-- =====================================================

-- صلاحيات الصف (Row Level Security) لجداول 2FA
ALTER TABLE public.user_2fa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa_verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa_temp_sessions ENABLE ROW LEVEL SECURITY;

-- سياسة أمان: المستخدمون يمكنهم رؤية إعداداتهم فقط
CREATE POLICY user_2fa_settings_policy ON public.user_2fa_settings
    FOR ALL USING (user_id = current_user_id());

-- سياسة أمان: المستخدمون يمكنهم رؤية رموزهم الاحتياطية فقط
CREATE POLICY user_2fa_backup_codes_policy ON public.user_2fa_backup_codes
    FOR ALL USING (user_id = current_user_id());

-- سياسة أمان: المستخدمون يمكنهم رؤية محاولاتهم فقط
CREATE POLICY user_2fa_verification_attempts_policy ON public.user_2fa_verification_attempts
    FOR ALL USING (user_id = current_user_id());

-- سياسة أمان: المستخدمون يمكنهم رؤية جلساتهم المؤقتة فقط
CREATE POLICY user_2fa_temp_sessions_policy ON public.user_2fa_temp_sessions
    FOR ALL USING (user_id = current_user_id());

-- =====================================================
-- تم إنشاء مخطط 2FA بنجاح
-- 2FA Database Schema Created Successfully
-- =====================================================

-- إدراج إعدادات النظام للـ 2FA
INSERT INTO public.settings (key, value, type, category, description, is_public, is_editable) VALUES
('2fa_enabled', 'true', 'boolean', 'security', 'تفعيل نظام المصادقة الثنائية', false, true),
('2fa_required_for_admins', 'true', 'boolean', 'security', 'إجبار المشرفين على استخدام 2FA', false, true),
('2fa_backup_codes_count', '10', 'number', 'security', 'عدد رموز النسخ الاحتياطي', false, true),
('2fa_session_timeout', '10', 'number', 'security', 'مهلة انتهاء جلسة 2FA بالدقائق', false, true),
('2fa_max_attempts', '5', 'number', 'security', 'عدد محاولات 2FA القصوى', false, true),
('2fa_lockout_duration', '15', 'number', 'security', 'مدة القفل بالدقائق', false, true),
('2fa_sms_enabled', 'true', 'boolean', 'security', 'تفعيل SMS للـ 2FA', false, true),
('2fa_app_name', 'SPSA', 'string', 'security', 'اسم التطبيق في أدوات 2FA', false, true); 