import { createClient } from '@supabase/supabase-js';

// Default values for development/testing when env vars aren't available
// These will be replaced by actual values in production
const DEFAULT_SUPABASE_URL = 'https://fvehsrkarfmmiaqphzls.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2ZWhzcmthcmZtbWlhcXBoemxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNzc3NTYsImV4cCI6MjA2NjY1Mzc1Nn0._-dE4EBkszcgRLCtZTGR3KnTDOs5FI6sTwtSshYYFsY';

// Environment variables should be automatically set by Vercel
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

// Debug logging
console.log('Supabase URL:', supabaseUrl);
// Don't log the full key for security
console.log('Supabase key available:', !!supabaseAnonKey);

// Make sure URL has https:// prefix
let formattedUrl = supabaseUrl;
if (formattedUrl && !formattedUrl.startsWith('http')) {
  formattedUrl = `https://${formattedUrl}`;
  console.log('Formatted URL:', formattedUrl);
}

// Create the Supabase client
let supabase = null;
try {
  if (formattedUrl && supabaseAnonKey) {
    supabase = createClient(formattedUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
  } else {
    console.error('Cannot initialize Supabase client: missing URL or key');
  }
} catch (error) {
  console.error('Error creating Supabase client:', error);
}

export { supabase };