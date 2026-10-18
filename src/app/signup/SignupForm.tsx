"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type SignupFormState } from "./actions";

const initialState: SignupFormState = {};

const inputClassName =
  "rounded-xl border border-village-gold/35 bg-village-paper/70 px-4 py-2.5 text-village-ink outline-none transition-shadow placeholder:text-village-ink/30 focus:border-village-gold focus:shadow-[0_0_0_3px_rgba(190,140,78,0.18)]";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium tracking-wide text-village-ink/60">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClassName}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-medium tracking-wide text-village-ink/60">
          パスワード（8文字以上）
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClassName}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="passwordConfirm" className="text-xs font-medium tracking-wide text-village-ink/60">
          パスワード（確認）
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClassName}
        />
      </div>

      {state.error ? (
        <p className="rounded-lg border border-red-300/60 bg-red-50/80 px-3 py-2 text-center text-xs text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-lg border border-village-leaf/30 bg-village-leaf/10 px-3 py-2 text-center text-xs text-village-leaf">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-gradient-to-b from-[#c06f45] to-[#8a4326] px-6 py-3 text-sm font-medium text-village-parchment shadow-[0_8px_20px_rgba(90,46,26,0.45)] transition-all hover:from-[#c97a4f] hover:to-[#96492b] hover:shadow-[0_10px_24px_rgba(90,46,26,0.5)] active:scale-[0.98] active:shadow-[0_4px_12px_rgba(90,46,26,0.4)] disabled:opacity-50 disabled:active:scale-100"
      >
        {pending ? "登録中..." : "新規登録"}
      </button>

      <div className="mt-1 flex flex-col items-center gap-2 text-center">
        <p className="text-xs text-village-ink/55">すでにアカウントをお持ちの方は</p>
        <Link
          href="/login"
          className="rounded-full border border-village-gold/50 px-5 py-2 text-xs font-medium text-village-ink/80 transition-colors hover:border-village-gold hover:bg-village-gold/10"
        >
          ログイン
        </Link>
      </div>
    </form>
  );
}
