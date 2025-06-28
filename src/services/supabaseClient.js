import { createClient } from '@supabase/supabase-js';

// Hardcoded values from .env file since environment variables aren't loading properly
const supabaseUrl = 'https://fvehsrkarfmmiaqphzls.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2ZWhzcmthcmZtbWlhcXBoemxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNzc3NTYsImV4cCI6MjA2NjY1Mzc1Nn0._-dE4EBkszcgRLCtZTGR3KnTDOs5FI6sTwtSshYYFsY';

// Debug logging
console.log('Supabase URL (hardcoded):', supabaseUrl);
console.log('Supabase key available (hardcoded):', !!supabaseAnonKey);

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