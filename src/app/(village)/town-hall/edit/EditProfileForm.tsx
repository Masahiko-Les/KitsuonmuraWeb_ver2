"use client";

import { useActionState } from "react";
import { StutterTypesFieldset } from "@/components/StutterTypesFieldset";
import { DifficultSoundsFieldset } from "@/components/DifficultSoundsFieldset";
import type { Profile } from "@/types/database";
import { updateProfileAction, type EditProfileFormState } from "./actions";

const initialState: EditProfileFormState = {};

export function EditProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="nickname" className="text-sm text-village-ink/80">
          ニックネーム
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          maxLength={40}
          defaultValue={profile.nickname}
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="bio" className="text-sm text-village-ink/80">
          自己紹介（任意）
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={1000}
          defaultValue={profile.bio ?? ""}
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="favorite_things" className="text-sm text-village-ink/80">
          好きなこと・大切にしていること（任意）
        </label>
        <textarea
          id="favorite_things"
          name="favorite_things"
          rows={3}
          maxLength={2000}
          defaultValue={profile.favorite_things ?? ""}
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>

      <StutterTypesFieldset defaultValues={profile.stutter_types} />
      <DifficultSoundsFieldset defaultValues={profile.difficult_sounds} />

      <div className="flex flex-col gap-1">
        <label htmlFor="difficult_situations" className="text-sm text-village-ink/80">
          吃音が出やすい場面（任意）
        </label>
        <textarea
          id="difficult_situations"
          name="difficult_situations"
          rows={3}
          maxLength={2000}
          defaultValue={profile.difficult_situations ?? ""}
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="easy_situations" className="text-sm text-village-ink/80">
          吃音が出にくい場面（任意）
        </label>
        <textarea
          id="easy_situations"
          name="easy_situations"
          rows={3}
          maxLength={2000}
          defaultValue={profile.easy_situations ?? ""}
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="first_noticed_stutter" className="text-sm text-village-ink/80">
          初めて吃音に気づいた時のこと（任意）
        </label>
        <textarea
          id="first_noticed_stutter"
          name="first_noticed_stutter"
          rows={3}
          maxLength={2000}
          defaultValue={profile.first_noticed_stutter ?? ""}
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>

      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-village-ember px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "保存中..." : "保存する"}
      </button>
    </form>
  );
}
