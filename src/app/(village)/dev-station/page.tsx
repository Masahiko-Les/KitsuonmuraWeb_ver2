import { requireProfile } from "@/lib/guards";
import { ComingSoon } from "@/components/ComingSoon";

export default async function DevStationPage() {
  await requireProfile();
  return <ComingSoon title="開発局" />;
}
