import { requireProfile } from "@/lib/guards";
import { VillageMap } from "@/components/VillageMap";
import { SignOutButton } from "@/components/SignOutButton";
import type { VillageStatus, VillageVitalityTier } from "@/types/database";

export default async function VillagePage() {
  const { supabase, profile } = await requireProfile();

  const { data } = await supabase.rpc("get_village_status");
  const status = data as VillageStatus | null;
  const tier: VillageVitalityTier = status?.tier ?? 1;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-village-ink/60">おかえりなさい</p>
          <h1 className="font-serif text-2xl text-village-ink">
            {profile.village_name} さん
          </h1>
        </div>
        <SignOutButton />
      </div>

      <VillageMap tier={tier} />

      <p className="mt-6 text-center text-sm text-village-ink/50">
        地図の上の建物をクリックすると、それぞれの場所に移動します。
      </p>
    </main>
  );
}
