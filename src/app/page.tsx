import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/village");
  }

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden">
      <Image
        src="/village-map.png"
        alt=""
        fill
        priority
        className="object-cover opacity-40"
      />
      <div className="relative z-10 mx-4 max-w-md rounded-2xl border border-village-border bg-village-paper/95 p-8 text-center shadow-xl">
        <h1 className="font-serif text-4xl text-village-ink">吃音村</h1>
        <p className="mt-4 text-sm leading-relaxed text-village-ink/80">
          吃音を持つ人たちが暮らす、小さなオンラインの村です。
          <br />
          弱さや苦労を隠すのではなく、分かち合うことで、
          <br />
          それがこの村の豊かさになります。
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded-full bg-village-ember px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-village-ember px-6 py-3 text-sm font-medium text-village-ember transition-colors hover:bg-village-ember/10"
          >
            新規登録
          </Link>
        </div>
      </div>
    </main>
  );
}
