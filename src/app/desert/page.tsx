import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { DesertStory, Profile } from "@/types/database";
import { DesertStoryForm } from "./DesertStoryForm";
import { deleteDesertStoryAction } from "./actions";

export default async function DesertPage() {
  const { supabase, user } = await requireProfile();

  const { data: storiesData } = await supabase
    .from("desert_stories")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const stories = (storiesData ?? []) as DesertStory[];
  const userIds = [...new Set(stories.map((story) => story.user_id))];

  const { data: profilesData } = userIds.length
    ? await supabase.from("profiles").select("*").in("user_id", userIds)
    : { data: [] };

  const profileByUserId = new Map(
    ((profilesData ?? []) as Profile[]).map((profile) => [profile.user_id, profile]),
  );

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader
        title="砂漠"
        description="過去に経験した苦難を振り返り、その経験を後世に残す場所です。"
      />

      <div className="mb-8">
        <DesertStoryForm />
      </div>

      <ul className="flex flex-col gap-4">
        {stories.map((story) => {
          const author = profileByUserId.get(story.user_id);
          const isOwn = story.user_id === user.id;
          return (
            <li
              key={story.id}
              className="rounded-xl border border-village-border bg-village-paper p-4"
            >
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium text-village-ink">
                  {author?.village_name ?? "名もなき村人"}
                </span>
                <time className="text-xs text-village-ink/50">
                  {new Date(story.created_at).toLocaleDateString("ja-JP")}
                </time>
              </div>

              <dl className="flex flex-col gap-2 text-sm">
                <div>
                  <dt className="text-xs text-village-ink/50">何に苦しんだか</dt>
                  <dd className="whitespace-pre-wrap text-village-ink/90">
                    {story.suffering}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-village-ink/50">何をしたか</dt>
                  <dd className="whitespace-pre-wrap text-village-ink/90">
                    {story.action_taken}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-village-ink/50">その結果どうなったか</dt>
                  <dd className="whitespace-pre-wrap text-village-ink/90">
                    {story.result}
                  </dd>
                </div>
              </dl>

              {isOwn ? (
                <form
                  action={deleteDesertStoryAction.bind(null, story.id)}
                  className="mt-3 text-right"
                >
                  <button
                    type="submit"
                    className="text-xs text-village-ink/40 hover:text-village-ember"
                  >
                    削除する
                  </button>
                </form>
              ) : null}
            </li>
          );
        })}
        {stories.length === 0 ? (
          <p className="text-center text-sm text-village-ink/50">
            まだ記録がありません。
          </p>
        ) : null}
      </ul>
    </main>
  );
}
