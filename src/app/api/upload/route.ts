// src/app/api/upload/route.ts
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";

export const runtime = "nodejs";

const MAX_INPUT_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "BLOB_READ_WRITE_TOKEN が未設定です（VercelのEnvironment Variablesを確認してください）" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "ファイルがありません" }, { status: 400 });
    }

    // mime check（最低限）
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: `未対応の画像形式です（${file.type}）` },
        { status: 400 }
      );
    }

    const inputBuf = Buffer.from(await file.arrayBuffer());

    if (inputBuf.length > MAX_INPUT_BYTES) {
      return NextResponse.json({ ok: false, error: "ファイルサイズが大きすぎます" }, { status: 400 });
    }

    // 画像変換（JPEGに統一）
    const output = await sharp(inputBuf)
      .rotate()
      .resize({ width: 1280, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const hash = crypto.createHash("sha256").update(output).digest("hex");
    const filename = `uploads/${Date.now()}_${hash.slice(0, 12)}.jpg`;

    // ✅ Blob 保存（token を明示）
    const blob = await put(filename, output, {
      access: "public",
      contentType: "image/jpeg",
      token,
    });

    return NextResponse.json({
      ok: true,
      imageUrl: blob.url,
      imageHash: hash,
      bytes: output.length,
    });
  } catch (e: any) {
    console.error("upload error:", e);

    // ここで「何が起きてるか」を返す（ユーザーが原因特定できる）
    const message =
      typeof e?.message === "string" ? e.message : "サーバー側でエラーが発生しました";

    return NextResponse.json(
      { ok: false, error: `アップロード処理でエラー: ${message}` },
      { status: 500 }
    );
  }
}