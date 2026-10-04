import { requireProfile } from "@/lib/guards";
import { ComingSoon } from "@/components/ComingSoon";

export default async function RadioStationPage() {
  await requireProfile();
  return <ComingSoon title="ラジオ局" />;
}
