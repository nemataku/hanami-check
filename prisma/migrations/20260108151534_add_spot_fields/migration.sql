/*
  Warnings:

  - Made the column `weather` on table `Spot` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Spot" ADD COLUMN     "imageHash" TEXT,
ALTER COLUMN "weather" SET NOT NULL;
