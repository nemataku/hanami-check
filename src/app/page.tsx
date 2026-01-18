// src/app/page.tsx
import Link from "next/link";
import { CategoryTabs } from "@/components/CategoryTabs";

export const dynamic = "force-dynamic";

type SearchParams = { place?: string; category?: string };
type PageProps = { searchParams?: SearchParams | Promise<SearchParams> };

export default async function Home({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams ?? {});
  const place = (sp.place ?? "").trim();
  const category = (sp.category ?? "").trim(); // "" は「すべて」

  // 検索ボタンの遷移先（place + category）
  const p = new URLSearchParams();
  if (place) p.set("place", place);
  if (category) p.set("category", category);
  const resultsHref = `/results?${p.toString()}`;

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      {/* ヘッダー */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <h1 className="text-2xl font-bold text-neutral-900">Hanami Check</h1>
        <p className="mt-1 text-sm text-neutral-600">花見スポットの今がわかる</p>
      </div>

      {/* ✅ 追加：カテゴリタブ（押せる） */}
      <div className="mt-4">
        <CategoryTabs place={place} selected={category} />
      </div>

      {/* 検索 */}
      <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200">
        <p className="text-xs font-semibold text-neutral-600">場所名で探す</p>

        <form className="mt-3" action="/" method="get">
          {/* category は維持 */}
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

      <Link
        href="/post"
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
      >
        投稿する
      </Link>
    </main>
  );
}