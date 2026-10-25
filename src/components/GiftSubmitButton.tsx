"use client";

import { useState } from "react";
import { UnlockModal } from "@/components/UnlockModal";

interface GiftActionResult {
  unlockedFacilityLabel?: string | null;
}

export function GiftSubmitButton({
  action,
}: {
  action: () => Promise<GiftActionResult>;
}) {
  const [unlockedLabel, setUnlockedLabel] = useState<string | null>(null);

  return (
    <>
      <form
        action={async () => {
          const result = await action();
          if (result.unlockedFacilityLabel) {
            setUnlockedLabel(result.unlockedFacilityLabel);
          }
        }}
      >
        <button
          type="submit"
          className="rounded-full bg-village-ember px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          あげる
        </button>
      </form>

      {unlockedLabel ? (
        <UnlockModal
          facilityLabel={unlockedLabel}
          onClose={() => setUnlockedLabel(null)}
        />
      ) : null}
    </>
  );
}
