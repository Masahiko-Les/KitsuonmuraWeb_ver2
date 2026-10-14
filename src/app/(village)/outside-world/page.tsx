import { requireProfile } from "@/lib/guards";
import { ComingSoon } from "@/components/ComingSoon";
import { LockedFacility } from "@/components/LockedFacility";
import { getBadgeForFacility, isFacilityUnlocked } from "@/lib/unlocks";

export default async function OutsideWorldPage() {
  const { profile } = await requireProfile();

  if (!isFacilityUnlocked(profile.gift_count, "outside-world")) {
    return (
      <LockedFacility
        badge={getBadgeForFacility("outside-world")}
        giftCount={profile.gift_count}
      />
    );
  }

  return <ComingSoon title="外の世界へ" />;
}
