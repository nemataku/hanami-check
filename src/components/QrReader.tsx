"use client";

import jsQR from "jsqr";
import { useRef, useState } from "react";

type Props = {
  onDecoded?: (text: string) => void;
};

export default function QrReader({ onDecoded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [decoded, setDecoded] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleFile(file: File) {
    setError("");
    setDecoded("");

    // 画像を読み込む
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    });

    // Canvas に描画してピクセル取得
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas が利用できません");

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    URL.revokeObjectURL(url);

    if (!code?.data) {
      setError("QRコードを検出できませんでした");
      return;
    }

    setDecoded(code.data);
    onDecoded?.(code.data);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-sm font-semibold text-neutral-900">QR読み取り（ブラウザ側）</p>

      <div className="mt-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f).catch((err) => setError(String(err?.message ?? err)));
          }}
        />
      </div>

      {decoded ? (
        <div className="mt-3 rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
          <p className="text-xs text-emerald-700">読み取り結果</p>
          <p className="mt-1 break-all text-sm text-neutral-900">{decoded}</p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}