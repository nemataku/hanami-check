// src/app/api/spots/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

// 公開前の最低限ガード（UIと合わせて調整OK）
const MAX_PLACE_LEN = 60;
const MAX_COMMENT_LEN = 200;

// ここは UI 側と合わせる（将来 options を増やすなら更新）
const ALLOWED_WEATHER = new Set(["晴れ", "曇り", "小雨", "雨", "雪"]);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const place = (searchParams.get("place") ?? "").trim();

    if (!place) {
      return NextResponse.json({ ok: false, error: "place is required" }, { status: 400 });
    }
    if (place.length > MAX_PLACE_LEN) {
      return NextResponse.json({ ok: false, error: "place is too long" }, { status: 400 });
    }

    const items = await prisma.spot.findMany({
      where: { place },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, error: "search failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const place = (body?.place ?? "").trim();
    const bloom = Number(body?.bloom);
    const weather = String(body?.weather ?? "");
    const comment = body?.comment ? String(body.comment) : null;
    const imageUrl = body?.imageUrl ? String(body.imageUrl) : null;
    const imageHash = body?.imageHash ? String(body.imageHash) : null;

    if (!place) {
      return NextResponse.json({ ok: false, error: "place is required" }, { status: 400 });
    }
    if (place.length > MAX_PLACE_LEN) {
      return NextResponse.json({ ok: false, error: "place is too long" }, { status: 400 });
    }

    if (!Number.isInteger(bloom) || bloom < 0 || bloom > 6) {
      return NextResponse.json({ ok: false, error: "bloom is invalid" }, { status: 400 });
    }

    if (!weather) {
      return NextResponse.json({ ok: false, error: "weather is required" }, { status: 400 });
    }
    if (!ALLOWED_WEATHER.has(weather)) {
      return NextResponse.json({ ok: false, error: "weather is invalid" }, { status: 400 });
    }

    if (comment && comment.length > MAX_COMMENT_LEN) {
      return NextResponse.json({ ok: false, error: "comment is too long" }, { status: 400 });
    }

    // 画像URL/Hash が入ってくる場合の軽い整合チェック（SpotForm 側が保証しているが保険）
    if ((imageUrl && !imageHash) || (!imageUrl && imageHash)) {
      return NextResponse.json({ ok: false, error: "image fields are invalid" }, { status: 400 });
    }

    try {
      const created = await prisma.spot.create({
        data: { place, bloom, weather, comment, imageUrl, imageHash },
      });
      return NextResponse.json({ ok: true, item: created });
    } catch (e: any) {
      // 同一画像の多重投稿（imageHash UNIQUE）を分かりやすく
      if (e?.code === "P2002") {
        return NextResponse.json(
          { ok: false, error: "同じ画像の投稿はできません（重複）" },
          { status: 400 }
        );
      }
      throw e;
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "post failed" }, { status: 400 });
  }
}