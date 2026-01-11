// src/app/api/spots/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // ✅ PrismaはNode.jsで動かす（Edge回避）

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const place = (searchParams.get("place") ?? "").trim();

    const items = await prisma.spot.findMany({
      where: place
        ? {
            place: {
              contains: place,
              mode: "insensitive",
            },
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: place ? 5 : 20,
    });

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error("GET /api/spots error:", e);
    return NextResponse.json(
      { ok: false, error: "取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // ✅ JSONが壊れている/空のときに 500 ではなく 400 にする
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "JSONの形式が正しくありません" },
        { status: 400 }
      );
    }

    const place = String(body.place ?? "").trim();
    const bloom = Number(body.bloom);

    // SpotForm側は null or 値を送る想定だが、安全側で空文字もnull扱い
    const weatherRaw = body.weather == null ? null : String(body.weather).trim();
    const weather = weatherRaw === "" ? null : weatherRaw;

    const commentRaw = body.comment == null ? "" : String(body.comment).trim();
    const comment = commentRaw === "" ? null : commentRaw;

    const imageUrlRaw = body.imageUrl == null ? "" : String(body.imageUrl).trim();
    const imageUrl = imageUrlRaw === "" ? null : imageUrlRaw;

    const imageHashRaw = body.imageHash == null ? "" : String(body.imageHash).trim();
    const imageHash = imageHashRaw === "" ? null : imageHashRaw;

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

    const created = await prisma.spot.create({
      data: { place, bloom, weather, comment, imageUrl, imageHash },
    });

    return NextResponse.json({ ok: true, item: created });
  } catch (e) {
    console.error("POST /api/spots error:", e);

    // ✅ 500の原因がDB未作成などでも、ログで追いやすいように詳細も出す
    const msg = e instanceof Error ? e.message : String(e);

    return NextResponse.json(
      { ok: false, error: "投稿に失敗しました", detail: msg },
      { status: 500 }
    );
  }
}