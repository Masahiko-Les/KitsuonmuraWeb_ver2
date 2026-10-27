"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface SignupFormState {
  error?: string;
  message?: string;
}

export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  if (password.length < 8) {
    return { error: "パスワードは8文字以上にしてください。" };
  }

  const headerList = await headers();
  const origin = headerList.get("origin");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/onboarding`,
    },
  });

  if (error) {
    // Logged server-side only — the user-facing message stays generic so we
    // don't leak provider internals, but this makes the real cause visible
    // in server logs instead of requiring a live repro to diagnose.
    console.error("signupAction: supabase.auth.signUp failed", {
      code: error.code,
      status: error.status,
      message: error.message,
    });

    if (error.code === "over_email_send_rate_limit") {
      return {
        error:
          "確認メールの送信が混み合っています。しばらく時間をおいてから再度お試しください。",
      };
    }

    if (error.code === "email_address_invalid") {
      return { error: "そのメールアドレスは使用できません。" };
    }

    if (error.code === "user_already_exists") {
      return { error: "このメールアドレスはすでに登録されています。" };
    }

    return { error: "登録できませんでした。時間をおいて再度お試しください。" };
  }

  if (data.session) {
    // Email confirmation is disabled on this project, so the user is
    // already signed in right away.
    redirect("/onboarding");
  }

  return {
    message:
      "確認メールを送信しました。メール内のリンクを開いて登録を完了してください。",
  };
}
