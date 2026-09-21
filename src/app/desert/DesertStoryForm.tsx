"use client";

import { useActionState, useEffect, useRef } from "react";
import { createDesertStoryAction, type DesertFormState } from "./actions";

const initialState: DesertFormState = {};

export function DesertStoryForm() {
  const [state, formAction, pending] = useActionState(
    createDesertStoryAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error && !pending) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="suffering" className="text-sm text-village-ink/80">
          何に苦しんだか
        </label>
        <textarea
          id="suffering"
          name="suffering"
          rows={2}
          required
          maxLength={4000}
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="action_taken" className="text-sm text-village-ink/80">
          何をしたか
        </label>
        <textarea
          id="action_taken"
          name="action_taken"
          rows={2}
          required
          maxLength={4000}
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="result" className="text-sm text-village-ink/80">
          その結果どうなったか
        </label>
        <textarea
          id="result"
          name="result"
          rows={2}
          required
          maxLength={4000}
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>

      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-full bg-village-ember px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "記録しています..." : "経験を残す"}
      </button>
    </form>
  );
}
