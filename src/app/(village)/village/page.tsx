import Link from "next/link";
import { requireProfile } from "@/lib/guards";
import { VillageMap } from "@/components/VillageMap";
import { mapHotspots } from "@/config/mapHotspots";
import type {
  GardenHarvestClaim,
  GardenSeed,
  Profile,
  VillageVitalityTier,
} from "@/types/database";
import { claimGardenHarvestAction } from "../garden/actions";

interface Watering {
  seed_id: string;
  user_id: string;
}

interface Harvest {
  id: string;
  seed_id: string;
}

interface ReadyHarvest {
  seed: GardenSeed;
  plantedByPhrase: string;
  othersPhrase: string;
}

export default async function VillagePage() {
  const { supabase, user, profile } = await requireProfile();

  // Village vitality's visual feedback (map darkening as tier rises) is
  // temporarily disabled: it was surprising first-time visitors. The
  // backend (decay, offerings, get_village_status()) is untouched — this
  // just pins the map to its brightest look. Revert to
  // `const { data } = await supabase.rpc("get_village_status"); const tier
  // = (data as VillageStatus | null)?.tier ?? 1;` to re-enable.
  const tier: VillageVitalityTier = 1;

  const readyHarvests = await getReadyGardenHarvests(supabase, user.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <div className="relative mb-6 flex items-center justify-end">
        <div className="text-right">
          <p className="hidden text-sm text-village-ink/60 sm:block">
            おかえりなさい
          </p>
          <h1 className="font-serif text-sm text-village-ink sm:text-2xl">
            {profile.nickname} さん
          </h1>
        </div>
        <p className="absolute inset-x-0 text-center font-serif text-4xl text-village-ink">
          吃音村
        </p>
      </div>

      {readyHarvests.length > 0 ? (
        <ul className="mb-6 flex flex-col gap-3">
          {readyHarvests.map(({ seed, plantedByPhrase, othersPhrase }) => (
            <li
              key={seed.id}
              data-seed-id={seed.id}
              className="rounded-xl border border-village-border bg-village-paper p-4"
            >
              <p className="text-sm leading-relaxed text-village-ink/90">
                農園で{plantedByPhrase}が蒔いた種が育ち、{othersPhrase}
                と収穫しました。
              </p>
              <form
                action={claimGardenHarvestAction.bind(null, seed.id)}
                className="mt-3"
              >
                <button
                  type="submit"
                  className="rounded-full bg-village-ember px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  受け取る
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}

      <VillageMap tier={tier} />

      <p className="mt-6 text-center text-sm text-village-ink/50">
        地図の上の建物をクリックすると、それぞれの場所に移動します。
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
        {mapHotspots.map((spot) => (
          <li key={spot.id}>
            <Link
              href={spot.route}
              className="block rounded-lg border border-village-border bg-village-paper px-3 py-2.5 text-center text-sm text-village-ink transition-colors hover:bg-village-ink/5"
            >
              {spot.facility}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

async function getReadyGardenHarvests(
  supabase: Awaited<ReturnType<typeof requireProfile>>["supabase"],
  userId: string,
): Promise<ReadyHarvest[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { data: myWateringsData } = await supabase
    .from("waterings")
    .select("seed_id")
    .eq("user_id", userId);
  const myWateredSeedIds = new Set(
    ((myWateringsData ?? []) as { seed_id: string }[]).map((w) => w.seed_id),
  );

  const { data: candidateSeedsData } = await supabase
    .from("garden_seeds")
    .select("*")
    .eq("kind", "community")
    .in("status", ["ripening", "harvested"]);

  const candidateSeeds = ((candidateSeedsData ?? []) as GardenSeed[]).filter(
    (seed) =>
      (seed.user_id === userId || myWateredSeedIds.has(seed.id)) &&
      (seed.status !== "ripening" || (seed.ready_at ?? "") <= today),
  );

  if (candidateSeeds.length === 0) {
    return [];
  }

  const harvestedSeedIds = candidateSeeds
    .filter((seed) => seed.status === "harvested")
    .map((seed) => seed.id);

  const [{ data: harvestsData }, { data: myClaimsData }, { data: wateringsData }] =
    await Promise.all([
      harvestedSeedIds.length
        ? supabase.from("harvests").select("id, seed_id").in("seed_id", harvestedSeedIds)
        : Promise.resolve({ data: [] as Harvest[] }),
      supabase.from("garden_harvest_claims").select("harvest_id").eq("user_id", userId),
      supabase
        .from("waterings")
        .select("seed_id, user_id")
        .in(
          "seed_id",
          candidateSeeds.map((seed) => seed.id),
        ),
    ]);

  const harvestIdBySeedId = new Map(
    ((harvestsData ?? []) as Harvest[]).map((h) => [h.seed_id, h.id]),
  );
  const myClaimedHarvestIds = new Set(
    ((myClaimsData ?? []) as GardenHarvestClaim[]).map((c) => c.harvest_id),
  );

  const unclaimedSeeds = candidateSeeds.filter((seed) => {
    if (seed.status === "ripening") return true;
    const harvestId = harvestIdBySeedId.get(seed.id);
    return harvestId ? !myClaimedHarvestIds.has(harvestId) : false;
  });

  if (unclaimedSeeds.length === 0) {
    return [];
  }

  const waterings = (wateringsData ?? []) as Watering[];
  const waterersBySeedId = new Map<string, string[]>();
  for (const watering of waterings) {
    const list = waterersBySeedId.get(watering.seed_id) ?? [];
    list.push(watering.user_id);
    waterersBySeedId.set(watering.seed_id, list);
  }

  const relevantUserIds = [
    ...new Set([
      ...unclaimedSeeds.map((seed) => seed.user_id),
      ...waterings.map((w) => w.user_id),
    ]),
  ];

  const { data: profilesData } = relevantUserIds.length
    ? await supabase.from("profiles").select("*").in("user_id", relevantUserIds)
    : { data: [] };

  const profileByUserId = new Map(
    ((profilesData ?? []) as Profile[]).map((p) => [p.user_id, p]),
  );

  return unclaimedSeeds.map((seed) => {
    const plantedByPhrase =
      seed.user_id === userId
        ? "自分"
        : `${profileByUserId.get(seed.user_id)?.nickname ?? "名もなき村人"}さん`;

    const waterers = waterersBySeedId.get(seed.id) ?? [];
    const othersPhrase = waterers
      .filter((id) => id !== userId)
      .map((id) => `${profileByUserId.get(id)?.nickname ?? "名もなき村人"}さん`)
      .join("・");

    return { seed, plantedByPhrase, othersPhrase };
  });
}
