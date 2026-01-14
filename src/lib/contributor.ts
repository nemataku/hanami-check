// src/lib/contributor.ts
import { prisma } from "./prisma";
import { cookies } from "next/headers";

const COOKIE_NAME = "hc_contributor_id";

export async function getOrCreateContributorId() {
  const cookieStore = cookies();
  const existing = cookieStore.get(COOKIE_NAME)?.value;

  if (existing) {
    return existing;
  }

  const contributor = await prisma.contributor.create({
    data: {},
  });

  cookieStore.set(COOKIE_NAME, String(contributor.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return String(contributor.id);
}