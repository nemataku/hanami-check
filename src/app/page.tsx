// src/app/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <header className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <h1 className="text-4xl font-black tracking-tight text-neutral-900">
          Hanami Check
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          花見スポットの今がわかる
        </p>

        <div className="mt-6 space-y-3">
          <Link
            href="/post"
            className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
          >
            開花状況を投稿する
          </Link>

          <Link
            href="/my"
            className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
          >
            マイページを見る
          </Link>
        </div>
      </header>
    </main>
  );
}