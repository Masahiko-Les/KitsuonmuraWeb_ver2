"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { plantSeedAction, type PlantSeedFormState } from "./actions";

const initialState: PlantSeedFormState = {};

export function PlantSeedForm() {
  const [state, formAction, pending] = useActionState(
    plantSeedAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [handledState, setHandledState] = useState(state);
  const [showConfirm, setShowConfirm] = useState(false);

  // Derived during render (not in an effect) per React's "adjusting state
  // when a prop changes" pattern: useActionState's `state` only ever
  // changes once a submission has actually completed, so this reliably
  // fires exactly once per successful plant — including the first one,
  // unlike a `useEffect` keyed on `state`, which would also fire on the
  // initial mount.
  if (state !== handledState) {
    setHandledState(state);
    if (!state.error) {
      setShowConfirm(true);
    }
  }

  useEffect(() => {
    if (showConfirm) {
      formRef.current?.reset();
    }
  }, [showConfirm]);

  // Built as a plain backdrop + card, not <dialog>/showModal(): that
  // native API's top-layer promotion (which is what blocks background
  // scrolling) doesn't reliably engage on every mobile Safari — see the
  // same fix applied to GardenHarvestModal.
  useEffect(() => {
    if (!showConfirm) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [showConfirm]);

  return (
    <>
      <form ref={formRef} action={formAction} className="flex flex-col gap-3">
        <textarea
          name="struggle"
          rows={3}
          required
          maxLength={2000}
          placeholder="吃音の苦労を、種として植えてみましょう。"
          className="rounded-lg border border-village-border bg-white px-4 py-3 text-village-ink outline-none focus:border-village-ember"
        />
        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="self-end rounded-full bg-village-leaf px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "植えています..." : "種を植える"}
        </button>
      </form>

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-village-ink/50 p-6">
          <div
            role="dialog"
            aria-modal="true"
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
                いい苦労をしましたね。
                <br />
                みんなで育てて収穫を待ちましょう。
              </p>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="mt-5 rounded-full bg-gradient-to-b from-[#c06f45] to-[#8a4326] px-6 py-2 text-sm font-medium text-village-parchment shadow-[0_6px_16px_rgba(90,46,26,0.4)] transition-all hover:from-[#c97a4f] hover:to-[#96492b] active:scale-[0.98]"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
