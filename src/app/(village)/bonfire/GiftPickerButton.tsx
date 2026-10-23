"use client";

import { useEffect, useState } from "react";
import { CropIcon } from "@/components/CropIcon";
import { FlowerIcon } from "@/components/FlowerIcon";
import { giftCropAction, giftFlowerAction } from "./actions";

export interface GiftableItem {
  key: string;
  kind: "crop" | "flower";
  name: string;
  emoji: string | null;
  count: number;
  ids: string[];
}

export function GiftPickerButton({
  items,
  recipientId,
  postId,
}: {
  items: GiftableItem[];
  recipientId: string;
  postId: string;
}) {
  const [open, setOpen] = useState(false);

  // Built as a plain backdrop + card, not <dialog>/showModal(): that
  // native API's top-layer promotion (which is what blocks background
  // scrolling) doesn't reliably engage on every mobile Safari — see the
  // same fix applied to GardenHarvestModal.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-fit rounded-full border border-village-leaf px-4 py-1.5 text-xs font-medium text-village-leaf transition-colors hover:bg-village-leaf/10"
      >
        ＋あげる
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-village-ink/50 p-6"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="village-auth-card relative flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-[28px] border border-village-gold/40 shadow-[0_20px_50px_rgba(31,20,14,0.45)]"
          >
            <div className="pointer-events-none absolute inset-[7px] rounded-[21px] border border-village-gold/25" />

            <div className="relative shrink-0 p-5 pb-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="閉じる"
                className="absolute right-4 top-4 text-village-ink/40 transition-colors hover:text-village-ink"
              >
                ✕
              </button>
              <div className="mb-3 flex items-center justify-center gap-3 text-village-gold/70">
                <span className="h-px w-8 bg-current" />
                <span className="h-1.5 w-1.5 rotate-45 border border-current" />
                <span className="h-px w-8 bg-current" />
              </div>
              <h2 className="text-center font-serif text-lg text-village-ink">
                何をあげますか？
              </h2>
            </div>

            <ul className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-5 pb-5">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-village-border bg-white px-3 py-2"
                >
                  <span className="flex items-center gap-1.5 text-sm text-village-ink">
                    {item.kind === "flower" ? (
                      <FlowerIcon name={item.name} emoji={item.emoji} size={20} />
                    ) : (
                      <CropIcon name={item.name} emoji={item.emoji} size={20} />
                    )}
                    {item.name} x{item.count}
                  </span>
                  <form
                    action={
                      item.kind === "crop"
                        ? giftCropAction.bind(null, item.ids[0], recipientId, postId)
                        : giftFlowerAction.bind(null, item.ids[0], recipientId, postId)
                    }
                    onSubmit={() => setOpen(false)}
                  >
                    <button
                      type="submit"
                      className="rounded-full bg-village-ember px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    >
                      あげる
                    </button>
                  </form>
                </li>
              ))}
              {items.length === 0 ? (
                <p className="py-4 text-center text-xs text-village-ink/40">
                  あげられるものがありません
                </p>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
