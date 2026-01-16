// src/app/my/mypage.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  // ✅ Next.jsのバージョンによって cookies() が Promise なので await
  const store = await cookies();
  const contributorId = store.get("contributorId")?.value ?? null;

  let totalPosts = 0;
  let postsWithImage = 0;

  if (contributorId) {
    // contributorId は String? なのでそのまま where に入れてOK
    totalPosts = await prisma.spot.count({
      where: { contributorId },
    });

    postsWithImage = await prisma.spot.count({
      where: { contributorId, imageUrl: { not: null } },
    });
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold tracking-tight text-neutral-900">
          マイページ
        </h1>

        <div className="mt-2">
          <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
            称号：ビギナー
          </span>
        </div>

        <div className="mt-5 border-t border-neutral-200 pt-5">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <p className="text-xs text-neutral-500">総投稿数</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">
                {totalPosts}件
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">画像付き</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">
                {postsWithImage}件
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-neutral-900">投稿履歴</h2>
        <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4 text-center text-sm text-neutral-500">
          履歴がありません
        </div>
      </section>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          TOPに戻る
        </Link>
      </div>
    </main>
  );
}