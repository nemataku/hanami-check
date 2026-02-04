/*
  Warnings:

  - The values [FACILITY] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `condition` on the `Spot` table. All the data in the column will be lost.
  - The `crowd` column on the `Spot` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CrowdLevel" AS ENUM ('EMPTY', 'LIGHT', 'CROWDED', 'FULL', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "ParkingLevel" AS ENUM ('AVAILABLE', 'LIGHT', 'CROWDED', 'FULL');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('OPEN', 'BREAK', 'CLOSED', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "FlowerPreset" AS ENUM ('SAKURA', 'UME', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('SHOPPING', 'PARK', 'FOOD', 'EVENT', 'PARKING', 'HANAMI', 'SCENIC', 'PUBLIC');
ALTER TABLE "Spot" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "Spot" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "Category_old";
ALTER TABLE "Spot" ALTER COLUMN "category" SET DEFAULT 'HANAMI';
COMMIT;

-- AlterTable
ALTER TABLE "Spot" DROP COLUMN "condition",
ADD COLUMN     "attractionName" TEXT,
ADD COLUMN     "businessStatus" "BusinessStatus",
ADD COLUMN     "closeTime" TEXT,
ADD COLUMN     "eventEnd" TEXT,
ADD COLUMN     "eventName" TEXT,
ADD COLUMN     "eventStart" TEXT,
ADD COLUMN     "flowerOther" TEXT,
ADD COLUMN     "flowerPreset" "FlowerPreset",
ADD COLUMN     "openTime" TEXT,
ADD COLUMN     "parkingLevel" "ParkingLevel",
ADD COLUMN     "parkingName" TEXT,
ADD COLUMN     "shopName" TEXT,
ADD COLUMN     "waitMinutes" INTEGER,
ALTER COLUMN "bloom" DROP NOT NULL,
ALTER COLUMN "bloom" DROP DEFAULT,
DROP COLUMN "crowd",
ADD COLUMN     "crowd" "CrowdLevel";
