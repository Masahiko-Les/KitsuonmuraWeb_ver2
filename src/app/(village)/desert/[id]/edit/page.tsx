import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { DesertStory } from "@/types/database";
import { EditDesertStoryForm } from "./EditDesertStoryForm";

export default async function EditDesertStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireProfile();

  const { data } = await supabase
    .from("desert_stories")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  const story = data as DesertStory | null;
  if (!story) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader title="砂漠の記録を編集" />
      <EditDesertStoryForm story={story} />
    </main>
  );
}
