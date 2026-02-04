// src/app/my/page.tsx
import Link from "next/link";
import { ensureContributorId } from "@/lib/contributor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getBadge(total: number, withImg: number) {
  if (total >= 10) return { label: "花見マスター", color: "bg-purple-600" };
  if (withImg >= 3) return { label: "凄腕カメラマン", color: "bg-blue-600" };
  if (total >= 3) return { label: "お花見常連", color: "bg-pink-600" };
  if (total >= 1) return { label: "初投稿", color: "bg-emerald-600" };
  return { label: "ビギナー", color: "bg-neutral-400" };
}

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

const BLOOM_LABELS = ["つぼみ", "咲始め", "3分咲き", "5分咲き", "7分咲き", "満開", "散る"] as const;
function bloomLabel(v: number | null) {
  if (!Number.isInteger(v ?? NaN)) return "-";
  return BLOOM_LABELS[v as number] ?? "-";
}

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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 ring-1 ring-neutral-200">
      {children}
    </span>
  );
}

export default async function MyPage() {
  const { id: contributorId } = await ensureContributorId();

  const [items, stats] = await Promise.all([
    prisma.spot.findMany({
      where: { contributorId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.spot.aggregate({
      where: { contributorId },
      _count: { _all: true, imageUrl: true },
    }),
  ]);

  const total = stats._count._all;
  const withImg = stats._count.imageUrl ?? 0;
  const badge = getBadge(total, withImg);

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <h1 className="text-xl font-bold text-neutral-900">マイページ</h1>
        <div className="mt-4 flex items-center gap-3">
          <span className={`${badge.color} rounded-full px-3 py-1 text-xs font-bold text-white`}>
            称号：{badge.label}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
          <div className="text-center">
            <p className="text-xs text-neutral-500">総投稿数</p>
            <p className="text-lg font-bold">{total}件</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-500">画像付き</p>
            <p className="text-lg font-bold">{withImg}件</p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-sm font-bold text-neutral-600">投稿履歴</h2>

        {items.map((s) => {
          const cat = String(s.category);
          const isHanami = cat === "HANAMI";

          return (
            <div key={s.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="font-bold truncate">{s.place}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Pill>{CATEGORY_LABEL[cat] ?? cat}</Pill>

                    {/* 花見だけ bloom/weather を表示 */}
                    {isHanami ? (
                      <>
                        <Pill>開花：{bloomLabel(s.bloom ?? null)}</Pill>
                        <Pill>天気：{s.weather ?? "-"}</Pill>
                        {s.flowerPreset ? <Pill>花：{String(s.flowerPreset)}</Pill> : null}
                        {s.flowerOther ? <Pill>花：{s.flowerOther}</Pill> : null}
                      </>
                    ) : (
                      <>
                        {s.crowd ? <Pill>混雑：{CROWD_LABEL[String(s.crowd)] ?? String(s.crowd)}</Pill> : null}
                        {s.businessStatus ? <Pill>営業：{BIZ_LABEL[String(s.businessStatus)] ?? String(s.businessStatus)}</Pill> : null}
                        {s.parkingLevel ? <Pill>駐車：{PARKING_LABEL[String(s.parkingLevel)] ?? String(s.parkingLevel)}</Pill> : null}
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-neutral-400">{formatJST(s.createdAt)}</p>
                  <p className="mt-1 text-[10px] text-neutral-300">id:{s.id}</p>
                </div>
              </div>

              {s.imageUrl ? (
                <img src={s.imageUrl} className="mt-3 h-32 w-full rounded-lg object-cover" alt="投稿画像" />
              ) : null}

              {s.comment ? <p className="mt-2 text-sm text-neutral-700 whitespace-pre-wrap">{s.comment}</p> : null}
            </div>
          );
        })}

        {items.length === 0 ? (
          <p className="text-center text-sm text-neutral-400">履歴がありません</p>
        ) : null}
      </div>

      <div className="mt-8 space-y-3">
        <Link
          href="/"
          className="block w-full rounded-xl bg-neutral-900 py-3 text-center text-sm font-bold text-white"
        >
          TOPに戻る
        </Link>
      </div>
    </main>
  );
}