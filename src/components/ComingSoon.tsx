import { FacilityHeader } from "@/components/FacilityHeader";

export function ComingSoon({
  title,
  iconSrc,
}: {
  title: string;
  iconSrc?: string;
}) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader title={title} iconSrc={iconSrc} centered />
      <p className="text-center text-sm text-village-ink/60">
        {title}はまだ準備中です。
      </p>
    </main>
  );
}
