// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import sharp from "sharp";
import heicConvert from "heic-convert";
import jsQR from "jsqr";

export const runtime = "nodejs"; // sharp/heic-convert を使うので必須

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// 出力の目安（容量削減）
const OUT_MAX_WIDTH = 1920;
const OUT_QUALITY_START = 82;

// 入力のガード（サーバーを守る）
const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024; // 2MB（最終ガード）

function sha256(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function isHeicLike(mime: string, filename: string) {
  const m = (mime || "").toLowerCase();
  const n = (filename || "").toLowerCase();
  return (
    m === "image/heic" ||
    m === "image/heif" ||
    n.endsWith(".heic") ||
    n.endsWith(".heif")
  );
}

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * HEIC/HEIF を JPEG Buffer に変換
 */
async function heicToJpegBuffer(input: Buffer) {
  const out = await heicConvert({
    buffer: input,
    format: "JPEG",
    quality: 0.9,
  });
  return Buffer.from(out);
}

/**
 * JPEG/PNG/WebP(など) を最終的に JPEG にしてリサイズ・圧縮
 * ※ここで「必ずJPEGに再エンコード」されるので、アップロード画像由来のXSS等を強く抑制できる
 */
async function resizeAndCompressToJpeg(input: Buffer) {
  let quality = OUT_QUALITY_START;

  for (let i = 0; i < 6; i++) {
    const out = await sharp(input)
      .rotate()
      .resize({
        width: OUT_MAX_WIDTH,
        withoutEnlargement: true,
      })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    if (out.byteLength <= MAX_OUTPUT_BYTES) return out;

    quality -= 8;
    if (quality < 45) break;
  }

  throw new Error("圧縮後もサイズが大きすぎます（2MB上限）");
}

/**
 * QRコード検出（検出できたら true）
 * ※100%ではない（小さすぎる/ボケ/欠け等はすり抜ける可能性あり）
 */
async function containsQRCode(jpegBuf: Buffer) {
  // 検出用に縮小（速度優先）
  const { data, info } = await sharp(jpegBuf)
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const u8 = new Uint8ClampedArray(data);
  const code = jsQR(u8, info.width, info.height);
  return !!code;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file is required" }, { status: 400 });
    }

    if (file.size > MAX_INPUT_BYTES) {
      return NextResponse.json(
        { ok: false, error: "ファイルサイズが大きすぎます（上限 10MB）" },
        { status: 400 }
      );
    }

    const filename = file.name || "upload";
    const mime = file.type || "";
    const inputBuf = Buffer.from(await file.arrayBuffer());

    // ① HEIC/HEIFなら先にJPEG化
    const jpegBase = isHeicLike(mime, filename)
      ? await heicToJpegBuffer(inputBuf)
      : inputBuf;

    // ② リサイズ＆圧縮して最終JPEGに
    const outJpeg = await resizeAndCompressToJpeg(jpegBase);

    // （保険）最終出力が空などの異常値を弾く
    if (!outJpeg || outJpeg.byteLength === 0) {
      return NextResponse.json({ ok: false, error: "invalid image" }, { status: 400 });
    }

    // ③ QRコードが含まれていたら拒否
    const hasQR = await containsQRCode(outJpeg);
    if (hasQR) {
      return NextResponse.json(
        { ok: false, error: "QRコードが含まれる画像はアップロードできません" },
        { status: 400 }
      );
    }

    // ④ 同一画像判定は「最終JPEGのsha256」
    const hash = sha256(outJpeg);

    await ensureDir();

    // hash から生成するので安全（ユーザー入力をファイル名に使わない）
    const outName = `${hash}.jpg`;
    const outPath = path.join(UPLOAD_DIR, outName);

    // 同一画像は保存しない（多重アップロード防止）
    try {
      await fs.access(outPath);
    } catch {
      await fs.writeFile(outPath, outJpeg);
    }

    return NextResponse.json({
      ok: true,
      url: `/uploads/${outName}`,
      hash,
      bytes: outJpeg.byteLength,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "upload failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}