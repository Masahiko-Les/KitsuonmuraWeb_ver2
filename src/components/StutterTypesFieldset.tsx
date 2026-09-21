import { STUTTER_TYPES } from "@/types/database";

export function StutterTypesFieldset({
  defaultValues = [],
}: {
  defaultValues?: string[];
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm text-village-ink/80">
        吃音のタイプ（複数選択可）
      </legend>
      <div className="flex flex-wrap gap-3">
        {STUTTER_TYPES.map((type) => (
          <label
            key={type}
            className="flex items-center gap-2 rounded-full border border-village-border bg-white px-4 py-2 text-sm text-village-ink has-[:checked]:border-village-ember has-[:checked]:bg-village-ember/10"
          >
            <input
              type="checkbox"
              name="stutter_types"
              value={type}
              defaultChecked={defaultValues.includes(type)}
              className="accent-village-ember"
            />
            {type}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
