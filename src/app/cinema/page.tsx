import { requireProfile } from "@/lib/guards";
import { ComingSoon } from "@/components/ComingSoon";

export default async function CinemaPage() {
  await requireProfile();
  return <ComingSoon title="映画館" />;
}
