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
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  if (password.length < 8) {
    return { error: "パスワードは8文字以上にしてください。" };
  }

  if (password !== passwordConfirm) {
    return { error: "パスワードが一致しません。" };
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
