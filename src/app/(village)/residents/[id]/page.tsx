import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import { ProfileCard } from "@/components/ProfileCard";
import type { Profile } from "@/types/database";

export default async function ResidentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile: ownProfile } = await requireProfile();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const resident = data as Profile | null;
  if (!resident) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
      <FacilityHeader title="住民票" />
      <ProfileCard profile={resident} />

      {resident.id === ownProfile.id ? (
        <Link
          href="/town-hall/edit"
          className="mt-4 inline-block text-sm text-village-ember underline"
        >
          自分の住民票を編集する
        </Link>
      ) : null}
    </main>
  );
}
