import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  COOKIE_KEY,
  contributorCookieOptions,
  readContributorId,
  newContributorId,
} from "@/lib/contributor";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "SHOPPING",
  "PARK",
  "FOOD",
  "EVENT",
  "PARKING",
  "HANAMI",
  "SCENIC",
  "PUBLIC",
] as const;

const CROWD = ["EMPTY", "LIGHT", "CROWDED", "FULL", "RESTRICTED"] as const;
const PARKING = ["AVAILABLE", "LIGHT", "CROWDED", "FULL"] as const;
const BIZ = ["OPEN", "BREAK", "CLOSED", "HOLIDAY"] as const;
const FLOWER = ["SAKURA", "UME", "OTHER"] as const;

type Category = (typeof CATEGORIES)[number];

function isOneOf<T extends readonly string[]>(
  v: unknown,
  arr: T
): v is T[number] {
  return typeof v === "string" && (arr as readonly string[]).includes(v);
}

function normalizeHHMM(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  if (!/^\d{2}:\d{2}$/.test(s)) return null;
  const [hh, mm] = s.split(":").map(Number);
  if (hh < 0 || hh > 23) return null;
  if (mm < 0 || mm > 59) return null;
  return s;
}

function normalizeInt(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i < 0) return null;
  return i;
}

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

    const category: Category = isOneOf(body.category, CATEGORIES)
      ? body.category
      : "HANAMI";

    const place = String(body.place ?? "").trim();
    if (!place) {
      return NextResponse.json(
        { ok: false, error: "場所名は必須です" },
        { status: 400 }
      );
    }

    // 共通
    const comment =
      body.comment == null || String(body.comment).trim() === ""
        ? null
        : String(body.comment).trim();

    const imageUrl = body.imageUrl == null ? null : String(body.imageUrl);
    const imageHash = body.imageHash == null ? null : String(body.imageHash);

    // セキュリティ：画像URLは http(s) のみ
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      return NextResponse.json(
        { ok: false, error: "imageUrl が不正です" },
        { status: 400 }
      );
    }

    // カテゴリ別入力（共通候補）
    const crowd = isOneOf(body.crowd, CROWD) ? body.crowd : null;

    const businessStatus = isOneOf(body.businessStatus, BIZ)
      ? body.businessStatus
      : null;
    const openTime = normalizeHHMM(body.openTime);
    const closeTime = normalizeHHMM(body.closeTime);

    const shopName =
      body.shopName == null || String(body.shopName).trim() === ""
        ? null
        : String(body.shopName).trim();

    const attractionName =
      body.attractionName == null || String(body.attractionName).trim() === ""
        ? null
        : String(body.attractionName).trim();

    const waitMinutes = normalizeInt(body.waitMinutes);

    const eventName =
      body.eventName == null || String(body.eventName).trim() === ""
        ? null
        : String(body.eventName).trim();

    const eventStart = normalizeHHMM(body.eventStart);
    const eventEnd = normalizeHHMM(body.eventEnd);

    const parkingLevel = isOneOf(body.parkingLevel, PARKING)
      ? body.parkingLevel
      : null;

    const parkingName =
      body.parkingName == null || String(body.parkingName).trim() === ""
        ? null
        : String(body.parkingName).trim();

    // 花見（既存）
    const bloomRaw = body.bloom;
    const bloom = bloomRaw == null || bloomRaw === "" ? null : Number(bloomRaw);
    const weather = body.weather == null || body.weather === ""
      ? null
      : String(body.weather);

    // ✅ ここが今回の修正点：UIのキー名揺れを吸収
    const flowerPresetRaw = body.flowerPreset ?? body.flowerType;
    const flowerPreset = isOneOf(flowerPresetRaw, FLOWER)
      ? flowerPresetRaw
      : null;

    const flowerOtherRaw = body.flowerOther ?? body.flowerOtherText;
    const flowerOther =
      flowerOtherRaw == null || String(flowerOtherRaw).trim() === ""
        ? null
        : String(flowerOtherRaw).trim();

    // ===== カテゴリ別必須バリデーション =====
    if (category === "HANAMI") {
      if (!Number.isInteger(bloom) || (bloom as number) < 0 || (bloom as number) > 6) {
        return NextResponse.json(
          { ok: false, error: "開花状況（bloom）が不正です" },
          { status: 400 }
        );
      }

      // 花の種類：preset か other どちらか必須
      const hasFlower = !!flowerPreset || !!flowerOther;
      if (!hasFlower) {
        return NextResponse.json(
          { ok: false, error: "花の種類（桜/梅/その他 or 自由記入）が必須です" },
          { status: 400 }
        );
      }

      if (!crowd) {
        return NextResponse.json(
          { ok: false, error: "混雑状況は必須です" },
          { status: 400 }
        );
      }
    }

    if (category === "SHOPPING") {
      if (!businessStatus) {
        return NextResponse.json(
          { ok: false, error: "営業状況は必須です" },
          { status: 400 }
        );
      }
      if (!crowd) {
        return NextResponse.json(
          { ok: false, error: "混雑状況は必須です" },
          { status: 400 }
        );
      }
    }

    if (category === "PARK") {
      if (!crowd) {
        return NextResponse.json(
          { ok: false, error: "混雑状況は必須です" },
          { status: 400 }
        );
      }
      if (!businessStatus) {
        return NextResponse.json(
          { ok: false, error: "営業状況は必須です" },
          { status: 400 }
        );
      }
    }

    if (category === "FOOD") {
      if (!crowd) {
        return NextResponse.json(
          { ok: false, error: "混雑状況は必須です" },
          { status: 400 }
        );
      }
      if (!businessStatus) {
        return NextResponse.json(
          { ok: false, error: "営業状況は必須です" },
          { status: 400 }
        );
      }
    }

    if (category === "EVENT") {
      if (!eventName) {
        return NextResponse.json(
          { ok: false, error: "イベント名は必須です" },
          { status: 400 }
        );
      }
      if (!crowd) {
        return NextResponse.json(
          { ok: false, error: "混雑状況は必須です" },
          { status: 400 }
        );
      }
    }

    if (category === "PARKING") {
      if (!parkingLevel) {
        return NextResponse.json(
          { ok: false, error: "混雑具合（駐車場）は必須です" },
          { status: 400 }
        );
      }
    }

    if (category === "SCENIC") {
      if (!crowd) {
        return NextResponse.json(
          { ok: false, error: "混雑状況は必須です" },
          { status: 400 }
        );
      }
    }

    if (category === "PUBLIC") {
      if (!crowd) {
        return NextResponse.json(
          { ok: false, error: "混雑状況は必須です" },
          { status: 400 }
        );
      }
    }

    // 投稿者ID
    let contributorId = await readContributorId();
    let isNew = false;
    if (!contributorId) {
      contributorId = newContributorId();
      isNew = true;
    }

    // Contributor を必ず存在させる
    await prisma.contributor.upsert({
      where: { id: contributorId },
      update: {},
      create: { id: contributorId },
    });

    const created = await prisma.spot.create({
      data: {
        category,
        place,

        bloom: category === "HANAMI" ? (bloom as number) : bloom,
        weather,

        comment,
        imageUrl,
        imageHash,

        crowd,

        businessStatus,
        openTime,
        closeTime,
        shopName,
        attractionName,

        waitMinutes,

        eventName,
        eventStart,
        eventEnd,

        parkingLevel,
        parkingName,

        flowerPreset,
        flowerOther,

        contributorId,
      },
    });

    const res = NextResponse.json({ ok: true, item: created });

    if (isNew) {
      // contributorCookieOptions が「オブジェクト」である前提
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