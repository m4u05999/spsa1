-- SQL script to create tables needed for dashboard statistics
-- يجب تشغيل هذا السكريبت في Supabase SQL Editor

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'member',
  membership_type TEXT DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content table if it doesn't exist
CREATE TABLE IF NOT EXISTS content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'article', 'news', 'research', 'publication'
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table if it doesn't exist
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'cancelled'
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create membership_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS membership_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  membership_type TEXT DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for testing
INSERT INTO profiles (id, email, full_name, role, membership_type) VALUES
  (gen_random_uuid(), 'admin@spsa.org.sa', 'مدير النظام', 'admin', 'platinum'),
  (gen_random_uuid(), 'member1@spsa.org.sa', 'عضو تجريبي 1', 'member', 'gold'),
  (gen_random_uuid(), 'member2@spsa.org.sa', 'عضو تجريبي 2', 'member', 'silver')
ON CONFLICT (id) DO NOTHING;

INSERT INTO content (title, content_type, status, views_count, likes_count) VALUES
  ('مقال تجريبي 1', 'article', 'published', 150, 25),
  ('خبر تجريبي 1', 'news', 'published', 200, 30),
  ('بحث تجريبي 1', 'research', 'published', 75, 10),
  ('منشور تجريبي 1', 'publication', 'draft', 0, 0);

INSERT INTO events (title, description, start_date, status, participants_count) VALUES
  ('مؤتمر العلوم السياسية 2024', 'مؤتمر سنوي للجمعية', '2024-12-15 09:00:00+03', 'published', 150),
  ('ورشة عمل البحث العلمي', 'ورشة تدريبية', '2024-08-20 14:00:00+03', 'published', 50);

INSERT INTO membership_applications (applicant_name, email, status, membership_type) VALUES
  ('طالب عضوية 1', 'applicant1@example.com', 'pending', 'bronze'),
  ('طالب عضوية 2', 'applicant2@example.com', 'approved', 'silver'),
  ('طالب عضوية 3', 'applicant3@example.com', 'rejected', 'bronze');

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public content is viewable by everyone" ON content FOR SELECT USING (status = 'published');
CREATE POLICY "Public events are viewable by everyone" ON events FOR SELECT USING (status = 'published');
CREATE POLICY "Membership applications viewable by admins" ON membership_applications FOR SELECT USING (true);
