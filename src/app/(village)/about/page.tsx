import { requireProfile } from "@/lib/guards";
import { ComingSoon } from "@/components/ComingSoon";

export default async function AboutPage() {
  await requireProfile();

  return <ComingSoon title="吃音村についてのお話" />;
}
