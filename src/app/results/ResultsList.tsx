// src/app/results/ResultsList.tsx
import Image from "next/image";

type Spot = {
  id: number;
  bloom: number; // 0..6
  weather: string;
  imageUrl: string | null;
  comment: string | null;
  createdAt: string;
};

const BLOOM_LABELS = [
  "つぼみ",
  "咲始め",
  "3分咲き",
  "5分咲き",
  "7分咲き",
  "満開",
  "散る",
] as const;

function bloomLabel(code: number) {
  return BLOOM_LABELS[code] ?? "不明";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}`;
}

function bloomTone(label: string) {
  // “散る”は落ち着いたトーンに
  if (label === "散る")
    return "bg-neutral-100 text-neutral-700 ring-neutral-200";
  // “満開/7分”は少し華やか
  if (label === "満開" || label === "7分咲き")
    return "bg-pink-100 text-pink-800 ring-pink-200";
  // それ以外は淡い
  return "bg-rose-50 text-rose-800 ring-rose-100";
}

function weatherTone(weather: string) {
  if (weather === "晴れ") return "bg-sky-50 text-sky-800 ring-sky-100";
  if (weather === "曇り") return "bg-slate-50 text-slate-800 ring-slate-100";
  if (weather === "小雨" || weather === "雨")
    return "bg-blue-50 text-blue-800 ring-blue-100";
  if (weather === "雪") return "bg-indigo-50 text-indigo-800 ring-indigo-100";
  return "bg-neutral-50 text-neutral-800 ring-neutral-100";
}

function normalizeLocalImageUrl(url: string) {
  const s = url.trim();
  if (!s) return null;
  // "/uploads/xxx" に統一（過去データで "uploads/xxx" が入ってても救う）
  return s.startsWith("/") ? s : `/${s}`;
}

export default function ResultsList({ spots }: { spots: Spot[] }) {
  return (
    <ul className="divide-y divide-neutral-100">
      {spots.map((spot) => {
        const b = bloomLabel(spot.bloom);
        const imgSrc = spot.imageUrl ? normalizeLocalImageUrl(spot.imageUrl) : null;

        return (
          <li key={spot.id} className="px-4 py-4">
            {/* 上段：バッジ + 日付 */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {/* 開花（アイコンなし） */}
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                    bloomTone(b),
                  ].join(" ")}
                >
                  {b}
                </span>

                {/* 天気 */}
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                    weatherTone(spot.weather),
                  ].join(" ")}
                >
                  {spot.weather}
                </span>
              </div>

              <time className="shrink-0 text-xs text-neutral-400 tracking-wide">
                {formatDate(spot.createdAt)}
              </time>
            </div>

            {/* コメント */}
            <div className="mt-3">
              {spot.comment ? (
                <p className="text-sm leading-relaxed text-neutral-800">
                  {spot.comment}
                </p>
              ) : (
                <p className="text-sm text-neutral-400">コメントなし</p>
              )}
            </div>

            {/* 画像（カード内） */}
            {imgSrc ? (
              <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-neutral-200">
                <div className="relative aspect-[16/9] w-full bg-neutral-50">
                  <Image
                    src={imgSrc}
                    alt="投稿画像"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 420px"
                  />
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}