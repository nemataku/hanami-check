// src/app/results/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Spot = {
  id: number;
  place: string;
  bloom: number; // 0..6
  weather: string;
  imageUrl: string | null;
  comment: string | null;
  createdAt: string;
};

const BLOOM_LABELS = ["つぼみ", "咲始め", "3分咲き", "5分咲き", "7分咲き", "満開", "散る"] as const;
const bloomLabel = (v: number) => BLOOM_LABELS[v] ?? "-";

// ✅ 当初の「色表示」に寄せたバッジ色
function bloomBadgeClass(bloom: number) {
  switch (bloom) {
    case 0: // つぼみ
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case 1: // 咲始め
      return "bg-pink-100 text-pink-700 ring-pink-200";
    case 2: // 3分
      return "bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200";
    case 3: // 5分
      return "bg-rose-100 text-rose-700 ring-rose-200";
    case 4: // 7分
      return "bg-orange-100 text-orange-700 ring-orange-200";
    case 5: // 満開
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case 6: // 散る
      return "bg-neutral-200 text-neutral-700 ring-neutral-300";
    default:
      return "bg-neutral-100 text-neutral-700 ring-neutral-200";
  }
}

function weatherBadgeClass(weather: string) {
  switch (weather) {
    case "晴れ":
      return "bg-amber-100 text-amber-800 ring-amber-200";
    case "曇り":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case "小雨":
      return "bg-sky-100 text-sky-800 ring-sky-200";
    case "雨":
      return "bg-blue-100 text-blue-800 ring-blue-200";
    case "雪":
      return "bg-indigo-100 text-indigo-800 ring-indigo-200";
    default:
      return "bg-neutral-100 text-neutral-700 ring-neutral-200";
  }
}

export default function ResultsPage() {
  const sp = useSearchParams();
  const place = useMemo(() => (sp.get("place") ?? "").trim(), [sp]);

  const [items, setItems] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!place) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/spots?place=${encodeURIComponent(place)}`, {
          method: "GET",
          cache: "no-store",
          signal: ac.signal,
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok) {
          setError(data?.error ?? "検索に失敗しました");
          setItems([]);
          return;
        }

        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError("検索に失敗しました");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [place]);

  // place 未入力なら導線だけ（当初仕様に合わせる）
  if (!place) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-8">
        <div className="rounded-2xl bg-pink-50 p-4 ring-1 ring-pink-100">
          <p className="text-xs font-medium text-pink-700">検索結果</p>
          <h1 className="mt-1 text-xl font-semibold text-neutral-900">場所が未入力です</h1>
          <p className="mt-1 text-xs text-neutral-600">TOPに戻って場所を入力してください</p>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
          >
            TOPに戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      {/* ✅ ヘッダー：ピンク背景（検索結果 + 場所） */}
      <div className="rounded-2xl bg-pink-50 p-4 ring-1 ring-pink-100">
        <p className="text-xs font-medium text-pink-700">検索結果</p>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">{place}</h1>
        <p className="mt-1 text-xs text-neutral-600">最新の5件を表示しています</p>
      </div>

      {loading ? <p className="mt-4 text-sm text-neutral-500">読み込み中...</p> : null}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-5 space-y-4">
        {!loading && !error && items.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-700">投稿がまだありません。</p>
          </div>
        ) : null}

        {items.map((s) => (
          <article key={s.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2">
              {/* ✅ 〜分咲き：色表示 */}
              <span
                className={[
                  "rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                  bloomBadgeClass(s.bloom),
                ].join(" ")}
              >
                {bloomLabel(s.bloom)}
              </span>

              {/* ✅ 天気：色表示 */}
              <span
                className={[
                  "rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                  weatherBadgeClass(s.weather),
                ].join(" ")}
              >
                {s.weather}
              </span>

              <span className="ml-auto text-xs text-neutral-400">
                {new Date(s.createdAt).toLocaleString()}
              </span>
            </div>

            {s.comment ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-800">{s.comment}</p>
            ) : null}

            {s.imageUrl ? (
              <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-neutral-200">
                <img src={s.imageUrl} alt="投稿画像" className="h-auto w-full object-cover" />
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
        >
          TOPに戻る
        </Link>

        <Link
          href="/post"
          className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
        >
          開花状況を投稿する
        </Link>
      </div>
    </main>
  );
}