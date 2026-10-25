"use client";

import { useEffect } from "react";

// Built as a plain backdrop + card, not <dialog>/showModal(): that native
// API's top-layer promotion (which is what blocks background scrolling)
// doesn't reliably engage on every mobile Safari — see the same fix
// applied to GardenHarvestModal.
export function UnlockModal({
  facilityLabel,
  onClose,
}: {
  facilityLabel: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-village-ink/50 p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="village-auth-card relative w-full max-w-sm overflow-hidden rounded-[28px] border border-village-gold/40 p-6 text-center shadow-[0_20px_50px_rgba(31,20,14,0.45)]"
      >
        <div className="pointer-events-none absolute inset-[7px] rounded-[21px] border border-village-gold/25" />
        <div className="relative">
          <div className="mb-3 flex items-center justify-center gap-3 text-village-gold/70">
            <span className="h-px w-8 bg-current" />
            <span className="h-1.5 w-1.5 rotate-45 border border-current" />
            <span className="h-px w-8 bg-current" />
          </div>
          <p className="text-sm leading-relaxed text-village-ink/90">
            おめでとうございます！
            <br />
            {facilityLabel}が解放されました。
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 rounded-full bg-gradient-to-b from-[#c06f45] to-[#8a4326] px-6 py-2 text-sm font-medium text-village-parchment shadow-[0_6px_16px_rgba(90,46,26,0.4)] transition-all hover:from-[#c97a4f] hover:to-[#96492b] active:scale-[0.98]"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
