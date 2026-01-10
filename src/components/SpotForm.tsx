"use client";

import { useState } from "react";

export default function SpotForm() {
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setError(null);

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      let imageUrl: string | null = null;

      // ① 画像がある場合だけ upload API を呼ぶ
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });

        const json = await res.json();
        if (!json.ok) throw new Error("画像アップロード失敗");

        imageUrl = json.imageUrl;
      }

      // ② spots API に投稿
      const res2 = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment,
          imageUrl, // ← null でもOK
        }),
      });

      if (!res2.ok) throw new Error("投稿に失敗しました");

      // 成功時リセット
      setComment("");
      handleImageChange(null);
      alert("投稿しました");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="例：かなり混雑、5分咲き"
        className="w-full border rounded p-2"
      />

      {/* 画像 */}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
        />

        {imagePreview && (
          <div className="mt-2 space-y-2">
            <img src={imagePreview} className="max-h-40 rounded" />
            <button
              className="text-sm text-red-500"
              onClick={() => handleImageChange(null)}
            >
              画像をキャンセル
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        disabled={loading}
        onClick={handleSubmit}
        className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "送信中..." : "投稿する"}
      </button>

      <button
        onClick={() => history.back()}
        className="w-full border py-2 rounded"
      >
        TOPに戻る
      </button>
    </div>
  );
}