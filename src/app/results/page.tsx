import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchParamsShape = { place?: string; category?: string };
type PageProps = { searchParams?: SearchParamsShape | Promise<SearchParamsShape> };

const TABS = [
  { key: "HANAMI", label: "花見" },
  { key: "SCENIC", label: "景勝地" },
  { key: "FACILITY", label: "商業施設" },
  { key: "FOOD", label: "飲食" },
  { key: "EVENT", label: "イベント" },
  { key: "PARKING", label: "駐車場" },
] as const;

const BLOOM_LABELS = ["つぼみ", "咲始め", "3分咲き", "5分咲き", "7分咲き", "満開", "散る"] as const;
const bloomLabel = (v: number) => BLOOM_LABELS[v] ?? "-";

function timeAgo(input: string | Date) {
  const t = input instanceof Date ? input.getTime() : new Date(input).getTime();
  const now = Date.now();
  if (!Number.isFinite(t)) return "-";
  let diff = now - t;
  if (diff < 0) diff = 0;

  const sec = Math.floor(diff / 1000);
  if (sec < 30) return "たった今";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}時間前`;
  const day = Math.floor(hour / 24);
  return `${day}日前`;
}

function formatJSTTime(input: string | Date) {
  const d = input instanceof Date ? input : new Date(input);
  if (!Number.isFinite(d.getTime())) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function pillTone(kind: "pink" | "green" | "blue" | "orange" | "gray") {
  switch (kind) {
    case "pink":
      return "bg-pink-100 text-pink-800 ring-pink-200";
    case "green":
      return "bg-emerald-100 text-emerald-800 ring-emerald-200";
    case "blue":
      return "bg-sky-100 text-sky-800 ring-sky-200";
    case "orange":
      return "bg-orange-100 text-orange-800 ring-orange-200";
    default:
      return "bg-neutral-100 text-neutral-700 ring-neutral-200";
  }
}

function Dots({ value, max = 5, tone = "orange" }: { value: number; max?: number; tone?: "orange" | "green" }) {
  const on = Math.max(0, Math.min(max, Math.floor(value)));
  const onCls = tone === "green" ? "bg-emerald-500" : "bg-orange-400";
  return (
    <div className="flex items-center gap-1 rounded-full bg-neutral-50 px-2 py-1 ring-1 ring-neutral-200">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={[
            "h-3 w-3 rounded-full",
            i < on ? onCls : "bg-neutral-200",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

function primaryBadge(category: string, bloom: number, condition: number) {
  if (category === "HANAMI") return { text: bloomLabel(bloom), tone: "pink" as const };
  if (category === "SCENIC") return { text: condition >= 4 ? "ベストシーズン" : "見頃", tone: "green" as const };
  if (category === "PARKING") return { text: condition >= 4 ? "駐車場空き◎" : condition >= 3 ? "空きあり" : "満車気味", tone: "green" as const };
  return { text: "混雑度", tone: "blue" as const };
}

function secondaryBadge(weather: string | null) {
  if (!weather) return null;
  if (weather === "晴れ") return { text: "☀️ 晴れ", tone: "orange" as const };
  if (weather === "曇り") return { text: "☁️ 曇り", tone: "gray" as const };
  if (weather === "小雨") return { text: "🌧 小雨", tone: "blue" as const };
  if (weather === "雨") return { text: "🌧 雨", tone: "blue" as const };
  if (weather === "雪") return { text: "❄️ 雪", tone: "gray" as const };
  return { text: weather, tone: "gray" as const };
}

export default async function ResultsPage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams ?? {});
  const place = (sp.place ?? "").trim();
  const category = (sp.category ?? "HANAMI").trim();

  const items = await prisma.spot.findMany({
    where: {
      ...(place ? { place: { contains: place, mode: "insensitive" as const } } : {}),
      ...(category ? { category: category as any } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6">
      {/* タブ */}
      <div className="sticky top-0 z-10 -mx-4 bg-neutral-50 px-4 pt-2 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const active = t.key === category;
            return (
              <Link
                key={t.key}
                href={`/results?place=${encodeURIComponent(place)}&category=${t.key}`}
                className={[
                  "shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold ring-1",
                  active
                    ? "bg-emerald-700 text-white ring-emerald-700"
                    : "bg-white text-neutral-800 ring-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 一覧 */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-700">投稿がまだありません。</p>
          </div>
        ) : null}

        {items.map((s) => {
          const p = primaryBadge(String((s as any).category), s.bloom, (s as any).condition);
          const w = secondaryBadge(s.weather ?? null);
          const showWeather = String((s as any).category) === "HANAMI";

          return (
            <article key={s.id} className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-[1fr_140px] gap-3">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-neutral-900">{s.place}</h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={["rounded-full px-3 py-1 text-xs font-bold ring-1", pillTone(p.tone)].join(" ")}>
                      {p.text}
                    </span>

                    {showWeather && w ? (
                      <span className={["rounded-full px-3 py-1 text-xs font-bold ring-1", pillTone(w.tone)].join(" ")}>
                        {w.text}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
                    {/* 混雑メーター */}
                    <Dots value={(s as any).crowd ?? 3} tone="orange" />
                    <span className="text-neutral-500">
                      {timeAgo(s.createdAt)}（{formatJSTTime(s.createdAt)}）
                    </span>
                  </div>

                  {String((s as any).category) === "SCENIC" || String((s as any).category) === "PARKING" ? (
                    <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
                      <span className="text-xs font-semibold text-neutral-500">状態</span>
                      <Dots value={(s as any).condition ?? 3} tone={String((s as any).category) === "PARKING" ? "green" : "orange"} />
                    </div>
                  ) : null}

                  {s.comment ? (
                    <p className="mt-3 text-base text-neutral-900">{s.comment}</p>
                  ) : null}
                </div>

                {/* 画像 */}
                <div className="flex items-center justify-end">
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt="投稿画像"
                      className="h-[92px] w-[140px] rounded-2xl object-cover ring-1 ring-neutral-200"
                    />
                  ) : (
                    <div className="h-[92px] w-[140px] rounded-2xl bg-neutral-100 ring-1 ring-neutral-200" />
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* 下部ボタン */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-4 py-4 text-sm font-extrabold text-white shadow-sm hover:bg-neutral-800"
        >
          TOPに戻る
        </Link>

        <Link
          href="/post"
          className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-sm font-bold text-neutral-900 shadow-sm hover:bg-neutral-50"
        >
          投稿する
        </Link>
      </div>
    </main>
  );
}