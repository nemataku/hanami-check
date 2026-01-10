// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import sharp from "sharp";

// ❌ import heicConvert from "heic-convert";
// ✅ require に変更（これが決定打）
const heicConvert = require("heic-convert");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const OUT_MAX_WIDTH = 1920;
const OUT_QUALITY_JPG = 82;

const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;

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

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file が見つかりません" }, { status: 400 });
    }

    if (file.size > MAX_INPUT_BYTES) {
      return NextResponse.json({ ok: false, error: "ファイルが大きすぎます" }, { status: 413 });
    }

    const inputBuf = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "";
    const filename = file.name || "upload";

    let bufForSharp: Buffer;

    if (isHeicLike(mime, filename)) {
      const converted = await heicConvert({
        buffer: inputBuf,
        format: "JPEG",
        quality: 0.9,
      });
      bufForSharp = Buffer.from(converted);
    } else {
      bufForSharp = inputBuf;
    }

    let out = await sharp(bufForSharp)
      .rotate()
      .resize({ width: OUT_MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: OUT_QUALITY_JPG })
      .toBuffer();

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
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}