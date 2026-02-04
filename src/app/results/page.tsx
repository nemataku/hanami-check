// src/app/results/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ShareButtons from "@/components/ShareButtons";

export const dynamic = "force-dynamic";

type SearchParamsShape = { place?: string; category?: string };
type PageProps = {
  searchParams?: SearchParamsShape | Promise<SearchParamsShape>;
};

const CATEGORIES = [
  { key: "", label: "すべて" },
  { key: "SHOPPING", label: "商業施設" },
  { key: "PARK", label: "公園・テーマパーク" },
  { key: "FOOD", label: "飲食" },
  { key: "EVENT", label: "イベント" },
  { key: "PARKING", label: "駐車場" },
  { key: "HANAMI", label: "花見" },
  { key: "SCENIC", label: "観光地・景勝地" },
  { key: "PUBLIC", label: "公共施設" },
] as const;

const CATEGORY_LABEL: Record<string, string> = {
  SHOPPING: "商業施設",
  PARK: "公園・テーマパーク",
  FOOD: "飲食",
  EVENT: "イベント",
  PARKING: "駐車場",
  HANAMI: "花見",
  SCENIC: "観光地・景勝地",
  PUBLIC: "公共施設",
};

const CROWD_LABEL: Record<string, string> = {
  EMPTY: "空いている",
  LIGHT: "やや混雑",
  CROWDED: "混雑",
  FULL: "満員",
  RESTRICTED: "入場規制",
};

const BIZ_LABEL: Record<string, string> = {
  OPEN: "営業中",
  BREAK: "休憩中",
  CLOSED: "営業時間外",
  HOLIDAY: "休業",
};

