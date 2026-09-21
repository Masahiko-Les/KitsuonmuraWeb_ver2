"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface PlantSeedFormState {
  error?: string;
}

export async function plantSeedAction(
  _prevState: PlantSeedFormState,
  formData: FormData,
): Promise<PlantSeedFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const struggle = String(formData.get("struggle") ?? "").trim();
  if (!struggle) {
    return { error: "今の苦労を書いてから植えてください。" };
  }

  const { error } = await supabase
    .from("garden_seeds")
    .insert({ user_id: user.id, struggle });

  if (error) {
    return { error: "種を植えられませんでした。時間をおいて再度お試しください。" };
  }

  revalidatePath("/garden");
  return {};
}

export async function waterSeedAction(seedId: string) {
  const supabase = await createClient();
  await supabase.rpc("water_seed", { p_seed_id: seedId });
  revalidatePath("/garden");
}
