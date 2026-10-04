import Link from "next/link";
import { requireProfile } from "@/lib/guards";
import { VillageMap } from "@/components/VillageMap";
import { mapHotspots } from "@/config/mapHotspots";
import type { VillageVitalityTier } from "@/types/database";

export default async function VillagePage() {
  const { profile } = await requireProfile();

  // Village vitality's visual feedback (map darkening as tier rises) is
  // temporarily disabled: it was surprising first-time visitors. The
  // backend (decay, offerings, get_village_status()) is untouched — this
  // just pins the map to its brightest look. Revert to
  // `const { data } = await supabase.rpc("get_village_status"); const tier
  // = (data as VillageStatus | null)?.tier ?? 1;` to re-enable.
  const tier: VillageVitalityTier = 1;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <div className="relative mb-6 flex items-center justify-end">
        <div className="text-right">
          <p className="hidden text-sm text-village-ink/60 sm:block">
            おかえりなさい
          </p>
          <h1 className="font-serif text-sm text-village-ink sm:text-2xl">
            {profile.nickname} さん
          </h1>
        </div>
        <p className="absolute inset-x-0 text-center font-serif text-4xl text-village-ink">
          吃音村
        </p>
      </div>

      <VillageMap tier={tier} />

      <p className="mt-6 text-center text-sm text-village-ink/50">
        地図の上の建物をクリックすると、それぞれの場所に移動します。
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
        {mapHotspots.map((spot) => (
          <li key={spot.id}>
            <Link
              href={spot.route}
              className="block rounded-lg border border-village-border bg-village-paper px-3 py-2.5 text-center text-sm text-village-ink transition-colors hover:bg-village-ink/5"
            >
              {spot.facility}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
