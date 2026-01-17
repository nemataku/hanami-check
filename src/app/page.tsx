// src/app/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { place?: string } | Promise<{ place?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams ?? {});
  const defaultPlace = (sp.place ?? "").trim();

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <header className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <h1 className="text-4xl font-black tracking-tight text-neutral-900">
          Hanami Check
        </h1>
        <p className="mt-2 text-sm text-neutral-600">花見スポットの今がわかる</p>

        {/* ✅ 検索窓（GETで /results に送る） */}
        <form action="/results" method="GET" className="mt-6 space-y-3">
          <label className="block text-sm font-semibold text-neutral-900">
            場所を検索
          </label>

          <input
            name="place"
            defaultValue={defaultPlace}
            placeholder="例：上野公園 / 東京駅"
            className="w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-neutral-400"
          />

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
          >
            検索する
          </button>
        </form>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/post"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
          >
            投稿する
          </Link>

          <Link
            href="/my"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
          >
            マイページ
          </Link>
        </div>
      </header>
    </main>
  );
}