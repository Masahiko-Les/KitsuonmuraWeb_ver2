import { requireProfile } from "@/lib/guards";
import { ComingSoon } from "@/components/ComingSoon";
import { LockedFacility } from "@/components/LockedFacility";
import { getBadgeForFacility, isFacilityUnlocked } from "@/lib/unlocks";

export default async function DevStationPage() {
  const { profile } = await requireProfile();

  if (!isFacilityUnlocked(profile.gift_count, "dev-station")) {
    return (
      <LockedFacility
        badge={getBadgeForFacility("dev-station")}
        giftCount={profile.gift_count}
      />
    );
  }

  return <ComingSoon title="開発局" iconSrc="/icons/dev-station.png" />;
}
