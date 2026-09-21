import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";

export default async function LibraryPage() {
  await requireProfile();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader title="図書館" />
      <p className="text-center text-sm text-village-ink/60">
        図書館はまだ準備中です。
      </p>
    </main>
  );
}
