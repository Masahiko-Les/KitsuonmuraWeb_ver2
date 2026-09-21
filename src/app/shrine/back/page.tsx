import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { Profile } from "@/types/database";

interface OfferingHistoryRow {
  id: string;
  created_at: string;
  user_id: string;
  crop_name: string;
  crop_emoji: string | null;
}

export default async function ShrineBackPage() {
  const { supabase } = await requireProfile();

  const { data } = await supabase.rpc("get_offering_history");
  const offerings = (data ?? []) as OfferingHistoryRow[];
  const userIds = [...new Set(offerings.map((o) => o.user_id))];

  const { data: profilesData } = userIds.length
    ? await supabase.from("profiles").select("*").in("user_id", userIds)
    : { data: [] };

  const profileByUserId = new Map(
    ((profilesData ?? []) as Profile[]).map((profile) => [profile.user_id, profile]),
  );

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader
        title="祠の裏"
        description="これまで、誰がどんな作物をお供えしてくれたのかを、静かに見ることができます。"
      />

      <ul className="flex flex-col gap-2">
        {offerings.map((offering) => {
          const author = profileByUserId.get(offering.user_id);
          return (
            <li
              key={offering.id}
              className="flex items-center justify-between rounded-lg border border-village-border bg-village-paper px-4 py-2.5 text-sm"
            >
              <span className="text-village-ink">
                {author?.village_name ?? "名もなき村人"}さん
              </span>
              <span className="text-village-ink/70">
                {offering.crop_emoji ?? "🌾"} {offering.crop_name}
              </span>
              <time className="text-xs text-village-ink/40">
                {new Date(offering.created_at).toLocaleDateString("ja-JP")}
              </time>
            </li>
          );
        })}
        {offerings.length === 0 ? (
          <p className="text-center text-sm text-village-ink/50">
            まだお供えはありません。
          </p>
        ) : null}
      </ul>
    </main>
  );
}
