import { createClient } from '@supabase/supabase-js';

// Environment variables should be automatically set by Vercel
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging
console.log('Supabase URL type:', typeof supabaseUrl);
console.log('Supabase URL value:', supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found in environment variables');
}

// Make sure URL has https:// prefix
let formattedUrl = supabaseUrl;
if (formattedUrl && !formattedUrl.startsWith('http')) {
  formattedUrl = `https://${formattedUrl}`;
  console.log('Formatted URL:', formattedUrl);
}

let supabase = null;
try {
  supabase = createClient(formattedUrl, supabaseAnonKey);
} catch (error) {
  console.error('Error creating Supabase client:', error);
}

export { supabase };