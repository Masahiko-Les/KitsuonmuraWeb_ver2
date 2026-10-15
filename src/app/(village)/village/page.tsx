import Image from "next/image";
import Link from "next/link";
import { requireProfile } from "@/lib/guards";
import { VillageMap } from "@/components/VillageMap";
import { VillageHeader } from "@/components/VillageHeader";
import { GardenHarvestModal } from "@/components/GardenHarvestModal";
import { mapHotspots } from "@/config/mapHotspots";
import { getUnlockedFacilityKeys } from "@/lib/unlocks";
import type {
  GardenHarvestClaim,
  GardenSeed,
  Profile,
  VillageVitalityTier,
} from "@/types/database";

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
  const unlockedFacilityKeys = getUnlockedFacilityKeys(profile.gift_count);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col pb-8">
      <VillageHeader nickname={profile.nickname} />

      <GardenHarvestModal harvests={readyHarvests} />

      <VillageMap tier={tier} unlockedFacilityKeys={unlockedFacilityKeys} />

      <section className="village-woodgrain px-4 pt-6 pb-8 sm:rounded-b-2xl">
        <p className="text-center text-sm text-village-parchment/70">
          地図の上の建物をクリックすると、それぞれの場所に移動します。
        </p>

        <ul className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
          {mapHotspots.map((spot) => {
            const isLocked = !unlockedFacilityKeys.has(spot.id);
            return (
              <li key={spot.id}>
                <Link
                  href={spot.route}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-transform active:scale-95 ${
                    isLocked
                      ? "border-village-gold/30 bg-village-timber text-village-parchment/40"
                      : "border-village-gold bg-village-parchment text-village-ink shadow-sm"
                  }`}
                >
                  <Image
                    src={spot.iconSrc}
                    alt=""
                    width={32}
                    height={32}
                    className={`h-8 w-8 object-contain ${isLocked ? "opacity-40 grayscale" : ""}`}
                  />
                  <span className="flex-1 text-center">
                    {isLocked ? "🔒 " : ""}
                    {spot.facility}
                  </span>
                  <span
                    aria-hidden
                    className={isLocked ? "text-village-parchment/30" : "text-village-gold"}
                  >
                    ›
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
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
