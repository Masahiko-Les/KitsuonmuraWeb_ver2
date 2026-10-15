"use client";

import { useEffect, useRef } from "react";
import type { GardenSeed } from "@/types/database";
import { claimGardenHarvestAction } from "@/app/(village)/garden/actions";

interface ReadyHarvest {
  seed: GardenSeed;
  plantedByPhrase: string;
  othersPhrase: string;
}

export function GardenHarvestModal({
  harvests,
}: {
  harvests: ReadyHarvest[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (harvests.length > 0 && !dialog.open) {
      dialog.showModal();
    } else if (harvests.length === 0 && dialog.open) {
      dialog.close();
    }
  }, [harvests.length]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed top-1/2 left-1/2 right-auto bottom-auto m-0 flex max-h-[80vh] w-[calc(100%-3rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-village-border bg-village-paper p-0 backdrop:bg-village-ink/40"
    >
      <div className="flex shrink-0 items-center justify-between p-5 pb-4">
        <h2 className="font-serif text-lg text-village-ink">
          農園からのお知らせ
        </h2>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="text-sm text-village-ink/50 hover:text-village-ink"
        >
          閉じる
        </button>
      </div>

      <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-5 pt-0">
        {harvests.map(({ seed, plantedByPhrase, othersPhrase }) => (
          <li
            key={seed.id}
            data-seed-id={seed.id}
            className="rounded-xl border border-village-border bg-white p-4"
          >
            <p className="text-sm leading-relaxed text-village-ink/90">
              農園で{plantedByPhrase}が蒔いた種が育ち、{othersPhrase}
              と収穫しました。
            </p>
            <form
              action={claimGardenHarvestAction.bind(null, seed.id)}
              className="mt-3"
            >
              <button
                type="submit"
                className="rounded-full bg-village-ember px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                受け取る
              </button>
            </form>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
