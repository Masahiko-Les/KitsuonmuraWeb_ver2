import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { CinemaReview } from "@/types/database";
import { EditCinemaReviewForm } from "./EditCinemaReviewForm";

export default async function EditCinemaReviewPage({
  params,
}: {
  params: Promise<{ movieId: string; reviewId: string }>;
}) {
  const { movieId, reviewId } = await params;
  const { supabase, user } = await requireProfile();

  const { data } = await supabase
    .from("cinema_reviews")
    .select("*")
    .eq("id", reviewId)
    .eq("movie_id", movieId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  const review = data as CinemaReview | null;
  if (!review) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader title="感想を編集" />
      <EditCinemaReviewForm review={review} movieId={movieId} />
    </main>
  );
}
