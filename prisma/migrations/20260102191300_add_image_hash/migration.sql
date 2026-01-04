/*
  Warnings:

  - A unique constraint covering the columns `[imageHash]` on the table `Spot` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Spot" ADD COLUMN "imageHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Spot_imageHash_key" ON "Spot"("imageHash");
