import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-village-border bg-village-paper p-8 shadow-lg">
        <h1 className="mb-6 text-center font-serif text-2xl text-village-ink">
          新規登録
        </h1>
        <SignupForm />
      </div>
    </main>
  );
}
