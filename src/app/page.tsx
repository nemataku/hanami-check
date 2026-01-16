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

export default async function MyPage() {
  const { id: contributorId } = await ensureContributorId();

  const [items, stats] = await Promise.all([
    prisma.spot.findMany({
      where: { contributorId },
      orderBy: { createdAt: "desc" },
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
        {items.map((s) => (
          <div key={s.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <p className="font-bold">{s.place}</p>
              <p className="text-[10px] text-neutral-400">
                {s.createdAt.toLocaleDateString("ja-JP")}
              </p>
            </div>
            {s.imageUrl && (
              <img src={s.imageUrl} className="mt-2 h-32 w-full rounded-lg object-cover" alt="" />
            )}
            {s.comment && <p className="mt-2 text-sm text-neutral-700">{s.comment}</p>}
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-sm text-neutral-400">履歴がありません</p>}
      </div>

      <Link href="/" className="mt-8 block w-full rounded-xl bg-neutral-900 py-3 text-center text-sm font-bold text-white">
        TOPに戻る
      </Link>
    </main>
  );
}