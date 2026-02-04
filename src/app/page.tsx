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

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      {/* ヘッダー */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <h1 className="text-2xl font-bold text-neutral-900">Komiru</h1>
        <p className="mt-1 text-sm text-neutral-600">
          いまの状況が見える、投稿サイト
        </p>
      </div>

      {/* カテゴリタブ */}
      <div className="mt-4">
        <CategoryTabs place={place} selected={category} />
      </div>

      {/* 検索フォーム */}
      <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200">
        <p className="text-xs font-semibold text-neutral-600">場所名で探す</p>

        {/* 🔽 /results に GET で送信 */}
        <form className="mt-3" action="/results" method="get">
          {category ? <input type="hidden" name="category" value={category} /> : null}

          <input
            name="place"
            defaultValue={place}
            placeholder="例：上野公園 / 東京駅 / イオンモール"
            className="w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-neutral-400"
          />

          <button
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white hover:bg-pink-700"
          >
            検索する
          </button>
        </form>
      </section>

      {/* 投稿（幅いっぱい） */}
      <div className="mt-5">
        <Link
          href="/post"
          className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          投稿する
        </Link>
      </div>
    </main>
  );
}