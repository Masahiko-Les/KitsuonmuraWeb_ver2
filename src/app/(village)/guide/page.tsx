import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";

const FACILITIES: { name: string; description: string }[] = [
  {
    name: "住民票",
    description:
      "まずは「住民票」を書いて、自分の吃音を共有しましょう。わからないところは飛ばして大丈夫です。\n村で生活しながら自分の吃音の理解をゆっくり深めていけばいいです。\n村人たちの住民票を共有することで、吃音で苦労しているのは自分だけじゃないんだという感覚も得てほしいと思っています。",
  },
  {
    name: "自分の畑",
    description:
      "「自分の畑」に種を蒔いてみましょう。なんでもいいので日々自分ができたことを種にして蒔きます。\n水をやると農作物を手に入れることができます。農作物は他の村人たちにあげたり、村の祠にお供えしたりできます。",
  },
  {
    name: "農園",
    description:
      "みんなの苦労を種にして、みんなで農作物を育てる場所です。\n吃音の苦労を分かち合い、水やりを通して「いい苦労をしたね」と苦労を讃え合いましょう。",
  },
  {
    name: "砂漠",
    description:
      "吃音という苦労を抱えながらも、その苦労にどう向き合い、どう考えて行動したかを書き記す場所です。\n吃音の苦労に対する自分なりのチャレンジを種として蒔くことで、吃音村の人たちに勇気を与える場所です。\n砂漠という生きづらい環境の中にあっても、種を蒔き、みんなでその種を育てて花を咲かせていきましょう。",
  },
  {
    name: "図書館",
    description:
      "吃音に関する本を読んで、感想を共有する場所です。\n声が出ない分だけ読書を深めることで、それは人生を豊かにする経験になると思います。",
  },
  {
    name: "映画館",
    description:
      "吃音に関する映画を観て、感想を共有する場所です。\n図書館と同様、良い映画を観て考えることは、吃音や人生を深めることにつながると思います。",
  },
  {
    name: "祠",
    description:
      "村の守り神です。農作物をお供えすることで、吃音村が豊かになります。",
  },
  {
    name: "開発局",
    description:
      "村の開発を村人全員で考える場所です。\nこういう機能があった方がいいとか意見交換をしていきます。",
  },
];

export default async function GuidePage() {
  await requireProfile();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader
        title="初めての方へ"
        description="この村は吃音という共通の苦労を抱える人たちが住む村です。
みんなで助け合って生きていく場所です。"
      />

      <ul className="flex flex-col gap-4">
        {FACILITIES.map((facility) => (
          <li
            key={facility.name}
            className="rounded-xl border border-village-border bg-village-paper p-4"
          >
            <h2 className="font-medium text-village-ink">{facility.name}</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-village-ink/80">
              {facility.description}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
