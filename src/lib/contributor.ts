// src/lib/contributor.ts
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const COOKIE_KEY = "hc_contributor_id";

type EnsureResult = {
  id: string;
  isNew: boolean;
};

export async function ensureContributorId(): Promise<EnsureResult> {
  const store = await cookies(); // ★ここがポイント（Promiseなのでawait）

  const existing = store.get(COOKIE_KEY)?.value;
  if (existing) return { id: existing, isNew: false };

  const id = randomUUID();
  return { id, isNew: true };
}

export function contributorCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1年
  };
}