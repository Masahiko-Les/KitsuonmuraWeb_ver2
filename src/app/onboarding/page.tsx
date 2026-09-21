import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/profile";
import { OnboardingForm } from "./OnboardingForm";

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
    <main className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-village-border bg-village-paper p-8 shadow-lg">
        <h1 className="mb-2 font-serif text-2xl text-village-ink">
          村役場で村人登録
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-village-ink/70">
          この村での住民票を作りましょう。ここで書いた内容は、
          ログインした村人だけが見ることができます。
        </p>
        <OnboardingForm />
      </div>
    </main>
  );
}
