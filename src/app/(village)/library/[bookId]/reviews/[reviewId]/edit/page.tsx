import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { LibraryReview } from "@/types/database";
import { EditLibraryReviewForm } from "./EditLibraryReviewForm";

export default async function EditLibraryReviewPage({
  params,
}: {
  params: Promise<{ bookId: string; reviewId: string }>;
}) {
  const { bookId, reviewId } = await params;
  const { supabase, user } = await requireProfile();

  const { data } = await supabase
    .from("library_reviews")
    .select("*")
    .eq("id", reviewId)
    .eq("book_id", bookId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  const review = data as LibraryReview | null;
  if (!review) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader title="感想を編集" />
      <EditLibraryReviewForm review={review} bookId={bookId} />
    </main>
  );
}
