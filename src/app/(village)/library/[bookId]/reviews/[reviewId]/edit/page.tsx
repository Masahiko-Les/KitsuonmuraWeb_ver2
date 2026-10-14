import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import { LockedFacility } from "@/components/LockedFacility";
import { getBadgeForFacility, isFacilityUnlocked } from "@/lib/unlocks";
import type { LibraryReview } from "@/types/database";
import { EditLibraryReviewForm } from "./EditLibraryReviewForm";

export default async function EditLibraryReviewPage({
  params,
}: {
  params: Promise<{ bookId: string; reviewId: string }>;
}) {
  const { bookId, reviewId } = await params;
  const { supabase, user, profile } = await requireProfile();

  if (!isFacilityUnlocked(profile.gift_count, "library")) {
    return (
      <LockedFacility
        badge={getBadgeForFacility("library")}
        giftCount={profile.gift_count}
      />
    );
  }

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
