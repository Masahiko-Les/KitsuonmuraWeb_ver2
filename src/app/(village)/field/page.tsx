import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { GardenSeed, SeedStatus } from "@/types/database";
import { SEED_STATUS_LABEL } from "@/types/database";
import { PlantFieldSeedForm } from "./PlantFieldSeedForm";
import { waterFieldSeedAction } from "./actions";

interface SeedHarvest {
  seed_id: string;
  crop_catalog: { name: string; emoji: string | null } | null;
}

export default async function FieldPage() {
  const { supabase, user } = await requireProfile();

  const { data: seedsData } = await supabase
    .from("garden_seeds")
    .select("*")
    .eq("user_id", user.id)
    .eq("kind", "own_field")
    .order("created_at", { ascending: false });

  const seeds = (seedsData ?? []) as GardenSeed[];
  const seedIds = seeds.map((seed) => seed.id);

  const { data: harvestsData } = seedIds.length
    ? await supabase
        .from("harvests")
        .select("seed_id, crop_catalog(name, emoji)")
        .in("seed_id", seedIds)
    : { data: [] };

  const cropsBySeedId = new Map<
    string,
    { name: string; emoji: string | null }[]
  >();
  for (const harvest of (harvestsData ?? []) as unknown as SeedHarvest[]) {
    if (!harvest.crop_catalog) continue;
    const list = cropsBySeedId.get(harvest.seed_id) ?? [];
    list.push(harvest.crop_catalog);
    cropsBySeedId.set(harvest.seed_id, list);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader
        title="自分の家の畑"
        description="自分ができたことを種として植え、翌日から1日1回、自分で水をやりましょう。水をやるたびに実が1つ育ちます。1つの種につき最大10個で収穫は終わり、また新しい種を植えられます。"
      />

      <div className="mb-8">
        <PlantFieldSeedForm />
      </div>

      <ul className="flex flex-col gap-4">
        {seeds.map((seed) => {
          const isDone = seed.harvest_count >= 10;
          const plantedToday = seed.created_at.slice(0, 10) === today;
          const wateredToday = seed.last_watered_date === today;
          const canWater = !isDone && !plantedToday && !wateredToday;
          const crops = cropsBySeedId.get(seed.id) ?? [];
          const statusLabel = SEED_STATUS_LABEL[seed.status as SeedStatus];

          return (
            <li
              key={seed.id}
              className="rounded-xl border border-village-border bg-village-paper p-4"
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="rounded-full bg-village-leaf/10 px-3 py-0.5 text-xs text-village-leaf">
                  {statusLabel}
                </span>
                <span className="text-xs text-village-ink/50">
                  収穫: {seed.harvest_count} / 10
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-village-ink/90">
                {seed.struggle}
              </p>

              {crops.length > 0 ? (
                <p className="mt-3 text-sm text-village-ink/70">
                  {crops
                    .map((crop) => `${crop.emoji ?? "🌾"} ${crop.name}`)
                    .join("・")}{" "}
                  が実りました
                </p>
              ) : null}

              {canWater ? (
                <form action={waterFieldSeedAction.bind(null, seed.id)} className="mt-3">
                  <button
                    type="submit"
                    className="rounded-full border border-village-leaf px-4 py-1.5 text-xs font-medium text-village-leaf transition-colors hover:bg-village-leaf/10"
                  >
                    水をやる
                  </button>
                </form>
              ) : (
                <p className="mt-3 text-xs text-village-ink/40">
                  {isDone
                    ? "この種の収穫は終わりました。"
                    : plantedToday
                      ? "植えたばかりです。明日から水やりができます。"
                      : "今日はもう水をあげました。また明日。"}
                </p>
              )}
            </li>
          );
        })}
        {seeds.length === 0 ? (
          <p className="text-center text-sm text-village-ink/50">
            まだ種が植えられていません。今日できたことを、種として植えてみませんか。
          </p>
        ) : null}
      </ul>
    </main>
  );
}
