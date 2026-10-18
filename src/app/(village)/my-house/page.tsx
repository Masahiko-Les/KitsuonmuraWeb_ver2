import Image from "next/image";
import Link from "next/link";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import { BADGES } from "@/lib/unlocks";
import { CROP_ICON_SRC } from "@/config/cropIcons";
import { FLOWER_ICON_SRC } from "@/config/flowerIcons";

interface OwnedCrop {
  id: string;
  harvests: {
    crop_catalog: { id: string; name: string; emoji: string | null } | null;
  } | null;
}

interface GroupedCrop {
  key: string;
  name: string;
  emoji: string | null;
  count: number;
}

interface OwnedFlower {
  id: string;
  desert_blooms: {
    flower_catalog: { id: string; name: string; emoji: string | null } | null;
  } | null;
}

export default async function MyHousePage() {
  const { supabase, profile } = await requireProfile();

  const [{ data: cropsData }, { data: flowersData }] = await Promise.all([
    supabase
      .from("user_crops")
      .select("id, harvests(crop_catalog(id, name, emoji))")
      .is("offered_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("user_flowers")
      .select("id, desert_blooms(flower_catalog(id, name, emoji))")
      .order("created_at", { ascending: true }),
  ]);

  const crops = (cropsData ?? []) as unknown as OwnedCrop[];
  const flowers = (flowersData ?? []) as unknown as OwnedFlower[];

  const grouped = new Map<string, GroupedCrop>();
  for (const crop of crops) {
    const catalog = crop.harvests?.crop_catalog;
    const key = catalog?.id ?? "unknown";
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(key, {
        key,
        name: catalog?.name ?? "作物",
        emoji: catalog?.emoji ?? "🌾",
        count: 1,
      });
    }
  }
  const groupedCrops = Array.from(grouped.values());

  const groupedFlowersMap = new Map<string, GroupedCrop>();
  for (const flower of flowers) {
    const catalog = flower.desert_blooms?.flower_catalog;
    const key = catalog?.id ?? "unknown";
    const existing = groupedFlowersMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      groupedFlowersMap.set(key, {
        key,
        name: catalog?.name ?? "花",
        emoji: catalog?.emoji ?? "🌸",
        count: 1,
      });
    }
  }
  const groupedFlowers = Array.from(groupedFlowersMap.values());

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <FacilityHeader title="自分の家" iconSrc="/icons/my-house.png" centered />

      <section className="rounded-2xl border border-village-gold/70 bg-village-parchment p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl">🧺</span>
          <h2 className="font-serif text-lg text-village-ink">
            所持している収穫物
          </h2>
        </div>
        {groupedCrops.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {groupedCrops.map((crop) => (
              <div
                key={crop.key}
                className="flex flex-col items-center gap-1 rounded-xl border border-village-border bg-white px-2 py-2.5 text-center shadow-sm"
              >
                {CROP_ICON_SRC[crop.name] ? (
                  <Image
                    src={CROP_ICON_SRC[crop.name]}
                    alt=""
                    width={36}
                    height={36}
                    className="h-9 w-9 object-contain"
                  />
                ) : (
                  <span className="text-2xl">{crop.emoji ?? "🌾"}</span>
                )}
                <span className="text-xs font-medium text-village-ink">
                  {crop.name}
                </span>
                <span className="text-[11px] text-village-ink/50">
                  ×{crop.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-village-ink/50">
            まだ収穫物を持っていません。農園で作物を育てましょう。
          </p>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-village-gold/70 bg-village-parchment p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl">🌷</span>
          <h2 className="font-serif text-lg text-village-ink">所持している花</h2>
        </div>
        {groupedFlowers.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {groupedFlowers.map((flower) => (
              <div
                key={flower.key}
                className="flex flex-col items-center gap-1 rounded-xl border border-village-border bg-white px-2 py-2.5 text-center shadow-sm"
              >
                {FLOWER_ICON_SRC[flower.name] ? (
                  <Image
                    src={FLOWER_ICON_SRC[flower.name]}
                    alt=""
                    width={36}
                    height={36}
                    className="h-9 w-9 object-contain"
                  />
                ) : (
                  <span className="text-2xl">{flower.emoji ?? "🌸"}</span>
                )}
                <span className="text-xs font-medium text-village-ink">
                  {flower.name}
                </span>
                <span className="text-[11px] text-village-ink/50">
                  ×{flower.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1 text-center">
            <span className="text-4xl">🌼</span>
            <p className="text-sm text-village-ink/50">
              まだ花を咲かせていません。
              <br />
              砂漠で種を蒔いて、水をあげましょう。
            </p>
          </div>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-village-gold/70 bg-village-parchment p-4 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xl">👑</span>
          <h2 className="font-serif text-lg text-village-ink">
            村長からもらったバッジ
          </h2>
        </div>
        <p className="mb-3 text-xs text-village-ink/60">
          これまでに収穫物を{profile.gift_count}回、村人にあげました。
        </p>
        <div className="grid grid-cols-2 gap-2">
          {BADGES.map((badge) => {
            const earned = profile.gift_count >= badge.requiredGifts;
            return (
              <div
                key={badge.badgeNumber}
                className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2.5 shadow-sm ${
                  earned
                    ? "border-village-gold bg-white"
                    : "border-village-border/60 bg-village-ink/5"
                }`}
              >
                <Image
                  src={`/icons/${badge.facilityKey}.png`}
                  alt=""
                  width={40}
                  height={40}
                  className={`h-10 w-10 shrink-0 object-contain ${
                    earned ? "" : "opacity-40 grayscale"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm leading-snug ${
                      earned ? "text-village-ink" : "text-village-ink/40"
                    }`}
                  >
                    {earned ? "" : "🔒 "}
                    {badge.facilityLabel}
                  </p>
                  <p
                    className={`text-xs ${
                      earned ? "text-village-ink/50" : "text-village-ink/30"
                    }`}
                  >
                    {earned
                      ? `${badge.requiredGifts}回達成`
                      : `あと${badge.requiredGifts - profile.gift_count}回`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-5 flex flex-col gap-2">
        <h2 className="text-sm font-medium text-village-ink/80">住民票</h2>
        <div>
          <Link
            href="/town-hall"
            className="rounded-full bg-village-ember px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            住民票を見る
          </Link>
        </div>
      </section>

      <section className="mt-5 flex flex-col gap-2">
        <h2 className="text-sm font-medium text-village-ink/80">日記</h2>
        <p className="text-sm text-village-ink/60">
          この村でのあなたの活動やもらったものが記録されます。
        </p>
        <div>
          <Link
            href="/diary"
            className="rounded-full border border-village-border bg-village-paper px-5 py-2 text-sm font-medium text-village-ink transition-colors hover:bg-village-ink/5"
          >
            日記を見る
          </Link>
        </div>
      </section>
    </main>
  );
}
