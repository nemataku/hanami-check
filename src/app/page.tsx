// src/app/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <div className="rounded-2xl bg-pink-50 p-5 ring-1 ring-pink-100">
        <p className="text-xs font-medium text-pink-700">Hanami Check</p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">いま行くべき花見を探す</h1>
        <p className="mt-1 text-xs text-neutral-600">場所名で検索して、最新投稿を確認できます</p>
      </div>

      <form action="/results" className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
        <label className="text-sm font-semibold text-neutral-900">場所</label>
        <input
          name="place"
          placeholder="例：上野公園 / 目黒川"
          className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
        <button
          type="submit"
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          検索する
        </button>
      </form>

      <div className="mt-6 space-y-3">
        <Link
          href="/post"
          className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
        >
          開花状況を投稿する
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