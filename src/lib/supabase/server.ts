import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Demo mode when Supabase credentials are not configured
const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
