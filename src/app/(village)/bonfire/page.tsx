import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import { CropIcon } from "@/components/CropIcon";
import { FlowerIcon } from "@/components/FlowerIcon";
import type { BonfirePost, Profile } from "@/types/database";
import { BonfireForm } from "./BonfireForm";
import { GiftPickerButton, type GiftableItem } from "./GiftPickerButton";
import { deleteBonfirePostAction } from "./actions";

interface CatalogRef {
  name: string;
  emoji: string | null;
}

interface GiftableCrop {
  id: string;
  harvests: { crop_catalog: CatalogRef | null } | null;
}

interface GiftableFlower {
  id: string;
  desert_blooms: { flower_catalog: CatalogRef | null } | null;
}

interface PostCropGift {
  id: string;
  bonfire_post_id: string | null;
  harvests: { crop_catalog: CatalogRef | null } | null;
}

interface PostFlowerGift {
  id: string;
  bonfire_post_id: string | null;
  desert_blooms: { flower_catalog: CatalogRef | null } | null;
}

interface GroupedGift {
  key: string;
  kind: "crop" | "flower";
  name: string;
  emoji: string | null;
  count: number;
}

export default async function BonfirePage() {
  const { supabase, user } = await requireProfile();

  const [
    { data: postsData },
    { data: giftableCropsData },
    { data: giftableFlowersData },
    { data: postCropGiftsData },
    { data: postFlowerGiftsData },
  ] = await Promise.all([
    supabase
      .from("bonfire_posts")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("user_crops")
      .select("id, harvests(crop_catalog(name, emoji))")
      .is("offered_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("user_flowers")
      .select("id, desert_blooms(flower_catalog(name, emoji))")
      .order("created_at", { ascending: true }),
    supabase
      .from("crop_gifts")
      .select("id, bonfire_post_id, harvests(crop_catalog(name, emoji))"),
    supabase
      .from("flower_gifts")
      .select("id, bonfire_post_id, desert_blooms(flower_catalog(name, emoji))"),
  ]);

  const posts = (postsData ?? []) as BonfirePost[];
  const userIds = [...new Set(posts.map((post) => post.user_id))];
  const giftableCrops = (giftableCropsData ?? []) as unknown as GiftableCrop[];
  const giftableFlowers = (giftableFlowersData ?? []) as unknown as GiftableFlower[];
  const postCropGifts = (postCropGiftsData ?? []) as unknown as PostCropGift[];
  const postFlowerGifts = (postFlowerGiftsData ?? []) as unknown as PostFlowerGift[];

  const { data: profilesData } = userIds.length
    ? await supabase.from("profiles").select("*").in("user_id", userIds)
    : { data: [] };

  const profileByUserId = new Map(
    ((profilesData ?? []) as Profile[]).map((profile) => [profile.user_id, profile]),
  );

  const giftsByPostId = new Map<string, GroupedGift[]>();
  function addGift(
    postId: string | null,
    kind: "crop" | "flower",
    catalog: CatalogRef | null | undefined,
  ) {
    if (!postId) return;
    const name = catalog?.name ?? (kind === "crop" ? "作物" : "花");
    const key = `${kind}:${name}`;
    const list = giftsByPostId.get(postId) ?? [];
    const existing = list.find((entry) => entry.key === key);
    if (existing) {
      existing.count += 1;
    } else {
      list.push({
        key,
        kind,
        name,
        emoji: catalog?.emoji ?? (kind === "crop" ? "🌾" : "🌸"),
        count: 1,
      });
    }
    giftsByPostId.set(postId, list);
  }
  for (const gift of postCropGifts) {
    addGift(gift.bonfire_post_id, "crop", gift.harvests?.crop_catalog);
  }
  for (const gift of postFlowerGifts) {
    addGift(gift.bonfire_post_id, "flower", gift.desert_blooms?.flower_catalog);
  }

  const giftableItemsByKey = new Map<string, GiftableItem>();
  for (const crop of giftableCrops) {
    const catalog = crop.harvests?.crop_catalog;
    const name = catalog?.name ?? "作物";
    const key = `crop:${name}`;
    const existing = giftableItemsByKey.get(key);
    if (existing) {
      existing.count += 1;
      existing.ids.push(crop.id);
    } else {
      giftableItemsByKey.set(key, {
        key,
        kind: "crop",
        name,
        emoji: catalog?.emoji ?? "🌾",
        count: 1,
        ids: [crop.id],
      });
    }
  }
  for (const flower of giftableFlowers) {
    const catalog = flower.desert_blooms?.flower_catalog;
    const name = catalog?.name ?? "花";
    const key = `flower:${name}`;
    const existing = giftableItemsByKey.get(key);
    if (existing) {
      existing.count += 1;
      existing.ids.push(flower.id);
    } else {
      giftableItemsByKey.set(key, {
        key,
        kind: "flower",
        name,
        emoji: catalog?.emoji ?? "🌸",
        count: 1,
        ids: [flower.id],
      });
    }
  }
  const giftableItems = Array.from(giftableItemsByKey.values());

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader
        title="焚き火"
        iconSrc="/icons/bonfire.png"
        centered
        description="焚き火を囲みながら、吃音にまつわる日々の気持ちや出来事を、ポツリポツリとつぶやいてみませんか。"
      />

      <div className="mb-8">
        <BonfireForm />
      </div>

      <ul className="flex flex-col gap-4">
        {posts.map((post) => {
          const author = profileByUserId.get(post.user_id);
          const isOwn = post.user_id === user.id;
          const gifts = giftsByPostId.get(post.id) ?? [];
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

              {gifts.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {gifts.map((gift) => (
                    <span
                      key={gift.key}
                      className="flex items-center gap-1 rounded-full bg-village-leaf/10 px-3 py-1 text-xs text-village-leaf"
                    >
                      {gift.kind === "flower" ? (
                        <FlowerIcon name={gift.name} emoji={gift.emoji} size={16} />
                      ) : (
                        <CropIcon name={gift.name} emoji={gift.emoji} size={16} />
                      )}
                      {gift.name}
                      {gift.count > 1 ? ` x${gift.count}` : ""}
                    </span>
                  ))}
                </div>
              ) : null}

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
                <GiftPickerButton
                  items={giftableItems}
                  recipientId={post.user_id}
                  postId={post.id}
                />
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
