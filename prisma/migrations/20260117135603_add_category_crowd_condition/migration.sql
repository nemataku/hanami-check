-- CreateEnum
CREATE TYPE "Category" AS ENUM ('HANAMI', 'SCENIC', 'FACILITY', 'FOOD', 'EVENT', 'PARKING');

-- DropIndex
DROP INDEX "Spot_createdAt_idx";

-- AlterTable
ALTER TABLE "Spot" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'HANAMI',
ADD COLUMN     "condition" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "crowd" INTEGER NOT NULL DEFAULT 3,
ALTER COLUMN "bloom" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Spot_createdAt_idx" ON "Spot"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Spot_category_idx" ON "Spot"("category");
