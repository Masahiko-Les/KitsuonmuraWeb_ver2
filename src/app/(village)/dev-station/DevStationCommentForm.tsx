"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createDevStationCommentAction,
  type DevStationCommentFormState,
} from "./actions";

const initialState: DevStationCommentFormState = {};

export function DevStationCommentForm({ postId }: { postId: string }) {
  const action = createDevStationCommentAction.bind(null, postId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error && !pending) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <textarea
        name="body"
        rows={2}
        required
        maxLength={2000}
        placeholder="ご意見・アイデアを書いてみましょう"
        className="rounded-lg border border-village-border bg-white px-3 py-2 text-sm text-village-ink outline-none focus:border-village-ember"
      />
      {state.error ? <p className="text-xs text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-full bg-village-leaf px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "投稿中..." : "コメントする"}
      </button>
    </form>
  );
}
