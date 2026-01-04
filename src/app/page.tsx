import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      {/* ===== ヘッダー ===== */}
      <header className="mb-10">
        {/* アイコン＋タイトル（横並び・左詰め） */}
        <div className="flex items-center gap-3">
          <Image
            src="/image.png"
            alt="Hanami Check アイコン"
            width={40}
            height={40}
            priority
          />
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Hanami Check
          </h1>
        </div>

        {/* サブコピー */}
        <p className="mt-4 pl-10 text-sm text-neutral-600">
          花見スポットの今がわかる
        </p>
      </header>

      {/* ===== 検索 ===== */}
      <section>
        <p className="mb-3 text-base font-semibold text-neutral-800">
          場所を検索
        </p>

        <form action="/results" method="GET" className="space-y-6">
          <input
            type="text"
            name="place"
            placeholder="例：上野公園 / 東京駅"
            required
            className="w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm focus:border-neutral-400 focus:outline-none"
          />

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
          >
            検索する
          </button>
        </form>
      </section>

      {/* ===== 投稿導線 ===== */}
      <div className="mt-6">
        <Link
          href="/post"
          className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
        >
          開花状況を投稿する
        </Link>
      </div>
    </main>
  );
}