import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { BookCatalogItem, LibraryReview, Profile } from "@/types/database";
import { LibraryReviewForm } from "./LibraryReviewForm";
import { deleteLibraryReviewAction, giftFlowerAction } from "./actions";

interface GiftableFlower {
  id: string;
  desert_blooms: { flower_catalog: { name: string; emoji: string | null } | null } | null;
}

interface GroupedGiftableFlower {
  key: string;
  name: string;
  emoji: string | null;
  count: number;
  ids: string[];
}

interface ReviewGift {
  id: string;
  library_review_id: string | null;
  desert_blooms: { flower_catalog: { name: string; emoji: string | null } | null } | null;
}

interface GroupedGift {
  key: string;
  name: string;
  emoji: string | null;
  count: number;
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const { supabase, user } = await requireProfile();

  const { data: bookData } = await supabase
    .from("book_catalog")
    .select("*")
    .eq("id", bookId)
    .eq("is_active", true)
    .maybeSingle();

  const book = bookData as BookCatalogItem | null;
  if (!book) {
    notFound();
  }

  const [{ data: reviewsData }, { data: giftableFlowersData }, { data: reviewGiftsData }] =
    await Promise.all([
      supabase
        .from("library_reviews")
        .select("*")
        .eq("book_id", bookId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("user_flowers")
        .select("id, desert_blooms(flower_catalog(name, emoji))")
        .order("created_at", { ascending: true }),
      supabase
        .from("flower_gifts")
        .select("id, library_review_id, desert_blooms(flower_catalog(name, emoji))"),
    ]);

  const reviews = (reviewsData ?? []) as LibraryReview[];
  const userIds = [...new Set(reviews.map((review) => review.user_id))];
  const giftableFlowers = (giftableFlowersData ?? []) as unknown as GiftableFlower[];
  const reviewGifts = (reviewGiftsData ?? []) as unknown as ReviewGift[];

  const { data: profilesData } = userIds.length
    ? await supabase.from("profiles").select("*").in("user_id", userIds)
    : { data: [] };

  const profileByUserId = new Map(
    ((profilesData ?? []) as Profile[]).map((profile) => [profile.user_id, profile]),
  );

  const groupedGiftableFlowersByKey = new Map<string, GroupedGiftableFlower>();
  for (const flower of giftableFlowers) {
    const catalog = flower.desert_blooms?.flower_catalog;
    const key = catalog?.name ?? "花";
    const existing = groupedGiftableFlowersByKey.get(key);
    if (existing) {
      existing.count += 1;
      existing.ids.push(flower.id);
    } else {
      groupedGiftableFlowersByKey.set(key, {
        key,
        name: key,
        emoji: catalog?.emoji ?? "🌸",
        count: 1,
        ids: [flower.id],
      });
    }
  }
  const groupedGiftableFlowers = Array.from(groupedGiftableFlowersByKey.values());

  const giftsByReviewId = new Map<string, GroupedGift[]>();
  for (const gift of reviewGifts) {
    if (!gift.library_review_id) continue;
    const catalog = gift.desert_blooms?.flower_catalog;
    const key = catalog?.name ?? "花";
    const list = giftsByReviewId.get(gift.library_review_id) ?? [];
    const existing = list.find((entry) => entry.key === key);
    if (existing) {
      existing.count += 1;
    } else {
      list.push({ key, name: key, emoji: catalog?.emoji ?? "🌸", count: 1 });
    }
    giftsByReviewId.set(gift.library_review_id, list);
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <Link
        href="/library"
        className="mb-4 inline-block text-sm text-village-ink/50 hover:text-village-ember"
      >
        ← 図書館に戻る
      </Link>

      <FacilityHeader title={book.title} description={book.author ?? "著者情報準備中"} />

      {book.description ? (
        <p className="mb-8 whitespace-pre-wrap text-sm leading-relaxed text-village-ink/80">
          {book.description}
        </p>
      ) : null}

      <div className="mb-8">
        <LibraryReviewForm bookId={bookId} />
      </div>

      <ul className="flex flex-col gap-4">
        {reviews.map((review) => {
          const author = profileByUserId.get(review.user_id);
          const isOwn = review.user_id === user.id;
          const gifts = giftsByReviewId.get(review.id) ?? [];
          return (
            <li
              key={review.id}
              className="rounded-xl border border-village-border bg-village-paper p-4"
            >
              <div className="mb-2">
                <span className="text-sm font-medium text-village-ink">
                  {author?.nickname ?? "名もなき村人"}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-village-ink/90">
                {review.body}
              </p>

              {gifts.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {gifts.map((gift) => (
                    <span
                      key={gift.key}
                      className="rounded-full bg-village-leaf/10 px-3 py-1 text-xs text-village-leaf"
                    >
                      {gift.emoji} {gift.name}
                      {gift.count > 1 ? ` x${gift.count}` : ""}
                    </span>
                  ))}
                </div>
              ) : null}

              {isOwn ? (
                <div className="mt-3 flex items-center justify-end gap-3">
                  <Link
                    href={`/library/${bookId}/reviews/${review.id}/edit`}
                    className="text-xs text-village-ink/40 hover:text-village-ember"
                  >
                    編集する
                  </Link>
                  <form
                    action={deleteLibraryReviewAction.bind(null, review.id, bookId)}
                    className="contents"
                  >
                    <button
                      type="submit"
                      className="text-xs text-village-ink/40 hover:text-village-ember"
                    >
                      削除する
                    </button>
                  </form>
                </div>
              ) : (
                <details className="mt-3">
                  <summary className="w-fit cursor-pointer rounded-full border border-village-leaf px-4 py-1.5 text-xs font-medium text-village-leaf transition-colors hover:bg-village-leaf/10">
                    花をあげる
                  </summary>
                  <ul className="mt-2 flex flex-col gap-2">
                    {groupedGiftableFlowers.map((flower) => (
                      <li
                        key={flower.key}
                        className="flex items-center justify-between rounded-lg border border-village-border bg-white px-3 py-2"
                      >
                        <span className="text-sm text-village-ink">
                          {flower.emoji} {flower.name} x{flower.count}
                        </span>
                        <form
                          action={giftFlowerAction.bind(
                            null,
                            flower.ids[0],
                            review.user_id,
                            review.id,
                            bookId,
                          )}
                        >
                          <button
                            type="submit"
                            className="rounded-full bg-village-ember px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
                          >
                            あげる
                          </button>
                        </form>
                      </li>
                    ))}
                    {groupedGiftableFlowers.length === 0 ? (
                      <p className="text-xs text-village-ink/40">
                        あげられる花がありません
                      </p>
                    ) : null}
                  </ul>
                </details>
              )}
            </li>
          );
        })}
        {reviews.length === 0 ? (
          <p className="text-center text-sm text-village-ink/50">
            まだ感想がありません。最初の感想を届けてみませんか。
          </p>
        ) : null}
      </ul>
    </main>
  );
}
