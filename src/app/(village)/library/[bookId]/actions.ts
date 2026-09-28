"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface LibraryReviewFormState {
  error?: string;
}

export async function createLibraryReviewAction(
  bookId: string,
  _prevState: LibraryReviewFormState,
  formData: FormData,
): Promise<LibraryReviewFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "感想を書いてから投稿してください。" };
  }

  const { error } = await supabase
    .from("library_reviews")
    .insert({ book_id: bookId, user_id: user.id, body });

  if (error) {
    return { error: "投稿できませんでした。時間をおいて再度お試しください。" };
  }

  revalidatePath(`/library/${bookId}`);
  return {};
}

export async function updateLibraryReviewAction(
  reviewId: string,
  bookId: string,
  _prevState: LibraryReviewFormState,
  formData: FormData,
): Promise<LibraryReviewFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "感想を書いてから保存してください。" };
  }

  const { error } = await supabase
    .from("library_reviews")
    .update({ body })
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "更新できませんでした。時間をおいて再度お試しください。" };
  }

  revalidatePath(`/library/${bookId}`);
  redirect(`/library/${bookId}`);
}

export async function deleteLibraryReviewAction(reviewId: string, bookId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("library_reviews")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", reviewId)
    .eq("user_id", user.id);

  revalidatePath(`/library/${bookId}`);
}

export async function giftFlowerAction(
  userFlowerId: string,
  recipientId: string,
  reviewId: string,
  bookId: string,
) {
  const supabase = await createClient();
  await supabase.rpc("gift_flower", {
    p_user_flower_id: userFlowerId,
    p_recipient_id: recipientId,
    p_library_review_id: reviewId,
  });
  revalidatePath(`/library/${bookId}`);
}
