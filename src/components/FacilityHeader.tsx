import Image from "next/image";

export function FacilityHeader({
  title,
  description,
  iconSrc,
}: {
  title: string;
  description?: string;
  iconSrc?: string;
}) {
  return (
    <header className="mb-8 border-b border-village-border pb-6">
      <div className="flex items-center gap-3">
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 object-contain"
          />
        ) : null}
        <h1 className="font-serif text-3xl text-village-ink">{title}</h1>
      </div>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-village-ink/70">
          {description}
        </p>
      ) : null}
    </header>
  );
}
