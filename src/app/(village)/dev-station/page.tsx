import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { DevStationComment, Profile } from "@/types/database";
import { DevStationCommentForm } from "./DevStationCommentForm";
import { deleteDevStationCommentAction } from "./actions";

const DEV_STATION_POSTS: {
  id: string;
  body: string;
  link: string | null;
  linkLabel: string | null;
  inlineLink?: { text: string; href: string };
}[] = [
  {
    id: "prototype-v2",
    body: "この吃音村をさらに良くするために試作アプリを作りました。良ければぜひ使っていただき皆さんのご意見をいただきたいです。\n\n「新・吃音村」は、もっとどうぶつの森のような世界観にして、苦労の種や挑戦の種をわかりやすくしてみました。また「カフェ」で他者と安全に話せる仕組みも導入してました。",
    link: "https://kitsuonmura.vercel.app/",
    linkLabel: "試作アプリ（新・吃音村）を開く",
    inlineLink: { text: "新・吃音村", href: "https://kitsuonmura.vercel.app/" },
  },
  {
    id: "ideas",
    body: "吃音村を少しでも良くするためのアイデアがあればぜひ教えてください。\n新しい建物でも、仕組みでも、もっとこうしたらいいんじゃないか、などなど。\n皆さんの力で少しでも良い村を作りたいと考えています。",
    link: null,
    linkLabel: null,
  },
  {
    id: "contributors-wanted",
    body: "吃音村の開発にご協力いただける方を絶賛募集しております。アプリ開発でもデザインでも、アイデアでも、世界観でも、コミュニティ運営でも、人の集め方でも、安全面でも、いろんな面で悩んでいます。もし少しでも協力したい！という方がいましたら、こちらのコメント欄か、myriel.jp@gmail.comまでご連絡お願いします。",
    link: null,
    linkLabel: null,
  },
];

function renderPostBody(post: (typeof DEV_STATION_POSTS)[number]) {
  if (!post.inlineLink) {
    return post.body;
  }
  const { text, href } = post.inlineLink;
  const index = post.body.indexOf(text);
  if (index === -1) {
    return post.body;
  }
  return (
    <>
      {post.body.slice(0, index)}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-village-ember underline underline-offset-2 hover:text-village-ember/80"
      >
        {text}
      </a>
      {post.body.slice(index + text.length)}
    </>
  );
}

export default async function DevStationPage() {
  const { supabase, user } = await requireProfile();

  const { data: commentsData } = await supabase
    .from("dev_station_comments")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const comments = (commentsData ?? []) as DevStationComment[];
  const userIds = [...new Set(comments.map((comment) => comment.user_id))];
  const { data: profilesData } = userIds.length
    ? await supabase.from("profiles").select("*").in("user_id", userIds)
    : { data: [] as Profile[] };
  const profileByUserId = new Map(
    ((profilesData ?? []) as Profile[]).map((profile) => [profile.user_id, profile]),
  );

  const commentsByPostId = new Map<string, DevStationComment[]>();
  for (const comment of comments) {
    const list = commentsByPostId.get(comment.post_id) ?? [];
    list.push(comment);
    commentsByPostId.set(comment.post_id, list);
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader
        title="開発局"
        iconSrc="/icons/dev-station.png"
        centered
        description="吃音村をより良くするためのアイデアや、新しい試作アプリへのご意見をいただく場所です。"
      />

      <ul className="flex flex-col gap-6">
        {DEV_STATION_POSTS.map((post) => {
          const postComments = commentsByPostId.get(post.id) ?? [];
          return (
            <li
              key={post.id}
              className="rounded-xl border border-village-border bg-village-paper p-4"
            >
              <div className="mb-2 text-sm font-medium text-village-ink">村長</div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-village-ink/90">
                {renderPostBody(post)}
              </p>
              {post.link ? (
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-full bg-village-ember px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  {post.linkLabel}
                </a>
              ) : null}

              <div className="mt-4 border-t border-village-border pt-4">
                <DevStationCommentForm postId={post.id} />

                {postComments.length > 0 ? (
                  <ul className="mt-4 flex flex-col gap-3">
                    {postComments.map((comment) => {
                      const author = profileByUserId.get(comment.user_id);
                      const isOwn = comment.user_id === user.id;
                      return (
                        <li
                          key={comment.id}
                          className="rounded-lg border border-village-border bg-white p-3"
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs font-medium text-village-ink">
                              {author?.nickname ?? "名もなき村人"}
                            </span>
                            {isOwn ? (
                              <form
                                action={deleteDevStationCommentAction.bind(
                                  null,
                                  comment.id,
                                )}
                              >
                                <button
                                  type="submit"
                                  className="text-xs text-village-ink/40 hover:text-village-ember"
                                >
                                  削除する
                                </button>
                              </form>
                            ) : null}
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-village-ink/90">
                            {comment.body}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
