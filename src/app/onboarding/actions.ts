"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface OnboardingFormState {
  error?: string;
}

export async function createProfileAction(
  _prevState: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const villageName = String(formData.get("village_name") ?? "").trim();
  if (!villageName) {
    return { error: "村での名前を入力してください。" };
  }

  const bio = String(formData.get("bio") ?? "").trim();
  const stutterTypes = formData.getAll("stutter_types").map(String);
  const difficultSounds = formData.getAll("difficult_sounds").map(String);
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  const { error } = await supabase.from("profiles").insert({
    user_id: user.id,
    village_name: villageName,
    bio: bio || null,
    stutter_types: stutterTypes,
    difficult_sounds: difficultSounds,
    avatar_url: avatarUrl || null,
  });

  if (error) {
    return { error: "登録できませんでした。時間をおいて再度お試しください。" };
  }

  redirect("/village");
}
