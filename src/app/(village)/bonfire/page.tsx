import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { BonfirePost, Profile } from "@/types/database";
import { BonfireForm } from "./BonfireForm";
import { deleteBonfirePostAction, giftCropAction } from "./actions";

interface GiftableCrop {
  id: string;
  harvests: { crop_catalog: { name: string; emoji: string | null } | null } | null;
}

export default async function BonfirePage() {
  const { supabase, user } = await requireProfile();

  const [{ data: postsData }, { data: giftableCropsData }] = await Promise.all([
    supabase
      .from("bonfire_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("user_crops")
      .select("id, harvests(crop_catalog(name, emoji))")
      .is("offered_at", null)
      .order("created_at", { ascending: true }),
  ]);

  const posts = (postsData ?? []) as BonfirePost[];
  const userIds = [...new Set(posts.map((post) => post.user_id))];
  const giftableCrops = (giftableCropsData ?? []) as unknown as GiftableCrop[];

  const { data: profilesData } = userIds.length
    ? await supabase.from("profiles").select("*").in("user_id", userIds)
    : { data: [] };

  const profileByUserId = new Map(
    ((profilesData ?? []) as Profile[]).map((profile) => [profile.user_id, profile]),
  );

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader
        title="焚き火"
        description="日々の気持ちや出来事を、気軽に分かち合う場所です。"
      />

      <div className="mb-8">
        <BonfireForm />
      </div>

      <ul className="flex flex-col gap-4">
        {posts.map((post) => {
          const author = profileByUserId.get(post.user_id);
          const isOwn = post.user_id === user.id;
          return (
            <li
              key={post.id}
              className="rounded-xl border border-village-border bg-village-paper p-4"
            >
              <div className="mb-2">
                <span className="text-sm font-medium text-village-ink">
                  {author?.nickname ?? "名もなき村人"}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-village-ink/90">
                {post.body}
              </p>

              {isOwn ? (
                <form
                  action={deleteBonfirePostAction.bind(null, post.id)}
                  className="mt-2 text-right"
                >
                  <button
                    type="submit"
                    className="text-xs text-village-ink/40 hover:text-village-ember"
                  >
                    削除する
                  </button>
                </form>
              ) : (
                <details className="mt-3">
                  <summary className="w-fit cursor-pointer rounded-full border border-village-leaf px-4 py-1.5 text-xs font-medium text-village-leaf transition-colors hover:bg-village-leaf/10">
                    農作物をあげる
                  </summary>
                  <ul className="mt-2 flex flex-col gap-2">
                    {giftableCrops.map((crop) => (
                      <li
                        key={crop.id}
                        className="flex items-center justify-between rounded-lg border border-village-border bg-white px-3 py-2"
                      >
                        <span className="text-sm text-village-ink">
                          {crop.harvests?.crop_catalog?.emoji ?? "🌾"}{" "}
                          {crop.harvests?.crop_catalog?.name ?? "作物"}
                        </span>
                        <form
                          action={giftCropAction.bind(
                            null,
                            crop.id,
                            post.user_id,
                            post.id,
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
                    {giftableCrops.length === 0 ? (
                      <p className="text-xs text-village-ink/40">
                        あげられる作物がありません
                      </p>
                    ) : null}
                  </ul>
                </details>
              )}
            </li>
          );
        })}
        {posts.length === 0 ? (
          <p className="text-center text-sm text-village-ink/50">
            まだ投稿がありません。最初のひとことを届けてみませんか。
          </p>
        ) : null}
      </ul>
    </main>
  );
}
