import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/profile";

// Every page under the village calls this first: no session -> /login,
// session but no 住民票 yet -> /onboarding. Keeps the "register before you
// can do anything in the village" rule in one place.
export async function requireProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(supabase, user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return { supabase, user, profile };
}
