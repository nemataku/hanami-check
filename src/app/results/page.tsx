// src/app/results/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchParamsShape = { place?: string };

// Nextのバージョン差分吸収（object or Promise）
type PageProps = {
  searchParams?: SearchParamsShape | Promise<SearchParamsShape>;
};

const BLOOM_LABELS = ["つぼみ", "咲始め", "3分咲き", "5分咲き", "7分咲き", "満開", "散る"] as const;
const bloomLabel = (v: number) => BLOOM_LABELS[v] ?? "-";

function bloomBadgeClass(bloom: number) {
  switch (bloom) {
    case 0: return "bg-slate-100 text-slate-700 ring-slate-200";
    case 1: return "bg-pink-100 text-pink-700 ring-pink-200";
    case 2: return "bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200";
    case 3: return "bg-rose-100 text-rose-700 ring-rose-200";
    case 4: return "bg-orange-100 text-orange-700 ring-orange-200";
    case 5: return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case 6: return "bg-neutral-200 text-neutral-700 ring-neutral-300";
    default: return "bg-neutral-100 text-neutral-700 ring-neutral-200";
  }
}

function weatherBadgeClass(weather: string | null) {
  switch (weather) {
    case "晴れ": return "bg-amber-100 text-amber-800 ring-amber-200";
    case "曇り": return "bg-slate-100 text-slate-700 ring-slate-200";
    case "小雨": return "bg-sky-100 text-sky-800 ring-sky-200";
    case "雨":   return "bg-blue-100 text-blue-800 ring-blue-200";
    case "雪":   return "bg-indigo-100 text-indigo-800 ring-indigo-200";
    default:     return "bg-neutral-100 text-neutral-700 ring-neutral-200";
  }
}

/**
 * 相対時間表示（◯分前 / ◯時間前 / ◯日前）
 * ※差分はタイムゾーンに依存しないので、UTC保存でもOK
 */
function timeAgo(input: string | Date) {
  const t = input instanceof Date ? input.getTime() : new Date(input).getTime();
  const now = Date.now();
  if (!Number.isFinite(t)) return "-";

  let diff = now - t;
  if (diff < 0) diff = 0; // 未来時刻（時計ズレ等）の保険

  const sec = Math.floor(diff / 1000);
  if (sec < 30) return "たった今";

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分前`;

  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}時間前`;

  const day = Math.floor(hour / 24);
  return `${day}日前`;
}

/**
 * 日本時間（Asia/Tokyo）で「YYYY/MM/DD HH:mm」に整形
 */
function formatJST(input: string | Date) {
  const d = input instanceof Date ? input : new Date(input);
  if (!Number.isFinite(d.getTime())) return "-";

  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export default async function ResultsPage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams ?? {});
  const place = (sp.place ?? "").trim();

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

  const items = await prisma.spot.findMany({
    where: {
      place: { contains: place, mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-2xl bg-pink-50 p-4 ring-1 ring-pink-100">
        <p className="text-xs font-medium text-pink-700">検索結果</p>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">{place}</h1>
        <p className="mt-1 text-xs text-neutral-600">最新の5件を表示しています</p>
      </div>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-700">投稿がまだありません。</p>
          </div>
        ) : null}

        {items.map((s) => (
          <article key={s.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                  bloomBadgeClass(s.bloom),
                ].join(" ")}
              >
                {bloomLabel(s.bloom)}
              </span>

              <span
                className={[
                  "rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                  weatherBadgeClass(s.weather ?? null),
                ].join(" ")}
              >
                {s.weather ?? "-"}
              </span>

              {/* ✅ ここが変更：相対（◯日前）＋ 日本時間の投稿日時 */}
              <span className="ml-auto text-xs text-neutral-400">
                {timeAgo(s.createdAt)}（{formatJST(s.createdAt)}）
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