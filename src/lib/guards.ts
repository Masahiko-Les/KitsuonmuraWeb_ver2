import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/profile";
import { VERIFIED_USER_HEADER } from "@/lib/supabase/middleware";

// Every page under the village calls this first: no session -> /login,
// session but no 住民票 yet -> /onboarding. Keeps the "register before you
// can do anything in the village" rule in one place.
export async function requireProfile() {
  const supabase = await createClient();

  // proxy.ts/updateSession() already ran auth.getUser() for this exact
  // request and left its result in this header, which it unconditionally
  // overwrites (or clears) on every request — a client can't set this
  // itself and have it survive to here. Trusting it here skips a second,
  // redundant auth.getUser() round trip to Supabase Auth on every single
  // page load. Falls back to calling it directly if the header is somehow
  // missing (e.g. a path not covered by proxy.ts's matcher).
  const verifiedUserId = (await headers()).get(VERIFIED_USER_HEADER);

  let userId: string | null = verifiedUserId;
  if (!userId) {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    userId = authUser?.id ?? null;
  }

  if (!userId) {
    redirect("/login");
  }

  const user = { id: userId };
  const profile = await getProfileByUserId(supabase, user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return { supabase, user, profile };
}
