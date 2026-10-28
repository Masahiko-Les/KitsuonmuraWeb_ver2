import Link from "next/link";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { Profile } from "@/types/database";

export default async function ResidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { supabase } = await requireProfile();
  const { sort } = await searchParams;
  const sortByName = sort === "name";

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order(sortByName ? "nickname" : "created_at", {
      ascending: sortByName,
    });

  const residents = (data ?? []) as Profile[];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <FacilityHeader title="村人一覧" description={`${residents.length}人が暮らしています`} />

      <div className="mb-4 flex gap-2">
        <Link
          href="/residents?sort=date"
          className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
            !sortByName
              ? "border-village-ember bg-village-ember text-white"
              : "border-village-border text-village-ink/60 hover:border-village-ember"
          }`}
        >
          登録日順
        </Link>
        <Link
          href="/residents?sort=name"
          className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
            sortByName
              ? "border-village-ember bg-village-ember text-white"
              : "border-village-border text-village-ink/60 hover:border-village-ember"
          }`}
        >
          名前順（あいうえお順）
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {residents.map((resident) => (
          <li key={resident.id}>
            <Link
              href={`/residents/${resident.id}`}
              className="flex items-center gap-3 rounded-xl border border-village-border bg-village-paper px-4 py-3 transition-colors hover:border-village-ember"
            >
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-village-border bg-white text-lg">
                🌾
              </span>
              <span className="text-village-ink">{resident.nickname}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
