import { createClient } from "@/lib/supabase/server";
import { BADGES } from "@/lib/unlocks";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// Called right after a successful gift_crop/gift_flower RPC call (both
// increment profiles.gift_count by exactly 1 per gift, inside the same
// transaction — so if the RPC didn't error, gift_count moved up by
// exactly 1). Thresholds in BADGES are spaced more than 1 apart, so
// gift_count can only ever land exactly on one the moment it's crossed —
// never again afterward. That makes a single exact-match check on the
// post-gift count sufficient to detect "this specific gift was the one
// that unlocked a facility," with no need to separately track the
// before-gift count.
export async function getJustUnlockedFacilityLabel(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("gift_count")
    .eq("user_id", userId)
    .single();

  const giftCount = data?.gift_count;
  if (giftCount == null) return null;

  const badge = BADGES.find((b) => b.requiredGifts === giftCount);
  return badge?.facilityLabel ?? null;
}
