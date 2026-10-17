// Facility-unlock badge system. Deliberately pure, DB-free code: thresholds
// live here (not a DB table) and are checked against profile.gift_count,
// which every page already has via requireProfile(). This keeps "is
// facility X unlocked" free of any extra query.

export const ALWAYS_UNLOCKED_FACILITIES = [
  "town-hall",
  "my-house",
  "field",
  "garden",
  "bonfire",
];

export interface BadgeDefinition {
  badgeNumber: number;
  requiredGifts: number;
  facilityKey: string;
  facilityLabel: string;
}

export const BADGES: BadgeDefinition[] = [
  { badgeNumber: 1, requiredGifts: 5, facilityKey: "desert", facilityLabel: "砂漠の開拓" },
  { badgeNumber: 2, requiredGifts: 10, facilityKey: "library", facilityLabel: "図書館" },
  { badgeNumber: 3, requiredGifts: 50, facilityKey: "cinema", facilityLabel: "映画館" },
  { badgeNumber: 4, requiredGifts: 100, facilityKey: "dev-station", facilityLabel: "開発局" },
  { badgeNumber: 5, requiredGifts: 150, facilityKey: "radio-station", facilityLabel: "ラジオ局" },
  { badgeNumber: 6, requiredGifts: 200, facilityKey: "shrine", facilityLabel: "祠" },
  { badgeNumber: 7, requiredGifts: 250, facilityKey: "outside-world", facilityLabel: "外の世界へ" },
  { badgeNumber: 8, requiredGifts: 300, facilityKey: "research-lab", facilityLabel: "研究所" },
];

export function getUnlockedFacilityKeys(giftCount: number): Set<string> {
  const keys = new Set(ALWAYS_UNLOCKED_FACILITIES);
  for (const badge of BADGES) {
    if (giftCount >= badge.requiredGifts) {
      keys.add(badge.facilityKey);
    }
  }
  return keys;
}

export function isFacilityUnlocked(giftCount: number, facilityKey: string): boolean {
  if (ALWAYS_UNLOCKED_FACILITIES.includes(facilityKey)) {
    return true;
  }
  return getUnlockedFacilityKeys(giftCount).has(facilityKey);
}

export function getBadgeForFacility(facilityKey: string): BadgeDefinition {
  const badge = BADGES.find((b) => b.facilityKey === facilityKey);
  if (!badge) {
    throw new Error(`No badge defined for facility: ${facilityKey}`);
  }
  return badge;
}
