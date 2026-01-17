// src/lib/contributor.ts
import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE_KEY = "contributorId";

export const contributorCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1年
};

/**
 * cookies() の Next.js バージョン差分吸収（object or Promise）
 */
async function getCookieStore() {
  // cookies() が Promise を返す環境でも、通常のオブジェクトでも動くようにする
  return await Promise.resolve(cookies() as any);
}

/**
 * 現在の contributorId を cookie から読む（なければ null）
 */
export async function readContributorId(): Promise<string | null> {
  const store = await getCookieStore();
  return store.get(COOKIE_KEY)?.value ?? null;
}

/**
 * 新しい contributorId を作る
 */
export function newContributorId(): string {
  return crypto.randomUUID();
}

/**
 * contributorId を必ず返す（cookieが無ければ新規発行）
 * - id: contributorId
 * - isNew: 新規発行したかどうか
 */
export async function ensureContributorId(): Promise<{ id: string; isNew: boolean }> {
  const existing = await readContributorId();
  if (existing) return { id: existing, isNew: false };

  const id = newContributorId();
  return { id, isNew: true };
}