// src/app/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Spot = {
  id: number;
  place: string;
  bloom: number;
  weather: string | null;
  comment: string | null;
  imageUrl: string | null;
  imageHash: string | null;
  createdAt: string; // ISO
};

type ListResult =
  | { ok: true; items: Spot[] }
  | { ok: false; error: string };

type DeleteResult =
  | { ok: true; deleted: { id: number } }
  | { ok: false; error: string };

function formatJPDateTime(iso: string) {
  const d = new Date(iso);
  // 日本時間で「YYYY/MM/DD HH:mm」
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function fromNowJP(iso: string) {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);

  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}分前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}時間前`;
  const day = Math.floor(hour / 24);
  return `${day}日前`;
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [items, setItems] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const canFetch = useMemo(() => token.trim().length > 0, [token]);

  async function fetchList() {
    setOk(null);
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/spots", {
        method: "GET",
        headers: {
          "x-admin-token": token.trim(),
        },
        cache: "no-store",
      });

      const data = (await res.json()) as ListResult;

      // ✅ TSが確実に理解できるように「ifで分岐」する
      if (!res.ok) {
        setErr(`取得に失敗しました（${res.status}）`);
        setItems([]);
        return;
      }
      if (!data.ok) {
        setErr(data.error);
        setItems([]);
        return;
      }

      setItems(data.items);
    } catch (e) {
      console.error(e);
      setErr("取得に失敗しました");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteOne(id: number) {
    setOk(null);
    setErr(null);

    try {
      const res = await fetch(`/api/admin/spots?id=${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": token.trim(),
        },
      });

      const data = (await res.json()) as DeleteResult;

      if (!res.ok) {
        setErr(`削除に失敗しました（${res.status}）`);
        return;
      }
      if (!data.ok) {
        setErr(data.error);
        return;
      }

      setItems((prev) => prev.filter((x) => x.id !== id));
      setOk(`削除しました（id: ${id}）`);
    } catch (e) {
      console.error(e);
      setErr("削除に失敗しました");
    }
  }

  useEffect(() => {
    // 入力してから「一覧取得」ボタンを押す運用にしておく（勝手に叩かない）
  }, []);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-neutral-900">管理者：投稿一覧 / 削除</h1>
          <Link
            href="/"
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
          >
            TOPに戻る
          </Link>
        </div>

        <div className="mt-4 grid gap-2">
          <label className="text-sm font-semibold text-neutral-900">管理者トークン</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="管理者トークンを入力"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
          />

          <button
            type="button"
            disabled={!canFetch || loading}
            onClick={fetchList}
            className={[
              "mt-1 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sm",
              canFetch && !loading ? "bg-neutral-900 text-white hover:bg-neutral-800" : "bg-neutral-200 text-neutral-500",
            ].join(" ")}
          >
            {loading ? "取得中..." : "一覧を取得"}
          </button>

          {err ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-rose-700">{err}</p>
            </div>
          ) : null}

          {ok ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">{ok}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((s) => (
          <div key={s.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-900">{s.place}</p>
                <p className="mt-1 text-xs text-neutral-600">
                  {fromNowJP(s.createdAt)} ・ {formatJPDateTime(s.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => deleteOne(s.id)}
                className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                削除
              </button>
            </div>

            {s.imageUrl ? (
              <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-neutral-200">
                <img src={s.imageUrl} alt="投稿画像" className="h-auto w-full object-cover" />
              </div>
            ) : null}

            {s.comment ? <p className="mt-3 text-sm text-neutral-800">{s.comment}</p> : null}
          </div>
        ))}

        {!loading && items.length === 0 ? (
          <p className="text-sm text-neutral-500">まだ投稿がありません（または取得できていません）</p>
        ) : null}
      </div>
    </main>
  );
}