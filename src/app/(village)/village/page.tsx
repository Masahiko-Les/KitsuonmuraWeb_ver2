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

interface HarvestPerson {
  nickname: string;
  profileId: string;
}

interface ReadyHarvest {
  seed: GardenSeed;
  plantedBy: HarvestPerson | null;
  others: HarvestPerson[];
}

const ABOUT_VILLAGE_TEXT = `吃音村は、吃音者の、吃音者による、吃音者のための村です。

「吃音」という共通の体験を持つ人たちが集まり、互いの苦労や思いを分かち合い、支え合うための場所です。
この村の人々と関わる中で、「吃音を抱えているのは、自分ひとりではない」と感じてもらえたら嬉しいです。
普通の世界では、吃音の苦労はなかなか理解されないことがあります。
しかし、この村では、その苦労を大切なものとして受け止め、分かち合いたいと考えています。

農園では、吃音にまつわる苦労を「種」としてまきます。 その種に村人たちが水をあげ、育った農作物をみんなで分かち合います。誰かの苦労が、誰かを支える糧になる。そんな場所です。

村のはずれには、生きづらさを象徴する「砂漠」があります。 ここでは、吃音を抱えながらも一歩踏み出した挑戦を「種」としてまきます。村人たちは水をあげてその挑戦を応援し、やがて咲いた花をみんなで分かち合います。
村人の挑戦は他の村人たちの新たな勇気にもなると思います。

苦労も、挑戦も、ひとりで抱え込まなくていい。
お互いの弱さを知り、その弱さを価値として分かち合える。
みんなで吃音村を、そんな場所に育てていきたいと思っています。`;

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

        <ul className="mt-4 grid grid-cols-2 gap-2">
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

        <div className="mt-6 rounded-xl border border-village-gold/40 bg-village-timber/60 p-5">
          <h2 className="mb-3 text-center font-serif text-lg text-village-parchment">
            吃音村とは
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-village-parchment/80">
            {ABOUT_VILLAGE_TEXT}
          </p>
          <div className="mt-4 text-center">
            <Link
              href="/about"
              className="inline-block rounded-full border border-village-gold px-5 py-2 text-sm font-medium text-village-gold transition-colors hover:bg-village-gold/10"
            >
              さらに読む
            </Link>
          </div>
        </div>
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
    const plantedBy: HarvestPerson | null =
      seed.user_id === userId
        ? null
        : {
            nickname: profileByUserId.get(seed.user_id)?.nickname ?? "名もなき村人",
            profileId: profileByUserId.get(seed.user_id)?.id ?? "",
          };

    const waterers = waterersBySeedId.get(seed.id) ?? [];
    const others: HarvestPerson[] = waterers
      .filter((id) => id !== userId)
      .map((id) => ({
        nickname: profileByUserId.get(id)?.nickname ?? "名もなき村人",
        profileId: profileByUserId.get(id)?.id ?? "",
      }));

    return { seed, plantedBy, others };
  });
}
