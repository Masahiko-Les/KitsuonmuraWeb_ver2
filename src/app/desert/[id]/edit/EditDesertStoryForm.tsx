"use client";

import { useActionState } from "react";
import type { DesertStory } from "@/types/database";
import { updateDesertStoryAction, type DesertFormState } from "../../actions";

const initialState: DesertFormState = {};

export function EditDesertStoryForm({ story }: { story: DesertStory }) {
  const action = updateDesertStoryAction.bind(null, story.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="suffering" className="text-sm text-village-ink/80">
          何に苦労したか
        </label>
        <textarea
          id="suffering"
          name="suffering"
          rows={4}
          required
          minLength={10}
          maxLength={4000}
          defaultValue={story.suffering}
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="action_taken" className="text-sm text-village-ink/80">
          どう考えたか
        </label>
        <textarea
          id="action_taken"
          name="action_taken"
          rows={4}
          required
          minLength={10}
          maxLength={4000}
          defaultValue={story.action_taken}
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="result" className="text-sm text-village-ink/80">
          どう行動したか
        </label>
        <textarea
          id="result"
          name="result"
          rows={4}
          required
          minLength={10}
          maxLength={4000}
          defaultValue={story.result}
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>

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
