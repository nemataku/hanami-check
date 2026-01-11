// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// public/uploads に保存
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// 出力の目安
const OUT_MAX_WIDTH = 1920;
const OUT_QUALITY_JPG = 82;

// 入力サイズ制限（サーバー保護）
const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024; // 2MB

// ✅ サーバー側でも形式ガード（HEICは受け付けない）
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function sha256(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function isAllowedImage(mime: string, filename: string) {
  const m = (mime || "").toLowerCase();
  const n = (filename || "").toLowerCase();
  const ext = n.includes(".") ? n.slice(n.lastIndexOf(".")) : "";
  return (m && ALLOWED_MIME.has(m)) || (ext && ALLOWED_EXT.has(ext));
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
      return NextResponse.json({ ok: false, error: "画像サイズが大きすぎます（10MBまで）" }, { status: 413 });
    }

    const filename = file.name || "upload";
    const mime = file.type || "";

    // ✅ 形式ガード（HEICなどをここで弾く）
    if (!isAllowedImage(mime, filename)) {
      return NextResponse.json(
        { ok: false, error: "対応していない画像形式です（JPEG / PNG / WebP のみ対応）" },
        { status: 415 }
      );
    }

    const inputBuf = Buffer.from(await file.arrayBuffer());

    // sharpで読み込み可能かチェック（壊れた画像対策）
    const meta = await sharp(inputBuf).metadata().catch(() => null);
    if (!meta) {
      return NextResponse.json({ ok: false, error: "画像の読み込みに失敗しました" }, { status: 400 });
    }

    // 画像処理（リサイズ＋JPEG化）
    let out = await sharp(inputBuf)
      .rotate()
      .resize({ width: OUT_MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: OUT_QUALITY_JPG, mozjpeg: true })
      .toBuffer();

    // サイズが大きい場合は追加で圧縮
    if (out.length > MAX_OUTPUT_BYTES) {
      out = await sharp(inputBuf)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .jpeg({ quality: 75, mozjpeg: true })
        .toBuffer();
    }
    if (out.length > MAX_OUTPUT_BYTES) {
      out = await sharp(inputBuf)
        .rotate()
        .resize({ width: 1280, withoutEnlargement: true })
        .jpeg({ quality: 68, mozjpeg: true })
        .toBuffer();
    }
    if (out.length > MAX_OUTPUT_BYTES) {
      return NextResponse.json(
        { ok: false, error: "圧縮後もサイズが大きすぎます（2MB上限）" },
        { status: 413 }
      );
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