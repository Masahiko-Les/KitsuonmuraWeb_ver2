import { FacilityHeader } from "@/components/FacilityHeader";
import type { BadgeDefinition } from "@/lib/unlocks";

export function LockedFacility({
  badge,
  giftCount,
}: {
  badge: BadgeDefinition;
  giftCount: number;
}) {
  const remaining = Math.max(0, badge.requiredGifts - giftCount);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader title={badge.facilityLabel} />
      <div className="rounded-xl border border-village-border bg-village-paper p-6 text-center">
        <p className="text-3xl">🔒</p>
        <p className="mt-3 text-sm leading-relaxed text-village-ink/70">
          {badge.facilityLabel}はまだ解放されていません。
          <br />
          村人に収穫物を{badge.requiredGifts}回あげると解放されます。
        </p>
        <p className="mt-4 text-xs text-village-ink/50">
          現在{giftCount}回（あと{remaining}回）
        </p>
      </div>
    </main>
  );
}
