import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VillageHeader } from "@/components/VillageHeader";
import { ABOUT_VILLAGE_TEXT } from "@/config/aboutVillage";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/village");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col pb-8">
      <VillageHeader />

      <div className="relative aspect-[1122/1402] w-full overflow-hidden border-village-gold shadow-[0_8px_24px_rgba(63,44,34,0.35)] sm:mx-auto sm:max-w-2xl sm:rounded-2xl sm:border">
        <Image
          src="/village-map.jpg"
          alt="村の地図"
          fill
          priority
          sizes="(min-width: 768px) 42rem, 100vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-6 pt-24 pb-8 text-center">
          <h2 className="font-serif text-2xl tracking-wide text-village-parchment drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] sm:text-3xl">
            吃音村へようこそ
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-village-parchment/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
            この村は、吃音者の、吃音者による、吃音者のための村です。
          </p>
        </div>
      </div>

      <section className="village-woodgrain px-4 pt-6 pb-8 sm:rounded-b-2xl">
        <div className="rounded-xl border border-village-gold/40 bg-village-timber/60 p-5">
          <h1 className="mb-3 text-center font-serif text-lg text-village-parchment">
            吃音村とは
          </h1>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-village-parchment/80">
            {ABOUT_VILLAGE_TEXT}
          </p>
          <div className="mt-6 text-center">
            <Link
              href="/signup"
              className="inline-block rounded-full bg-village-ember px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              村人登録はこちら
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
