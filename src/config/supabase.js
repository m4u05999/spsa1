/**
 * Supabase Configuration
 * تكوين Supabase للمشروع
 */

import { createClient } from '@supabase/supabase-js';
import { getFeatureFlag } from './featureFlags.js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase should be enabled
const isSupabaseEnabled = getFeatureFlag('ENABLE_SUPABASE_FALLBACK', false) && supabaseUrl && supabaseAnonKey;

// Validate URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Create Supabase client only if enabled and URL is valid
let supabaseClient = null;

if (isSupabaseEnabled && isValidUrl(supabaseUrl)) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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
  } catch (error) {
    console.warn('⚠️ Failed to create Supabase client:', error.message);
    supabaseClient = null;
  }
} else {
  console.info('ℹ️ Supabase is disabled or not configured properly');
}

export const supabase = supabaseClient;

// Export configuration for use in other parts of the app
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey
};

export default supabase;
