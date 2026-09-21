"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface BonfireFormState {
  error?: string;
}

export async function createBonfirePostAction(
  _prevState: BonfireFormState,
  formData: FormData,
): Promise<BonfireFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "気持ちを書いてから投稿してください。" };
  }

  const { error } = await supabase
    .from("bonfire_posts")
    .insert({ user_id: user.id, body });

  if (error) {
    return { error: "投稿できませんでした。時間をおいて再度お試しください。" };
  }

  revalidatePath("/bonfire");
  return {};
}

export async function deleteBonfirePostAction(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("bonfire_posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", postId)
    .eq("user_id", user.id);

  revalidatePath("/bonfire");
}
