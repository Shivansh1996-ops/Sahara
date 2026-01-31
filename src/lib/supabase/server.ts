import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function createClient() {
  if (DEMO_MODE) {
    // Return a mock client for demo mode
    return createServerClient(
      "https://demo.supabase.co",
      "demo-anon-key",
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
