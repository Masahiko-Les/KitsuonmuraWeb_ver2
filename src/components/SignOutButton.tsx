import { signOutAction } from "@/lib/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="text-sm text-village-ink/60 hover:text-village-ember transition-colors"
      >
        村を出る（ログアウト）
      </button>
    </form>
  );
}
