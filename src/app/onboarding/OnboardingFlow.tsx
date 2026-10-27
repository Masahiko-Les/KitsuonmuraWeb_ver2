"use client";

import { useState } from "react";
import { OnboardingForm } from "./OnboardingForm";

export function OnboardingFlow() {
  const [step, setStep] = useState<"welcome" | "form">("welcome");

  if (step === "welcome") {
    return (
      <div className="text-center">
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
      <h1 className="mb-6 text-center font-serif text-2xl text-village-ink">
        吃音村の住民票
      </h1>
      <OnboardingForm />
    </>
  );
}
