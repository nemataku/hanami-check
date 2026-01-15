// src/app/api/spots/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureContributorId,
  COOKIE_KEY,
  contributorCookieOptions,
} from "@/lib/contributor";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const place = (searchParams.get("place") ?? "").trim();

    const items = await prisma.spot.findMany({
      where: place
        ? { place: { contains: place, mode: "insensitive" } }
        : undefined,
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
    const bloom = Number(body.bloom);
    const weather = body.weather == null ? null : String(body.weather);

    const comment =
      body.comment == null || String(body.comment).trim() === ""
        ? null
        : String(body.comment).trim();

    const imageUrl = body.imageUrl == null ? null : String(body.imageUrl);
    const imageHash = body.imageHash == null ? null : String(body.imageHash);

    if (!place) {
      return NextResponse.json(
        { ok: false, error: "place は必須です" },
        { status: 400 }
      );
    }
    if (!Number.isInteger(bloom) || bloom < 0 || bloom > 6) {
      return NextResponse.json(
        { ok: false, error: "bloom が不正です" },
        { status: 400 }
      );
    }

    const { id: contributorId, isNew } = await ensureContributorId();

    // ★ Contributor を必ず存在させる
    await prisma.contributor.upsert({
      where: { id: contributorId },
      update: {},
      create: { id: contributorId },
    });

    const created = await prisma.spot.create({
      data: {
        place,
        bloom,
        weather,
        comment,
        imageUrl,
        imageHash,
        contributorId,
      },
    });

    const res = NextResponse.json({ ok: true, item: created });

    if (isNew) {
      res.cookies.set(COOKIE_KEY, contributorId, contributorCookieOptions());
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