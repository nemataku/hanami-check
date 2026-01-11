"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canRun = useMemo(() => token.trim().length >= 8 && !busy, [token, busy]);

  async function clearAll() {
    if (!confirm("全投稿を削除します。本当に実行しますか？")) return;

    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/spots?action=clear", {
        method: "POST",
        headers: { "x-admin-token": token.trim() },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setMsg(`失敗: ${data?.error ?? `HTTP ${res.status}`}`);
        return;
      }

      setMsg(`削除完了: ${data.deleted}件`);
    } catch (e) {
      console.error(e);
      setMsg("失敗: 通信エラー");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="text-xl font-semibold text-neutral-900">管理者メニュー</h1>
      <p className="mt-1 text-sm text-neutral-600">
        ADMIN_TOKEN を知っている人だけ操作できます。
      </p>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
        <label className="text-sm font-semibold text-neutral-900">管理者トークン</label>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ADMIN_TOKEN を入力"
          className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />

        <button
          type="button"
          onClick={clearAll}
          disabled={!canRun}
          className={[
            "mt-4 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sm",
            canRun ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-neutral-200 text-neutral-500",
          ].join(" ")}
        >
          {busy ? "実行中..." : "全投稿を削除"}
        </button>

        {msg ? (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-medium text-neutral-900">{msg}</p>
          </div>
        ) : null}
      </section>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
        >
          TOPに戻る
        </Link>
      </div>
    </main>
  );
}