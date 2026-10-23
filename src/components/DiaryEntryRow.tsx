import { CropIcon } from "@/components/CropIcon";
import { FlowerIcon } from "@/components/FlowerIcon";
import { formatDiaryDate, type DiaryEntry } from "@/lib/diary";

export function DiaryEntryRow({
  entry,
  iconSize = 18,
}: {
  entry: DiaryEntry;
  iconSize?: number;
}) {
  return (
    <>
      <p className="mb-1 text-xs text-village-ink/50">
        {formatDiaryDate(entry.date)}
      </p>
      <p className="flex items-start gap-1.5 text-sm leading-relaxed text-village-ink/90">
        {entry.itemKind === "flower" ? (
          <FlowerIcon
            name={entry.itemName}
            emoji={entry.itemEmoji}
            size={iconSize}
            className="mt-0.5"
          />
        ) : entry.itemKind === "crop" ? (
          <CropIcon
            name={entry.itemName}
            emoji={entry.itemEmoji}
            size={iconSize}
            className="mt-0.5"
          />
        ) : (
          <span
            className="mt-0.5 shrink-0 leading-none"
            style={{ fontSize: iconSize }}
          >
            {entry.itemEmoji}
          </span>
        )}
        <span>
          {entry.itemName}
          {entry.suffix}
        </span>
      </p>
    </>
  );
}
