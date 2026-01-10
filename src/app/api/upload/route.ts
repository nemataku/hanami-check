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

// 出力の目安（好みで調整OK）
const OUT_MAX_WIDTH = 1920;
const OUT_QUALITY_JPG = 82;

// 入力サイズ制限（サーバー保護）
const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024; // 2MB（最終目標）

function sha256(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function isHeicLike(mime: string, filename: string) {
  const m = (mime || "").toLowerCase();
  const n = (filename || "").toLowerCase();
  return m === "image/heic" || m === "image/heif" || n.endsWith(".heic") || n.endsWith(".heif");
}

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

async function convertHeicToJpegBuffer(inputBuf: Buffer): Promise<Buffer> {
  /**
   * ✅ ここがポイント
   * - TS が import の型解決で落ちていたので require() に変更
   * - 型は any 扱いでOK（ビルド通すのが最優先）
   */
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const heicConvert = require("heic-convert") as any;

  const converted = await heicConvert({
    buffer: inputBuf,
    format: "JPEG",
    quality: 0.9,
  });

  // heic-convert は Buffer を返すことが多いが、念のため Buffer 化
  return Buffer.isBuffer(converted) ? converted : Buffer.from(converted);
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

    const arrayBuffer = await file.arrayBuffer();
    const inputBuf = Buffer.from(arrayBuffer);

    const mime = file.type || "";
    const filename = file.name || "upload";

    // HEIC/HEIF → JPEG に変換（sharpが直接扱えない環境対策）
    let bufForSharp: Buffer;
    if (isHeicLike(mime, filename)) {
      bufForSharp = await convertHeicToJpegBuffer(inputBuf);
    } else {
      bufForSharp = inputBuf;
    }

    // 画像処理（リサイズ＋圧縮）
    let out = await sharp(bufForSharp)
      .rotate() // Exif回転補正
      .resize({ width: OUT_MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: OUT_QUALITY_JPG })
      .toBuffer();

    // 出力サイズが大きい場合は段階的に落とす
    if (out.length > MAX_OUTPUT_BYTES) {
      out = await sharp(bufForSharp)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();
    }
    if (out.length > MAX_OUTPUT_BYTES) {
      out = await sharp(bufForSharp)
        .rotate()
        .resize({ width: 1280, withoutEnlargement: true })
        .jpeg({ quality: 68 })
        .toBuffer();
    }

    const hash = sha256(out);
    const outName = `${Date.now()}_${hash.slice(0, 12)}.jpg`;

    await ensureDir();
    await fs.writeFile(path.join(UPLOAD_DIR, outName), out);

    const imageUrl = `/uploads/${outName}`;

    return NextResponse.json({
      ok: true,
      imageUrl,
      imageHash: hash,
      bytes: out.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "アップロードに失敗しました" }, { status: 500 });
  }
}