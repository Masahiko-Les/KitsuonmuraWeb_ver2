"use client";

import { useEffect, useState } from "react";
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
  // Tracks the count that was active when the user last dismissed the
  // modal, so any change (a claim, or a newly-ready harvest) naturally
  // un-dismisses it without needing an effect to reset separate state.
  const [dismissedAtCount, setDismissedAtCount] = useState<number | null>(
    null,
  );
  const isOpen = harvests.length > 0 && dismissedAtCount !== harvests.length;

  // Built as a plain backdrop + card instead of <dialog>/showModal():
  // showModal()'s native top-layer promotion (which is what's supposed to
  // block background scrolling) doesn't reliably engage on every mobile
  // Safari, which let swipes fall through to scroll the page behind the
  // modal instead of the list inside it. Locking body scroll explicitly
  // here works regardless of top-layer support.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-village-ink/50 p-6">
      <div
        role="dialog"
        aria-modal="true"
        className="village-auth-card relative flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-village-gold/40 shadow-[0_20px_50px_rgba(31,20,14,0.45)]"
      >
        <div className="pointer-events-none absolute inset-[7px] rounded-[21px] border border-village-gold/25" />

        <div className="relative shrink-0 p-5 pb-4">
          <button
            type="button"
            onClick={() => setDismissedAtCount(harvests.length)}
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

        <ul className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-5 pt-0">
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
      </div>
    </div>
  );
}
