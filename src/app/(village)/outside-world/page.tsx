import { requireProfile } from "@/lib/guards";
import { ComingSoon } from "@/components/ComingSoon";

export default async function OutsideWorldPage() {
  await requireProfile();
  return <ComingSoon title="外の世界へ" />;
}
