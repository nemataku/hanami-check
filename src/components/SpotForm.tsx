"use client";

import { useMemo, useState } from "react";
import QrReader from "@/components/QrReader";

type ApiResult<T> = { ok: true } & T;
type ApiError = { ok: false; error: string };

const BLOOM_OPTIONS = [
  { value: 0, label: "つぼみ" },
  { value: 1, label: "咲始め" },
  { value: 2, label: "3分咲き" },
  { value: 3, label: "5分咲き" },
  { value: 4, label: "7分咲き" },
  { value: 5, label: "満開" },
  { value: 6, label: "散る" },
] as const;

const WEATHER_OPTIONS = ["晴れ", "曇り", "小雨", "雨", "雪"] as const;

export default function SpotForm() {
  const [place, setPlace] = useState("");
  const [bloom, setBloom] = useState<number>(5);
  const [weather, setWeather] = useState<string>("晴れ");
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // ✅ A案：QRはブラウザ側で読む（サーバーでjsqr importしない）
  const [qrText, setQrText] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");

  const canSubmit = useMemo(() => {
    if (!place.trim()) return false;
    if (!Number.isInteger(bloom) || bloom < 0 || bloom > 6) return false;
    return true;
  }, [place, bloom]);

  async function uploadIfNeeded(): Promise<{ imageUrl: string | null; imageHash: string | null }> {
    if (!file) return { imageUrl: null, imageHash: null };

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
    });

    const json = (await res.json()) as ApiResult<{ imageUrl: string; imageHash?: string | null }> | ApiError;

    if (!res.ok || !json.ok) {
      throw new Error(!json.ok ? json.error : "画像アップロードに失敗しました");
    }

    return { imageUrl: json.imageUrl, imageHash: json.imageHash ?? null };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!canSubmit) {
      setMessage("必須項目（場所 / 開花状況）を確認してください。");
      return;
    }

    setSubmitting(true);
    try {
      // 1) 画像があれば /api/upload
      const { imageUrl, imageHash } = await uploadIfNeeded();

      // 2) /api/spots に投稿
      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place: place.trim(),
          bloom,
          weather,
          comment: comment.trim() ? comment.trim() : null,
          imageUrl,
          imageHash,
          // ✅ QRは文字列として一緒に送れる（DB保存するならAPI側で受けて保存）
          qrText: qrText.trim() ? qrText.trim() : null,
        }),
      });

      const json = (await res.json()) as ApiResult<{ item: unknown }> | ApiError;

      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error : "投稿に失敗しました");
      }

      setMessage("投稿しました。");
      // 任意：入力クリア
      setComment("");
      setFile(null);
      // QRは残しても良いが、ここではクリア
      setQrText("");
    } catch (err: any) {
      setMessage(err?.message ?? "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* 場所 */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <label className="block text-sm font-semibold text-neutral-900">場所（必須）</label>
        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="例：上野公園"
          className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </div>

      {/* 開花 */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <label className="block text-sm font-semibold text-neutral-900">開花状況（必須）</label>
        <select
          value={bloom}
          onChange={(e) => setBloom(Number(e.target.value))}
          className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
        >
          {BLOOM_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* 天気 */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <label className="block text-sm font-semibold text-neutral-900">天気</label>
        <select
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
          className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
        >
          {WEATHER_OPTIONS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      {/* コメント */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <label className="block text-sm font-semibold text-neutral-900">コメント</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="例：かなり混んでる、まだ5分咲き など"
          rows={3}
          className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </div>

      {/* 画像 */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <label className="block text-sm font-semibold text-neutral-900">画像（任意）</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-2 w-full text-sm"
        />
        {file ? <p className="mt-2 text-xs text-neutral-500">選択中：{file.name}</p> : null}
      </div>

      {/* ✅ QR（クライアントで解析） */}
      <QrReader
        onDecoded={(text) => {
          setQrText(text);
        }}
      />

      {qrText ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-sm font-semibold text-neutral-900">QR文字列（送信されます）</p>
          <p className="mt-2 break-all text-sm text-neutral-700">{qrText}</p>
          <button
            type="button"
            onClick={() => setQrText("")}
            className="mt-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
          >
            クリア
          </button>
        </div>
      ) : null}

      {/* メッセージ */}
      {message ? <p className="text-sm text-neutral-700">{message}</p> : null}

      {/* 送信 */}
      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50"
      >
        {submitting ? "送信中..." : "投稿する"}
      </button>
    </form>
  );
}