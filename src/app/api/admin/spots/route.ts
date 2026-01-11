import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdmin(req: Request) {
  const token = req.headers.get("x-admin-token") ?? "";
  const expected = process.env.ADMIN_TOKEN ?? "";
  return expected.length > 0 && token === expected;
}

// 全件削除: POST /api/admin/spots/clear
export async function POST(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action !== "clear") {
      return NextResponse.json({ ok: false, error: "invalid action" }, { status: 400 });
    }

    // 全投稿削除
    const result = await prisma.spot.deleteMany({});
    return NextResponse.json({ ok: true, deleted: result.count });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "failed" }, { status: 500 });
  }
}

// 1件削除: DELETE /api/admin/spots?id=123
export async function DELETE(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id)) {
      return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
    }

    await prisma.spot.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "failed" }, { status: 500 });
  }
}