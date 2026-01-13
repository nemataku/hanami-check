// src/app/my/page.tsx
import Link from "next/link";

type Spot = {
  id: number;
  place: string;
  bloom: number;
  weather: string | null;
  comment: string | null;
  imageUrl: string | null;
  createdAt: string;
};

type SpotsRes =
  | { ok: true; items: Spot[] }
  | { ok: false; error: string };

type StatsRes =
  | { ok: true; totalPosts: number; postsWithImage: number }
  | { ok: false; error: string };

function badgeLabel(total: number) {
  if (total >= 10) return "レポーター";
  if (total >= 3) return "常連さん";
  if (total >= 1) return "はじめての投稿";
  return "未投稿";
}

export default async function MyPage() {
  const [spotsRes, statsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/spots?mine=1`, { cache: "no-store" })
      .then((r) => r.json() as Promise<SpotsRes>)
      .catch(() => ({ ok: false, error: "取得に失敗しました" } as const)),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/me/stats`, { cache: "no-store" })
      .then((r) => r.json() as Promise<StatsRes>)
      .catch(() => ({ ok: false, error: "取得に失敗しました" } as const)),
  ]);

  const items = spotsRes.ok ? spotsRes.items : [];
  const total = statsRes.ok ? statsRes.totalPosts : 0;
  const withImg = statsRes.ok ? statsRes.postsWithImage : 0;

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
        <h1 className="text-lg font-semibold text-neutral-900">自分の投稿</h1>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-neutral-900 px-3 py-1 text-white">
            バッジ：{badgeLabel(total)}
          </span>
          <span className="text-neutral-600">投稿 {total}件</span>
          <span className="text-neutral-600">画像付き {withImg}件</span>
        </div>
      </div>

      {!spotsRes.ok ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-700">{spotsRes.error}</p>
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {items.map((s) => (
          <div key={s.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-sm font-semibold text-neutral-900">{s.place}</p>
            {s.comment ? <p className="mt-1 text-sm text-neutral-700">{s.comment}</p> : null}
            {s.imageUrl ? (
              <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-neutral-200">
                <img src={s.imageUrl} alt="" className="h-auto w-full object-cover" />
              </div>
            ) : null}
            <p className="mt-2 text-xs text-neutral-500">
              {new Date(s.createdAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
            </p>
          </div>
        ))}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-600">まだ投稿がありません。</p>
            <Link href="/post" className="mt-3 inline-flex rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">
              投稿する
            </Link>
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
        >
          TOPに戻る
        </Link>
      </div>
    </main>
  );
}