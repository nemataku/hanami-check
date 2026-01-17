import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  COOKIE_KEY,
  contributorCookieOptions,
  readContributorId,
  newContributorId,
} from "@/lib/contributor";

export const dynamic = "force-dynamic";

function clampInt(v: unknown, min: number, max: number, fallback: number) {
  const n = Number(v);
  if (!Number.isInteger(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const place = (searchParams.get("place") ?? "").trim();
    const category = (searchParams.get("category") ?? "").trim(); // 任意

    const items = await prisma.spot.findMany({
      where: {
        ...(place
          ? { place: { contains: place, mode: "insensitive" as const } }
          : {}),
        ...(category
          ? { category: category as any } // UI側は固定タブのみなのでOK（厳密にしたいなら enum チェック追加）
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: place ? 5 : 20,
    });

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const place = String(body.place ?? "").trim();
    if (!place) {
      return NextResponse.json(
        { ok: false, error: "place は必須です" },
        { status: 400 }
      );
    }

    const category = String(body.category ?? "HANAMI").trim();

    // 花見：bloom 0..6
    const bloom = clampInt(body.bloom, 0, 6, 0);

    // 1..5
    const crowd = clampInt(body.crowd, 1, 5, 3);
    const condition = clampInt(body.condition, 1, 5, 3);

    const weather = body.weather == null ? null : String(body.weather);
    const comment =
      body.comment == null || String(body.comment).trim() === ""
        ? null
        : String(body.comment).trim();

    const imageUrl = body.imageUrl == null ? null : String(body.imageUrl);
    const imageHash = body.imageHash == null ? null : String(body.imageHash);

    let contributorId = await readContributorId();
    let isNew = false;

    if (!contributorId) {
      contributorId = newContributorId();
      isNew = true;
    }

    await prisma.contributor.upsert({
      where: { id: contributorId },
      update: {},
      create: { id: contributorId },
    });

    const created = await prisma.spot.create({
      data: {
        category: category as any,
        place,
        bloom,
        crowd,
        condition,
        weather,
        comment,
        imageUrl,
        imageHash,
        contributorId,
      },
    });

    const res = NextResponse.json({ ok: true, item: created });

    if (isNew) {
      res.cookies.set(COOKIE_KEY, contributorId, contributorCookieOptions);
    }

    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "投稿に失敗しました" },
      { status: 500 }
    );
  }
}