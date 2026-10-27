"use client";

import { useState } from "react";
import { OnboardingForm } from "./OnboardingForm";

function Flourish() {
  return (
    <div className="mb-5 flex items-center justify-center gap-3 text-village-gold/70">
      <span className="h-px w-10 bg-current" />
      <span className="h-2 w-2 rotate-45 border border-current" />
      <span className="h-px w-10 bg-current" />
    </div>
  );
}

export function OnboardingFlow() {
  const [step, setStep] = useState<"welcome" | "form">("welcome");

  if (step === "welcome") {
    return (
      <div className="text-center">
        <Flourish />
        <h1 className="mb-4 font-serif text-2xl text-village-ink">
          吃音村へようこそ！
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-village-ink/70">
          吃音村の村人全員があなたのことを歓迎します。
          <br />
          まずは、住民票を作成しましょう。
          <br />
          まずはニックネームだけでも良いので記入をお願いします。
        </p>
        <button
          type="button"
          onClick={() => setStep("form")}
          className="rounded-full bg-village-ember px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          次へ
        </button>
      </div>
    );
  }

  return (
    <>
      <Flourish />
      <h1 className="mb-6 text-center font-serif text-2xl text-village-ink">
        住民票
      </h1>
      <OnboardingForm />
    </>
  );
}
