import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { GardenSeed, Profile, SeedStatus } from "@/types/database";
import { SEED_STATUS_LABEL } from "@/types/database";
import { PlantSeedForm } from "./PlantSeedForm";
import { waterSeedAction } from "./actions";

interface HarvestWithCrop {
  seed_id: string;
  crop_catalog: { name: string; emoji: string | null } | null;
}

export default async function GardenPage() {
  const { supabase, user } = await requireProfile();

  const { data: seedsData } = await supabase
    .from("garden_seeds")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const seeds = (seedsData ?? []) as GardenSeed[];
  const userIds = [...new Set(seeds.map((seed) => seed.user_id))];
  const harvestedSeedIds = seeds
    .filter((seed) => seed.status === "harvested")
    .map((seed) => seed.id);

  const [{ data: profilesData }, { data: waterings }, { data: harvestsData }] =
    await Promise.all([
      userIds.length
        ? supabase.from("profiles").select("*").in("user_id", userIds)
        : Promise.resolve({ data: [] as Profile[] }),
      supabase.from("waterings").select("seed_id").eq("user_id", user.id),
      harvestedSeedIds.length
        ? supabase
            .from("harvests")
            .select("seed_id, crop_catalog(name, emoji)")
            .in("seed_id", harvestedSeedIds)
        : Promise.resolve({ data: [] as HarvestWithCrop[] }),
    ]);

  const profileByUserId = new Map(
    ((profilesData ?? []) as Profile[]).map((profile) => [profile.user_id, profile]),
  );
  const wateredSeedIds = new Set(
    (waterings ?? []).map((row: { seed_id: string }) => row.seed_id),
  );
  const cropBySeedId = new Map(
    ((harvestsData ?? []) as unknown as HarvestWithCrop[]).map((h) => [
      h.seed_id,
      h.crop_catalog,
    ]),
  );

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader
        title="農園"
        description="自分の苦労を種として植え、他の村人の種に水をやりましょう。3人が水をやると、実を結びます。"
      />

      <div className="mb-8">
        <PlantSeedForm />
      </div>

      <ul className="flex flex-col gap-4">
        {seeds.map((seed) => {
          const planter = profileByUserId.get(seed.user_id);
          const isOwn = seed.user_id === user.id;
          const alreadyWatered = wateredSeedIds.has(seed.id);
          const canWater = !isOwn && seed.status !== "harvested" && !alreadyWatered;
          const crop = cropBySeedId.get(seed.id);
          const statusLabel = SEED_STATUS_LABEL[seed.status as SeedStatus];

          return (
            <li
              key={seed.id}
              className="rounded-xl border border-village-border bg-village-paper p-4"
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-village-ink">
                  {planter?.village_name ?? "名もなき村人"}
                </span>
                <span className="rounded-full bg-village-leaf/10 px-3 py-0.5 text-xs text-village-leaf">
                  {statusLabel}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-village-ink/90">
                {seed.struggle}
              </p>

              {seed.status === "harvested" && crop ? (
                <p className="mt-3 text-sm text-village-ink/70">
                  {crop.emoji ?? "🌾"} {crop.name} が実りました
                </p>
              ) : null}

              {canWater ? (
                <form action={waterSeedAction.bind(null, seed.id)} className="mt-3">
                  <button
                    type="submit"
                    className="rounded-full border border-village-leaf px-4 py-1.5 text-xs font-medium text-village-leaf transition-colors hover:bg-village-leaf/10"
                  >
                    水をやる
                  </button>
                </form>
              ) : null}

              {isOwn ? (
                <p className="mt-3 text-xs text-village-ink/40">
                  自分の種には水をやれません
                </p>
              ) : alreadyWatered && seed.status !== "harvested" ? (
                <p className="mt-3 text-xs text-village-ink/40">
                  すでに水をあげました
                </p>
              ) : null}
            </li>
          );
        })}
        {seeds.length === 0 ? (
          <p className="text-center text-sm text-village-ink/50">
            まだ種が植えられていません。最初の種を植えてみませんか。
          </p>
        ) : null}
      </ul>
    </main>
  );
}
