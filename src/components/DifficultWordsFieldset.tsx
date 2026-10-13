"use client";

import { useState } from "react";

export function DifficultWordsFieldset({
  defaultValues = [],
}: {
  defaultValues?: string[];
}) {
  const [words, setWords] = useState<string[]>(defaultValues);
  const [draft, setDraft] = useState("");

  function addWord() {
    const trimmed = draft.trim();
    if (!trimmed || words.includes(trimmed)) {
      setDraft("");
      return;
    }
    setWords([...words, trimmed]);
    setDraft("");
  }

  function removeWord(word: string) {
    setWords(words.filter((w) => w !== word));
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm text-village-ink/80">
        言いにくい言葉（任意・複数追加可）
      </legend>
      <div className="flex flex-col gap-2 rounded-lg border border-village-border bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addWord();
              }
            }}
            maxLength={50}
            placeholder="例: ありがとう"
            className="flex-1 rounded-lg border border-village-border px-3 py-1.5 text-sm text-village-ink outline-none focus:border-village-ember"
          />
          <button
            type="button"
            onClick={addWord}
            className="rounded-full border border-village-leaf px-4 py-1.5 text-xs font-medium text-village-leaf transition-colors hover:bg-village-leaf/10"
          >
            追加
          </button>
        </div>
        {words.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {words.map((word) => (
              <span
                key={word}
                className="flex items-center gap-1.5 rounded-full bg-village-ember/10 px-3 py-1 text-xs text-village-ember"
              >
                {word}
                <button
                  type="button"
                  onClick={() => removeWord(word)}
                  aria-label={`${word} を削除`}
                  className="text-village-ember/70 hover:text-village-ember"
                >
                  ×
                </button>
                <input type="hidden" name="difficult_words" value={word} />
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </fieldset>
  );
}
