import { requireProfile } from "@/lib/guards";
import { ComingSoon } from "@/components/ComingSoon";

export default async function LibraryPage() {
  await requireProfile();
  return <ComingSoon title="図書館" />;
}
