import Image from "next/image";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <Image
        src="/village-map.png"
        alt=""
        fill
        priority
        className="object-cover opacity-40"
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-village-border bg-village-paper/95 p-8 shadow-lg">
        <h1 className="mb-6 text-center font-serif text-2xl text-village-ink">
          ログイン
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
