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
        <label htmlFor="village_name" className="text-sm text-village-ink/80">
          村での名前
        </label>
        <input
          id="village_name"
          name="village_name"
          type="text"
          required
          maxLength={40}
          defaultValue={profile.village_name}
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

      <StutterTypesFieldset defaultValues={profile.stutter_types} />
      <DifficultSoundsFieldset defaultValues={profile.difficult_sounds} />

      <div className="flex flex-col gap-1">
        <label htmlFor="avatar_url" className="text-sm text-village-ink/80">
          アバター画像URL（任意）
        </label>
        <input
          id="avatar_url"
          name="avatar_url"
          type="url"
          defaultValue={profile.avatar_url ?? ""}
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
