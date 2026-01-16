// src/lib/contributor.ts
import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_KEY = "contributorId";

export async function getOrCreateContributorId(): Promise<{ id: string }> {
  // ✅ Next.jsのバージョンによって cookies() が Promise なので await
  const store = await cookies();
  const existing = store.get(COOKIE_KEY)?.value;

  if (existing) return { id: existing };

  const id =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : crypto.randomBytes(16).toString("hex");

  // Cookie をセット（投稿者IDの永続化）
  store.set(COOKIE_KEY, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1年
  });

  return { id };
}