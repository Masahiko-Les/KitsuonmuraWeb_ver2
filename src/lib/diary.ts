import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

interface CatalogRef {
  name: string;
  emoji: string | null;
}

interface CropGiftRow {
  id: string;
  created_at: string;
  giver_id: string;
  harvests: { crop_catalog: CatalogRef | null } | null;
}

interface FlowerGiftRow {
  id: string;
  created_at: string;
  giver_id: string;
  desert_blooms: { flower_catalog: CatalogRef | null } | null;
}

interface OwnFieldHarvestRow {
  id: string;
  created_at: string;
  crop_catalog: CatalogRef | null;
}

interface GardenClaimRow {
  claimed_at: string;
  harvest_id: string;
  harvests: {
    crop_catalog: CatalogRef | null;
    seed_id: string;
    garden_seeds: { user_id: string } | null;
  } | null;
}

interface DesertClaimRow {
  claimed_at: string;
  bloom_id: string;
  desert_blooms: {
    flower_catalog: CatalogRef | null;
    story_id: string;
    desert_stories: { user_id: string } | null;
  } | null;
}

export interface DiaryEntry {
  date: string;
  itemKind: "crop" | "flower";
  itemName: string;
  itemEmoji: string | null;
  suffix: string;
}

export function formatDiaryDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function othersPhrase(
  userIds: string[],
  selfId: string,
  nicknameById: Map<string, string>,
): string {
  return [...new Set(userIds)]
    .filter((id) => id !== selfId)
    .map((id) => `${nicknameById.get(id) ?? "名もなき村人"}さん`)
    .join("・");
}

