"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface DesertFormState {
  error?: string;
}

const MIN_LENGTH = 10;

function readAndValidateFields(formData: FormData): { error: string } | {
  suffering: string;
  actionTaken: string;
  result: string;
} {
  const suffering = String(formData.get("suffering") ?? "").trim();
  const actionTaken = String(formData.get("action_taken") ?? "").trim();
  const result = String(formData.get("result") ?? "").trim();

  if (
    suffering.length < MIN_LENGTH ||
    actionTaken.length < MIN_LENGTH ||
    result.length < MIN_LENGTH
  ) {
    return { error: `3つの項目とも${MIN_LENGTH}文字以上で入力してください。` };
  }

  return { suffering, actionTaken, result };
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

  const fields = readAndValidateFields(formData);
  if ("error" in fields) {
    return fields;
  }

  const { error } = await supabase.from("desert_stories").insert({
    user_id: user.id,
    suffering: fields.suffering,
    action_taken: fields.actionTaken,
    result: fields.result,
  });

  if (error) {
    return { error: "記録できませんでした。時間をおいて再度お試しください。" };
  }

  revalidatePath("/desert");
  return {};
}

export async function updateDesertStoryAction(
  storyId: string,
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

  const fields = readAndValidateFields(formData);
  if ("error" in fields) {
    return fields;
  }

  const { error } = await supabase
    .from("desert_stories")
    .update({
      suffering: fields.suffering,
      action_taken: fields.actionTaken,
      result: fields.result,
    })
    .eq("id", storyId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "更新できませんでした。時間をおいて再度お試しください。" };
  }

  revalidatePath("/desert");
  redirect("/desert");
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
