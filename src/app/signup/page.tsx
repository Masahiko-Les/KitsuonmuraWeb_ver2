import Image from "next/image";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute inset-0">
        <Image
          src="/village-map.jpg"
          alt=""
          fill
          priority
          className="scale-105 object-cover blur-[2px]"
        />
        <div className="absolute inset-0 bg-village-timber/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-village-timber/70 via-village-timber/35 to-village-timber/75" />
      </div>

      <Link
        href="/"
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full border border-village-gold/30 bg-village-timber/35 px-3 py-1.5 text-xs font-medium tracking-wide text-village-parchment/90 backdrop-blur-sm transition-colors hover:border-village-gold/60 hover:bg-village-timber/55 sm:left-6 sm:top-6"
      >
        <span aria-hidden>‹</span> トップページ
      </Link>

      <div className="relative z-10 w-full max-w-sm">
        <div className="village-auth-card relative overflow-hidden rounded-[28px] px-7 py-8 shadow-[0_20px_50px_rgba(31,20,14,0.45)] sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute inset-[7px] rounded-[21px] border border-village-gold/25" />

          <div className="relative">
            <div className="mb-5 flex items-center justify-center gap-3 text-village-gold/70">
              <span className="h-px w-10 bg-current" />
              <span className="h-2 w-2 rotate-45 border border-current" />
              <span className="h-px w-10 bg-current" />
            </div>

            <h1 className="text-center font-serif text-[1.65rem] text-village-ink">
              新規登録
            </h1>
            <p className="mt-1.5 text-center text-xs tracking-wide text-village-ink/55">
              村人としての一歩を踏み出しましょう
            </p>

            <div className="mt-7">
              <SignupForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
