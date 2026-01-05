import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAnonymousName } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Check if user profile exists, create if not
      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .single();

      if (!existingProfile) {
        // Create user profile
        await supabase.from("user_profiles").insert({
          user_id: data.user.id,
          anonymous_name: generateAnonymousName(),
        });

        // Create feature gate
        await supabase.from("feature_gates").insert({
          user_id: data.user.id,
          completed_chats: 0,
        });

        // Assign default pet
        const { data: defaultPet } = await supabase
          .from("pets")
          .select("id")
          .eq("is_default", true)
          .single();

        if (defaultPet) {
          await supabase.from("user_pets").insert({
            user_id: data.user.id,
            pet_id: defaultPet.id,
            bond_level: 0,
            is_active: true,
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
