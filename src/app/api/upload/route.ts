// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const OUT_MAX_WIDTH = 1920;
const OUT_QUALITY_JPG = 82;

const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024; // 2MB

function sha256(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file が見つかりません" }, { status: 400 });
    }
    if (file.size <= 0) {
      return NextResponse.json({ ok: false, error: "空ファイルです" }, { status: 400 });
    }
    if (file.size > MAX_INPUT_BYTES) {
      return NextResponse.json({ ok: false, error: "ファイルが大きすぎます（10MBまで）" }, { status: 413 });
    }

    const inputBuf = Buffer.from(await file.arrayBuffer());

    // sharpで読めない形式（例: HEIC）が来た場合はここで落ちるので、明示的にエラーメッセージを返す
    let out: Buffer;
    try {
      out = await sharp(inputBuf)
        .rotate()
        .resize({ width: OUT_MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: OUT_QUALITY_JPG })
        .toBuffer();
    } catch {
      return NextResponse.json(
        { ok: false, error: "未対応の画像形式です（JPEG/PNG を推奨）" },
        { status: 415 }
      );
    }

    if (out.length > MAX_OUTPUT_BYTES) {
      out = await sharp(inputBuf)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();
    }
    if (out.length > MAX_OUTPUT_BYTES) {
      out = await sharp(inputBuf)
        .rotate()
        .resize({ width: 1280, withoutEnlargement: true })
        .jpeg({ quality: 68 })
        .toBuffer();
    }

    const hash = sha256(out);
    const outName = `${Date.now()}_${hash.slice(0, 12)}.jpg`;

    await ensureDir();
    await fs.writeFile(path.join(UPLOAD_DIR, outName), out);

    return NextResponse.json({
      ok: true,
      imageUrl: `/uploads/${outName}`,
      imageHash: hash,
      bytes: out.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "アップロードに失敗しました" }, { status: 500 });
  }
}