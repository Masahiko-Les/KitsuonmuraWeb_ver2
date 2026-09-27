import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import { EditProfileForm } from "./EditProfileForm";

export default async function EditProfilePage() {
  const { profile } = await requireProfile();

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
      <FacilityHeader title="住民票の編集" />
      <EditProfileForm profile={profile} />
    </main>
  );
}
