import Link from "next/link";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { DesertStory, Profile, StoryStatus } from "@/types/database";
import { STORY_STATUS_LABEL } from "@/types/database";
import { DesertStoryForm } from "./DesertStoryForm";
import { deleteDesertStoryAction, waterDesertStoryAction } from "./actions";

interface BloomWithFlower {
  story_id: string;
  flower_catalog: { name: string; emoji: string | null } | null;
}

export default async function DesertPage() {
  const { supabase, user } = await requireProfile();

  const { data: storiesData } = await supabase
    .from("desert_stories")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  const stories = (storiesData ?? []) as DesertStory[];
  const userIds = [...new Set(stories.map((story) => story.user_id))];
  const bloomedStoryIds = stories
    .filter((story) => story.status === "bloomed")
    .map((story) => story.id);

  const [{ data: profilesData }, { data: waterings }, { data: bloomsData }] =
    await Promise.all([
      userIds.length
        ? supabase.from("profiles").select("*").in("user_id", userIds)
        : Promise.resolve({ data: [] as Profile[] }),
      supabase.from("desert_waterings").select("story_id").eq("user_id", user.id),
      bloomedStoryIds.length
        ? supabase
            .from("desert_blooms")
            .select("story_id, flower_catalog(name, emoji)")
            .in("story_id", bloomedStoryIds)
        : Promise.resolve({ data: [] as BloomWithFlower[] }),
    ]);

  const profileByUserId = new Map(
    ((profilesData ?? []) as Profile[]).map((profile) => [profile.user_id, profile]),
  );
  const wateredStoryIds = new Set(
    (waterings ?? []).map((row: { story_id: string }) => row.story_id),
  );
  const flowerByStoryId = new Map(
    ((bloomsData ?? []) as unknown as BloomWithFlower[]).map((b) => [
      b.story_id,
      b.flower_catalog,
    ]),
  );

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader
        title="砂漠の開拓"
        description="吃音の苦労に対して、どう考えて、どう行動したかを書き記し、そのチャレンジをタネとして蒔く場所です。砂漠という困難な場所で、あなたと村人たちのチャレンジと応援によって、砂漠を豊かな場所にしていきましょう。村人総出で、苦労を讃えチャレンジを応援し合いましょう。あなたの考えや行動が、村人たちの勇気になりますように。村人3人が水をあげると花が咲き、記録した人と水をあげた人たちで花を分かち合うことができます。"
      />

      <div className="mb-8">
        <DesertStoryForm />
      </div>

      <ul className="flex flex-col gap-4">
        {stories.map((story) => {
          const author = profileByUserId.get(story.user_id);
          const isOwn = story.user_id === user.id;
          const alreadyWatered = wateredStoryIds.has(story.id);
          const canWater = !isOwn && story.status !== "bloomed" && !alreadyWatered;
          const flower = flowerByStoryId.get(story.id);
          const statusLabel = STORY_STATUS_LABEL[story.status as StoryStatus];

          return (
            <li
              key={story.id}
              className="rounded-xl border border-village-border bg-village-paper p-4"
            >
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium text-village-ink">
                  {author?.nickname ?? "名もなき村人"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-village-leaf/10 px-3 py-0.5 text-xs text-village-leaf">
                    {statusLabel}
                  </span>
                  <time className="text-xs text-village-ink/50">
                    {new Date(story.created_at).toLocaleDateString("ja-JP")}
                  </time>
                </div>
              </div>

              <dl className="flex flex-col gap-2 text-sm">
                <div>
                  <dt className="text-xs text-village-ink/50">何に苦労したか</dt>
                  <dd className="whitespace-pre-wrap text-village-ink/90">
                    {story.suffering}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-village-ink/50">どう考えたか</dt>
                  <dd className="whitespace-pre-wrap text-village-ink/90">
                    {story.action_taken}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-village-ink/50">どう行動したか</dt>
                  <dd className="whitespace-pre-wrap text-village-ink/90">
                    {story.result}
                  </dd>
                </div>
              </dl>

              {story.status === "bloomed" && flower ? (
                <p className="mt-3 text-sm text-village-ink/70">
                  {flower.emoji ?? "🌸"} {flower.name} が咲きました
                </p>
              ) : null}

              {canWater ? (
                <form action={waterDesertStoryAction.bind(null, story.id)} className="mt-3">
                  <button
                    type="submit"
                    className="rounded-full border border-village-leaf px-4 py-1.5 text-xs font-medium text-village-leaf transition-colors hover:bg-village-leaf/10"
                  >
                    水をやる
                  </button>
                </form>
              ) : null}

              {isOwn ? (
                <p className="mt-3 text-xs text-village-ink/40">
                  自分の投稿には水をやれません
                </p>
              ) : alreadyWatered && story.status !== "bloomed" ? (
                <p className="mt-3 text-xs text-village-ink/40">
                  すでに水をあげました
                </p>
              ) : null}

              {isOwn ? (
                <div className="mt-3 flex items-center justify-end gap-3">
                  <Link
                    href={`/desert/${story.id}/edit`}
                    className="text-xs text-village-ink/40 hover:text-village-ember"
                  >
                    編集する
                  </Link>
                  <form
                    action={deleteDesertStoryAction.bind(null, story.id)}
                    className="contents"
                  >
                    <button
                      type="submit"
                      className="text-xs text-village-ink/40 hover:text-village-ember"
                    >
                      削除する
                    </button>
                  </form>
                </div>
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
