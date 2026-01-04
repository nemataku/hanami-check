"use client";

import { useEffect, useMemo, useState } from "react";
import imageCompression from "browser-image-compression";

const BLOOM_LABELS = [
  "つぼみ",
  "咲始め",
  "3分咲き",
  "5分咲き",
  "7分咲き",
  "満開",
  "散る",
] as const;

const WEATHER_OPTIONS = ["晴れ", "曇り", "小雨", "雨", "雪"] as const;
type WeatherLabel = (typeof WEATHER_OPTIONS)[number];

// ✅ 目標は 1MB、最終ガードは 2MB
const TARGET_MB = 1;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_LABEL = "2MB";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function isAllowedFile(file: File) {
  const t = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();

  if (t && ALLOWED_MIME.has(t)) return true;
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return true;
  if (name.endsWith(".png")) return true;
  if (name.endsWith(".webp")) return true;
  if (name.endsWith(".heic") || name.endsWith(".heif")) return true;
  return false;
}

// URL / メール検出（ゆるめに弾く）
const URL_LIKE = /(https?:\/\/|www\.)/i;
const EMAIL_LIKE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

function commentHasForbidden(content: string) {
  const s = content.trim();
  if (!s) return false;
  return URL_LIKE.test(s) || EMAIL_LIKE.test(s);
}

export default function SpotForm() {
  const [place, setPlace] = useState("");
  const [bloom, setBloom] = useState<number>(3);
  const [weather, setWeather] = useState<WeatherLabel>("晴れ");
  const [comment, setComment] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedHash, setUploadedHash] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const commentForbidden = useMemo(() => commentHasForbidden(comment), [comment]);

  const canSubmit = useMemo(() => {
    if (!place.trim()) return false;
    if (!Number.isInteger(bloom) || bloom < 0 || bloom > 6) return false;
    if (!WEATHER_OPTIONS.includes(weather)) return false;
    if (uploading) return false;

    // コメントの防犯（URL/メール不可）
    if (commentForbidden) return false;

    // 画像は任意。選択した場合はアップロード完了が必要
    if (file && (!uploadedUrl || !uploadedHash)) return false;
    return true;
  }, [place, bloom, weather, file, uploadedUrl, uploadedHash, uploading, commentForbidden]);

  async function uploadSelectedFile(selected: File) {
    setUploading(true);
    setError(null);
    setUploadedUrl(null);
    setUploadedHash(null);

    try {
      const fd = new FormData();
      fd.append("file", selected);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "upload failed");
        return;
      }

      setUploadedUrl(String(data.url));
      setUploadedHash(String(data.hash));
    } catch {
      setError("upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function compressIfNeeded(selected: File) {
    if (selected.size <= TARGET_MB * 1024 * 1024) return selected;

    const options = {
      maxSizeMB: TARGET_MB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.82,
    } as const;

    const compressed = await imageCompression(selected, options);

    if (compressed.size > MAX_IMAGE_BYTES) {
      throw new Error(`圧縮後もサイズが大きすぎます（上限 ${MAX_IMAGE_LABEL}）`);
    }

    return compressed;
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;

    setError(null);
    setUploadedUrl(null);
    setUploadedHash(null);
    setFile(null);

    if (!selected) return;

    if (!isAllowedFile(selected)) {
      setError("対応していない画像形式です（JPEG/PNG/WebP/HEIC）");
      return;
    }

    try {
      const processed = await compressIfNeeded(selected);
      setFile(processed);
      await uploadSelectedFile(processed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "画像処理に失敗しました");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (commentHasForbidden(comment)) {
        setError("コメントにURLやメールアドレスは入力できません");
        return;
      }

      if (file && (!uploadedUrl || !uploadedHash)) {
        setError("画像アップロードが完了していません");
        return;
      }

      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place: place.trim(),
          bloom,
          weather,
          comment: comment.trim() ? comment.trim() : null,
          imageUrl: uploadedUrl,
          imageHash: uploadedHash,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "投稿に失敗しました");
        return;
      }

      setPlace("");
      setBloom(3);
      setWeather("晴れ");
      setComment("");
      setFile(null);
      setUploadedUrl(null);
      setUploadedHash(null);
      setError(null);
    } catch {
      setError("投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700">場所</label>
        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
          placeholder="例：上野公園"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">開花状況</label>
        <select
          value={bloom}
          onChange={(e) => setBloom(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
        >
          {BLOOM_LABELS.map((label, idx) => (
            <option key={label} value={idx}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">天気</label>
        <select
          value={weather}
          onChange={(e) => setWeather(e.target.value as WeatherLabel)}
          className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
        >
          {WEATHER_OPTIONS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">コメント（任意）</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
          rows={3}
          placeholder="例：人が多いです"
        />
        {commentForbidden ? (
          <p className="mt-2 text-sm text-red-600">
            コメントにURLやメールアドレスは入力できません
          </p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">写真（任意）</label>
        <p className="mt-1 text-xs text-neutral-500">
          JPEG / PNG / WebP / HEIC（推奨 1MB、上限 {MAX_IMAGE_LABEL}）
        </p>

        <input
          type="file"
          accept="image/*,.heic,.heif"
          onChange={onFileChange}
          className="mt-2 block w-full text-sm"
        />

        {uploading ? <p className="mt-2 text-xs text-neutral-500">アップロード中...</p> : null}
        {!uploading && file && uploadedUrl && uploadedHash ? (
          <p className="mt-2 text-xs text-neutral-500">アップロード完了</p>
        ) : null}

        {previewUrl ? (
          <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-neutral-200">
            <img src={previewUrl} alt="プレビュー" className="h-auto w-full object-cover" />
          </div>
        ) : null}
      </div>

      {/* ✅ 追加：しっかり注意喚起 */}
      <div className="rounded-2xl border border-pink-200 bg-pink-50 p-3">
        <p className="text-xs font-semibold text-pink-700">投稿にあたっての注意</p>
        <p className="mt-1 text-xs text-pink-700 leading-relaxed">
          本サービスでは、個人情報（氏名・連絡先等）や、人物・車のナンバー・住所が推測できるものなど
          <span className="font-semibold">個人が特定される可能性のある内容・画像の投稿を禁止</span>
          しています。
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "投稿中..." : "投稿する"}
      </button>
    </form>
  );
}