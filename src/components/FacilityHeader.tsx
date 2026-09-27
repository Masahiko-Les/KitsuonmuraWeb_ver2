export function FacilityHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8 border-b border-village-border pb-6">
      <h1 className="font-serif text-3xl text-village-ink">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-village-ink/70">
          {description}
        </p>
      ) : null}
    </header>
  );
}
