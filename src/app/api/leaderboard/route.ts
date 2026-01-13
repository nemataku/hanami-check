// src/app/api/leaderboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

type Ng = { ok: false; error: string };

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") ?? "7d"; // "7d" or "week"

    const from =
      range === "week"
        ? (() => {
            // 月曜開始の「今週」
            const now = new Date();
            const day = (now.getDay() + 6) % 7; // Mon=0..Sun=6
            const start = new Date(now);
            start.setDate(now.getDate() - day);
            start.setHours(0, 0, 0, 0);
            return start;
          })()
        : daysAgo(7);

    const rows = await prisma.spot.groupBy({
      by: ["contributorId"],
      where: { createdAt: { gte: from } },
      _count: { _all: true },
      orderBy: { _count: { _all: "desc" } },
      take: 10,
    });

    const leaderboard = rows.map((r, i) => ({
      rank: i + 1,
      contributorId: r.contributorId,
      posts: r._count._all,
      label: `ユーザー ${r.contributorId.slice(0, 4).toUpperCase()}`, // 表示用
    }));

    return NextResponse.json({ ok: true, from, leaderboard });
  } catch (e) {
    console.error(e);
    return NextResponse.json<Ng>({ ok: false, error: "取得に失敗しました" }, { status: 500 });
  }
}