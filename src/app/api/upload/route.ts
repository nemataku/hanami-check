// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 出力の目安（好みで調整OK）
const OUT_MAX_WIDTH = 1920;
const OUT_QUALITY_JPG = 82;

// 入力サイズ制限
const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024; // 2MB

function sha256(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex");
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

    // 画像処理（リサイズ＋圧縮）
    let out = await sharp(inputBuf)
      .rotate()
      .resize({ width: OUT_MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: OUT_QUALITY_JPG })
      .toBuffer();

    // 出力が大きい場合は段階的に落とす
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

    // Vercel Blob に保存（public）
    const blob = await put(`uploads/${outName}`, out, {
      access: "public",
      contentType: "image/jpeg",
    });

    return NextResponse.json({
      ok: true,
      imageUrl: blob.url, // 外部URL（Vercel BlobのURL）
      imageHash: hash,
      bytes: out.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "アップロードに失敗しました" }, { status: 500 });
  }
}