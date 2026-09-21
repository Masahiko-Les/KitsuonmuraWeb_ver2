"use client";

import { useActionState, useEffect, useRef } from "react";
import { createBonfirePostAction, type BonfireFormState } from "./actions";

const initialState: BonfireFormState = {};

export function BonfireForm() {
  const [state, formAction, pending] = useActionState(
    createBonfirePostAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error && !pending) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <textarea
        name="body"
        rows={3}
        required
        maxLength={2000}
        placeholder="今日感じたこと、思ったことを、少しだけ書いてみませんか。"
        className="rounded-lg border border-village-border bg-white px-4 py-3 text-village-ink outline-none focus:border-village-ember"
      />
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-full bg-village-ember px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "投稿中..." : "焚き火にくべる"}
      </button>
    </form>
  );
}
