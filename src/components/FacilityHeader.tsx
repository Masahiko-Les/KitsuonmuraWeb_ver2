import Link from "next/link";

export function FacilityHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8 border-b border-village-border pb-6">
      <Link
        href="/village"
        className="text-sm text-village-ink/60 hover:text-village-ember transition-colors"
      >
        ← 村の地図へ戻る
      </Link>
      <h1 className="mt-3 font-serif text-3xl text-village-ink">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-village-ink/70">
          {description}
        </p>
      ) : null}
    </header>
  );
}
