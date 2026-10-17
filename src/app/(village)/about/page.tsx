const MAYOR_MESSAGE = `吃音村の村長、ミリエルと申します。

この村に興味を持っていただき、ありがとうございます。

この村はまだまだ開発途中ですが、どんな村を目指しているのか、少しお話ししたいと思います。`;

const PROFILE_SECTION = `この村では、まず村役場で自分の住民票を作成します。

住民票には、自分の吃音について詳しく記録できる欄があります。

例えば、「自分の吃音は難発型か、連発型か、伸発型か」「どんな音が言いにくいか」「どんな場面で言葉が出にくくなるか」「これまで吃音とどのように向き合ってきたか」といったことです。

こうしたことを自分のペースで振り返り、書き残すことで、まずは自分自身の吃音について理解を深めるきっかけにしてもらいたいと思っています。

また、この村に暮らす人たちは、「吃音」という共通の体験を持っています。

もちろん、吃音の症状や、それによって経験してきた苦労は、一人ひとり異なります。

それでも、他の村人の住民票を読んで、「自分と同じようなことで悩んでいる人がいるんだ」「こんな経験をしてきた人もいるんだ」と感じることがあるかもしれません。

そして何より、この村の住民票を通して、「吃音を抱えているのは、自分だけじゃないんだ」と感じてもらえたら嬉しいです。

住民票を、単なる自己紹介ではなく、自分自身を知り、他の村人とつながるための場所にしていきたいと思っています。`;

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <section className="village-woodgrain rounded-2xl px-4 py-6">
        <div className="rounded-xl border border-village-gold/40 bg-village-timber/60 p-5">
          <h1 className="mb-3 text-center font-serif text-lg text-village-parchment">
            村長の想い
          </h1>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-village-parchment/80">
            {MAYOR_MESSAGE}
          </p>

          <h2 className="mt-6 mb-3 text-center font-serif text-lg text-village-parchment">
            住民票について
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-village-parchment/80">
            {PROFILE_SECTION}
          </p>
        </div>
      </section>
    </main>
  );
}
