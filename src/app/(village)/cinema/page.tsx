import Link from "next/link";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { MovieCatalogItem } from "@/types/database";

export default async function CinemaPage() {
  const { supabase } = await requireProfile();

  const { data: moviesData } = await supabase
    .from("movie_catalog")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const movies = (moviesData ?? []) as MovieCatalogItem[];

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader
        title="映画館"
        description="吃音にまつわる映画を、静かに観ていきませんか"
      />

      <ul className="flex flex-col gap-4">
        {movies.map((movie) => (
          <li key={movie.id}>
            <Link
              href={`/cinema/${movie.id}`}
              className="block rounded-xl border border-village-border bg-village-paper p-4 transition-colors hover:border-village-ember"
            >
              <h2 className="font-medium text-village-ink">{movie.title}</h2>
              {movie.original_title ? (
                <p className="mt-1 text-sm text-village-ink/50">
                  {movie.original_title}
                </p>
              ) : null}
              {movie.description ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-village-ink/80">
                  {movie.description}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
        {movies.length === 0 ? (
          <p className="text-center text-sm text-village-ink/50">
            まだ映画が登録されていません。
          </p>
        ) : null}
      </ul>

      <div className="mt-6 rounded-xl border border-dashed border-village-border px-4 py-3 text-center text-sm text-village-ink/40">
        ＋ 吃音に関する映画の追加を要望
      </div>
    </main>
  );
}
