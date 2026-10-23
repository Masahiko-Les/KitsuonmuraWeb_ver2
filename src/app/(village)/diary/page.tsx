import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import { CropIcon } from "@/components/CropIcon";
import { FlowerIcon } from "@/components/FlowerIcon";
import { getDiaryEntries, formatDiaryDate } from "@/lib/diary";

export default async function DiaryPage() {
  const { supabase, user } = await requireProfile();

  const entries = await getDiaryEntries(supabase, user.id);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <FacilityHeader
        title="日記"
        description="この村でのあなたの活動やもらったものが記録されます。"
      />

      {entries.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {entries.map((entry, index) => (
            <li
              key={index}
              className="rounded-xl border border-village-border bg-white px-4 py-3"
            >
              <p className="mb-1 text-xs text-village-ink/50">
                {formatDiaryDate(entry.date)}
              </p>
              <p className="flex items-start gap-1.5 text-sm leading-relaxed text-village-ink/90">
                {entry.itemKind === "flower" ? (
                  <FlowerIcon
                    name={entry.itemName}
                    emoji={entry.itemEmoji}
                    size={18}
                    className="mt-0.5"
                  />
                ) : (
                  <CropIcon
                    name={entry.itemName}
                    emoji={entry.itemEmoji}
                    size={18}
                    className="mt-0.5"
                  />
                )}
                <span>
                  {entry.itemName}
                  {entry.suffix}
                </span>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-sm text-village-ink/50">
          まだ記録がありません。村のみんなと関わってみましょう。
        </p>
      )}
    </main>
  );
}
