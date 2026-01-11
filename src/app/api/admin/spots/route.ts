// src/app/api/admin/spots/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 管理者認証（Bearer または x-admin-token）
 * Vercel の Environment Variables に ADMIN_TOKEN を登録して使う
 */
function requireAdmin(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";
  const headerToken = req.headers.get("x-admin-token")?.trim() ?? "";
  const token = bearer || headerToken;

  if (!process.env.ADMIN_TOKEN) {
    return {
      ok: false as const,
      res: NextResponse.json({ ok: false, error: "ADMIN_TOKEN が未設定です" }, { status: 500 }),
    };
  }
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return {
      ok: false as const,
      res: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true as const };
}

/**
 * GET: 管理者用一覧（確認用）
 * /api/admin/spots?take=50
 */
export async function GET(req: Request) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;

  try {
    const { searchParams } = new URL(req.url);
    const take = Math.min(Number(searchParams.get("take") ?? 50) || 50, 200);

    const items = await prisma.spot.findMany({
      orderBy: { createdAt: "desc" },
      take,
    });

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "取得に失敗しました" }, { status: 500 });
  }
}

/**
 * DELETE:
 * 1) /api/admin/spots?id=123  -> 1件削除（id が Int の場合）
 * 2) /api/admin/spots         -> 全件削除
 */
export async function DELETE(req: Request) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.res;

  try {
    const { searchParams } = new URL(req.url);
    const idStr = (searchParams.get("id") ?? "").trim();

    // id 指定があるなら 1件削除
    if (idStr) {
      // ✅ Prisma の id が Int のため number に変換
      const idNum = Number(idStr);
      if (!Number.isInteger(idNum) || idNum <= 0) {
        return NextResponse.json({ ok: false, error: "id が不正です" }, { status: 400 });
      }

      await prisma.spot.delete({ where: { id: idNum } });
      return NextResponse.json({ ok: true, deleted: 1 });
    }

    // id なしなら全削除
    const r = await prisma.spot.deleteMany({});
    return NextResponse.json({ ok: true, deleted: r.count });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "削除に失敗しました" }, { status: 500 });
  }
}