// Hand-written types matching supabase/migrations/*.sql.
// Keep in sync manually until `supabase gen types typescript` is wired up.

export type StutterType = "難発" | "連発" | "伸発" | "その他";

export const STUTTER_TYPES: StutterType[] = ["難発", "連発", "伸発", "その他"];

export const DIFFICULT_SOUND_ROWS: string[][] = [
  ["あ", "い", "う", "え", "お"],
  ["か", "き", "く", "け", "こ"],
  ["が", "ぎ", "ぐ", "げ", "ご"],
  ["さ", "し", "す", "せ", "そ"],
  ["ざ", "じ", "ず", "ぜ", "ぞ"],
  ["た", "ち", "つ", "て", "と"],
  ["だ", "ぢ", "づ", "で", "ど"],
  ["な", "に", "ぬ", "ね", "の"],
  ["は", "ひ", "ふ", "へ", "ほ"],
  ["ば", "び", "ぶ", "べ", "ぼ"],
  ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"],
  ["ま", "み", "む", "め", "も"],
  ["や", "ゆ", "よ"],
  ["ら", "り", "る", "れ", "ろ"],
  ["わ", "を", "ん"],
];

export interface Profile {
  id: string;
  user_id: string;
  village_name: string;
  bio: string | null;
  stutter_types: string[];
  difficult_sounds: string[];
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type SeedStatus = "seed" | "growing" | "harvested";

export const SEED_STATUS_LABEL: Record<SeedStatus, string> = {
  seed: "種",
  growing: "芽が出た",
  harvested: "収穫",
};

export interface BonfirePost {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GardenSeed {
  id: string;
  user_id: string;
  struggle: string;
  status: SeedStatus;
  created_at: string;
  harvested_at: string | null;
}

export interface Watering {
  id: string;
  seed_id: string;
  user_id: string;
  created_at: string;
}

export interface CropCatalogItem {
  id: string;
  name: string;
  emoji: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Harvest {
  id: string;
  seed_id: string;
  crop_id: string;
  created_at: string;
}

export interface UserCrop {
  id: string;
  user_id: string;
  harvest_id: string;
  offered_at: string | null;
  created_at: string;
}

export interface Offering {
  id: string;
  user_id: string;
  user_crop_id: string;
  created_at: string;
}

export interface DesertStory {
  id: string;
  user_id: string;
  suffering: string;
  action_taken: string;
  result: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type VillageVitalityTier = 1 | 2 | 3 | 4;

export interface VillageStatus {
  tier: VillageVitalityTier;
  message: string;
}
