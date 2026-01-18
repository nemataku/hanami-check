// src/app/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: {
    place?: string;
    category?: string;
  };
};

const CATEGORIES = [
  { key: "MALL", label: "商業施設" },
  { key: "PARK", label: "公園・テーマパーク" },
  { key: "FOOD", label: "飲食" },
  { key: "EVENT", label: "イベント" },
  { key: "PARKING", label: "駐車場" },
  { key: "HANAMI", label: "花見" },
  { key: "SCENIC", label: "景勝地" },
  { key: "PUBLIC", label: "公共施設" },
] as const;

export default function HomePage({ searchParams }: PageProps) {
  const selectedCategory = (searchParams?.category ?? "").trim(); // ""なら全カテゴリ
  const defaultPlace = (searchParams?.place ?? "").trim();

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      {/* ヘッダー */}
      <header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200">
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
          Hanami Check
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          花見スポットの今がわかる
        </p>
      </header>

      {/* カテゴリ */}
      <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200">
        <p className="text-xs font-semibold text-neutral-600">カテゴリで探す</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/"
            className={[
              "rounded-xl border px-3 py-2 text-xs font-semibold",
              selectedCategory === ""
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
            ].join(" ")}
          >
            すべて
          </Link>

          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/?category=${encodeURIComponent(c.key)}`}
              className={[
                "rounded-xl border px-3 py-2 text-xs font-semibold",
                selectedCategory === c.key
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
              ].join(" ")}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 検索 */}
      <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200">
        <p className="text-xs font-semibold text-neutral-600">場所名で探す</p>

        {/* GET で /results に飛ばす（既存の検索実装に合わせる） */}
        <form action="/results" method="GET" className="mt-3 space-y-3">
          {/* カテゴリも一緒に渡す（選択中のみ） */}
          {selectedCategory ? (
            <input type="hidden" name="category" value={selectedCategory} />
          ) : null}

          <input
            name="place"
            defaultValue={defaultPlace}
            placeholder="例：上野公園 / 東京駅 / イオンモール"
            className="w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-neutral-400"
          />

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-pink-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-pink-700"
          >
            検索する
          </button>
        </form>

        <p className="mt-3 text-[11px] text-neutral-500">
          ※カテゴリ選択中は、そのカテゴリで検索します
        </p>
      </section>

      {/* CTA */}
      <div className="mt-6">
        <Link
          href="/post"
          className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
        >
          投稿する
        </Link>
      </div>
    </main>
  );
}