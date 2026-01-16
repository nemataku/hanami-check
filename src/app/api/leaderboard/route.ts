// src/app/api/leaderboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 投稿数ランキング（上位20）
    const rows = await prisma.$queryRaw<
      { contributorId: string; posts: number }[]
    >`
      SELECT
        "contributorId" AS "contributorId",
        COUNT(*)::int    AS "posts"
      FROM "Spot"
      WHERE "contributorId" IS NOT NULL
      GROUP BY "contributorId"
      ORDER BY "posts" DESC
      LIMIT 20;
    `;

    return NextResponse.json({ ok: true, items: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "取得に失敗しました" },
      { status: 500 }
    );
  }
}