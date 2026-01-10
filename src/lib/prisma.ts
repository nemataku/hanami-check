// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

/**
 * Next.js / Vercel 環境では Hot Reload / Serverless 再実行で
 * PrismaClient が複数生成されると接続数超過を起こすため globalThis にキャッシュします。
 */

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}