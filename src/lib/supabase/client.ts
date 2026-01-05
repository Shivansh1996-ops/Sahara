import { createBrowserClient } from "@supabase/ssr";

// Demo mode when Supabase credentials are not configured
const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
