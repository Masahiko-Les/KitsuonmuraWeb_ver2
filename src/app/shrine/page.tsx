import Link from "next/link";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { VillageStatus } from "@/types/database";
import { offerCropAction } from "./actions";

interface UnofferedCrop {
  id: string;
  harvests: { crop_catalog: { name: string; emoji: string | null } | null } | null;
}

export default async function ShrinePage() {
  const { supabase } = await requireProfile();

  const [{ data: statusData }, { data: cropsData }] = await Promise.all([
    supabase.rpc("get_village_status"),
    supabase
      .from("user_crops")
      .select("id, harvests(crop_catalog(name, emoji))")
      .is("offered_at", null)
      .order("created_at", { ascending: true }),
  ]);

  const status = statusData as VillageStatus | null;
  const crops = (cropsData ?? []) as unknown as UnofferedCrop[];

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader title="祠" />

      <p className="whitespace-pre-line text-sm leading-relaxed text-village-ink/80">
        {
          "村の奥に、古い祠があります。\n\n誰が建てたのかは、もう分かりません。\n\n祠にお供えすると、村が豊かになると言われています。"
        }
      </p>

      {status ? (
        <p className="mt-6 rounded-xl border border-village-border bg-village-paper px-5 py-4 text-center font-serif text-village-ink">
          {status.message}
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-village-ink/80">
          お供えできる作物
        </h2>
        <ul className="flex flex-col gap-3">
          {crops.map((crop) => (
            <li
              key={crop.id}
              className="flex items-center justify-between rounded-xl border border-village-border bg-white px-4 py-3"
            >
              <span className="text-sm text-village-ink">
                {crop.harvests?.crop_catalog?.emoji ?? "🌾"}{" "}
                {crop.harvests?.crop_catalog?.name ?? "作物"}
              </span>
              <form action={offerCropAction.bind(null, crop.id)}>
                <button
                  type="submit"
                  className="rounded-full bg-village-ember px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  お供えする
                </button>
              </form>
            </li>
          ))}
          {crops.length === 0 ? (
            <p className="text-center text-sm text-village-ink/50">
              今はお供えできる作物がありません。農園で収穫を待ちましょう。
            </p>
          ) : null}
        </ul>
      </section>

      <div className="mt-12 text-right">
        <Link
          href="/shrine/back"
          className="text-xs text-village-ink/40 hover:text-village-ember"
        >
          祠の裏へまわる
        </Link>
      </div>
    </main>
  );
}
