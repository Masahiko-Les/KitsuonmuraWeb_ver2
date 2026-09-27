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

  const nickname = String(formData.get("nickname") ?? "").trim();
  if (!nickname) {
    return { error: "ニックネームを入力してください。" };
  }

  const bio = String(formData.get("bio") ?? "").trim();
  const favoriteThings = String(formData.get("favorite_things") ?? "").trim();
  const stutterTypes = formData.getAll("stutter_types").map(String);
  const difficultSounds = formData.getAll("difficult_sounds").map(String);
  const difficultSituations = String(formData.get("difficult_situations") ?? "").trim();
  const easySituations = String(formData.get("easy_situations") ?? "").trim();
  const firstNoticedStutter = String(formData.get("first_noticed_stutter") ?? "").trim();

  const { error } = await supabase.from("profiles").insert({
    user_id: user.id,
    nickname,
    bio: bio || null,
    favorite_things: favoriteThings || null,
    stutter_types: stutterTypes,
    difficult_sounds: difficultSounds,
    difficult_situations: difficultSituations || null,
    easy_situations: easySituations || null,
    first_noticed_stutter: firstNoticedStutter || null,
  });

  if (error) {
    return { error: "登録できませんでした。時間をおいて再度お試しください。" };
  }

  redirect("/village");
}
