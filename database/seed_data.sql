-- =====================================================
-- البيانات الأولية - Seed Data
-- الجمعية السعودية للعلوم السياسية
-- =====================================================

-- =====================================================
-- إدراج الفئات الأساسية - Insert Basic Categories
-- =====================================================

INSERT INTO public.categories (id, name, name_en, slug, description, description_en, icon, color, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'العلوم السياسية', 'Political Science', 'political-science', 'المقالات والأبحاث في مجال العلوم السياسية', 'Articles and research in political science', 'academic-cap', '#3B82F6', 1),
('550e8400-e29b-41d4-a716-446655440002', 'العلاقات الدولية', 'International Relations', 'international-relations', 'دراسات وتحليلات العلاقات الدولية', 'International relations studies and analysis', 'globe-alt', '#10B981', 2),
('550e8400-e29b-41d4-a716-446655440003', 'السياسة المقارنة', 'Comparative Politics', 'comparative-politics', 'دراسات السياسة المقارنة والأنظمة السياسية', 'Comparative politics and political systems studies', 'scale', '#F59E0B', 3),
('550e8400-e29b-41d4-a716-446655440004', 'الفكر السياسي', 'Political Thought', 'political-thought', 'دراسات الفكر السياسي والنظريات', 'Political thought and theory studies', 'light-bulb', '#8B5CF6', 4),
('550e8400-e29b-41d4-a716-446655440005', 'الأخبار', 'News', 'news', 'آخر الأخبار والمستجدات', 'Latest news and updates', 'newspaper', '#EF4444', 5),
('550e8400-e29b-41d4-a716-446655440006', 'الأحداث', 'Events', 'events', 'المؤتمرات وورش العمل والفعاليات', 'Conferences, workshops and events', 'calendar', '#06B6D4', 6),
('550e8400-e29b-41d4-a716-446655440007', 'المنشورات', 'Publications', 'publications', 'الكتب والمجلات والمنشورات العلمية', 'Books, journals and academic publications', 'book-open', '#84CC16', 7),
('550e8400-e29b-41d4-a716-446655440008', 'آراء الخبراء', 'Expert Opinions', 'expert-opinions', 'آراء وتحليلات الخبراء', 'Expert opinions and analysis', 'user-group', '#F97316', 8);

-- =====================================================
-- إدراج العلامات الأساسية - Insert Basic Tags
-- =====================================================

INSERT INTO public.tags (id, name, name_en, slug, color) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'الديمقراطية', 'Democracy', 'democracy', '#3B82F6'),
('660e8400-e29b-41d4-a716-446655440002', 'الحكم الرشيد', 'Good Governance', 'good-governance', '#10B981'),
('660e8400-e29b-41d4-a716-446655440003', 'حقوق الإنسان', 'Human Rights', 'human-rights', '#F59E0B'),
('660e8400-e29b-41d4-a716-446655440004', 'التنمية السياسية', 'Political Development', 'political-development', '#8B5CF6'),
('660e8400-e29b-41d4-a716-446655440005', 'الأمن القومي', 'National Security', 'national-security', '#EF4444'),
('660e8400-e29b-41d4-a716-446655440006', 'السياسة الخارجية', 'Foreign Policy', 'foreign-policy', '#06B6D4'),
('660e8400-e29b-41d4-a716-446655440007', 'الاقتصاد السياسي', 'Political Economy', 'political-economy', '#84CC16'),
('660e8400-e29b-41d4-a716-446655440008', 'المجتمع المدني', 'Civil Society', 'civil-society', '#F97316'),
('660e8400-e29b-41d4-a716-446655440009', 'الإصلاح السياسي', 'Political Reform', 'political-reform', '#EC4899'),
('660e8400-e29b-41d4-a716-446655440010', 'الدراسات الإقليمية', 'Regional Studies', 'regional-studies', '#6366F1');

-- =====================================================
-- إدراج الإعدادات الأساسية - Insert Basic Settings
-- =====================================================

