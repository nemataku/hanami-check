-- AlterTable
ALTER TABLE "Spot" ADD COLUMN     "contributorId" INTEGER,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "weather" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Contributor" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_key_key" ON "Contributor"("key");

-- CreateIndex
CREATE INDEX "Contributor_createdAt_idx" ON "Contributor"("createdAt");

-- CreateIndex
CREATE INDEX "Spot_place_idx" ON "Spot"("place");

-- CreateIndex
CREATE INDEX "Spot_createdAt_idx" ON "Spot"("createdAt");

-- CreateIndex
CREATE INDEX "Spot_deletedAt_idx" ON "Spot"("deletedAt");

-- CreateIndex
CREATE INDEX "Spot_contributorId_idx" ON "Spot"("contributorId");

-- AddForeignKey
ALTER TABLE "Spot" ADD CONSTRAINT "Spot_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
