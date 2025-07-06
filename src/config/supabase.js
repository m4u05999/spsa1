/**
 * Supabase Configuration
 * تكوين Supabase للمشروع
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dufvobubfjicrkygwyll.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZnZvYnViZmppY3JreWd3eWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTE1MzYsImV4cCI6MjA2NzA2NzUzNn0.nKBHVhYR5tgZvS45E9Tq7NqeFzQ8v4DS-jDjLZlR0Yo';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Export configuration for use in other parts of the app
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey
};

export default supabase;
