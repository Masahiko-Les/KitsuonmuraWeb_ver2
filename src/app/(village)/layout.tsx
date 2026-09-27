import { BottomNav } from "@/components/BottomNav";

export default function VillageGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col pb-16">
      {children}
      <BottomNav />
    </div>
  );
}