export async function getDiaryEntries(
  supabase: SupabaseClient,
  userId: string,
): Promise<DiaryEntry[]> {
  const [
    { data: cropGiftsData },
    { data: flowerGiftsData },
    { data: cinemaGiftsData },
    { data: ownFieldData },
    { data: gardenClaimsData },
    { data: desertClaimsData },
  ] = await Promise.all([
    supabase
      .from("crop_gifts")
      .select("id, created_at, giver_id, harvests(crop_catalog(name, emoji))")
      .eq("recipient_id", userId),
    supabase
      .from("flower_gifts")
      .select(
        "id, created_at, giver_id, desert_blooms(flower_catalog(name, emoji))",
      )
      .eq("recipient_id", userId),
    supabase
      .from("cinema_flower_gifts")
      .select(
        "id, created_at, giver_id, desert_blooms(flower_catalog(name, emoji))",
      )
      .eq("recipient_id", userId),
    supabase
      .from("harvests")
      .select("id, created_at, crop_catalog(name, emoji), garden_seeds!inner(user_id, kind)")
      .eq("garden_seeds.user_id", userId)
      .eq("garden_seeds.kind", "own_field"),
    supabase
      .from("garden_harvest_claims")
      .select(
        "claimed_at, harvest_id, harvests(crop_catalog(name, emoji), seed_id, garden_seeds(user_id))",
      )
      .eq("user_id", userId),
    supabase
      .from("desert_bloom_claims")
      .select(
        "claimed_at, bloom_id, desert_blooms(flower_catalog(name, emoji), story_id, desert_stories(user_id))",
      )
      .eq("user_id", userId),
  ]);

  const cropGifts = (cropGiftsData ?? []) as unknown as CropGiftRow[];
  const flowerGifts = (flowerGiftsData ?? []) as unknown as FlowerGiftRow[];
  const cinemaGifts = (cinemaGiftsData ?? []) as unknown as FlowerGiftRow[];
  const ownFieldHarvests = (ownFieldData ?? []) as unknown as OwnFieldHarvestRow[];
  const gardenClaims = (gardenClaimsData ?? []) as unknown as GardenClaimRow[];
  const desertClaims = (desertClaimsData ?? []) as unknown as DesertClaimRow[];

  const gardenSeedIds = [
    ...new Set(
      gardenClaims
        .map((c) => c.harvests?.seed_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const desertStoryIds = [
    ...new Set(
      desertClaims
        .map((c) => c.desert_blooms?.story_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const [{ data: wateringsData }, { data: desertWateringsData }] =
    await Promise.all([
      gardenSeedIds.length
        ? supabase.from("waterings").select("seed_id, user_id").in("seed_id", gardenSeedIds)
        : Promise.resolve({ data: [] as { seed_id: string; user_id: string }[] }),
      desertStoryIds.length
        ? supabase
            .from("desert_waterings")
            .select("story_id, user_id")
            .in("story_id", desertStoryIds)
        : Promise.resolve({ data: [] as { story_id: string; user_id: string }[] }),
    ]);

  const waterersBySeedId = new Map<string, string[]>();
  for (const w of (wateringsData ?? []) as { seed_id: string; user_id: string }[]) {
    const list = waterersBySeedId.get(w.seed_id) ?? [];
    list.push(w.user_id);
    waterersBySeedId.set(w.seed_id, list);
  }

  const waterersByStoryId = new Map<string, string[]>();
  for (const w of (desertWateringsData ?? []) as { story_id: string; user_id: string }[]) {
    const list = waterersByStoryId.get(w.story_id) ?? [];
    list.push(w.user_id);
    waterersByStoryId.set(w.story_id, list);
  }

  const relevantUserIds = [
    ...new Set([
      ...cropGifts.map((g) => g.giver_id),
      ...flowerGifts.map((g) => g.giver_id),
      ...cinemaGifts.map((g) => g.giver_id),
      ...gardenClaims.flatMap((c) => [
        c.harvests?.garden_seeds?.user_id,
        ...(waterersBySeedId.get(c.harvests?.seed_id ?? "") ?? []),
      ]),
      ...desertClaims.flatMap((c) => [
        c.desert_blooms?.desert_stories?.user_id,
        ...(waterersByStoryId.get(c.desert_blooms?.story_id ?? "") ?? []),
      ]),
    ].filter((id): id is string => Boolean(id))),
  ];

  const { data: profilesData } = relevantUserIds.length
    ? await supabase.from("profiles").select("*").in("user_id", relevantUserIds)
    : { data: [] };

  const nicknameById = new Map(
    ((profilesData ?? []) as Profile[]).map((p) => [p.user_id, p.nickname]),
  );

  const entries: DiaryEntry[] = [];

  for (const gift of cropGifts) {
    const catalog = gift.harvests?.crop_catalog;
    entries.push({
      date: gift.created_at,
      itemKind: "crop",
      itemName: catalog?.name ?? "作物",
      itemEmoji: catalog?.emoji ?? "🌾",
      suffix: `を${nicknameById.get(gift.giver_id) ?? "名もなき村人"}さんからもらいました。`,
    });
  }

  for (const gift of [...flowerGifts, ...cinemaGifts]) {
    const catalog = gift.desert_blooms?.flower_catalog;
    entries.push({
      date: gift.created_at,
      itemKind: "flower",
      itemName: catalog?.name ?? "花",
      itemEmoji: catalog?.emoji ?? "🌸",
      suffix: `を${nicknameById.get(gift.giver_id) ?? "名もなき村人"}さんからもらいました。`,
    });
  }

  for (const harvest of ownFieldHarvests) {
    const catalog = harvest.crop_catalog;
    entries.push({
      date: harvest.created_at,
      itemKind: "crop",
      itemName: catalog?.name ?? "作物",
      itemEmoji: catalog?.emoji ?? "🌾",
      suffix: "を自分の畑で収穫しました。",
    });
  }

  for (const claim of gardenClaims) {
    const catalog = claim.harvests?.crop_catalog;
    const others = othersPhrase(
      [
        claim.harvests?.garden_seeds?.user_id ?? "",
        ...(waterersBySeedId.get(claim.harvests?.seed_id ?? "") ?? []),
      ],
      userId,
      nicknameById,
    );
    entries.push({
      date: claim.claimed_at,
      itemKind: "crop",
      itemName: catalog?.name ?? "作物",
      itemEmoji: catalog?.emoji ?? "🌾",
      suffix: others
        ? `を農園で${others}と収穫しました。`
        : "を農園で収穫しました。",
    });
  }

  for (const claim of desertClaims) {
    const catalog = claim.desert_blooms?.flower_catalog;
    const others = othersPhrase(
      [
        claim.desert_blooms?.desert_stories?.user_id ?? "",
        ...(waterersByStoryId.get(claim.desert_blooms?.story_id ?? "") ?? []),
      ],
      userId,
      nicknameById,
    );
    entries.push({
      date: claim.claimed_at,
      itemKind: "flower",
      itemName: catalog?.name ?? "花",
      itemEmoji: catalog?.emoji ?? "🌸",
      suffix: others
        ? `を砂漠で${others}と収穫しました。`
        : "を砂漠で収穫しました。",
    });
  }

  entries.sort((a, b) => (a.date < b.date ? 1 : -1));

  return entries;
}
