{/* 写真アップロード（imageUrl手入力は削除） */}
<div className="space-y-2">
  <label className="text-xs font-semibold text-neutral-700">
    写真（任意）
  </label>

  <input
    type="file"
    accept="image/*"
    className="block w-full text-sm"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setUploading(true);

        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });

        const data = await res.json();
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error ?? "upload failed");
        }

        setImageUrl(data.url); // ← これが /uploads/xxx.jpg になる想定
      } catch (err: any) {
        alert(err?.message ?? "upload failed");
      } finally {
        setUploading(false);
      }
    }}
  />

  {uploading ? (
    <p className="text-xs text-neutral-500">アップロード中...</p>
  ) : imageUrl ? (
    <p className="text-xs text-neutral-500">
      アップロード済み
    </p>
  ) : (
    <p className="text-xs text-neutral-400">未選択</p>
  )}
</div>