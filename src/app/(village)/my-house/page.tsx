import Link from "next/link";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import { ProfileCard } from "@/components/ProfileCard";

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
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <FacilityHeader title="自分の家" />

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-village-ink/80">
          所持している収穫物
        </h2>
        <ul className="flex flex-col gap-3">
          {groupedCrops.map((crop) => (
            <li
              key={crop.key}
              className="flex items-center justify-between rounded-xl border border-village-border bg-white px-4 py-3"
            >
              <span className="text-sm text-village-ink">
                {crop.emoji ?? "🌾"} {crop.name}
              </span>
              <span className="text-sm font-medium text-village-ink/70">
                x {crop.count}
              </span>
            </li>
          ))}
        </ul>
        {groupedCrops.length === 0 ? (
          <p className="text-center text-sm text-village-ink/50">
            まだ収穫物を持っていません。農園で作物を育てましょう。
          </p>
        ) : null}
      </section>

      <section className="mt-8 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-village-ink/80">
          咲かせた花
        </h2>
        <ul className="flex flex-col gap-3">
          {groupedFlowers.map((flower) => (
            <li
              key={flower.key}
              className="flex items-center justify-between rounded-xl border border-village-border bg-white px-4 py-3"
            >
              <span className="text-sm text-village-ink">
                {flower.emoji ?? "🌸"} {flower.name}
              </span>
              <span className="text-sm font-medium text-village-ink/70">
                x {flower.count}
              </span>
            </li>
          ))}
        </ul>
        {groupedFlowers.length === 0 ? (
          <p className="text-center text-sm text-village-ink/50">
            まだ花を咲かせていません。砂漠の開拓で記録に水をあげましょう。
          </p>
        ) : null}
      </section>

      <section className="mt-8 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-village-ink/80">
          村長からもらったバッジ
        </h2>
        <p className="text-center text-sm text-village-ink/50">
          村に貢献すると、村長からバッジがもらえます。
        </p>
      </section>

      <section className="mt-8 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-village-ink/80">
          自分の住民票
        </h2>
        <ProfileCard profile={profile} />
        <div>
          <Link
            href="/town-hall/edit"
            className="rounded-full bg-village-ember px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            住民票を編集する
          </Link>
        </div>
      </section>
    </main>
  );
}
