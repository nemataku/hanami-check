// src/app/api/leaderboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.spot.groupBy({
      by: ["contributorId"] as const,
      where: { contributorId: { not: null } },
      _count: { contributorId: true },
      orderBy: { _count: { contributorId: "desc" } },
      take: 20,
    });

    const items = rows.map((r) => ({
      contributorId: r.contributorId, // string | null
      posts: r._count.contributorId,
    }));

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "取得に失敗しました" },
      { status: 500 }
    );
  }
}