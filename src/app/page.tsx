// src/app/page.tsx
import Link from "next/link";
import { CategoryTabs } from "@/components/CategoryTabs";

export const dynamic = "force-dynamic";

type SearchParams = { place?: string; category?: string };
type PageProps = { searchParams?: SearchParams | Promise<SearchParams> };

export default async function Home({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams ?? {});
  const place = (sp.place ?? "").trim();
  const category = (sp.category ?? "").trim();

  const p = new URLSearchParams();
  if (place) p.set("place", place);
  if (category) p.set("category", category);
  const resultsHref = `/results?${p.toString()}`;

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <h1 className="text-2xl font-bold text-neutral-900">Hanami Check</h1>
        <p className="mt-1 text-sm text-neutral-600">花見スポットの今がわかる</p>
      </div>

      <div className="mt-4">
        <CategoryTabs place={place} selected={category} />
      </div>

      <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200">
        <p className="text-xs font-semibold text-neutral-600">場所名で探す</p>

        <form className="mt-3" action="/" method="get">
          {category ? <input type="hidden" name="category" value={category} /> : null}

          <input
            name="place"
            defaultValue={place}
            placeholder="例：上野公園 / 東京駅 / イオンモール"
            className="w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-neutral-400"
          />

          <Link
            href={resultsHref}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white hover:bg-pink-700"
          >
            検索する
          </Link>
        </form>
      </section>

      {/* ✅ 復活：投稿 / マイページ */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          href="/post"
          className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          投稿する
        </Link>
        <Link
          href="/my"
          className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
        >
          マイページ
        </Link>
      </div>
    </main>
  );
}