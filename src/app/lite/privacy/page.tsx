import type { Metadata } from "next";

// iPhoneアプリ「吃音村Lite」のプライバシーポリシー。App Store の審査情報と、
// アプリの設定画面から開かれる。原文は KitsuonmuraLite/docs/privacy-policy.md
// にあり、文章を変えたら両方を直すこと。
export const metadata: Metadata = {
  title: "吃音村Lite プライバシーポリシー",
  description: "iPhoneアプリ「吃音村Lite」における利用者の情報の取り扱いについて。",
  alternates: { canonical: "/lite/privacy" },
  openGraph: { title: "吃音村Lite プライバシーポリシー | 吃音村" },
};

const INTRO =
  "吃音村 運営（以下「運営」）は、iPhoneアプリ「吃音村Lite」（以下「本アプリ」）における利用者の情報を、次のとおり取り扱います。";

interface PolicySection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  after?: string[];
}

const SECTIONS: PolicySection[] = [
  {
    heading: "1. 受け取る情報",
    items: [
      "利用者ID：利用者を区別するため、Firebase Authentication が自動で発行する匿名のIDです。名前・メールアドレス・電話番号・パスワードは求めず、受け取りません。",
      "利用者が書いた内容：農園・砂漠の種、焚き火のひとこと。",
      "村での活動の記録：水やり、贈り物、通報（理由を含む）、ブロックした村人のID、利用規約に同意した版、それぞれの日時。",
      "通信に伴う情報：本アプリが Firebase と通信する際、仕組み上、IPアドレスや端末・OSの種類などの情報が Google LLC に送られることがあります。運営はこれらを利用者の特定に使いません。",
    ],
    after: [
      "位置情報、連絡先、写真、カメラ、マイク、端末の広告IDは受け取りません。広告や、利用状況の分析ツールも使っていません。",
    ],
  },
  {
    heading: "2. 使い道",
    items: [
      "本アプリの機能（種・水やり・焚き火・贈り物・手持ちの計算）を提供するため",
      "不適切な投稿への対応（通報の確認、投稿の非表示・削除）のため",
      "不正な利用を防ぐため",
      "お問い合わせに返信するため",
    ],
    after: ["これ以外の目的には使いません。"],
  },
  {
    heading: "3. 公開される範囲",
    paragraphs: [
      "種と焚き火のひとことは、本アプリの他の利用者に匿名で公開されます。だれが書いたかは表示されません。焚き火のひとことは24時間で見えなくなり、その後削除されます。",
      "水やり・贈り物・ブロック・通報をしたことは、相手に伝わりません。贈り物を受け取った人には、「トマトが届きました」のように、何が届いたかだけが伝わります。",
    ],
  },
  {
    heading: "4. 保存先と第三者への提供",
    paragraphs: [
      "情報は、Google LLC が提供する Firebase（Cloud Firestore・Firebase Authentication）に保存されます。保存先のサーバーは日本国外にある場合があります。",
      "次の場合を除き、情報を第三者に提供しません。",
    ],
    items: [
      "法令に基づく場合",
      "人の生命・身体・財産を守るために必要で、本人の同意を得ることが難しい場合",
    ],
  },
  {
    heading: "5. 削除",
    paragraphs: [
      "本アプリの「設定 → アカウント削除」から、いつでも退会できます。退会すると、あなたの種・焚き火のひとこと・アカウント情報を削除します。",
      "他の利用者の手持ちが減らないよう、水やりと贈り物の記録は残ります。これらには名前や連絡先が含まれないため、それだけで個人を特定することはできません。",
      "利用者IDは端末に結びついているため、退会せずに本アプリを削除すると、同じ村人として戻ることができなくなります。書いた内容を消したい場合は、本アプリを削除する前に退会してください。",
    ],
  },
  {
    heading: "6. 13歳以上・未成年の方へ",
    paragraphs: [
      "本アプリは13歳以上の方を対象としています。18歳未満の方は、保護者の方の同意を得たうえで使ってください。",
    ],
  },
  {
    heading: "7. 変更",
    paragraphs: [
      "このポリシーは変わることがあります。変えたときは、このページでお知らせします。大切な変更のときは、本アプリの中でもお知らせします。",
    ],
  },
];

const CONTACT_EMAIL = "myriel.jp@gmail.com";

export default function LitePrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <article className="rounded-2xl border border-village-border bg-village-paper px-5 py-8 sm:px-8">
        <h1 className="text-center font-serif text-2xl text-village-ink">
          吃音村Lite プライバシーポリシー
        </h1>
        <div className="mt-3 mb-6 flex items-center justify-center gap-3 text-village-gold/70">
          <span className="h-px w-8 bg-current" />
          <span className="h-1.5 w-1.5 rotate-45 border border-current" />
          <span className="h-px w-8 bg-current" />
        </div>

        <p className="text-sm leading-relaxed text-village-ink/90">{INTRO}</p>

        {SECTIONS.map((section) => (
          <section key={section.heading} className="mt-8">
            <h2 className="mb-3 font-serif text-lg text-village-ink">
              {section.heading}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p
                key={paragraph}
                className="mb-3 text-sm leading-relaxed text-village-ink/90"
              >
                {paragraph}
              </p>
            ))}
            {section.items ? (
              <ul className="mb-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-village-ink/90">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.after?.map((paragraph) => (
              <p
                key={paragraph}
                className="mb-3 text-sm leading-relaxed text-village-ink/90"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <section className="mt-8">
          <h2 className="mb-3 font-serif text-lg text-village-ink">
            8. お問い合わせ
          </h2>
          <p className="text-sm leading-relaxed text-village-ink/90">
            吃音村 運営
            <br />
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-village-ember underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        <p className="mt-10 text-right text-xs text-village-ink/60">
          制定：2026年10月24日
        </p>
      </article>
    </main>
  );
}
