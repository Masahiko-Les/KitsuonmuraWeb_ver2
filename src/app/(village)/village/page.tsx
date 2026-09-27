import { requireProfile } from "@/lib/guards";
import { VillageMap } from "@/components/VillageMap";
import type { VillageStatus, VillageVitalityTier } from "@/types/database";

export default async function VillagePage() {
  const { supabase, profile } = await requireProfile();

  const { data } = await supabase.rpc("get_village_status");
  const status = data as VillageStatus | null;
  const tier: VillageVitalityTier = status?.tier ?? 1;

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
    </main>
  );
}
