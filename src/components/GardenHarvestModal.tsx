"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { GardenSeed } from "@/types/database";
import { claimGardenHarvestAction } from "@/app/(village)/garden/actions";

interface HarvestPerson {
  nickname: string;
  profileId: string;
}

interface ReadyHarvest {
  seed: GardenSeed;
  plantedBy: HarvestPerson | null;
  others: HarvestPerson[];
}

function PersonLink({ person }: { person: HarvestPerson }) {
  if (!person.profileId) {
    return <>{person.nickname}さん</>;
  }
  return (
    <Link
      href={`/residents/${person.profileId}`}
      className="text-village-ember"
    >
      {person.nickname}さん
    </Link>
  );
}

export function GardenHarvestModal({
  harvests,
}: {
  harvests: ReadyHarvest[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Tracks the count that was active when the user last dismissed the
  // modal, so any change (a claim, or a newly-ready harvest) naturally
  // un-dismisses it without needing an effect to reset separate state.
  const [dismissedAtCount, setDismissedAtCount] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && harvests.length > 0 && !dialog.open) {
      dialog.showModal();
    }
  }, [harvests.length]);

  if (harvests.length === 0 || dismissedAtCount === harvests.length) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className="village-auth-card fixed inset-0 z-50 m-auto flex max-h-[80vh] w-[calc(100%-3rem)] max-w-md flex-col overflow-hidden rounded-[28px] border border-village-gold/40 p-0 shadow-[0_20px_50px_rgba(31,20,14,0.45)] backdrop:bg-village-ink/50"
    >
      <div className="pointer-events-none absolute inset-[7px] rounded-[21px] border border-village-gold/25" />

      <div className="relative shrink-0 p-5 pb-4">
        <button
          type="button"
          onClick={() => {
            dialogRef.current?.close();
            setDismissedAtCount(harvests.length);
          }}
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
          収穫物のお知らせ
        </h2>
      </div>

      <ul className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-5 pt-0">
        {harvests.map(({ seed, plantedBy, others }) => (
          <li
            key={seed.id}
            data-seed-id={seed.id}
            className="rounded-xl border border-village-gold/30 bg-village-paper/70 p-4"
          >
            <p className="text-sm leading-relaxed text-village-ink/90">
              農園で
              {plantedBy ? <PersonLink person={plantedBy} /> : "自分"}
              が蒔いた種が育ち、
              {others.map((person, index) => (
                <span key={person.profileId || person.nickname}>
                  {index > 0 ? "・" : ""}
                  <PersonLink person={person} />
                </span>
              ))}
              と収穫しました。
            </p>
            <form
              action={claimGardenHarvestAction.bind(null, seed.id)}
              className="mt-3"
            >
              <button
                type="submit"
                className="rounded-full bg-gradient-to-b from-[#c06f45] to-[#8a4326] px-5 py-2 text-sm font-medium text-village-parchment shadow-[0_6px_16px_rgba(90,46,26,0.4)] transition-all hover:from-[#c97a4f] hover:to-[#96492b] active:scale-[0.98]"
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
