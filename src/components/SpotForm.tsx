// src/components/SpotForm.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

const BLOOM_LABELS = ["つぼみ", "咲始め", "3分咲き", "5分咲き", "7分咲き", "満開", "散る"] as const;
const WEATHER_OPTIONS = ["晴れ", "曇り", "小雨", "雨", "雪"] as const;

type UploadResult =
  | { ok: true; imageUrl: string; imageHash: string; bytes: number }
  | { ok: false; error: string };

type PostResult =
  | { ok: true; item: unknown }
  | { ok: false; error: string };

function bloomBadgeClass(bloom: number) {
  switch (bloom) {
    case 0:
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case 1:
      return "bg-pink-100 text-pink-700 ring-pink-200";
    case 2:
      return "bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200";
    case 3:
      return "bg-rose-100 text-rose-700 ring-rose-200";
    case 4:
      return "bg-orange-100 text-orange-700 ring-orange-200";
    case 5:
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case 6:
      return "bg-neutral-200 text-neutral-700 ring-neutral-300";
    default:
      return "bg-neutral-100 text-neutral-700 ring-neutral-200";
  }
}

function weatherBadgeClass(weather: string | null) {
  switch (weather) {
    case "晴れ":
      return "bg-amber-100 text-amber-800 ring-amber-200";
    case "曇り":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case "小雨":
      return "bg-sky-100 text-sky-800 ring-sky-200";
    case "雨":
      return "bg-blue-100 text-blue-800 ring-blue-200";
    case "雪":
      return "bg-indigo-100 text-indigo-800 ring-indigo-200";
    default:
      return "bg-neutral-100 text-neutral-700 ring-neutral-200";
  }
}

export default function SpotForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [place, setPlace] = useState("");
  const [bloom, setBloom] = useState<number>(3);
  const [weather, setWeather] = useState<(typeof WEATHER_OPTIONS)[number] | "">("");
  const [comment, setComment] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!place.trim()) return false;
    if (!Number.isInteger(bloom) || bloom < 0 || bloom > 6) return false;
    if (uploading || submitting) return false;
    if (file && !imageUrl) return false;
    return true;
  }, [place, bloom, uploading, submitting, file, imageUrl]);

  function clearFileSelection() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setFile(null);
    setPreviewUrl(null);
    setImageUrl(null);
    setImageHash(null);
    setUploadError(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadImage(selected: File) {
    setUploading(true);
    setUploadError(null);

    try {
      const fd = new FormData();
      fd.append("file", selected);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = (await res.json()) as UploadResult;

      if (!res.ok || !data.ok) {
        setImageUrl(null);
        setImageHash(null);
        setUploadError(!res.ok ? `アップロードに失敗しました（${res.status}）` : data.error);
        return;
      }

      setImageUrl(data.imageUrl);
      setImageHash(data.imageHash);
    } catch (e) {
      console.error(e);
      setUploadError("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  }

  async function onPickFile(f: File | null) {
    setOkMsg(null);
    setFormError(null);

    if (!f) {
      clearFileSelection();
      return;
    }

    clearFileSelection();
    setFile(f);

    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    await uploadImage(f);
  }

  async function onSubmit() {
    setOkMsg(null);
    setFormError(null);

    if (!place.trim()) {
      setFormError("場所を入力してください");
      return;
    }

    if (!Number.isInteger(bloom) || bloom < 0 || bloom > 6) {
      setFormError("開花状況が不正です");
      return;
    }

    if (file && !imageUrl) {
      setFormError("画像アップロードが完了していません");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place: place.trim(),
          bloom,
          weather: weather === "" ? null : weather,
          comment: comment.trim() || null,
          imageUrl,
          imageHash,
        }),
      });

      const data = (await res.json()) as PostResult;

      if (!res.ok || !data.ok) {
        setFormError(!res.ok ? `投稿に失敗しました（${res.status}）` : data.error);
        return;
      }

      setOkMsg("投稿しました");
      setComment("");
      clearFileSelection();
    } catch (e) {
      console.error(e);
      setFormError("投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-2xl bg-pink-50 p-4 ring-1 ring-pink-100">
        <p className="text-xs font-medium text-pink-700">開花状況を投稿</p>
        <h1 className="mt-1 text-xl font-semibold">花見スポットの今を共有</h1>
        <p className="mt-1 text-xs text-neutral-600">場所・開花・天気を選んで投稿できます</p>
      </div>

      <div className="mt-6 space-y-4">
        {/* 場所 */}
        <section className="rounded-2xl border bg-white p-4">
          <label className="text-sm font-semibold">場所（必須）</label>
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="例：上野公園 / 東京駅"
            className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </section>

        {/* コメント */}
        <section className="rounded-2xl border bg-white p-4">
          <label className="text-sm font-semibold">コメント（任意）</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="例：かなり混雑、まだ5分咲き など"
            className="mt-2 min-h-[96px] w-full rounded-xl border px-3 py-2 text-sm"
          />
        </section>

        {/* 画像 */}
        <section className="rounded-2xl border bg-white p-4">
          <label className="text-sm font-semibold">画像（任意）</label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm"
          />

          {previewUrl && (
            <div className="mt-3">
              <img src={previewUrl} alt="preview" className="rounded-lg" />
              <div className="mt-2 flex justify-between text-sm">
                <button onClick={clearFileSelection} className="text-rose-600">
                  画像をキャンセル
                </button>
                <span>{uploading ? "アップロード中…" : imageUrl ? "アップロード済み" : "未アップロード"}</span>
              </div>
              {uploadError && <p className="mt-1 text-sm text-rose-600">{uploadError}</p>}
            </div>
          )}
        </section>

        {formError && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{formError}</p>}
        {okMsg && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{okMsg}</p>}

        {/* ボタン（TOPに戻るは1つだけ） */}
        <div className="space-y-3">
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`w-full rounded-xl py-3 text-sm font-semibold ${
              canSubmit ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-500"
            }`}
          >
            {submitting ? "投稿中..." : "投稿する"}
          </button>

          <Link
            href="/"
            className="block w-full rounded-xl border bg-white py-3 text-center text-sm font-semibold"
          >
            TOPに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}