INSERT INTO public.settings (key, value, type, category, description, is_public) VALUES
('site_name', '"الجمعية السعودية للعلوم السياسية"', 'string', 'general', 'اسم الموقع', true),
('site_name_en', '"Saudi Political Science Association"', 'string', 'general', 'Site name in English', true),
('site_description', '"الجمعية السعودية للعلوم السياسية - منصة علمية متخصصة في العلوم السياسية والعلاقات الدولية"', 'string', 'general', 'وصف الموقع', true),
('site_description_en', '"Saudi Political Science Association - A specialized academic platform for political science and international relations"', 'string', 'general', 'Site description in English', true),
('contact_email', '"info@sapsa.org"', 'string', 'contact', 'البريد الإلكتروني للتواصل', true),
('contact_phone', '"+966-11-xxx-xxxx"', 'string', 'contact', 'رقم الهاتف للتواصل', true),
('contact_address', '"الرياض، المملكة العربية السعودية"', 'string', 'contact', 'العنوان', true),
('social_twitter', '"https://twitter.com/sapsa_org"', 'string', 'social', 'حساب تويتر', true),
('social_linkedin', '"https://linkedin.com/company/sapsa"', 'string', 'social', 'حساب لينكد إن', true),
('social_youtube', '"https://youtube.com/c/sapsa"', 'string', 'social', 'قناة يوتيوب', true),
('membership_fee_regular', '500', 'number', 'membership', 'رسوم العضوية العادية', false),
('membership_fee_student', '200', 'number', 'membership', 'رسوم العضوية الطلابية', false),
('event_registration_enabled', 'true', 'boolean', 'events', 'تفعيل تسجيل الأحداث', false),
('content_moderation_enabled', 'true', 'boolean', 'content', 'تفعيل مراجعة المحتوى', false),
('max_file_upload_size', '10485760', 'number', 'uploads', 'الحد الأقصى لحجم الملف (بايت)', false);

-- =====================================================
-- إدراج محتوى تجريبي - Insert Sample Content
-- =====================================================

-- مقال ترحيبي
INSERT INTO public.content (id, title, title_en, slug, excerpt, excerpt_en, content, content_en, type, status, category_id, featured_image_url, is_featured, published_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 
'مرحباً بكم في الجمعية السعودية للعلوم السياسية', 
'Welcome to Saudi Political Science Association',
'welcome-to-sapsa',
'نرحب بكم في المنصة الرسمية للجمعية السعودية للعلوم السياسية، المنصة العلمية المتخصصة في العلوم السياسية والعلاقات الدولية.',
'Welcome to the official platform of the Saudi Political Science Association, the specialized academic platform for political science and international relations.',
'<h2>مرحباً بكم في الجمعية السعودية للعلوم السياسية</h2>

<p>تأسست الجمعية السعودية للعلوم السياسية لتكون منصة علمية متخصصة تهدف إلى تطوير البحث العلمي في مجال العلوم السياسية والعلاقات الدولية في المملكة العربية السعودية والمنطقة العربية.</p>

<h3>أهدافنا</h3>
<ul>
<li>تطوير البحث العلمي في العلوم السياسية</li>
<li>تعزيز التبادل الأكاديمي والثقافي</li>
<li>نشر الوعي السياسي والثقافة الديمقراطية</li>
<li>دعم الباحثين والأكاديميين</li>
</ul>

<h3>خدماتنا</h3>
<p>نقدم مجموعة متنوعة من الخدمات الأكاديمية والبحثية، بما في ذلك المؤتمرات العلمية، وورش العمل، والمنشورات الأكاديمية، والاستشارات البحثية.</p>',

'<h2>Welcome to Saudi Political Science Association</h2>

<p>The Saudi Political Science Association was established to be a specialized academic platform aimed at developing scientific research in the field of political science and international relations in Saudi Arabia and the Arab region.</p>

<h3>Our Goals</h3>
<ul>
<li>Develop scientific research in political science</li>
<li>Enhance academic and cultural exchange</li>
<li>Spread political awareness and democratic culture</li>
<li>Support researchers and academics</li>
</ul>

<h3>Our Services</h3>
<p>We offer a variety of academic and research services, including scientific conferences, workshops, academic publications, and research consultations.</p>',

'article', 'published', '550e8400-e29b-41d4-a716-446655440001', '/images/welcome-banner.jpg', true, NOW());

-- خبر حديث
INSERT INTO public.content (id, title, title_en, slug, excerpt, excerpt_en, content, content_en, type, status, category_id, published_at) VALUES
('770e8400-e29b-41d4-a716-446655440002',
'انطلاق المؤتمر السنوي للعلوم السياسية 2024',
'Launch of Annual Political Science Conference 2024',
'annual-conference-2024',
'تعلن الجمعية السعودية للعلوم السياسية عن انطلاق مؤتمرها السنوي لعام 2024 تحت عنوان "مستقبل الديمقراطية في العالم العربي".',
'The Saudi Political Science Association announces the launch of its annual conference for 2024 under the title "The Future of Democracy in the Arab World".',
'<h2>انطلاق المؤتمر السنوي للعلوم السياسية 2024</h2>

<p>تعلن الجمعية السعودية للعلوم السياسية عن انطلاق مؤتمرها السنوي لعام 2024 تحت عنوان "مستقبل الديمقراطية في العالم العربي".</p>

<h3>تفاصيل المؤتمر</h3>
<ul>
<li><strong>التاريخ:</strong> 15-17 مارس 2024</li>
<li><strong>المكان:</strong> فندق الريتز كارلتون، الرياض</li>
<li><strong>المشاركون:</strong> أكثر من 200 باحث وأكاديمي</li>
</ul>

<p>سيناقش المؤتمر العديد من المحاور المهمة حول مستقبل الديمقراطية والتحولات السياسية في المنطقة العربية.</p>',

'<h2>Launch of Annual Political Science Conference 2024</h2>

<p>The Saudi Political Science Association announces the launch of its annual conference for 2024 under the title "The Future of Democracy in the Arab World".</p>

<h3>Conference Details</h3>
<ul>
<li><strong>Date:</strong> March 15-17, 2024</li>
<li><strong>Location:</strong> Ritz Carlton Hotel, Riyadh</li>
<li><strong>Participants:</strong> More than 200 researchers and academics</li>
</ul>

<p>The conference will discuss several important themes about the future of democracy and political transformations in the Arab region.</p>',

'news', 'published', '550e8400-e29b-41d4-a716-446655440005', NOW());

