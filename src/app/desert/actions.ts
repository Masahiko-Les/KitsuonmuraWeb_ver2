"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface DesertFormState {
  error?: string;
}

export async function createDesertStoryAction(
  _prevState: DesertFormState,
  formData: FormData,
): Promise<DesertFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const suffering = String(formData.get("suffering") ?? "").trim();
  const actionTaken = String(formData.get("action_taken") ?? "").trim();
  const result = String(formData.get("result") ?? "").trim();

  if (!suffering || !actionTaken || !result) {
    return { error: "3つの項目すべてを入力してください。" };
  }

  const { error } = await supabase.from("desert_stories").insert({
    user_id: user.id,
    suffering,
    action_taken: actionTaken,
    result,
  });

  if (error) {
    return { error: "記録できませんでした。時間をおいて再度お試しください。" };
  }

  revalidatePath("/desert");
  return {};
}

export async function deleteDesertStoryAction(storyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("desert_stories")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", storyId)
    .eq("user_id", user.id);

  revalidatePath("/desert");
}
