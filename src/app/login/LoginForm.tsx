"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "./actions";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-village-ink/80">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-village-ink/80">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-700">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-village-ember px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "ログイン中..." : "ログイン"}
      </button>

      <p className="text-center text-sm text-village-ink/70">
        まだ村人登録がお済みでない方は{" "}
        <Link href="/signup" className="text-village-ember underline">
          新規登録
        </Link>
      </p>
    </form>
  );
}