-- =====================================================
-- ربط المحتوى بالعلامات - Link Content with Tags
-- =====================================================

INSERT INTO public.content_tags (content_id, tag_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001'), -- الديمقراطية
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004'), -- التنمية السياسية
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001'), -- الديمقراطية
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440010'); -- الدراسات الإقليمية

-- =====================================================
-- إدراج حدث تجريبي - Insert Sample Event
-- =====================================================

INSERT INTO public.events (id, title, title_en, slug, description, description_en, type, status, location, is_online, capacity, registration_required, start_date, end_date, category_id, is_featured) VALUES
('880e8400-e29b-41d4-a716-446655440001',
'ورشة عمل: مناهج البحث في العلوم السياسية',
'Workshop: Research Methods in Political Science',
'research-methods-workshop',
'ورشة عمل متخصصة حول مناهج البحث الحديثة في العلوم السياسية والعلاقات الدولية.',
'Specialized workshop on modern research methods in political science and international relations.',
'workshop',
'upcoming',
'جامعة الملك سعود، الرياض',
false,
50,
true,
'2024-02-15 09:00:00+03',
'2024-02-15 17:00:00+03',
'550e8400-e29b-41d4-a716-446655440001',
true);

-- =====================================================
-- تحديث عدادات الاستخدام - Update Usage Counters
-- =====================================================

-- تحديث عداد استخدام العلامات
UPDATE public.tags SET usage_count = (
    SELECT COUNT(*) FROM public.content_tags WHERE tag_id = tags.id
);

-- =====================================================
-- إنشاء فهارس إضافية للأداء - Create Additional Performance Indexes
-- =====================================================

-- فهرس البحث النصي المتقدم
CREATE INDEX IF NOT EXISTS idx_content_fulltext_search ON public.content 
USING gin(to_tsvector('arabic', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(excerpt, '')));

-- فهرس البحث في الأحداث
CREATE INDEX IF NOT EXISTS idx_events_fulltext_search ON public.events 
USING gin(to_tsvector('arabic', title || ' ' || COALESCE(description, '')));

-- فهرس التواريخ للأحداث
CREATE INDEX IF NOT EXISTS idx_events_date_range ON public.events(start_date, end_date);

-- فهرس حالة المحتوى والتاريخ
CREATE INDEX IF NOT EXISTS idx_content_status_date ON public.content(status, published_at DESC) 
WHERE status = 'published';

-- =====================================================
-- دوال البحث المتقدم - Advanced Search Functions
-- =====================================================

-- دالة البحث في المحتوى
CREATE OR REPLACE FUNCTION search_content(search_query TEXT, content_type TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    excerpt TEXT,
    type VARCHAR,
    published_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.excerpt,
        c.type,
        c.published_at,
        ts_rank(to_tsvector('arabic', c.title || ' ' || COALESCE(c.content, '') || ' ' || COALESCE(c.excerpt, '')), 
                plainto_tsquery('arabic', search_query)) as rank
    FROM public.content c
    WHERE c.status = 'published'
    AND (content_type IS NULL OR c.type = content_type)
    AND to_tsvector('arabic', c.title || ' ' || COALESCE(c.content, '') || ' ' || COALESCE(c.excerpt, '')) 
        @@ plainto_tsquery('arabic', search_query)
    ORDER BY rank DESC, c.published_at DESC;
END;
$$ LANGUAGE plpgsql;

-- دالة البحث في الأحداث
CREATE OR REPLACE FUNCTION search_events(search_query TEXT)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.title,
        e.description,
        e.start_date,
        ts_rank(to_tsvector('arabic', e.title || ' ' || COALESCE(e.description, '')), 
                plainto_tsquery('arabic', search_query)) as rank
    FROM public.events e
    WHERE e.status IN ('upcoming', 'ongoing')
    AND to_tsvector('arabic', e.title || ' ' || COALESCE(e.description, '')) 
        @@ plainto_tsquery('arabic', search_query)
    ORDER BY rank DESC, e.start_date ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- تم إدراج البيانات الأولية بنجاح
-- Seed data inserted successfully
-- =====================================================
