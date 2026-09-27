import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { BonfirePost, Profile } from "@/types/database";
import { BonfireForm } from "./BonfireForm";
import { deleteBonfirePostAction } from "./actions";

export default async function BonfirePage() {
  const { supabase, user } = await requireProfile();

  const { data: postsData } = await supabase
    .from("bonfire_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const posts = (postsData ?? []) as BonfirePost[];
  const userIds = [...new Set(posts.map((post) => post.user_id))];

  const { data: profilesData } = userIds.length
    ? await supabase.from("profiles").select("*").in("user_id", userIds)
    : { data: [] };

  const profileByUserId = new Map(
    ((profilesData ?? []) as Profile[]).map((profile) => [profile.user_id, profile]),
  );

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader
        title="焚き火"
        description="日々の気持ちや出来事を、気軽に分かち合う場所です。"
      />

      <div className="mb-8">
        <BonfireForm />
      </div>

      <ul className="flex flex-col gap-4">
        {posts.map((post) => {
          const author = profileByUserId.get(post.user_id);
          const isOwn = post.user_id === user.id;
          return (
            <li
              key={post.id}
              className="rounded-xl border border-village-border bg-village-paper p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-village-ink">
                  {author?.village_name ?? "名もなき村人"}
                </span>
                <time className="text-xs text-village-ink/50">
                  {new Date(post.created_at).toLocaleString("ja-JP")}
                </time>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-village-ink/90">
                {post.body}
              </p>
              {isOwn ? (
                <form
                  action={deleteBonfirePostAction.bind(null, post.id)}
                  className="mt-2 text-right"
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
        {posts.length === 0 ? (
          <p className="text-center text-sm text-village-ink/50">
            まだ投稿がありません。最初のひとことを届けてみませんか。
          </p>
        ) : null}
      </ul>
    </main>
  );
}
