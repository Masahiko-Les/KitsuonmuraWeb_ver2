import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import { DiaryEntryRow } from "@/components/DiaryEntryRow";
import { getDiaryEntries } from "@/lib/diary";

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
              <DiaryEntryRow entry={entry} iconSize={18} />
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
