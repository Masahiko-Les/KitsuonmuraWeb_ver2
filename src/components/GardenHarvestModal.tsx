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
      className="text-village-ember underline"
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
      className="fixed inset-0 z-50 m-auto flex max-h-[80vh] w-[calc(100%-3rem)] max-w-md flex-col overflow-hidden rounded-xl border border-village-border bg-village-paper p-0 backdrop:bg-village-ink/40"
    >
      <div className="flex shrink-0 items-center justify-between p-5 pb-4">
        <h2 className="font-serif text-lg text-village-ink">
          収穫物のお知らせ
        </h2>
        <button
          type="button"
          onClick={() => {
            dialogRef.current?.close();
            setDismissedAtCount(harvests.length);
          }}
          className="text-sm text-village-ink/50 hover:text-village-ink"
        >
          閉じる
        </button>
      </div>

      <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-5 pt-0">
        {harvests.map(({ seed, plantedBy, others }) => (
          <li
            key={seed.id}
            data-seed-id={seed.id}
            className="rounded-xl border border-village-border bg-white p-4"
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
