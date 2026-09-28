"use client";

import { useActionState } from "react";
import type { CinemaReview } from "@/types/database";
import {
  updateCinemaReviewAction,
  type CinemaReviewFormState,
} from "../../../actions";

const initialState: CinemaReviewFormState = {};

export function EditCinemaReviewForm({
  review,
  movieId,
}: {
  review: CinemaReview;
  movieId: string;
}) {
  const action = updateCinemaReviewAction.bind(null, review.id, movieId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <textarea
        name="body"
        rows={5}
        required
        maxLength={2000}
        defaultValue={review.body}
        className="rounded-lg border border-village-border bg-white px-4 py-3 text-village-ink outline-none focus:border-village-ember"
      />

      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-full bg-village-ember px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "保存中..." : "保存する"}
      </button>
    </form>
  );
}
