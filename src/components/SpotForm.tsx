"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

type UploadResult =
  | { ok: true; imageUrl: string; imageHash: string; bytes?: number }
  | { ok: false; error: string };

type PostResult =
  | { ok: true; item: unknown }
  | { ok: false; error: string };

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

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

/** ブラウザ側ガード */
const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function isAllowedImage(file: File) {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  return (type && ALLOWED_MIME.has(type)) || (ext && ALLOWED_EXT.has(ext));
}

export default function SpotForm() {
  const [place, setPlace] = useState("");
  const [bloom, setBloom] = useState<number>(5);
  const [weather, setWeather] = useState<(typeof WEATHER_OPTIONS)[number]>("晴れ");
  const [comment, setComment] = useState("");

  // 画像
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // アップロード結果
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);

  // 状態
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);

  // ✅ 投稿完了（UX改善）
  const [postedPlace, setPostedPlace] = useState<string | null>(null);

  const formDisabled = isUploading || isPosting;

  const canSubmit = useMemo(() => {
    if (place.trim().length === 0) return false;
    if (!Number.isInteger(bloom) || bloom < 0 || bloom > 6) return false;

    // 画像を選んだのに upload がまだ成功してない場合は投稿させない
    if (fileName && !imageUrl) return false;

    if (formDisabled) return false;
    return true;
  }, [place, bloom, fileName, imageUrl, formDisabled]);

  function clearPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
  }

  function resetImageInput() {
    setUploadError(null);
    setImageUrl(null);
    setImageHash(null);
    setFileName("");
    clearPreview();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetAllForm() {
    setPlace("");
    setBloom(5);
    setWeather("晴れ");
    setComment("");
    resetImageInput();
    setPostError(null);
  }

  async function uploadSelectedFile(file: File) {
    setIsUploading(true);
    setUploadError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const json = (await res.json()) as UploadResult;

      if (!res.ok || !json.ok) {
        const msg = "error" in json ? json.error : "アップロードに失敗しました";
        throw new Error(msg);
      }

      setImageUrl(json.imageUrl);
      setImageHash(json.imageHash);
    } catch (e) {
      console.error(e);
      setImageUrl(null);
      setImageHash(null);
      setUploadError(e instanceof Error ? e.message : "アップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  }

  function onSelectImage(file: File | null) {
    setPostedPlace(null); // 画像を触ったら完了表示は閉じる
    setUploadError(null);
    setImageUrl(null);
    setImageHash(null);

    if (!file) {
      resetImageInput();
      return;
    }

    // 形式ガード
    if (!isAllowedImage(file)) {
      resetImageInput();
      setUploadError("対応していない画像形式です（JPEG / PNG / WebP のみ対応）");
      return;
    }

    // サイズガード
    if (file.size > MAX_INPUT_BYTES) {
      resetImageInput();
      setUploadError("画像サイズが大きすぎます（10MBまで）");
      return;
    }

    setFileName(file.name);

    clearPreview();
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    void uploadSelectedFile(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsPosting(true);
    setPostError(null);

    try {
      const trimmedPlace = place.trim();

      const payload = {
        place: trimmedPlace,
        bloom,
        weather,
        comment: comment.trim() ? comment.trim() : null,
        imageUrl: imageUrl ?? null,
        imageHash: imageHash ?? null,
      };

      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as PostResult;

      if (!res.ok || !json.ok) {
        const msg = "error" in json ? json.error : "投稿に失敗しました";
        throw new Error(msg);
      }

      // ✅ 投稿完了UIへ（勝手に遷移しない）
      setPostedPlace(trimmedPlace);

      // 入力は一旦残すと「送れたのか不安」になりにくいので残し、
      // 「続けて投稿」で明示的にリセットする設計にしています。
      // （ただし画像は安全のため選択状態は残す）
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error(e);
      setPostError(e instanceof Error ? e.message : "投稿に失敗しました");
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-2xl bg-pink-50 p-4 ring-1 ring-pink-100">
        <p className="text-xs font-medium text-pink-700">開花状況を投稿</p>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">いまの様子を共有</h1>
        <p className="mt-1 text-xs text-neutral-600">場所・開花・天気を選んで投稿できます</p>
      </div>

      {/* ✅ 投稿完了カード（③） */}
      {postedPlace ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">投稿が完了しました</p>
          <p className="mt-1 text-xs text-emerald-800">
            「{postedPlace}」の検索結果から、投稿が反映されているか確認できます。
          </p>

          <div className="mt-3 space-y-2">
            <Link
              href={`/results?place=${encodeURIComponent(postedPlace)}`}
              className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
            >
              検索結果を見る
            </Link>

            <button
              type="button"
              onClick={() => {
                setPostedPlace(null);
                resetAllForm();
              }}
              className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
            >
              続けて投稿する
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-5 space-y-4" aria-busy={formDisabled}>
        <fieldset disabled={formDisabled} className="space-y-4">
          {/* 場所 */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="block text-sm font-semibold text-neutral-900">場所</label>
            <input
              value={place}
              onChange={(e) => {
                setPostedPlace(null);
                setPlace(e.target.value);
              }}
              placeholder="例：上野公園 / 東京駅"
              className={cx(
                "mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none",
                "focus:border-neutral-400",
                formDisabled && "bg-neutral-50 text-neutral-500"
              )}
            />
          </section>

          {/* 開花 */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-sm font-semibold text-neutral-900">開花状況</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {BLOOM_OPTIONS.map((opt) => {
                const active = bloom === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setPostedPlace(null);
                      setBloom(opt.value);
                    }}
                    className={cx(
                      "rounded-xl border px-3 py-2 text-sm font-semibold",
                      active
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 天気 */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-sm font-semibold text-neutral-900">天気</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {WEATHER_OPTIONS.map((w) => {
                const active = weather === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      setPostedPlace(null);
                      setWeather(w);
                    }}
                    className={cx(
                      "rounded-full border px-3 py-1.5 text-sm font-semibold",
                      active
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
                    )}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </section>

          {/* コメント */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="block text-sm font-semibold text-neutral-900">コメント（任意）</label>
            <textarea
              value={comment}
              onChange={(e) => {
                setPostedPlace(null);
                setComment(e.target.value);
              }}
              rows={3}
              placeholder="例：かなり混雑で、まだ5分咲き など"
              className={cx(
                "mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none",
                "focus:border-neutral-400",
                formDisabled && "bg-neutral-50 text-neutral-500"
              )}
            />
          </section>

          {/* 画像 */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-900">画像（任意）</p>

              {isUploading ? (
                <span className="text-xs font-medium text-neutral-500">アップロード中…</span>
              ) : imageUrl ? (
                <span className="text-xs font-medium text-emerald-700">アップロード済み</span>
              ) : null}
            </div>

            <p className="mt-1 text-xs text-neutral-500">JPEG / PNG / WebP のみ（10MBまで）</p>

            <div className="mt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => onSelectImage(e.target.files?.[0] ?? null)}
                className={cx(
                  "block w-full text-sm text-neutral-700 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-neutral-800",
                  formDisabled && "opacity-70"
                )}
              />
            </div>

            {fileName ? <p className="mt-2 text-xs text-neutral-600">選択中：{fileName}</p> : null}

            {previewUrl ? (
              <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-neutral-200">
                <img src={previewUrl} alt="プレビュー" className="h-auto w-full object-cover" />
              </div>
            ) : null}

            {fileName ? (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={resetImageInput}
                  className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                >
                  画像をキャンセル
                </button>
              </div>
            ) : null}

            {uploadError ? (
              <p className="mt-2 text-sm font-medium text-rose-600">
                画像アップロード失敗：{uploadError}
              </p>
            ) : null}
          </section>

          {/* 注意書き */}
          <div className="rounded-2xl border border-pink-200 bg-pink-50 p-3">
            <p className="text-xs font-semibold text-pink-700">投稿にあたっての注意</p>
            <p className="mt-1 text-xs text-pink-700 leading-relaxed">
              本サービスでは、個人情報（氏名・連絡先等）や、人物・車のナンバー・住所が推測できるものなど
              <span className="font-semibold">個人が特定される可能性のある内容・画像の投稿を禁止</span>
              しています。
            </p>
          </div>
        </fieldset>

        {postError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-700">投稿に失敗しました</p>
            <p className="mt-1 text-xs text-rose-700">{postError}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className={cx(
            "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sm",
            canSubmit ? "bg-neutral-900 text-white hover:bg-neutral-800" : "bg-neutral-300 text-white"
          )}
        >
          {isPosting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              投稿中…
            </span>
          ) : isUploading ? (
            "画像アップロード中…"
          ) : (
            "投稿する"
          )}
        </button>

        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
        >
          TOPに戻る
        </Link>
      </form>
    </main>
  );
}