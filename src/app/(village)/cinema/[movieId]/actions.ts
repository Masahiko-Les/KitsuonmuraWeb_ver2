"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface CinemaReviewFormState {
  error?: string;
}

export async function createCinemaReviewAction(
  movieId: string,
  _prevState: CinemaReviewFormState,
  formData: FormData,
): Promise<CinemaReviewFormState> {
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
    .from("cinema_reviews")
    .insert({ movie_id: movieId, user_id: user.id, body });

  if (error) {
    return { error: "投稿できませんでした。時間をおいて再度お試しください。" };
  }

  revalidatePath(`/cinema/${movieId}`);
  return {};
}

export async function updateCinemaReviewAction(
  reviewId: string,
  movieId: string,
  _prevState: CinemaReviewFormState,
  formData: FormData,
): Promise<CinemaReviewFormState> {
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
    .from("cinema_reviews")
    .update({ body })
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "更新できませんでした。時間をおいて再度お試しください。" };
  }

  revalidatePath(`/cinema/${movieId}`);
  redirect(`/cinema/${movieId}`);
}

export async function deleteCinemaReviewAction(reviewId: string, movieId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("cinema_reviews")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", reviewId)
    .eq("user_id", user.id);

  revalidatePath(`/cinema/${movieId}`);
}

export async function giftFlowerAction(
  userFlowerId: string,
  recipientId: string,
  reviewId: string,
  movieId: string,
) {
  const supabase = await createClient();
  await supabase.rpc("gift_flower_to_cinema_review", {
    p_user_flower_id: userFlowerId,
    p_recipient_id: recipientId,
    p_cinema_review_id: reviewId,
  });
  revalidatePath(`/cinema/${movieId}`);
}
