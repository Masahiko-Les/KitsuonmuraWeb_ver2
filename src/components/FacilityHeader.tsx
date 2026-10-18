import Image from "next/image";

export function FacilityHeader({
  title,
  description,
  iconSrc,
  centered,
}: {
  title: string;
  description?: string;
  iconSrc?: string;
  centered?: boolean;
}) {
  return (
    <header className="mb-8 border-b border-village-border pb-6">
      <div
        className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}
      >
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt=""
            width={72}
            height={72}
            className="h-[72px] w-[72px] shrink-0 object-contain"
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
