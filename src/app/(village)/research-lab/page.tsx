import { requireProfile } from "@/lib/guards";
import { ComingSoon } from "@/components/ComingSoon";
import { LockedFacility } from "@/components/LockedFacility";
import { getBadgeForFacility, isFacilityUnlocked } from "@/lib/unlocks";

export default async function ResearchLabPage() {
  const { profile } = await requireProfile();

  if (!isFacilityUnlocked(profile.gift_count, "research-lab")) {
    return (
      <LockedFacility
        badge={getBadgeForFacility("research-lab")}
        giftCount={profile.gift_count}
      />
    );
  }

  return <ComingSoon title="研究所" iconSrc="/icons/research-lab.png" />;
}
