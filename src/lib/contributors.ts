// src/lib/contributor.ts
import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "kid";
const MAX_AGE_SEC = 60 * 60 * 24 * 365; // 1年

export function getOrCreateContributorId() {
  const store = cookies();
  const existing = store.get(COOKIE_NAME)?.value;

  if (existing && existing.length >= 16) {
    return { id: existing, isNew: false };
  }

  const id = crypto.randomUUID();
  // route handler / server component 上でcookieを書けます
  store.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });

  return { id, isNew: true };
}