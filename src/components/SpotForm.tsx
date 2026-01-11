// src/components/SpotForm.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const BLOOM_LABELS = ["つぼみ", "咲始め", "3分咲き", "5分咲き", "7分咲き", "満開", "散る"] as const;
const WEATHER_OPTIONS = ["晴れ", "曇り", "小雨", "雨", "雪"] as const;

type BloomValue = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type WeatherValue = (typeof WEATHER_OPTIONS)[number] | "";

export default function SpotForm() {
  const router = useRouter();

  // ★ file input の値を物理的に消すためのref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [place, setPlace] = useState("");
  const [bloom, setBloom] = useState<BloomValue>(3);
  const [weather, setWeather] = useState<WeatherValue>("");

  const [comment, setComment] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // ローカルプレビュー
  useEffect(() => {
    if (!file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const canSubmit = useMemo(() => {
    if (!place.trim()) return false;
    if (posting || uploading) return false;
    return true;
  }, [place, posting, uploading]);

  async function uploadIfNeeded(): Promise<{ imageUrl: string; imageHash: string } | null> {
    if (!file) return null;

    // すでにアップロード済みなら再利用
    if (imageUrl && imageHash) {
      return { imageUrl, imageHash };
    }

    setUploadError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || data.ok !== true) {
        const msg = (data && data.error) || `アップロードに失敗しました（status ${res.status}）`;
        throw new Error(msg);
      }

      setImageUrl(data.imageUrl);
      setImageHash(data.imageHash);

      return { imageUrl: data.imageUrl, imageHash: data.imageHash };
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit() {
    setError(null);

    if (!place.trim()) {
      setError("場所を入力してください");
      return;
    }

    setPosting(true);
    try {
      // 画像があれば先にアップロード（なければnull）
      let uploaded: { imageUrl: string; imageHash: string } | null = null;
      try {
        uploaded = await uploadIfNeeded();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "画像アップロードに失敗しました";
        setUploadError(msg);
        return;
      }

      const payload = {
        place: place.trim(),
        bloom,
        weather: weather === "" ? null : weather,
        comment: comment.trim() === "" ? null : comment.trim(),
        imageUrl: uploaded?.imageUrl ?? null,
        imageHash: uploaded?.imageHash ?? null,
      };

      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || data.ok !== true) {
        const msg = (data && data.error) || `投稿に失敗しました（status ${res.status}）`;
        throw new Error(msg);
      }

      setDone(true);

      router.push(`/results?place=${encodeURIComponent(payload.place)}`);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "投稿に失敗しました";
      setError(msg);
    } finally {
      setPosting(false);
    }
  }

  function cancelImage() {
    setFile(null);
    setPreviewUrl(null);

    // 既にアップロード済み情報もクリア
    setImageUrl(null);
    setImageHash(null);

    setUploadError(null);

    // ★ ここがポイント：file input の表示（ファイル名）を消す
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-5">
      {/* 場所 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-900">場所</label>
        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="例：上野公園 / 東京駅"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
        />
      </div>

      {/* 開花状況 */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <label className="text-sm font-semibold text-neutral-900">開花状況</label>
          <span className="text-xs text-neutral-500">{BLOOM_LABELS[bloom]}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {BLOOM_LABELS.map((label, idx) => {
            const v = idx as BloomValue;
            const active = bloom === v;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setBloom(v)}
                className={[
                  "rounded-xl border px-3 py-2 text-sm font-medium",
                  active
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 天気 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-900">天気</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setWeather("")}
            className={[
              "rounded-full border px-3 py-1.5 text-sm font-medium",
              weather === ""
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
            ].join(" ")}
          >
            未選択
          </button>

          {WEATHER_OPTIONS.map((w) => {
            const active = weather === w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => setWeather(w)}
                className={[
                  "rounded-full border px-3 py-1.5 text-sm font-medium",
                  active
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                ].join(" ")}
              >
                {w}
              </button>
            );
          })}
        </div>
      </div>

      {/* コメント */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-900">コメント</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="例：かなり混雑、まだ5分咲き など"
          className="min-h-[96px] w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
        />
      </div>

      {/* 画像（任意） */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-900">画像（任意）</label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />

        {previewUrl ? (
          <div className="space-y-2">
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <img src={previewUrl} alt="プレビュー" className="h-auto w-full object-cover" />
            </div>

            <button
              type="button"
              onClick={cancelImage}
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              画像をキャンセル
            </button>
          </div>
        ) : null}

        {uploadError ? <p className="text-sm font-medium text-red-600">{uploadError}</p> : null}
      </div>

      {/* エラー */}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* 送信 */}
      <button
        type="button"
        disabled={!canSubmit}
        onClick={onSubmit}
        className={[
          "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sm",
          canSubmit
            ? "bg-neutral-900 text-white hover:bg-neutral-800"
            : "bg-neutral-200 text-neutral-500 cursor-not-allowed",
        ].join(" ")}
      >
        {uploading ? "画像アップロード中..." : posting ? "投稿中..." : "投稿する"}
      </button>

      {done ? <p className="text-xs text-neutral-500">投稿しました。結果ページへ移動します…</p> : null}
    </div>
  );
}