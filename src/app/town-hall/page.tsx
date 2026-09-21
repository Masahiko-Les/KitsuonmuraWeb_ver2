import Link from "next/link";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import { ProfileCard } from "@/components/ProfileCard";

export default async function TownHallPage() {
  const { profile } = await requireProfile();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <FacilityHeader
        title="村役場"
        description="あなたの住民票の確認・編集や、村人の一覧はこちらから。"
      />

      <section className="flex flex-col gap-4">
        <ProfileCard profile={profile} />

        <div className="flex flex-wrap gap-3">
          <Link
            href="/town-hall/edit"
            className="rounded-full bg-village-ember px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            住民票を編集する
          </Link>
          <Link
            href="/residents"
            className="rounded-full border border-village-border bg-white px-5 py-2 text-sm font-medium text-village-ink transition-colors hover:border-village-ember"
          >
            村人一覧を見る
          </Link>
        </div>
      </section>
    </main>
  );
}
