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
    // 画像が選ばれているが、まだアップロードが終わっていない場合は送らせない
    if (file && !imageUrl) return false;
    return true;
  }, [place, bloom, uploading, submitting, file, imageUrl]);

  function clearFileSelection() {
    // プレビュー破棄
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setFile(null);
    setPreviewUrl(null);

    // アップロード結果も破棄
    setImageUrl(null);
    setImageHash(null);

    // エラー表示もリセット
    setUploadError(null);

    // ★重要：input のファイル名表示を消す
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

      // ✅ 1) HTTP が失敗しているケース（この時 data は ok:true の形かもしれないので data.error を触らない）
      if (!res.ok) {
        setImageUrl(null);
        setImageHash(null);
        setUploadError(`アップロードに失敗しました（${res.status}）`);
        return;
      }

      // ✅ 2) HTTP は成功だが、API 側で ok:false のケース（この時だけ data.error を触る）
      if (!data.ok) {
        setImageUrl(null);
        setImageHash(null);
        setUploadError(data.error);
        return;
      }

      // ✅ 3) 成功
      setImageUrl(data.imageUrl);
      setImageHash(data.imageHash);
      setUploadError(null);
    } catch (e) {
      console.error(e);
      setImageUrl(null);
      setImageHash(null);
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

    // 既存があればクリアしてから差し替え
    clearFileSelection();

    setFile(f);

    // プレビュー（ローカル）
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    // すぐアップロード開始
    await uploadImage(f);
  }

  async function onSubmit() {
    setOkMsg(null);
    setFormError(null);

    const placeTrim = place.trim();
    if (!placeTrim) {
      setFormError("場所を入力してください");
      return;
    }

    if (!Number.isInteger(bloom) || bloom < 0 || bloom > 6) {
      setFormError("開花状況が不正です");
      return;
    }

    // 画像選択ありで、アップロード未完了なら止める
    if (file && !imageUrl) {
      setFormError("画像アップロードが完了していません");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        place: placeTrim,
        bloom,
        weather: weather === "" ? null : weather,
        comment: comment.trim() === "" ? null : comment.trim(),
        imageUrl,
        imageHash,
      };

      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as PostResult;

      // ✅ 1) HTTP が失敗しているケース（この時 data は ok:true の形かもしれないので data.error を触らない）
      if (!res.ok) {
        setFormError(`投稿に失敗しました（${res.status}）`);
        return;
      }

      // ✅ 2) HTTP は成功だが、API 側で ok:false のケース（この時だけ data.error を触る）
      if (!data.ok) {
        setFormError(data.error);
        return;
      }

      // ✅ 3) 成功
      setOkMsg("投稿しました");

      // フォーム初期化（場所は残したいならここを外す）
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
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">花見スポットの今を共有</h1>
        <p className="mt-1 text-xs text-neutral-600">場所・開花・天気を選んで投稿できます</p>
      </div>

      <div className="mt-6 space-y-4">
        {/* 場所 */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-4">
          <label className="text-sm font-semibold text-neutral-900">場所（必須）</label>
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="例：上野公園 / 東京駅"
            className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
          />
        </section>

        {/* 開花状況 */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-neutral-900">開花状況（必須）</label>
            <span className={["rounded-full px-2.5 py-1 text-xs font-medium ring-1", bloomBadgeClass(bloom)].join(" ")}>
              {BLOOM_LABELS[bloom] ?? "-"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {BLOOM_LABELS.map((label, idx) => (
              <button
                key={label}
                type="button"
                onClick={() => setBloom(idx)}
                className={[
                  "rounded-xl border px-2 py-2 text-xs font-medium",
                  idx === bloom ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* 天気 */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-neutral-900">天気（任意）</label>
            <span className={["rounded-full px-2.5 py-1 text-xs font-medium ring-1", weatherBadgeClass(weather === "" ? null : weather)].join(" ")}>
              {weather === "" ? "-" : weather}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setWeather("")}
              className={[
                "rounded-xl border px-3 py-2 text-xs font-medium",
                weather === "" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
              ].join(" ")}
            >
              未選択
            </button>

            {WEATHER_OPTIONS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeather(w)}
                className={[
                  "rounded-xl border px-3 py-2 text-xs font-medium",
                  weather === w ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                ].join(" ")}
              >
                {w}
              </button>
            ))}
          </div>
        </section>

        {/* コメント */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-4">
          <label className="text-sm font-semibold text-neutral-900">コメント（任意）</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="例：かなり混雑、まだ5分咲き など"
            className="mt-2 min-h-[96px] w-full resize-y rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
          />
        </section>

        {/* 画像（任意） */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-neutral-900">画像（任意）</label>
            <p className="text-xs text-neutral-500">JPEG / PNG / WebP のみ（10MBまで）</p>
          </div>

          <div className="mt-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-neutral-800"
            />
          </div>

          {previewUrl ? (
            <div className="mt-3 rounded-xl border border-neutral-200 p-3">
              <div className="overflow-hidden rounded-lg ring-1 ring-neutral-200">
                <img src={previewUrl} alt="選択画像" className="h-auto w-full object-cover" />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={clearFileSelection}
                  className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                >
                  画像をキャンセル
                </button>

                <div className="text-xs text-neutral-500">
                  {uploading ? "アップロード中..." : imageUrl ? "アップロード済み" : "未アップロード"}
                </div>
              </div>

              {uploadError ? <p className="mt-2 text-sm font-medium text-rose-600">画像アップロード失敗：{uploadError}</p> : null}
            </div>
          ) : null}
        </section>

        {/* メッセージ */}
        {formError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-700">{formError}</p>
          </div>
        ) : null}

        {okMsg ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-700">{okMsg}</p>
          </div>
        ) : null}

{/* ボタン */}
<div className="space-y-3">
  <button
    type="button"
    onClick={onSubmit}
    disabled={!canSubmit}
    className={[
      "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sm",
      canSubmit
        ? "bg-neutral-900 text-white hover:bg-neutral-800"
        : "bg-neutral-200 text-neutral-500",
    ].join(" ")}
  >
    {submitting ? "投稿中..." : "投稿する"}
  </button>

  {/* ← TOPに戻るはここだけ残す */}
  <Link
    href="/"
    className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
  >
    TOPに戻る
  </Link>
</div>

          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
          >
            TOPに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}