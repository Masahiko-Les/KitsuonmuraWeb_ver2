import { FacilityHeader } from "@/components/FacilityHeader";

export function ComingSoon({ title }: { title: string }) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader title={title} />
      <p className="text-center text-sm text-village-ink/60">
        {title}はまだ準備中です。
      </p>
    </main>
  );
}
