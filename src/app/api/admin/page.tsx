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
  createdAt: string;
};

type AdminListResult =
  | { ok: true; items: Spot[] }
  | { ok: false; error: string };

type AdminDeleteResult =
  | { ok: true; deleted?: unknown; deletedCount?: number }
  | { ok: false; error: string };

const STORAGE_KEY = "admin_token";

function fmtJP(dt: string) {
  // iPhone含め、確実にJSTで表示
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dt));
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [savedToken, setSavedToken] = useState<string | null>(null);

  const [items, setItems] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // 初回：sessionStorageから復元
  useEffect(() => {
    const t = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
    if (t) {
      setSavedToken(t);
    }
  }, []);

  const isAuthed = useMemo(() => !!savedToken, [savedToken]);

  async function fetchList(activeToken: string) {
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/spots", {
        method: "GET",
        headers: {
          "x-admin-token": activeToken,
        },
        cache: "no-store",
      });

      const data = (await res.json()) as AdminListResult;

      if (!res.ok || !data.ok) {
        setErr(!res.ok ? `取得に失敗しました（${res.status}）` : data.error);
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

  async function onConnect() {
    setErr(null);
    setMsg(null);

    const t = token.trim();
    if (!t) {
      setErr("管理者トークンを入力してください");
      return;
    }

    // まず保存してから一覧取得（401なら弾かれて一覧出ない）
    sessionStorage.setItem(STORAGE_KEY, t);
    setSavedToken(t);
    setToken("");

    await fetchList(t);
  }

  function onLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setSavedToken(null);
    setItems([]);
    setMsg("ログアウトしました");
    setErr(null);
  }

  async function onDeleteOne(id: number) {
    if (!savedToken) return;
    setErr(null);
    setMsg(null);

    const ok = confirm(`ID=${id} を削除します。よろしいですか？`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/spots?id=${encodeURIComponent(String(id))}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": savedToken,
        },
      });

      const data = (await res.json()) as AdminDeleteResult;

      if (!res.ok || !data.ok) {
        setErr(!res.ok ? `削除に失敗しました（${res.status}）` : data.error);
        return;
      }

      setMsg(`削除しました（ID=${id}）`);
      // 画面からも即反映
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      setErr("削除に失敗しました");
    }
  }

  async function onDeleteAll() {
    if (!savedToken) return;
    setErr(null);
    setMsg(null);

    const ok = confirm("全件削除します。本当にいいですか？（元に戻せません）");
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/spots?all=1`, {
        method: "DELETE",
        headers: {
          "x-admin-token": savedToken,
        },
      });

      const data = (await res.json()) as AdminDeleteResult;

      if (!res.ok || !data.ok) {
        setErr(!res.ok ? `全件削除に失敗しました（${res.status}）` : data.error);
        return;
      }

      setMsg(`全件削除しました（${data.deletedCount ?? "?"}件）`);
      setItems([]);
    } catch (e) {
      console.error(e);
      setErr("全件削除に失敗しました");
    }
  }

  // すでにトークンがある場合は、初回に一覧を取りに行く
  useEffect(() => {
    if (savedToken) fetchList(savedToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedToken]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-neutral-900">管理者ページ</h1>
        <Link href="/" className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-neutral-50">
          TOPへ
        </Link>
      </div>

      {/* 未認証：トークン入力 */}
      {!isAuthed ? (
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-sm font-semibold text-neutral-900">管理者トークンを入力</p>
          <p className="mt-1 text-xs text-neutral-600">入力しない限り、一覧や削除UIは表示されません。</p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ADMIN_TOKEN を貼り付け"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            />
            <button
              type="button"
              onClick={onConnect}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              接続
            </button>
          </div>

          {err ? <p className="mt-3 text-sm font-semibold text-rose-600">{err}</p> : null}
          {msg ? <p className="mt-3 text-sm font-semibold text-emerald-700">{msg}</p> : null}
        </section>
      ) : (
        <>
          {/* 認証済み：操作UI */}
          <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-neutral-900">投稿一覧</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => savedToken && fetchList(savedToken)}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-neutral-50"
                >
                  再読込
                </button>
                <button
                  type="button"
                  onClick={onDeleteAll}
                  className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                >
                  全件削除
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-neutral-50"
                >
                  ログアウト
                </button>
              </div>
            </div>

            {err ? <p className="mt-3 text-sm font-semibold text-rose-600">{err}</p> : null}
            {msg ? <p className="mt-3 text-sm font-semibold text-emerald-700">{msg}</p> : null}

            <div className="mt-4">
              {loading ? (
                <p className="text-sm text-neutral-600">読み込み中...</p>
              ) : items.length === 0 ? (
                <p className="text-sm text-neutral-600">投稿がありません</p>
              ) : (
                <ul className="space-y-3">
                  {items.map((s) => (
                    <li key={s.id} className="rounded-2xl border border-neutral-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-neutral-900">
                          ID: {s.id} / {s.place}
                        </div>
                        <div className="text-xs text-neutral-500">{fmtJP(s.createdAt)}</div>
                      </div>

                      {s.comment ? <p className="mt-2 text-sm text-neutral-800">{s.comment}</p> : null}

                      {s.imageUrl ? (
                        <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-neutral-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.imageUrl} alt="投稿画像" className="h-auto w-full object-cover" />
                        </div>
                      ) : null}

                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => onDeleteOne(s.id)}
                          className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                        >
                          削除
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}