import { requireProfile } from "@/lib/guards";
import { ComingSoon } from "@/components/ComingSoon";

export default async function MyHousePage() {
  await requireProfile();
  return <ComingSoon title="自分の家" />;
}