const PARKING_LABEL: Record<string, string> = {
  AVAILABLE: "空きあり",
  LIGHT: "やや混雑",
  CROWDED: "混雑",
  FULL: "満車",
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

const bloomLabel = (v: number) => BLOOM_LABELS[v] ?? "-";

function timeAgo(input: string | Date) {
  const t = input instanceof Date ? input.getTime() : new Date(input).getTime();
  const now = Date.now();
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

function formatJST(input: string | Date) {
  const d = input instanceof Date ? input : new Date(input);
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

function linkToResults(place: string, category: string) {
  const p = new URLSearchParams();
  if (place.trim()) p.set("place", place.trim());
  if (category.trim()) p.set("category", category.trim());
  return `/results?${p.toString()}`;
}

/** ====== 色つきバッジ（値がある時だけ色付け） ====== */
function badgeBase() {
  return "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1";
}

function bizBadgeClass(v: string) {
  switch (v) {
    case "OPEN":
      return "bg-emerald-600 text-white ring-emerald-200";
    case "BREAK":
      return "bg-neutral-500 text-white ring-neutral-200";
    case "CLOSED":
      return "bg-neutral-500 text-white ring-neutral-200";
    case "HOLIDAY":
      return "bg-rose-600 text-white ring-rose-200";
    default:
      return "bg-neutral-200 text-neutral-700 ring-neutral-200";
  }
}

function crowdBadgeClass(v: string) {
  switch (v) {
    case "EMPTY":
      return "bg-emerald-600 text-white ring-emerald-200";
    case "LIGHT":
      return "bg-amber-400 text-white ring-amber-200";
    case "CROWDED":
      return "bg-orange-500 text-white ring-orange-200";
    case "FULL":
      return "bg-rose-600 text-white ring-rose-200";
    case "RESTRICTED":
      return "bg-neutral-600 text-white ring-neutral-200";
    default:
      return "bg-neutral-200 text-neutral-700 ring-neutral-200";
  }
}

function weatherBadgeClass(v: string) {
  switch (v) {
    case "晴れ":
      return "bg-amber-400 text-white ring-amber-200";
    case "曇り":
      return "bg-neutral-500 text-white ring-neutral-200";
    case "小雨":
      return "bg-sky-500 text-white ring-sky-200";
    case "雨":
      return "bg-blue-600 text-white ring-blue-200";
    case "雪":
      return "bg-white text-neutral-900 ring-neutral-200";
    default:
      return "bg-neutral-200 text-neutral-700 ring-neutral-200";
  }
}

function parkingBadgeClass(v: string) {
  switch (v) {
    case "AVAILABLE":
      return "bg-emerald-600 text-white ring-emerald-200";
    case "LIGHT":
      return "bg-amber-400 text-white ring-amber-200";
    case "CROWDED":
      return "bg-orange-500 text-white ring-orange-200";
    case "FULL":
      return "bg-rose-600 text-white ring-rose-200";
    default:
      return "bg-neutral-200 text-neutral-700 ring-neutral-200";
  }
}

function bloomBadgeClass(bloom: number) {
  switch (bloom) {
    case 0:
      return "bg-lime-500 text-white ring-lime-200";
    case 1:
      return "bg-emerald-600 text-white ring-emerald-200";
    case 2:
      return "bg-pink-200 text-neutral-900 ring-pink-200";
    case 3:
      return "bg-pink-200 text-neutral-900 ring-pink-200";
    case 4:
      return "bg-pink-500 text-white ring-pink-200";
    case 5:
      return "bg-pink-500 text-white ring-pink-200";
    case 6:
      return "bg-neutral-500 text-white ring-neutral-200";
    default:
      return "bg-neutral-200 text-neutral-700 ring-neutral-200";
  }
}

function RenderValue({
  value,
  className,
}: {
  value: string | null;
  className: string;
}) {
  if (!value || value === "ー") {
    return <span className="text-sm text-neutral-400">ー</span>;
  }
  return <span className={[badgeBase(), className].join(" ")}>{value}</span>;
}

function fmtTimeRange(openTime: string | null, closeTime: string | null) {
  if (!openTime || !closeTime) return "ー";
  return `${openTime}〜${closeTime}`;
}

function buildShareText(s: any) {
  const catKey = String(s.category ?? "");
  const cat = CATEGORY_LABEL[catKey] ?? catKey ?? "投稿";
  const crowd = s.crowd ? (CROWD_LABEL[s.crowd] ?? String(s.crowd)) : "ー";
  const biz = s.businessStatus ? (BIZ_LABEL[s.businessStatus] ?? String(s.businessStatus)) : "ー";
  const weather = s.weather ? String(s.weather) : "ー";
  const place = s.place ? String(s.place) : "";
  return `Komiru: ${place}（${cat}） 混雑状況:${crowd} / 営業状況:${biz} / 天気:${weather}`;
}

export default async function ResultsPage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams ?? {});
  const place = (sp.place ?? "").trim();
  const category = (sp.category ?? "").trim();

  if (!place) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-8">
        <div className="rounded-2xl bg-pink-50 p-4 ring-1 ring-pink-100">
          <p className="text-xs font-medium text-pink-700">検索結果</p>
          <h1 className="mt-1 text-xl font-semibold text-neutral-900">
            場所が未入力です
          </h1>
          <p className="mt-1 text-xs text-neutral-600">
            TOPに戻って場所を入力してください
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
          >
            TOPに戻る
          </Link>
        </div>
      </main>
    );
  }

  const where: any = {
    place: { contains: place, mode: "insensitive" },
  };
  if (category) where.category = category;

  const items = await prisma.spot.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-2xl bg-pink-50 p-4 ring-1 ring-pink-100">
        <p className="text-xs font-medium text-pink-700">検索結果</p>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">{place}</h1>
      </div>

      <section className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
        <p className="text-xs font-semibold text-neutral-600">カテゴリ</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = c.key === category;
            return (
              <Link
                key={c.label}
                href={linkToResults(place, c.key)}
                className={[
                  "rounded-xl border px-3 py-2 text-xs font-semibold",
                  active
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-900",
                ].join(" ")}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-5 space-y-4">
        {items.map((s: any) => {
          const catKey = String(s.category ?? "");
          const vCategory = (CATEGORY_LABEL[catKey] ?? catKey) || "ー";

          const vCrowd = s.crowd ? (CROWD_LABEL[s.crowd] ?? String(s.crowd)) : "ー";
          const vBiz = s.businessStatus ? (BIZ_LABEL[s.businessStatus] ?? String(s.businessStatus)) : "ー";
          const vWeather = s.weather ? String(s.weather) : "ー";
          const vBloom = Number.isInteger(s.bloom) ? bloomLabel(Number(s.bloom)) : "ー";
          const vParking = s.parkingLevel ? (PARKING_LABEL[s.parkingLevel] ?? String(s.parkingLevel)) : "ー";

          const commentText =
            s.comment && String(s.comment).trim() !== "" ? String(s.comment).trim() : null;

          const shareUrl = `https://komiru.app/results?place=${encodeURIComponent(place)}${category ? `&category=${encodeURIComponent(category)}` : ""
            }`;
          const shareText = buildShareText(s);

          return (
            <article key={s.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-900">{vCategory}</p>
                <p className="text-xs text-neutral-400">
                  {timeAgo(s.createdAt)}（{formatJST(s.createdAt)}）
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700">混雑状況：</span>
                  <RenderValue
                    value={vCrowd}
                    className={crowdBadgeClass(String(s.crowd ?? ""))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700">営業状況：</span>
                  <RenderValue
                    value={vBiz}
                    className={bizBadgeClass(String(s.businessStatus ?? ""))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700">天気：</span>
                  <RenderValue
                    value={vWeather}
                    className={weatherBadgeClass(String(s.weather ?? ""))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700">開花状況：</span>
                  {vBloom === "ー" ? (
                    <span className="text-sm text-neutral-400">ー</span>
                  ) : (
                    <span className={[badgeBase(), bloomBadgeClass(Number(s.bloom))].join(" ")}>
                      {vBloom}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700">駐車場：</span>
                  <RenderValue
                    value={vParking}
                    className={parkingBadgeClass(String(s.parkingLevel ?? ""))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700">営業時間：</span>
                  <span className="text-sm text-neutral-800">
                    {fmtTimeRange(s.openTime ?? null, s.closeTime ?? null) || "ー"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700">イベント時間：</span>
                  <span className="text-sm text-neutral-800">
                    {s.eventStart && s.eventEnd ? `${s.eventStart}〜${s.eventEnd}` : "ー"}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3">
                <p
                  className={[
                    "min-h-[4.5em] whitespace-pre-wrap text-sm leading-6",
                    commentText ? "text-neutral-900" : "text-neutral-400",
                  ].join(" ")}
                >
                  {commentText ?? "コメントなし"}
                </p>
              </div>

              {/* ✅ 共有ボタンは components 側で管理（ここが反映ポイント） */}
              <ShareButtons shareUrl={shareUrl} shareText={shareText} />

              {s.imageUrl ? (
                <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-neutral-200">
                  <img src={s.imageUrl} alt="投稿画像" className="h-auto w-full object-cover" />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
        >
          TOPに戻る
        </Link>
      </div>
    </main>
  );
}