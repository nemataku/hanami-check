"use client";

import { useState } from "react";

type Props = {
  onUploaded?: (imageUrl: string) => void;
};

export default function SpotImage({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("アップロードに失敗しました");
      }

      const data = await res.json();

      // 親コンポーネントに画像URLを渡す（任意）
      if (onUploaded) {
        onUploaded(data.imageUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラー");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || uploading}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {uploading ? "アップロード中..." : "画像をアップロード"}
      </button>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}