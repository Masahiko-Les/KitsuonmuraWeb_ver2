import { requireProfile } from "@/lib/guards";
import { ComingSoon } from "@/components/ComingSoon";
import { LockedFacility } from "@/components/LockedFacility";
import { getBadgeForFacility, isFacilityUnlocked } from "@/lib/unlocks";

export default async function RadioStationPage() {
  const { profile } = await requireProfile();

  if (!isFacilityUnlocked(profile.gift_count, "radio-station")) {
    return (
      <LockedFacility
        badge={getBadgeForFacility("radio-station")}
        giftCount={profile.gift_count}
      />
    );
  }

  return <ComingSoon title="ラジオ局" iconSrc="/icons/radio-station.png" />;
}
