// src/app/api/spots/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getOrCreateContributorId } from "../../../lib/contributor";

export const dynamic = "force-dynamic";

type Ok<T> = { ok: true } & T;
type Ng = { ok: false; error: string };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const place = (searchParams.get("place") ?? "").trim();
    const mine = searchParams.get("mine") === "1";

    const { id: contributorId } = getOrCreateContributorId();

    const where = mine
      ? { contributorId }
      : place
      ? {
          place: {
            contains: place,
            mode: "insensitive" as const,
          },
        }
      : undefined;

    const items = await prisma.spot.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: mine ? 50 : place ? 5 : 20,
    });

    return NextResponse.json<Ok<{ items: unknown[] }>>({ ok: true, items });
  } catch (e) {
    console.error(e);
    return NextResponse.json<Ng>({ ok: false, error: "取得に失敗しました" }, { status: 500 });
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
      return NextResponse.json<Ng>({ ok: false, error: "place は必須です" }, { status: 400 });
    }
    if (!Number.isInteger(bloom) || bloom < 0 || bloom > 6) {
      return NextResponse.json<Ng>({ ok: false, error: "bloom が不正です" }, { status: 400 });
    }

    // ✅ 投稿者ID（匿名）をcookieから取得（無ければ発行）
    const { id: contributorId } = getOrCreateContributorId();

    const created = await prisma.spot.create({
      data: { place, bloom, weather, comment, imageUrl, imageHash, contributorId },
    });

    return NextResponse.json<Ok<{ item: unknown }>>({ ok: true, item: created });
  } catch (e) {
    console.error(e);
    return NextResponse.json<Ng>({ ok: false, error: "投稿に失敗しました" }, { status: 500 });
  }
}