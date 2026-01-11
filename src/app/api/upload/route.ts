import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";

export const runtime = "nodejs";

const MAX_INPUT_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "ファイルがありません" },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());

    if (buf.length > MAX_INPUT_BYTES) {
      return NextResponse.json(
        { ok: false, error: "ファイルサイズが大きすぎます" },
        { status: 400 }
      );
    }

    // 画像変換
    const output = await sharp(buf)
      .rotate()
      .resize({ width: 1280, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const hash = crypto.createHash("sha256").update(output).digest("hex");
    const filename = `uploads/${Date.now()}_${hash.slice(0, 12)}.jpg`;

    // ✅ Blob 保存
    const blob = await put(filename, output, {
      access: "public",
      contentType: "image/jpeg",
    });

    // ✅ ここまで来たら「アップロード成功」
    return NextResponse.json({
      ok: true,
      imageUrl: blob.url,
      imageHash: hash,
      bytes: output.length,
    });

  } catch (e) {
    console.error("upload error:", e);
    return NextResponse.json(
      { ok: false, error: "サーバー側でエラーが発生しました" },
      { status: 500 }
    );
  }
}