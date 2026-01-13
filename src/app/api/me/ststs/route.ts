// src/app/api/me/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getOrCreateContributorId } from "../../../../lib/contributor";

export const dynamic = "force-dynamic";

type Ok<T> = { ok: true } & T;
type Ng = { ok: false; error: string };

export async function GET() {
  try {
    const { id: contributorId } = getOrCreateContributorId();

    const [totalPosts, postsWithImage] = await Promise.all([
      prisma.spot.count({ where: { contributorId } }),
      prisma.spot.count({ where: { contributorId, imageUrl: { not: null } } }),
    ]);

    return NextResponse.json<Ok<{ totalPosts: number; postsWithImage: number }>>({
      ok: true,
      totalPosts,
      postsWithImage,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json<Ng>({ ok: false, error: "取得に失敗しました" }, { status: 500 });
  }
}