import { DIFFICULT_SOUND_ROWS } from "@/types/database";

export function DifficultSoundsFieldset({
  defaultValues = [],
}: {
  defaultValues?: string[];
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm text-village-ink/80">
        言いにくい音（複数選択可）
      </legend>
      <div className="flex flex-col gap-1.5 rounded-lg border border-village-border bg-white p-4">
        {DIFFICULT_SOUND_ROWS.map((row) => (
          <div key={row.join("")} className="flex gap-1.5">
            {row.map((kana) => (
              <label
                key={kana}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-village-border text-sm text-village-ink has-[:checked]:border-village-ember has-[:checked]:bg-village-ember/10 has-[:checked]:text-village-ember"
              >
                <input
                  type="checkbox"
                  name="difficult_sounds"
                  value={kana}
                  defaultChecked={defaultValues.includes(kana)}
                  className="sr-only"
                />
                {kana}
              </label>
            ))}
          </div>
        ))}
      </div>
    </fieldset>
  );
}
