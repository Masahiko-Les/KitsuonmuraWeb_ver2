import Link from "next/link";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import { signOutAction } from "@/lib/actions/auth";

export default async function SettingsPage() {
  await requireProfile();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <FacilityHeader title="設定" />

      <ul className="flex flex-col divide-y divide-village-border overflow-hidden rounded-xl border border-village-border bg-village-paper">
        <li>
          <Link
            href="/town-hall"
            className="block px-4 py-3.5 text-sm text-village-ink transition-colors hover:bg-village-ink/5"
          >
            アカウント情報
          </Link>
        </li>
        <li>
          <form action={signOutAction}>
            <button
              type="submit"
              className="block w-full px-4 py-3.5 text-left text-sm text-village-ink transition-colors hover:bg-village-ink/5"
            >
              ログアウト
            </button>
          </form>
        </li>
      </ul>
    </main>
  );
}
