import Image from "next/image";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <Image
        src="/village-map.jpg"
        alt=""
        fill
        priority
        className="object-cover opacity-40"
      />
      <Link
        href="/"
        className="absolute left-4 top-4 z-10 text-sm font-medium text-village-ink drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] hover:text-village-ember sm:left-6 sm:top-6"
      >
        &lt; トップページ
      </Link>
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-village-border bg-village-paper/95 p-8 shadow-lg">
        <h1 className="mb-6 text-center font-serif text-2xl text-village-ink">
          新規登録
        </h1>
        <SignupForm />
      </div>
    </main>
  );
}
