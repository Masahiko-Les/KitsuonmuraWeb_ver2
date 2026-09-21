"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type SignupFormState } from "./actions";

const initialState: SignupFormState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

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
          パスワード（8文字以上）
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="passwordConfirm" className="text-sm text-village-ink/80">
          パスワード（確認）
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-village-border bg-white px-4 py-2 text-village-ink outline-none focus:border-village-ember"
        />
      </div>

      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.message ? (
        <p className="text-sm text-village-leaf">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-village-ember px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "登録中..." : "新規登録"}
      </button>

      <p className="text-center text-sm text-village-ink/70">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="text-village-ember underline">
          ログイン
        </Link>
      </p>
    </form>
  );
}
