import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/profile";
import { OnboardingFlow } from "./OnboardingFlow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(supabase, user.id);
  if (profile) {
    redirect("/village");
  }

  return (
    <main className="relative flex flex-1 justify-center px-4 py-12">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/village-map.jpg"
          alt=""
          fill
          priority
          className="scale-105 object-cover blur-[2px]"
        />
        <div className="absolute inset-0 bg-village-timber/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-village-timber/70 via-village-timber/35 to-village-timber/75" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="village-auth-card relative overflow-hidden rounded-[28px] px-7 py-8 shadow-[0_20px_50px_rgba(31,20,14,0.45)] sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute inset-[7px] rounded-[21px] border border-village-gold/25" />
          <div className="relative">
            <OnboardingFlow />
          </div>
        </div>
      </div>
    </main>
  );
}
