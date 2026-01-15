// src/app/api/me/ststs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureContributorId,
  COOKIE_KEY,
  contributorCookieOptions,
} from "@/lib/contributor";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { id: contributorId, isNew } = await ensureContributorId();

    // ★ 新規なら Contributor を作る（既にあってもOK）
    await prisma.contributor.upsert({
      where: { id: contributorId },
      update: {},
      create: { id: contributorId },
    });

    const [totalPosts, postsWithImage] = await Promise.all([
      prisma.spot.count({ where: { contributorId } }),
      prisma.spot.count({ where: { contributorId, imageUrl: { not: null } } }),
    ]);

    const res = NextResponse.json({
      ok: true,
      contributorId,
      totalPosts,
      postsWithImage,
    });

    if (isNew) {
      res.cookies.set(COOKIE_KEY, contributorId, contributorCookieOptions());
    }

    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "取得に失敗しました" },
      { status: 500 }
    );
  }
}