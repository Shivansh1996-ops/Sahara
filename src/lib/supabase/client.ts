import { createBrowserClient } from "@supabase/ssr";

// Check if Supabase is properly configured (not placeholder values)
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Check if values exist and are not placeholder values
  if (!url || !key) return false;
  if (url.includes('your_') || url.includes('placeholder') || url === 'your_supabase_project_url') return false;
  if (key.includes('your_') || key.includes('placeholder') || key === 'your_supabase_anon_key') return false;
  if (!url.startsWith('https://')) return false;
  
  return true;
}

// Demo mode when Supabase credentials are not configured
const DEMO_MODE = !isSupabaseConfigured();

export function createClient() {
  if (DEMO_MODE) {
    // Return a mock client for demo mode
    return createBrowserClient(
      "https://demo.supabase.co",
      "demo-anon-key"
    );
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function isDemoMode() {
  return DEMO_MODE;
}
