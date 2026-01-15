/*
  Warnings:

  - The primary key for the `Contributor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `key` on the `Contributor` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Contributor` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Spot` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Spot" DROP CONSTRAINT "Spot_contributorId_fkey";

-- DropIndex
DROP INDEX "Contributor_createdAt_idx";

-- DropIndex
DROP INDEX "Contributor_key_key";

-- DropIndex
DROP INDEX "Spot_deletedAt_idx";

-- AlterTable
ALTER TABLE "Contributor" DROP CONSTRAINT "Contributor_pkey",
DROP COLUMN "key",
DROP COLUMN "updatedAt",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Contributor_id_seq";

-- AlterTable
ALTER TABLE "Spot" DROP COLUMN "deletedAt",
ALTER COLUMN "contributorId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Spot" ADD CONSTRAINT "Spot_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
