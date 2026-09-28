import Link from "next/link";
import { requireProfile } from "@/lib/guards";
import { FacilityHeader } from "@/components/FacilityHeader";
import type { BookCatalogItem } from "@/types/database";

export default async function LibraryPage() {
  const { supabase } = await requireProfile();

  const { data: booksData } = await supabase
    .from("book_catalog")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const books = (booksData ?? []) as BookCatalogItem[];

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <FacilityHeader
        title="図書館"
        description="吃音にまつわる本を、静かに読んでいきませんか"
      />

      <ul className="flex flex-col gap-4">
        {books.map((book) => (
          <li key={book.id}>
            <Link
              href={`/library/${book.id}`}
              className="block rounded-xl border border-village-border bg-village-paper p-4 transition-colors hover:border-village-ember"
            >
              <h2 className="font-medium text-village-ink">{book.title}</h2>
              <p
                className={
                  book.author
                    ? "mt-1 text-sm text-village-ink/50"
                    : "mt-1 text-sm italic text-village-ink/40"
                }
              >
                {book.author ?? "著者情報準備中"}
              </p>
              {book.description ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-village-ink/80">
                  {book.description}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
        {books.length === 0 ? (
          <p className="text-center text-sm text-village-ink/50">
            まだ本が登録されていません。
          </p>
        ) : null}
      </ul>

      <div className="mt-6 rounded-xl border border-dashed border-village-border px-4 py-3 text-center text-sm text-village-ink/40">
        ＋ 吃音に関する本の追加を要望
      </div>
    </main>
  );
}
