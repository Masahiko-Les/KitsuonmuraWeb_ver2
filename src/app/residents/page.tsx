import Link from "next/link";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { Profile } from "@/types/database";

export default async function ResidentsPage() {
  const { supabase } = await requireProfile();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("village_name", { ascending: true });

  const residents = (data ?? []) as Profile[];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <FacilityHeader title="村人一覧" description={`${residents.length}人が暮らしています`} />

      <ul className="flex flex-col gap-3">
        {residents.map((resident) => (
          <li key={resident.id}>
            <Link
              href={`/residents/${resident.id}`}
              className="flex items-center gap-3 rounded-xl border border-village-border bg-village-paper px-4 py-3 transition-colors hover:border-village-ember"
            >
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-village-border bg-white text-lg">
                {resident.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resident.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "🌾"
                )}
              </span>
              <span className="text-village-ink">{resident.village_name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
