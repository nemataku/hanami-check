// src/app/my/mypage.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const store = cookies();
  const contributorId = store.get("contributorId")?.value ?? null;

  let totalPosts = 0;
  let postsWithImage = 0;

  if (contributorId) {
    const [countAll, countWithImage] = await Promise.all([
      prisma.spot.count({
        where: { contributorId },
      }),
      prisma.spot.count({
        where: {
          contributorId,
          imageUrl: { not: null },
        },
      }),
    ]);

    totalPosts = countAll;
    postsWithImage = countWithImage;
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      {/* ===== マイページカード ===== */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h1 className="text-lg font-bold">マイページ</h1>

        <div className="mt-2 inline-block rounded-full bg-neutral-200 px-3 py-1 text-xs text-neutral-700">
          称号：ビギナー
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-neutral-500">総投稿数</p>
            <p className="mt-1 text-2xl font-bold">{totalPosts}件</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-500">画像付き</p>
            <p className="mt-1 text-2xl font-bold">{postsWithImage}件</p>
          </div>
        </div>
      </div>

      {/* ===== 投稿履歴 ===== */}
      <div className="mt-8">
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">
          投稿履歴
        </h2>

        {totalPosts === 0 ? (
          <p className="text-sm text-neutral-500">履歴がありません</p>
        ) : (
          <p className="text-sm text-neutral-500">
            （ここに履歴一覧を今後表示）
          </p>
        )}
      </div>

      {/* ===== TOPに戻る ===== */}
      <div className="mt-10">
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