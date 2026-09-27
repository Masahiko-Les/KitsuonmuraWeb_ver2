"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface PlantFieldSeedFormState {
  error?: string;
}

export async function plantFieldSeedAction(
  _prevState: PlantFieldSeedFormState,
  formData: FormData,
): Promise<PlantFieldSeedFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const content = String(formData.get("content") ?? "").trim();
  if (!content) {
    return { error: "できたことを書いてから植えてください。" };
  }

  const { error } = await supabase
    .from("garden_seeds")
    .insert({ user_id: user.id, struggle: content, kind: "own_field" });

  if (error) {
    return { error: "種を植えられませんでした。時間をおいて再度お試しください。" };
  }

  revalidatePath("/field");
  return {};
}

export async function waterFieldSeedAction(seedId: string) {
  const supabase = await createClient();
  await supabase.rpc("water_own_field_seed", { p_seed_id: seedId });
  revalidatePath("/field");
}
