import { requireProfile } from "@/lib/guards";
import { ComingSoon } from "@/components/ComingSoon";

export default async function FieldPage() {
  await requireProfile();
  return <ComingSoon title="畑" />;
}
