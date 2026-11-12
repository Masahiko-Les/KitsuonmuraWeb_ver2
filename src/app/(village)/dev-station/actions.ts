"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface DevStationCommentFormState {
  error?: string;
}

export async function createDevStationCommentAction(
  postId: string,
  _prevState: DevStationCommentFormState,
  formData: FormData,
): Promise<DevStationCommentFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "コメントを書いてから投稿してください。" };
  }

  const { error } = await supabase
    .from("dev_station_comments")
    .insert({ post_id: postId, user_id: user.id, body });

  if (error) {
    return { error: "投稿できませんでした。時間をおいて再度お試しください。" };
  }

  revalidatePath("/dev-station");
  return {};
}

export async function deleteDevStationCommentAction(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("dev_station_comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("user_id", user.id);

  revalidatePath("/dev-station");
}
